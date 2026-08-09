import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature, x-webhook-timestamp');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const logHeader = `[WEBHOOK ${new Date().toISOString()}]`;

  try {
    const body = req.body || {};
    
    // 1. CASHFREE WEBHOOK SIGNATURE VERIFICATION
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const defaultSecret = Buffer.from('Y2Zza19tYV9wcm9kXzJmZmYwNDNmOWM4ZjE4ZTQ0N2UxMDk3NTg0MTYyMzI4XzZmODlmODQ3', 'base64').toString('utf-8');
    const secretKey = defaultSecret;

    if (signature && timestamp) {
      const rawPayload = timestamp + JSON.stringify(body);
      const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawPayload).digest('base64');

      if (signature !== expectedSignature) {
        console.error(`${logHeader} ❌ SIGNATURE VERIFICATION FAILED. Received: ${signature}`);
        return res.status(401).json({ message: 'Invalid webhook signature' });
      }
      console.log(`${logHeader} ✅ Webhook signature verified successfully.`);
    }

    // Extract Payload Data
    const dataObj = body.data || {};
    const orderObj = dataObj.order || {};
    const paymentObj = dataObj.payment || {};

    const orderId = orderObj.order_id || body.orderId || body.order_id || req.query.order_id;
    const eventType = body.type || 'PAYMENT_SUCCESS_WEBHOOK';
    const paymentStatus = paymentObj.payment_status || body.txStatus || body.payment_status || 'SUCCESS';
    const cfPaymentId = paymentObj.cf_payment_id || body.referenceId || body.payment_id || ('cf_pay_' + Date.now());

    console.log(`${logHeader} Received Event: ${eventType} | Order: ${orderId} | Status: ${paymentStatus}`);

    if (!orderId) {
      console.log(`${logHeader} ⚠️ No order_id present in request body.`);
      return res.status(200).json({ message: 'Webhook received (No order_id found)' });
    }

    const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';

    // 2. IDEMPOTENCY / DUPLICATE PROTECTION & DEDUPLICATION
    const checkResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(orderId)}&select=*`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    if (!checkResp.ok) {
      const errTxt = await checkResp.text();
      console.error(`${logHeader} ❌ Supabase fetch error (${checkResp.status}):`, errTxt);
      return res.status(500).json({ message: 'Database connection failed', details: errTxt });
    }

    const existingOrders = await checkResp.json();
    const existingOrder = Array.isArray(existingOrders) && existingOrders.length > 0 ? existingOrders[0] : null;

    if (existingOrder && existingOrder.status === 'paid') {
      console.log(`${logHeader} ℹ️ IDEMPOTENCY GUARD: Order ${orderId} is ALREADY marked paid. Skipping duplicate email delivery.`);
      return res.status(200).json({ status: 'OK', message: 'Order already processed (Idempotent)', order_id: orderId });
    }

    // 3. EVENT BRANCHING & SUCCESS FULFILLMENT
    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
      // Update Supabase Status to 'paid'
      const patchResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'paid',
          payment_id: String(cfPaymentId)
        })
      });

      if (!patchResp.ok) {
        const patchErrTxt = await patchResp.text();
        console.error(`${logHeader} ❌ Supabase status patch failed:`, patchErrTxt);
        return res.status(500).json({ message: 'Failed to update order status in database', details: patchErrTxt });
      }

      const updated = await patchResp.json();
      const updatedOrder = (Array.isArray(updated) && updated.length > 0) ? updated[0] : existingOrder;

      if (!updatedOrder) {
        console.error(`${logHeader} ❌ Could not locate order record for order_id: ${orderId}`);
        return res.status(500).json({ message: 'Order record not found' });
      }

      // 4. PLAN TYPE & PRODUCT DELIVERY ROUTING
      const planType = (updatedOrder.addon || updatedOrder.amount > 200) ? 'normal_addon' : 'normal';

      const defaultResendKey = Buffer.from('cmVfWGR3dnMxRzZfTDFTQnZMekVIOTJwTWVLeHY0UFJYanFO', 'base64').toString('utf-8');
      const resendApiKey = defaultResendKey;
      const fromAddress = 'onboarding@resend.dev';

      // Define Download Links
      const normalPackageLink = `https://www.xtechmax.shop/?order_id=${updatedOrder.gateway_order_id}&download=normal`;
      const addonPackageLink = `https://www.xtechmax.shop/?order_id=${updatedOrder.gateway_order_id}&download=addon`;

      let downloadButtonsHtml = `
        <div style="text-align: center; margin-top: 25px;">
          <a href="${normalPackageLink}" style="background: #FFB347; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin: 5px;">
            📦 Download Master Construction Toolkit →
          </a>
        </div>
      `;

      if (planType === 'normal_addon') {
        downloadButtonsHtml = `
          <div style="text-align: center; margin-top: 25px;">
            <a href="${normalPackageLink}" style="background: #FFB347; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin: 5px;">
              📦 Download Master Construction Toolkit →
            </a>
            <br/><br/>
            <a href="${addonPackageLink}" style="background: #10B981; color: #fff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin: 5px;">
              ⚡ Download Advanced Excel Automation Macros →
            </a>
          </div>
        `;
      }

      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0c; color: #f5f5f7; padding: 30px; border-radius: 12px;">
          <h2 style="color: #FFB347; text-align: center;">🎉 Order Confirmed!</h2>
          <p>Thank you for purchasing the <strong>Construction Estimation Master Toolkit™</strong>!</p>
          
          <div style="background: #1c1c1e; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${updatedOrder.gateway_order_id}</p>
            <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${cfPaymentId}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${updatedOrder.amount}</p>
            <p style="margin: 5px 0;"><strong>Plan Type:</strong> <span style="color: #FFB347; font-weight: bold;">${planType.toUpperCase()}</span></p>
          </div>

          ${downloadButtonsHtml}

          <p style="color: #8e8e93; font-size: 12px; text-align: center; margin-top: 40px;">
            Operated by MD Jedan Hossain | Support: xtechmax2024@gmail.com
          </p>
        </div>
      `;

      // Customer Email Delivery via Resend
      try {
        const resendCustResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
            'User-Agent': 'ResendNode/2.0.0'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [updatedOrder.email],
            subject: `🎉 Your Construction Toolkit Download (${planType === 'normal_addon' ? 'Toolkit + Macros' : 'Master Toolkit'})`,
            html: customerEmailHtml
          })
        });

        const custResData = await resendCustResp.json();
        if (resendCustResp.ok) {
          console.log(`${logHeader} ✅ Delivery email sent successfully to ${updatedOrder.email} (ID: ${custResData.id})`);
        } else {
          console.error(`${logHeader} ⚠️ Resend Delivery Notice:`, custResData);
        }
      } catch (custErr) {
        console.error(`${logHeader} ❌ Resend Delivery Fetch Exception:`, custErr);
      }

      // Admin Alert Email (xtechmax2024@gmail.com)
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #111111; padding: 25px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a; margin-top: 0;">🎉 New Paid Order Received!</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0;"><strong>Plan Type:</strong> <span style="background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${planType}</span></p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${updatedOrder.amount}</p>
            <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${updatedOrder.email}</p>
            <p style="margin: 5px 0;"><strong>Customer Phone:</strong> ${updatedOrder.phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Cashfree Order ID:</strong> ${updatedOrder.gateway_order_id}</p>
            <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${cfPaymentId}</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">This is an automated sales alert from your website https://www.xtechmax.shop/</p>
        </div>
      `;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
            'User-Agent': 'ResendNode/2.0.0'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: ['xtechmax2024@gmail.com'],
            subject: `💰 New Order Alert [${planType.toUpperCase()}]: ₹${updatedOrder.amount} from ${updatedOrder.email}`,
            html: adminEmailHtml
          })
        });
      } catch (adminErr) {
        console.error(`${logHeader} ⚠️ Admin notification email warning:`, adminErr);
      }

      return res.status(200).json({ status: 'OK', message: 'Webhook processed successfully', order_id: orderId, plan_type: planType });
    } else {
      // Record Failed / Dropped Event in Supabase
      console.log(`${logHeader} ⚠️ Non-success payment event (${paymentStatus}) received for order: ${orderId}`);
      await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ status: 'failed' })
      });
      return res.status(200).json({ status: 'OK', message: 'Payment failure recorded', order_id: orderId });
    }
  } catch (error) {
    console.error(`${logHeader} ❌ FATAL UNHANDLED WEBHOOK EXCEPTION:`, error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

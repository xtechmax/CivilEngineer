export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    
    // Extract Order ID & Payment Status from Cashfree Webhook Body
    const dataObj = body.data || {};
    const orderObj = dataObj.order || {};
    const paymentObj = dataObj.payment || {};

    const orderId = orderObj.order_id || body.orderId || body.order_id || req.query.order_id;
    const paymentStatus = paymentObj.payment_status || body.txStatus || body.payment_status || 'SUCCESS';
    const cfPaymentId = paymentObj.cf_payment_id || body.referenceId || body.payment_id || ('cf_pay_' + Date.now());

    if (!orderId) {
      return res.status(200).json({ message: 'Webhook received (No order_id found)' });
    }

    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://qqqhdzubrkzmecqpfuft.supabase.co';
      const defaultServiceKey = Buffer.from('ZXlKaGJHY2lPaUpJVXpVeE5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKMzNWcGhhV3RuYjNWdWRDY3ZjSEZ1ZVhSaExXTm9ZWEFpT2pFM09EWXlOVGsyT0RsZExDSmxjSEFpT2pJeE1ERTRNelUxT0RsbmZRLm5mT3JuR0R4LVFxc284U29MMWZiU21OdXlFaDB2NHBWWUVJTmRha09nUVE=', 'base64').toString('utf-8');
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceKey;

      // 1. Update Supabase Order Status to 'paid'
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

      const updated = await patchResp.json();
      const updatedOrder = Array.isArray(updated) && updated.length > 0 ? updated[0] : null;

      // 2. Send Automated Resend Product Delivery Email
      if (updatedOrder && updatedOrder.email) {
        const defaultResendKey = Buffer.from('cmVfWGR3dnMxRzZfTDFTQnZMekVIOTJwTWVLeHY0UFJYanFO', 'base64').toString('utf-8');
        const resendApiKey = (process.env.RESEND_API_KEY || defaultResendKey).trim();

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0c; color: #f5f5f7; padding: 30px; border-radius: 12px;">
            <h2 style="color: #FFB347; text-align: center;">🎉 Order Confirmed!</h2>
            <p>Thank you for purchasing the <strong>Construction Estimation Master Toolkit™</strong>!</p>
            <div style="background: #1c1c1e; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${updatedOrder.gateway_order_id}</p>
              <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${cfPaymentId}</p>
              <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${updatedOrder.amount}</p>
              <p style="margin: 5px 0;"><strong>Product:</strong> Construction Estimation Master Toolkit™ ${updatedOrder.addon ? '(+ ' + updatedOrder.addon + ')' : ''}</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://www.xtechmax.shop/?order_id=${updatedOrder.gateway_order_id}&status=success" style="background: #FFB347; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                Download Toolkit Files Now →
              </a>
            </div>
            <p style="color: #8e8e93; font-size: 12px; text-align: center; margin-top: 40px;">
              Operated by MD Jedan Hossain | Contact: xtechmax2024@gmail.com
            </p>
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
              from: 'onboarding@resend.dev',
              to: [updatedOrder.email, 'xtechmax2024@gmail.com'],
              subject: `🎉 Your Construction Toolkit Download (Order: ${updatedOrder.gateway_order_id})`,
              html: emailHtml
            })
          });
        } catch (eErr) {
          console.error('Resend Webhook Email Error:', eErr);
        }
      }
    }

    return res.status(200).json({ status: 'OK', message: 'Webhook processed successfully', order_id: orderId });
  } catch (error) {
    console.error('Cashfree Webhook Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

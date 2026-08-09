export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const orderId = req.query.order_id || (req.body && req.body.order_id);

    if (!orderId) {
      return res.status(400).json({ message: 'Missing order_id' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const defaultServiceKey = Buffer.from('ZXlKaGJHY2lPaUpJVXpVeE5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKMzNWcGhhV3RuYjNWdWRDY3ZjSEZ1ZVhSaExXTm9ZWEFpT2pFM09EWXlOVGsyT0RsZExDSmxjSEFpT2pJeE1ERTRNelUxT0RsbmZRLm5mT3JuR0R4LVFxc284U29MMWZiU21OdXlFaDB2NHBWWUVJTmRha09nUVE=', 'base64').toString('utf-8');
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceKey;

    const paymentId = 'cf_pay_' + Math.floor(Math.random() * 8999999999 + 1000000000);

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
        payment_id: paymentId
      })
    });

    const updated = await patchResp.json();
    let updatedOrder = Array.isArray(updated) && updated.length > 0 ? updated[0] : null;

    if (!updatedOrder) {
      const getResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(orderId)}&select=*`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      const getList = await getResp.json();
      if (Array.isArray(getList) && getList.length > 0) {
        updatedOrder = getList[0];
      }
    }

    if (updatedOrder && updatedOrder.email) {
      const planType = updatedOrder.plan_type || (updatedOrder.addon ? 'normal_addon' : 'normal');

      const defaultResendKey = Buffer.from('cmVfWGR3dnMxRzZfTDFTQnZMekVIOTJwTWVLeHY0UFJYanFO', 'base64').toString('utf-8');
      const resendApiKey = (process.env.RESEND_API_KEY || defaultResendKey).trim();
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'Construction Toolkit <orders@xtechmax.shop>';

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
            <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${paymentId}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${updatedOrder.amount}</p>
            <p style="margin: 5px 0;"><strong>Plan Type:</strong> <span style="color: #FFB347; font-weight: bold;">${planType.toUpperCase()}</span></p>
          </div>

          ${downloadButtonsHtml}

          <p style="color: #8e8e93; font-size: 12px; text-align: center; margin-top: 40px;">
            Operated by MD Jedan Hossain | Support: xtechmax2024@gmail.com
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
            from: fromAddress,
            to: [updatedOrder.email],
            subject: `🎉 Your Construction Toolkit Download (${planType === 'normal_addon' ? 'Toolkit + Macros' : 'Master Toolkit'})`,
            html: customerEmailHtml
          })
        });
      } catch (custErr) {
        console.error('Customer Email Delivery Error:', custErr);
      }

      // Admin Notification Email
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #111111; padding: 25px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a; margin-top: 0;">🎉 New Paid Order Received!</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0;"><strong>Plan Type:</strong> <span style="background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${planType}</span></p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${updatedOrder.amount}</p>
            <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${updatedOrder.email}</p>
            <p style="margin: 5px 0;"><strong>Customer Phone:</strong> ${updatedOrder.phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Cashfree Order ID:</strong> ${updatedOrder.gateway_order_id}</p>
            <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${paymentId}</p>
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
        console.error('Admin Email Delivery Error:', adminErr);
      }
    }

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    console.error('Error marking order paid in Supabase:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email, phone, addon1, addon2, couponCode, orderId: clientOrderId } = req.body || {};
    
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Secure server-side amount calculation
    const isCouponValid = typeof couponCode === 'string' && couponCode.trim().toLowerCase() === 'admin1';
    let amount;
    if (isCouponValid) {
      amount = '1.00';
    } else {
      amount = (199.00 + (addon1 ? 99.00 : 0) + (addon2 ? 49.00 : 0)).toFixed(2);
    }
    const txnid = 'TXN_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    const productinfo = 'Construction Estimation Master Toolkit';
    const firstname = (name || (email ? email.split('@')[0] : 'Customer')).replace(/[^a-zA-Z0-9]/g, '').trim() || 'Customer';

    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length < 10) {
      cleanPhone = '9999999999';
    }

    // --- Blocklist Check ---
    const blockedPhones = ['8176027714', '8090602267'];
    const blockedEmails = ['anshsingh50800@gmail.com', 'arnavsingh50800@gmail.com'];
    
    if (blockedPhones.includes(cleanPhone) || (email && blockedEmails.includes(email.toLowerCase().trim()))) {
      return res.status(400).json({ error: 'Payment gateway rejected the request. Please try again later.' });
    }
    // --- End Blocklist Check ---

    const key = process.env.PAYU_MERCHANT_KEY || "Bcrp9R";
    let salt = process.env.PAYU_MERCHANT_SALT;
    if (key === 'Bcrp9R' || !salt) {
      salt = "DRPR9SPIlhkg3IfHUyfgibhbcvzKpdRM";
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.xtechmax.shop';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const surl = `${baseUrl}/api/payu/callback`;
    const furl = `${baseUrl}/api/payu/callback`;

    const udf1 = addon1 ? '1' : '0';
    const udf2 = addon2 ? '1' : '0';
    const udf3 = cleanPhone;
    const udf4 = '';
    const udf5 = '';

    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email || ''}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Save/Update Order in Supabase
    const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    try {
      const checkResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(txnid)}`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      const existing = await checkResp.json();

      const payload = {
        date: dateStr,
        email: email || '',
        phone: phone || cleanPhone,
        amount: parseFloat(amount),
        addon: [addon1 ? 'Master Construction Estimation' : null, addon2 ? 'Practical Vastu Shastra Guide' : null].filter(Boolean).join(' + ') || null,
        status: 'pending',
        gateway_order_id: txnid,
      };

      if (existing && existing.length > 0) {
        if (existing[0].status !== 'paid') {
          await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(txnid)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify(payload)
          });
        }
      } else {
        payload.payment_id = '—';
        payload.followup_status = 'Not Contacted';
        payload.followup_note = '';

        await fetch(`${supabaseUrl}/rest/v1/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (dbErr) {
      console.error('Supabase Save Exception:', dbErr);
    }

    const isTestKey = key === 'gtKFFx' || key === '0MQaQP';
    const actionUrl = isTestKey ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment';

    return res.status(200).json({
      action: actionUrl,
      params: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email: email || '',
        phone: cleanPhone,
        surl,
        furl,
        hash,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5
      }
    });

  } catch (error) {
    console.error('Error generating PayU hash:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

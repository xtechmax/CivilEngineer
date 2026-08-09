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
    const { name, email, phone, orderBump } = req.body || {};

    const amount = orderBump ? 248.00 : 199.00;
    const orderId = 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    // Active Cashfree Production Credentials
    const appId = process.env.CASHFREE_APP_ID || '13542917e5845c6fd7a65ab0f621924531';
    const defaultSecret = Buffer.from('Y2Zza19tYV9wcm9kXzJmZmYwNDNmOWM4ZjE4ZTQ0N2UxMDk3NTg0MTYyMzI4XzZmODlmODQ3', 'base64').toString('utf-8');
    const secretKey = process.env.CASHFREE_SECRET_KEY || defaultSecret;

    // Clean and validate phone number (must be 10 digits)
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length < 10) {
      cleanPhone = '9999999999';
    }

    // Create order with Cashfree Production API
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'cust_' + Date.now(),
          customer_name: name || (email ? email.split('@')[0] : 'Customer'),
          customer_email: email || 'customer@example.com',
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: 'https://www.xtechmax.shop/?order_id={order_id}&status=success',
          notify_url: 'https://www.xtechmax.shop/api/cashfree-webhook',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      return res.status(response.status).json(data);
    }

    // Save Order Record to Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const defaultServiceKey = Buffer.from('ZXlKaGJHY2lPaUpJVXpVeE5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKMzNWcGhhV3RuYjNWdWRDY3ZjSEZ1ZVhSaExXTm9ZWEFpT2pFM09EWXlOVGsyT0RsZExDSmxjSEFpT2pJeE1ERTRNelUxT0RsbmZRLm5mT3JuR0R4LVFxc284U29MMWZiU21OdXlFaDB2NHBWWUVJTmRha09nUVE=', 'base64').toString('utf-8');
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceKey;

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    try {
      await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          date: dateStr,
          email: email || '',
          phone: phone || '',
          amount: amount,
          addon: orderBump ? 'Advanced Macros' : null,
          status: 'pending',
          gateway_order_id: orderId,
          payment_id: '—',
          followup_status: 'Not Contacted',
          followup_note: ''
        })
      });
    } catch (supaErr) {
      console.error('Supabase Save Error (non-blocking):', supaErr);
    }

    return res.status(200).json({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
    });
  } catch (error) {
    console.error('Error creating Cashfree order:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

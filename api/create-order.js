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
    const { name, email, phone, addon1, addon2, orderId: clientOrderId } = req.body || {};
    const amount = 199.00 + (addon1 ? 99.00 : 0) + (addon2 ? 49.00 : 0);
    const orderId = clientOrderId || ('order_' + Date.now() + '_' + Math.floor(Math.random() * 1000));

    // Active Cashfree Production Credentials
    const appId = '13542917e5845c6fd7a65ab0f621924531';
    const secretKey = Buffer.from('Y2Zza19tYV9wcm9kXzJmZmYwNDNmOWM4ZjE4ZTQ0N2UxMDk3NTg0MTYyMzI4XzZmODlmODQ3', 'base64').toString('utf-8');

    // Clean and validate phone number (must be 10 digits)
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length < 10) {
      cleanPhone = '9999999999';
    }


    // --- Blocklist Check ---
    const blockedPhones = ['8176027714', '8090602267'];
    const blockedEmail = 'anshsingh50800@gmail.com';
    
    if (blockedPhones.includes(cleanPhone) || (email && email.toLowerCase().trim() === blockedEmail)) {
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown IP';
      
      const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
      const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';
      
      const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

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
            id: orderId,
            date: dateStr,
            email: email || '',
            phone: phone || '',
            amount: amount,
            addon: [addon1 ? 'Master Construction Estimation' : null, addon2 ? 'Practical Vastu Shastra Guide' : null].filter(Boolean).join(' + ') || null,
            status: 'failed',
            cashfree_order_id: 'BLOCKED_USER',
            followup_note: `Blocked User Attempt. IP: ${clientIp}`
          })
        });
      } catch (err) {
        // silently ignore supabase insert errors
      }

      // Return generic error so they don't know they are explicitly blocked
      return res.status(400).json({ status: 'failed', error: 'Payment gateway rejected the request. Please try again later.' });
    }
    // --- End Blocklist Check ---

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
          return_url: 'https://www.xtechmax.shop/?order_id={order_id}&check_status=true',
          notify_url: 'https://www.xtechmax.shop/api/cashfree-webhook',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      return res.status(response.status).json(data);
    }

    // CRITICAL: Check if this orderId already resulted in a PAID order
    // This prevents duplicate records if user retries on a completed payment
    const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    try {
      // Check if order exists (was saved as draft)
      const checkResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      const existing = await checkResp.json();
      
      const payload = {
          date: dateStr,
          email: email || '',
          phone: phone || '',
          amount: amount,
          addon: [addon1 ? 'Master Construction Estimation' : null, addon2 ? 'Practical Vastu Shastra Guide' : null].filter(Boolean).join(' + ') || null,
          status: 'pending',
          gateway_order_id: orderId,
      };

      if (existing && existing.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify(payload)
        });
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
    } catch (supaErr) {
      console.error('Supabase Save Exception:', supaErr);
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

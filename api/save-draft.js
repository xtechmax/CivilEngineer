export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { orderId, email, phone, amount, addon1, addon2 } = req.body || {};
    if (!orderId || (!email && !phone)) return res.status(200).json({ status: 'ignored' });

    const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const addonStr = [addon1 ? 'Master Construction Estimation' : null, addon2 ? 'Practical Vastu Shastra Guide' : null].filter(Boolean).join(' + ') || null;

    // Check if order exists
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
      amount: amount || 199,
      addon: addonStr,
      status: 'entered', // Status specified by user
      gateway_order_id: orderId,
    };

    if (existing && existing.length > 0) {
      // Don't overwrite if it's already paid or pending
      if (existing[0].status === 'paid' || existing[0].status === 'pending') {
        return res.status(200).json({ status: 'ignored_existing_higher_state' });
      }

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

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error in save-draft:', error);
    return res.status(500).json({ error: error.message });
  }
}

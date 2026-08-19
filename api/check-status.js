import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { order_id } = req.query;
  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';
  const resendApiKey = Buffer.from('cmVfVjRqRkNjalZfS2h3NkVINFNLYWNleHhHcUE1MkROMUVM', 'base64').toString('utf-8');
  const fromAddress = 'Construction Toolkit <orders@xtechmax.shop>';

  try {
    // 1. Fetch Order from Supabase
    let order = null;
    try {
      const checkResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(order_id)}&select=*`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      const orders = await checkResp.json();
      order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
    } catch (e) {
      console.error('Supabase query error in check-status:', e);
    }

    if (order && order.status === 'paid') {
      return res.status(200).json({ status: 'success', amount: parseFloat(order.amount || 0) });
    }

    // 2. If it's a Cashfree order and pending, check Cashfree API
    if (!order_id.startsWith('TXN_')) {
      try {
        const appId = '13542917e5845c6fd7a65ab0f621924531';
        const secretKey = Buffer.from('Y2Zza19tYV9wcm9kXzJmZmYwNDNmOWM4ZjE4ZTQ0N2UxMDk3NTg0MTYyMzI4XzZmODlmODQ3', 'base64').toString('utf-8');

        const cfResp = await fetch(`https://api.cashfree.com/pg/orders/${encodeURIComponent(order_id)}`, {
          method: 'GET',
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': secretKey,
          }
        });

        const cfData = await cfResp.json();

        if (cfData.order_status === 'PAID') {
          const orderAmount = parseFloat(cfData.order_amount || 0);
          if (order) {
            await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(order_id)}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ status: 'paid', payment_id: cfData.cf_order_id || order_id })
            });
          }
          return res.status(200).json({ status: 'success', amount: orderAmount });
        }
      } catch (cfErr) {
        console.error('Cashfree check error:', cfErr);
      }
    }

    return res.status(200).json({ status: order?.status || 'pending', amount: parseFloat(order?.amount || 0) });

  } catch (error) {
    console.error('check-status error:', error);
    return res.status(500).json({ error: error.message });
  }
}

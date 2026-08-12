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

  const appId = '13542917e5845c6fd7a65ab0f621924531';
  const secretKey = Buffer.from('Y2Zza19tYV9wcm9kXzJmZmYwNDNmOWM4ZjE4ZTQ0N2UxMDk3NTg0MTYyMzI4XzZmODlmODQ3', 'base64').toString('utf-8');

  try {
    const response = await fetch(`https://api.cashfree.com/pg/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      }
    });

    const data = await response.json();
    if (data.order_status === 'PAID') {
      return res.status(200).json({ status: 'success', amount: data.order_amount });
    } else {
      return res.status(200).json({ status: data.order_status });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

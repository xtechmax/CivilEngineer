import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { firstname, email, phone, productinfo = 'Construction Master Bundle', amount = '390.00' } = req.body;
    
    if (!firstname || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const key = process.env.PAYU_MERCHANT_KEY || "XZdqBd";
    const salt = process.env.PAYU_MERCHANT_SALT || "iTDtDbj4vLXKuOdyYCdm1viP7GA7BCRi";
    
    if (!key || !salt) {
      return res.status(500).json({ error: 'PayU credentials not configured' });
    }

    // Generate unique transaction ID
    const txnid = 'TXN_' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Webhook URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
    const surl = `${baseUrl}/api/payu/callback`;
    const furl = `${baseUrl}/api/payu/callback`;

    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    res.status(200).json({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      hash
    });
  } catch (error) {
    console.error('PayU Hash Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

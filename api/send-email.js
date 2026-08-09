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
    const { to, subject, html, text } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ message: 'Missing "to" or "subject" parameters' });
    }

    const defaultResendKey = Buffer.from('cmVfWGR3dnMxRzZfTDFTQnZMekVIOTJwTWVLeHY0UFJYanFO', 'base64').toString('utf-8');
    const resendApiKey = process.env.RESEND_API_KEY || defaultResendKey;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
        'User-Agent': 'ResendNode/2.0.0'
      },
      body: JSON.stringify({
        from: 'Construction Toolkit <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html || `<p>${text || ''}</p>`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

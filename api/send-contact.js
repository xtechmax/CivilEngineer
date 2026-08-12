export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, message } = req.body || {};
  const resendKey = Buffer.from('cmVfVjRqRkNjalZfS2h3NkVINFNLYWNleHhHcUE1MkROMUVM', 'base64').toString('utf-8');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Contact Form <orders@xtechmax.shop>',
        to: ['xtechmax2024@gmail.com'],
        subject: `Contact Form: ${name} (${email})`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`
      })
    });
    const data = await r.json();
    if (r.ok) return res.status(200).json({ ok: true });
    return res.status(500).json({ error: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

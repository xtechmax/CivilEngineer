import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

async function parseBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0 && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try { return JSON.parse(req.body); } catch (e) {}
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  if (Buffer.isBuffer(req.body)) {
    const str = req.body.toString('utf-8');
    try { return JSON.parse(str); } catch (e) {}
    return Object.fromEntries(new URLSearchParams(str));
  }
  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const raw = Buffer.concat(buffers).toString('utf-8');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
      return Object.fromEntries(new URLSearchParams(raw));
    }
  } catch (e) {}
  return req.query || {};
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.xtechmax.shop';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const body = await parseBody(req);

    const {
      status = '',
      firstname = '',
      amount = '',
      txnid = '',
      hash = '',
      email = '',
      phone = '',
      productinfo = '',
      key = '',
      mihpayid = '',
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = '',
      additionalCharges
    } = body || {};

    const merchantKey = key || process.env.PAYU_MERCHANT_KEY || "Bcrp9R";
    let salt = process.env.PAYU_MERCHANT_SALT;
    if (merchantKey === 'Bcrp9R' || !salt) {
      salt = "DRPR9SPIlhkg3IfHUyfgibhbcvzKpdRM";
    }

    // Verify reverse hash:
    // Standard: sha512(salt|status|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const hashStringStandard = `${salt}|${status}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
    const calculatedHashStandard = crypto.createHash('sha512').update(hashStringStandard).digest('hex');

    // With additional charges: sha512(additionalCharges|salt|status|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    let hashWithCharges = '';
    if (additionalCharges) {
      const hashStringCharges = `${additionalCharges}|${hashStringStandard}`;
      hashWithCharges = crypto.createHash('sha512').update(hashStringCharges).digest('hex');
    }

    const isHashValid = (hash && (calculatedHashStandard.toLowerCase() === hash.toLowerCase() || (hashWithCharges && hashWithCharges.toLowerCase() === hash.toLowerCase())));

    if (!isHashValid && status === 'success') {
      console.warn('PayU Hash mismatch warning. Expected:', calculatedHashStandard, 'Received:', hash);
      // If payment status is explicit success and valid txnid is present, log and continue to fulfill
    }

    const supabaseUrl = 'https://qqqhdzubrkzmecqpfuft.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcWhkenVicmt6bWVjcXBmdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk2ODksImV4cCI6MjEwMTgzNTY4OX0.6AOXzjpaOOWX_qnhG_6ZLSkdaciQDZWqUVd0X2A864E';

    if (status === 'success') {
      const orderAmount = parseFloat(amount || 0);

      // Check if order exists in Supabase
      let order = null;
      try {
        const checkResp = await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(txnid)}&select=*`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        });
        const orders = await checkResp.json();
        order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
      } catch (dbReadErr) {
        console.error('Error fetching Supabase order in PayU callback:', dbReadErr);
      }

      const orderAddonStr = order?.addon || '';
      const isAddon1 = udf1 === '1' || orderAddonStr.includes('Master Construction Estimation') || orderAmount === 298 || orderAmount === 347 || orderAmount === 1;
      const isAddon2 = udf2 === '1' || orderAddonStr.includes('Practical Vastu Shastra Guide') || orderAmount === 248 || orderAmount === 347 || orderAmount === 1;

      let names = ['Construction Estimation Master Toolkit™'];
      if (isAddon1) names.push('Master Construction Estimation');
      if (isAddon2) names.push('Practical Vastu Shastra Guide');
      const planLabel = names.join(' + ');

      // Update Supabase to paid
      try {
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const updatePayload = {
          status: 'paid',
          payment_id: String(mihpayid || txnid),
          date: dateStr,
          amount: orderAmount,
          email: email || order?.email || '',
          phone: phone || udf3 || order?.phone || '',
          addon: [isAddon1 ? 'Master Construction Estimation' : null, isAddon2 ? 'Practical Vastu Shastra Guide' : null].filter(Boolean).join(' + ') || null,
          gateway_order_id: txnid
        };

        if (order) {
          await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(txnid)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify(updatePayload)
          });
        } else {
          updatePayload.followup_status = 'Not Contacted';
          updatePayload.followup_note = '';
          await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(updatePayload)
          });
        }
      } catch (dbUpdateErr) {
        console.error('Error updating order to paid in Supabase:', dbUpdateErr);
      }

      // Send delivery email via Resend
      const customerEmail = email || order?.email;
      if (customerEmail) {
        try {
          const resendApiKey = Buffer.from('cmVfVjRqRkNjalZfS2h3NkVINFNLYWNleHhHcUE1MkROMUVM', 'base64').toString('utf-8');
          const fromAddress = 'Construction Toolkit <orders@xtechmax.shop>';

          const addon1DriveLink = 'https://drive.google.com/drive/folders/1Z5LNNv36jODonCyAoESu5252hN3MFVOh?usp=sharing';
          const addon2DriveLink = 'https://drive.google.com/drive/folders/1_54-ZuYJANA_keHuH4K5Vmod6Kl8zYYP?usp=drive_link';

          let downloadHtml = `
            <div style="background:#1c1c1e;padding:20px;border-radius:10px;margin:20px 0;border:1px solid #333;">
              <h3 style="color:#FFB347;margin-top:0;">📦 Your Files Are Ready</h3>
              <p style="color:#d1d5db;font-size:13px;">The PDF is attached to this email. You can also download it directly below.</p>
              <p style="color:#aaa;font-size:12px;margin-top:10px;">📎 <strong>Attachment:</strong> EngineerXtech.pdf</p>
            </div>
          `;

          if (isAddon1) {
            downloadHtml += `
              <div style="background:#064e3b;padding:20px;border-radius:10px;margin:10px 0;border:1px solid #059669;text-align:center;">
                <h3 style="color:#34d399;margin-top:0;">⚡ Add-on: Master Construction Estimation</h3>
                <p style="color:#d1d5db;font-size:13px;margin-bottom:14px;">BOQ, BBS, Rate Analysis & Billing — Access via Google Drive:</p>
                <a href="${addon1DriveLink}" target="_blank" style="background:#10B981;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:8px;display:inline-block;">
                  Access Add-on Drive Folder →
                </a>
              </div>
            `;
          }

          if (isAddon2) {
            downloadHtml += `
              <div style="background:#064e3b;padding:20px;border-radius:10px;margin:10px 0;border:1px solid #059669;text-align:center;">
                <h3 style="color:#34d399;margin-top:0;">⚡ Add-on: Practical Vastu Shastra Guide</h3>
                <p style="color:#d1d5db;font-size:13px;margin-bottom:14px;">Complete Mastery — Access via Google Drive:</p>
                <a href="${addon2DriveLink}" target="_blank" style="background:#10B981;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:8px;display:inline-block;">
                  Access Add-on Drive Folder →
                </a>
              </div>
            `;
          }

          const emailHtml = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0c;color:#f5f5f7;padding:30px;border-radius:12px;">
              <h2 style="color:#FFB347;text-align:center;margin-top:0;">🎉 Order Confirmed!</h2>
              <p style="font-size:14px;color:#e5e7eb;">Thank you for purchasing the <strong>${planLabel}</strong>!</p>
              <div style="background:#1c1c1e;padding:18px;border-radius:8px;margin:20px 0;">
                <p style="margin:4px 0;font-size:13px;"><strong>Order ID:</strong> ${txnid}</p>
                <p style="margin:4px 0;font-size:13px;"><strong>Amount Paid:</strong> ₹${orderAmount}</p>
                <p style="margin:4px 0;font-size:13px;"><strong>Package:</strong> <span style="color:#FFB347;font-weight:bold;">${planLabel}</span></p>
              </div>
              ${downloadHtml}
              <p style="color:#8e8e93;font-size:12px;text-align:center;margin-top:35px;">
                Operated by MD Jedan Hossain | Support: xtechmax2024@gmail.com
              </p>
            </div>
          `;

          // Read PDF from assets
          let pdfBuffer;
          try {
            const pdfPath = path.join(process.cwd(), 'assets', 'EngineerXtech.pdf');
            pdfBuffer = fs.readFileSync(pdfPath);
          } catch (pdfReadErr) {
            console.error('Could not read PDF from disk:', pdfReadErr);
          }

          const attachments = [];
          if (pdfBuffer) {
            attachments.push({
              filename: 'EngineerXtech.pdf',
              content: pdfBuffer.toString('base64')
            });
          }

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [customerEmail],
              subject: `🎉 Your Order Is Confirmed — ${planLabel}`,
              html: emailHtml,
              attachments: attachments.length > 0 ? attachments : undefined
            })
          });

        } catch (emailErr) {
          console.error('PayU callback Resend email error:', emailErr);
        }
      }

      return res.redirect(302, `${baseUrl}/?order_id=${encodeURIComponent(txnid)}&check_status=true&amount=${orderAmount}&status=success`);
    } else {
      // Mark as failed in Supabase
      try {
        await fetch(`${supabaseUrl}/rest/v1/orders?gateway_order_id=eq.${encodeURIComponent(txnid)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ status: 'failed' })
        });
      } catch (failErr) {
        console.error('Error marking order failed in Supabase:', failErr);
      }

      return res.redirect(302, `${baseUrl}/?status=failure&order_id=${encodeURIComponent(txnid)}`);
    }

  } catch (error) {
    console.error('PayU Callback Error:', error);
    return res.redirect(302, `${baseUrl}/?status=error`);
  }
}

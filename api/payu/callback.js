import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.redirect(302, '/');
  }

  try {
    const { status, firstname, amount, txnid, hash, email, productinfo, key, additionalCharges } = req.body;
    
    const salt = process.env.PAYU_MERCHANT_SALT;
    const merchantKey = process.env.PAYU_MERCHANT_KEY;

    if (!salt || !merchantKey) {
      return res.redirect(302, '/?status=error&message=ServerConfigError');
    }

    // Verify reverse hash
    // Sequence: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    let hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
    
    if (additionalCharges) {
      hashString = `${additionalCharges}|${hashString}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash === hash) {
      if (status === 'success') {
        // Payment successful
        return res.redirect(302, '/?status=success&txnid=' + txnid);
      } else {
        // Payment failed
        return res.redirect(302, '/?status=failure&txnid=' + txnid);
      }
    } else {
      // Hash mismatch / tampering detected
      return res.redirect(302, '/?status=tampered');
    }

  } catch (error) {
    console.error('PayU Callback Error:', error);
    return res.redirect(302, '/?status=error');
  }
}

const admin = require('firebase-admin');
const { getClient } = require('./_twilio-client');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('twilio-notify Firebase logging disabled:', error.message);
  }
}

const allowedAdmins = new Set((process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean));

async function authenticate(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !admin.apps.length) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('twilio-notify authentication failed:', error.message);
    return null;
  }
}

// Internal endpoint: send an outbound SMS or automated call for order/account notifications.
// Requires an authenticated Firebase user (any signed-in account, or an admin for calls).
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = await authenticate(req);
  if (!user) return res.status(401).json({ error: 'AUTH_REQUIRED' });

  const { to, message, type = 'sms' } = req.body || {};
  if (!to || !message) return res.status(400).json({ error: 'to et message sont requis.' });

  if (type === 'call' && !allowedAdmins.has((user.email || '').toLowerCase())) {
    return res.status(403).json({ error: 'ADMIN_ONLY_FOR_CALLS' });
  }

  const client = getClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !fromNumber) return res.status(503).json({ error: 'TWILIO_NOT_CONFIGURED' });

  try {
    if (type === 'call') {
      const call = await client.calls.create({
        to, from: fromNumber,
        twiml: `<Response><Say language="fr-FR" voice="Polly.Lea">${String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Say></Response>`
      });
      if (admin.apps.length) await admin.firestore().collection('ney_outbound_calls').add({ to, message, sid: call.sid, userId: user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      return res.status(200).json({ sid: call.sid });
    }
    const sms = await client.messages.create({ to, from: fromNumber, body: message });
    if (admin.apps.length) await admin.firestore().collection('ney_outbound_sms').add({ to, message, sid: sms.sid, userId: user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.status(200).json({ sid: sms.sid });
  } catch (error) {
    console.error('twilio-notify:', error.message);
    return res.status(502).json({ error: 'TWILIO_SEND_FAILED', message: error.message });
  }
};

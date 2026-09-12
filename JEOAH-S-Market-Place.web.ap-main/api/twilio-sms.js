const admin = require('firebase-admin');
const { isValidTwilioRequest, requestUrl } = require('./_twilio-client');
const { getNeyReply } = require('./_ney-reply');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('twilio-sms Firebase logging disabled:', error.message);
  }
}

function xmlEscape(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Twilio webhook: incoming SMS. Configure this URL in the Twilio number's "A MESSAGE COMES IN" setting.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!isValidTwilioRequest(req, requestUrl(req))) return res.status(403).send('Invalid signature');

  const body = req.body || {};
  const from = body.From || '';
  const messageText = body.Body || '';

  const reply = await getNeyReply(messageText, { channel: 'sms', language: 'fr' });

  if (admin.apps.length) {
    try {
      await admin.firestore().collection('ney_sms_conversations').add({
        from, messageText, reply, createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('twilio-sms logging failed:', error.message);
    }
  }

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(reply)}</Message></Response>`);
};

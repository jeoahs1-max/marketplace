const admin = require('firebase-admin');
const { isValidTwilioRequest, requestUrl } = require('./_twilio-client');
const { getNeyReply } = require('./_ney-reply');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('twilio-voice-gather Firebase logging disabled:', error.message);
  }
}

function xmlEscape(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Twilio webhook: called after each <Gather> during a live call, continues the conversation loop.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!isValidTwilioRequest(req, requestUrl(req))) return res.status(403).send('Invalid signature');

  const body = req.body || {};
  const speechText = body.SpeechResult || '';
  const from = body.From || '';

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const gatherAction = `${proto}://${host}/api/twilio-voice-gather`;

  const reply = speechText
    ? await getNeyReply(speechText, { channel: 'voice', language: 'fr' })
    : "Je n'ai pas compris, pouvez-vous repeter ?";

  if (admin.apps.length) {
    try {
      await admin.firestore().collection('ney_call_conversations').add({
        from, speechText, reply, createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('twilio-voice-gather logging failed:', error.message);
    }
  }

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" language="fr-FR" action="${xmlEscape(gatherAction)}" method="POST" speechTimeout="auto"><Say language="fr-FR" voice="Polly.Lea">${xmlEscape(reply)}</Say></Gather><Say language="fr-FR" voice="Polly.Lea">Merci d'avoir appele JEOAH'S. Au revoir.</Say></Response>`);
};

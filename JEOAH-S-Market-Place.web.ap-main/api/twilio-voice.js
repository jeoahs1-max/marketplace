const { isValidTwilioRequest, requestUrl } = require('./_twilio-client');

function xmlEscape(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Twilio webhook: incoming call. Configure this URL in the Twilio number's "A CALL COMES IN" setting.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!isValidTwilioRequest(req, requestUrl(req))) return res.status(403).send('Invalid signature');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const gatherAction = `${proto}://${host}/api/twilio-voice-gather`;

  const greeting = "Bonjour ! Vous êtes bien avec Ney de JEOAH'S Market Place. Comment puis-je vous aider aujourd'hui ?";

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" language="fr-FR" action="${xmlEscape(gatherAction)}" method="POST" speechTimeout="auto" timeout="6"><Say language="fr-FR" voice="Polly.Lea-Neural">${xmlEscape(greeting)}</Say></Gather><Say language="fr-FR" voice="Polly.Lea-Neural">Je n'ai rien entendu, n'hésitez pas à rappeler. À très bientôt !</Say></Response>`);
};

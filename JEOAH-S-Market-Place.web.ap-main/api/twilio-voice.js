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

  const greeting = "Bonjour, vous etes en ligne avec Ney, l'assistante de JEOAH'S Market Place. Posez votre question apres le signal.";

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" language="fr-FR" action="${xmlEscape(gatherAction)}" method="POST" speechTimeout="auto"><Say language="fr-FR" voice="Polly.Lea">${xmlEscape(greeting)}</Say></Gather><Say language="fr-FR" voice="Polly.Lea">Nous n'avons rien entendu. Au revoir.</Say></Response>`);
};

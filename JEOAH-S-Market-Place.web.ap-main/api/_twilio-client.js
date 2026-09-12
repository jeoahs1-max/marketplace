const twilio = require('twilio');

// Auth via API Key (SID + Secret) when available, falls back to Auth Token.
function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid) return null;
  if (apiKeySid && apiKeySecret) return twilio(apiKeySid, apiKeySecret, { accountSid });
  if (authToken) return twilio(accountSid, authToken);
  return null;
}

// Twilio signs webhook requests; validation requires the Auth Token (not the API Key secret).
function isValidTwilioRequest(req, fullUrl) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true; // cannot validate without the auth token, allow but log upstream
  const signature = req.headers['x-twilio-signature'];
  if (!signature) return false;
  return twilio.validateRequest(authToken, signature, fullUrl, req.body || {});
}

function requestUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}${req.url}`;
}

module.exports = { getClient, isValidTwilioRequest, requestUrl };

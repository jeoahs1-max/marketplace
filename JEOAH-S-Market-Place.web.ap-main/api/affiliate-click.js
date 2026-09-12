const admin = require('firebase-admin');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('Configuration Firebase de suivi indisponible:', error.message);
  }
}

module.exports = async (req, res) => {
  const target = req.query?.url;
  const affiliateId = req.query?.affiliate_id || 'unknown';
  if (!target) return res.status(400).send('Lien manquant');

  let destination;
  try {
    destination = new URL(target);
    if (!['http:', 'https:'].includes(destination.protocol)) throw new Error('Protocole invalide');
  } catch (_) {
    return res.status(400).send('Lien invalide');
  }

  if (admin.apps.length) {
    try {
      await admin.firestore().collection('affiliate_clicks').add({
        affiliateId,
        destinationHost: destination.hostname,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Impossible d’enregistrer le clic:', error.message);
    }
  }

  return res.redirect(302, destination.toString());
};

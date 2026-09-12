const admin = require('firebase-admin');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('Configuration Firebase indisponible:', error.message);
  }
}

module.exports = async (req, res) => {
  const affiliateId = String(req.query?.affiliate_id || '').trim();
  if (!affiliateId) return res.status(400).json({ error: 'Identifiant affilié manquant', clicks: 0 });
  if (!admin.apps.length) return res.status(200).json({ clicks: 0, available: false });

  try {
    const snapshot = await admin.firestore()
      .collection('affiliate_clicks')
      .where('affiliateId', '==', affiliateId)
      .get();
    return res.status(200).json({ clicks: snapshot.size, available: true });
  } catch (error) {
    console.error('Impossible de charger les clics:', error.message);
    return res.status(200).json({ clicks: 0, available: false });
  }
};

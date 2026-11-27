const admin = require('firebase-admin');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('user-sync Firebase init error:', error.message);
  }
}

function normalizeEmailKey(email) {
  return String(email || '').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '');
}

function mergeProductsByIdOrName(existing = [], incoming = [], deletedIds = []) {
  const deletedSet = new Set((Array.isArray(deletedIds) ? deletedIds : []).map(String));
  const map = new Map();

  const addList = (list) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (!item || !item.id) continue;
      if (deletedSet.has(String(item.id))) continue;
      const key = String(item.name || item.title || item.id).trim().toLowerCase();
      const prev = map.get(key);
      if (!prev || String(item.createdAt || '') >= String(prev.createdAt || '')) {
        map.set(key, item);
      }
    }
  };

  addList(existing);
  addList(incoming);
  return Array.from(map.values())
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .slice(0, 60);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!admin.apps.length) {
    return res.status(200).json({ ok: false, reason: 'FIREBASE_ADMIN_UNAVAILABLE' });
  }

  const db = admin.firestore();

  try {
    if (req.method === 'GET') {
      const emailKey = normalizeEmailKey(req.query?.email);
      if (!emailKey) return res.status(400).json({ ok: false, error: 'Email requis' });
      const snap = await db.collection('user_sync_by_email').doc(emailKey).get();
      if (!snap.exists) {
        return res.status(200).json({ ok: true, data: null });
      }
      return res.status(200).json({ ok: true, data: snap.data() });
    }

    if (req.method === 'POST') {
      const { email, storefront, affiliateLinks, affiliateProducts, vendorProducts, deletedProductId } = req.body || {};
      const emailKey = normalizeEmailKey(email);
      if (!emailKey) return res.status(400).json({ ok: false, error: 'Email requis' });

      const docRef = db.collection('user_sync_by_email').doc(emailKey);
      const existingSnap = await docRef.get();
      const existing = existingSnap.exists ? (existingSnap.data() || {}) : {};

      const deletedIds = Array.isArray(existing.deletedProductIds) ? [...existing.deletedProductIds] : [];
      if (deletedProductId && !deletedIds.includes(String(deletedProductId))) {
        deletedIds.push(String(deletedProductId));
      }

      const payload = {
        email: emailKey,
        deletedProductIds: deletedIds.slice(-100),
        updatedAt: new Date().toISOString()
      };

      if (storefront && typeof storefront === 'object') {
        payload.storefront = {
          ...(existing.storefront || {}),
          ...storefront,
          updatedAt: new Date().toISOString()
        };
      }

      if (Array.isArray(affiliateLinks) && affiliateLinks.length) {
        payload.affiliateLinks = affiliateLinks;
      }

      if (Array.isArray(affiliateProducts) || deletedProductId) {
        payload.affiliateProducts = mergeProductsByIdOrName(
          existing.affiliateProducts || [],
          affiliateProducts || [],
          deletedIds
        );
      }

      if (Array.isArray(vendorProducts) || deletedProductId) {
        payload.vendorProducts = mergeProductsByIdOrName(
          existing.vendorProducts || [],
          vendorProducts || [],
          deletedIds
        );
      }

      await docRef.set(payload, { merge: true });
      const updatedSnap = await docRef.get();
      return res.status(200).json({ ok: true, data: updatedSnap.data() });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('user-sync error:', error.message);
    return res.status(200).json({ ok: false, error: error.message });
  }
};

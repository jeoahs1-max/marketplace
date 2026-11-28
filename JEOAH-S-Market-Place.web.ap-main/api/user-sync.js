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
      if (req.query?.scope === 'central') {
        const allMap = new Map();
        const storesMap = new Map();
        try {
          const syncSnaps = await db.collection('user_sync_by_email').get();
          syncSnaps.forEach(docSnap => {
            const d = docSnap.data() || {};
            const sfLegacy = d.storefront || {};
            const sfVen = d.storefront_vendeur || sfLegacy;
            const sfAff = d.storefront_affilie || sfLegacy;
            const venStoreName = sfVen.storeName || d.email?.split('@')[0] || 'Boutique Vendeur';
            const affStoreName = sfAff.storeName || d.email?.split('@')[0] || 'Vitrine Affilié';
            const affList = Array.isArray(d.affiliateProducts) ? d.affiliateProducts : [];
            const venList = Array.isArray(d.vendorProducts) ? d.vendorProducts : [];

            affList.forEach(p => {
              if (!p || !p.id) return;
              const enriched = { ...p, storeName: p.storeName || affStoreName, storeAvatar: sfAff.profilePictureUrl || '' };
              const key = String(p.name || p.title || p.id).trim().toLowerCase();
              const prev = allMap.get(key);
              if (!prev || String(p.createdAt || '') >= String(prev.createdAt || '')) {
                allMap.set(key, enriched);
              }
            });
            venList.forEach(p => {
              if (!p || !p.id) return;
              const enriched = { ...p, storeName: p.storeName || venStoreName, storeAvatar: sfVen.profilePictureUrl || '' };
              const key = String(p.name || p.title || p.id).trim().toLowerCase();
              const prev = allMap.get(key);
              if (!prev || String(p.createdAt || '') >= String(prev.createdAt || '')) {
                allMap.set(key, enriched);
              }
            });

            if (sfVen.storeName || venList.length) {
              storesMap.set(`${d.email || docSnap.id}::vendeur`, {
                id: docSnap.id,
                role: 'vendeur',
                name: venStoreName,
                category: sfVen.category || 'Boutique Vendeur',
                avatar: sfVen.profilePictureUrl || '',
                productsCount: venList.length
              });
            }
            if (sfAff.storeName || affList.length) {
              storesMap.set(`${d.email || docSnap.id}::affilie`, {
                id: docSnap.id,
                role: 'affilie',
                name: affStoreName,
                category: sfAff.category || 'Sélection Affilié',
                avatar: sfAff.profilePictureUrl || '',
                productsCount: affList.length
              });
            }
          });
        } catch (_) {}
        try {
          const pubSnaps = await db.collection('artifacts/jeoahs1-max-03326376-49b27/public/data/products').get();
          pubSnaps.forEach(docSnap => {
            const p = { id: docSnap.id, ...docSnap.data() };
            const key = String(p.name || p.title || p.id).trim().toLowerCase();
            if (!allMap.has(key)) allMap.set(key, p);
          });
        } catch (_) {}
        return res.status(200).json({
          ok: true,
          products: Array.from(allMap.values()),
          stores: Array.from(storesMap.values())
        });
      }

      const emailKey = normalizeEmailKey(req.query?.email);
      if (!emailKey) return res.status(400).json({ ok: false, error: 'Email requis' });
      const snap = await db.collection('user_sync_by_email').doc(emailKey).get();
      if (!snap.exists) {
        return res.status(200).json({ ok: true, data: null });
      }
      return res.status(200).json({ ok: true, data: snap.data() });
    }

    if (req.method === 'POST') {
      const { email, storefront, storefrontRole, storefront_vendeur, storefront_affilie, affiliateLinks, affiliateProducts, vendorProducts, deletedProductId } = req.body || {};
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

      const roleNorm = String(storefrontRole || '').toLowerCase();
      if (storefront_vendeur && typeof storefront_vendeur === 'object') {
        payload.storefront_vendeur = {
          ...(existing.storefront_vendeur || {}),
          ...storefront_vendeur,
          updatedAt: new Date().toISOString()
        };
      }
      if (storefront_affilie && typeof storefront_affilie === 'object') {
        payload.storefront_affilie = {
          ...(existing.storefront_affilie || {}),
          ...storefront_affilie,
          updatedAt: new Date().toISOString()
        };
      }
      if (storefront && typeof storefront === 'object') {
        if (roleNorm === 'vendeur') {
          payload.storefront_vendeur = {
            ...(existing.storefront_vendeur || {}),
            ...storefront,
            updatedAt: new Date().toISOString()
          };
        } else if (roleNorm === 'affilie') {
          payload.storefront_affilie = {
            ...(existing.storefront_affilie || {}),
            ...storefront,
            updatedAt: new Date().toISOString()
          };
        } else {
          payload.storefront = {
            ...(existing.storefront || {}),
            ...storefront,
            updatedAt: new Date().toISOString()
          };
        }
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

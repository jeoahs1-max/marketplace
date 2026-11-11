const admin = require('firebase-admin');
const fetch = require('node-fetch');
const MARKETPLACE_APP_ID = 'jeoahs1-max-03326376-49b27';
const MARKETPLACE_PAID_PLANS = new Set(['starter', 'pro', 'premium', 'enterprise']);
const allowedAdmins = new Set((process.env.ADMIN_EMAILS || 'jeoahs1@gmail.com').split(',').map(email => email.trim().toLowerCase()).filter(Boolean));

function toDate(value) {
  if (!value) return null;
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ensureAdmin() {
  if (!admin.apps || !admin.apps.length) {
    const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!encoded) return false;
    try {
      const serviceAccount = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      return true;
    } catch (error) {
      console.error('JEOAH orchestrator Firebase init failed:', error.message);
      return false;
    }
  }
  return true;
}

async function isAuthorizedAdmin(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;

  try {
    const user = await admin.auth().verifyIdToken(token);
    return allowedAdmins.has((user.email || '').toLowerCase());
  } catch (error) {
    console.warn('JEOAH orchestrator admin authorization failed:', error.message);
    return false;
  }
}

function normalizeUserProfile(raw = {}) {
  const role = String(raw.role || 'visiteur').toLowerCase();
  const plan = String(raw.selectedPlan || raw.plan || raw.subscription?.planId || 'free').toLowerCase();
  const expiresAt = toDate(raw.expiresAt || raw.subscription?.expiresAt);
  const marketplaceEnabled = raw.marketplaceEnabled !== false &&
    MARKETPLACE_PAID_PLANS.has(plan) &&
    expiresAt !== null &&
    expiresAt > new Date() &&
    (!raw.subscriptionStatus || raw.subscriptionStatus === 'active');
  const policy = {
    canUseSite: true,
    canSelfPublishOnSocial: true,
    canAutoPublishCentral: marketplaceEnabled,
    aiSimpleText: true,
    aiPromoText: false,
    aiVideo: false,
    aiPostPublication: false,
    autoPostingEnabled: false
  };
  return { role, plan, expiresAt, marketplaceEnabled, policy };
}

function buildSimpleProductCopy({ productName = 'Produit', category = 'Divers', features = [] } = {}) {
  const safeName = String(productName || 'Produit').trim() || 'Produit';
  const safeCategory = String(category || 'Divers').trim() || 'Divers';
  const selectedFeatures = Array.isArray(features) && features.length ? features.slice(0, 3) : ['Simple à utiliser', 'Pratique', 'Qualité de base'];
  return `Produit : ${safeName}.\n\nCe produit appartient à la catégorie ${safeCategory}. Il est simple à utiliser et pratique au quotidien. ${selectedFeatures.join(', ')}.`;
}

function validForCentral(product = {}, profile = {}) {
  const blocked = product.hidden === true || product.status === 'rejected' || product.removed === true || product.publicationStatus === 'rejected';
  const hasImage = Boolean(product.imageUrl || product.image || product.images?.length);
  const hasName = Boolean(product.name || product.title);
  const canPublishCentral = profile.marketplaceEnabled === true && product.subscriptionActive !== false;
  return !blocked && hasImage && hasName && canPublishCentral;
}

async function fetchUserProfiles(db) {
  const snapshot = await db.collection('profiles').get();
  const result = {};
  snapshot.forEach(doc => {
    result[doc.id] = doc.data();
  });
  return result;
}

function buildMarketItem(item, marketplaceSource, ownerId, profile) {
  const finalName = item.name || item.title || item.productName || 'Produit JEOAH';
  const label = marketplaceSource === 'vendor' ? 'Vendeur' : 'Affilié';
  const offer = Array.isArray(item.offers) ? item.offers[0] : {};
  return {
    ...item,
    id: item.id || item.productId || ownerId || 'marketplace-item',
    name: finalName,
    title: item.title || finalName,
    source: item.source || label,
    type: marketplaceSource,
    marketplaceSource,
    ownerId: ownerId || item.ownerId || item.affiliateId || 'marketplace',
    plan: profile.plan,
    url: item.url || item.redirection || offer.url || '#',
    imageUrl: item.imageUrl || item.image || item.images?.[0] || 'https://placehold.co/600x600/e2e8f0/334155?text=Produit',
    price: item.price ?? offer.price ?? item.priceUsd ?? 0,
    subscriptionActive: true,
    subscriptionExpiresAt: profile.expiresAt.toISOString(),
    status: item.status || 'approved',
    publicationStatus: item.publicationStatus || 'published_by_jeoah',
    marketState: 'approved'
  };
}

async function syncMarketplaceCentral(db) {
  const profiles = await fetchUserProfiles(db);
  const productsRef = db.collection(`artifacts/${MARKETPLACE_APP_ID}/public/data/products`);
  const [vendorSnap, affiliateSnap, centralSnap] = await Promise.all([
    db.collectionGroup('products').get(),
    db.collection(`artifacts/${MARKETPLACE_APP_ID}/public/data/affiliate_products`).get(),
    productsRef.get()
  ]);

  const eligible = [];

  vendorSnap.forEach(doc => {
    const segments = doc.ref.path.split('/');
    if (segments.length !== 6 ||
      segments[0] !== 'artifacts' ||
      segments[1] !== MARKETPLACE_APP_ID ||
      segments[2] !== 'users' ||
      segments[4] !== 'products') return;
    const data = doc.data();
    const ownerId = segments[3];
    const profile = normalizeUserProfile(profiles[ownerId] || {});
    if (validForCentral(data, profile)) {
      eligible.push(buildMarketItem({ ...data, id: `vendor_${ownerId}_${doc.id}` }, 'vendor', ownerId, profile));
    }
  });

  affiliateSnap.forEach((doc) => {
    const data = doc.data();
    const affiliateId = data.affiliateId || data.ownerId || doc.id;
    const profile = normalizeUserProfile(profiles[affiliateId] || {});
    if (validForCentral(data, profile)) {
      eligible.push(buildMarketItem({ ...data, id: `affiliate_${affiliateId}_${doc.id}` }, 'affiliate', affiliateId, profile));
    }
  });

  const desiredIds = new Set(eligible.map(item => item.id));
  const staleIds = [];
  centralSnap.forEach(doc => {
    const managedProduct = ['vendor', 'affiliate'].includes(doc.data().marketplaceSource) ||
      ['vendor', 'affiliate'].includes(doc.data().type);
    if (managedProduct && !desiredIds.has(doc.id)) staleIds.push(doc.id);
  });

  await Promise.all(staleIds.map(id => productsRef.doc(id).delete()));

  const results = [];
  for (const item of eligible) {
    const ref = productsRef.doc(item.id);
    await ref.set({
      ...item,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'approved',
      publicationStatus: 'published_by_jeoah'
    }, { merge: true });
    results.push({
      id: item.id,
      title: item.name || item.title || 'Produit',
      source: item.source,
      plan: item.plan || 'active'
    });
  }

  return { synced: results.length, removed: staleIds.length, items: results };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { action = 'sync', userId, prompt = '', targetProductId } = req.body || {};
  if (!ensureAdmin()) return res.status(200).json({ ok: false, message: 'JEOAH orchestrator requires Firebase service account configuration.' });
  if (action !== 'prepare_simple_product_text' && !(await isAuthorizedAdmin(req))) {
    return res.status(403).json({ ok: false, error: 'Accès réservé aux administrateurs.' });
  }

  const db = admin.firestore();

  try {
    if (action === 'sync_central') {
      const result = await syncMarketplaceCentral(db);
      return res.status(200).json({ ok: true, action: 'sync_central', ...result });
    }

    if (action === 'analyze_user') {
      const profileRef = db.collection('profiles').doc(userId || 'unknown');
      const profileSnap = await profileRef.get();
      const profile = profileSnap.exists ? profileSnap.data() : {};
      const normalized = normalizeUserProfile(profile);
      const market = await syncMarketplaceCentral(db);
      return res.status(200).json({
        ok: true,
        action: 'analyze_user',
        userId: userId || null,
        profile: normalized,
        marketSummary: { synced: market.synced, removed: market.removed },
        recommendation: normalized.marketplaceEnabled
          ? 'Votre vitrine est autorisée à publier sur la marketplace centrale.'
          : 'Votre plan ne permet pas encore la publication sur la vitrine centrale.'
      });
    }

    if (action === 'evaluate_product') {
      const productRef = await db.collection('products').doc(targetProductId).get();
      const product = productRef.exists ? productRef.data() : null;
      if (!product) return res.status(404).json({ ok: false, message: 'Produit introuvable.' });
      const profile = normalizeUserProfile((await db.collection('profiles').doc(product.ownerId || userId).get()).data() || {});
      const approved = validForCentral(product, profile);
      return res.status(200).json({
        ok: true,
        action: 'evaluate_product',
        productId: targetProductId,
        approved,
        reason: approved
          ? 'Produit compatible avec la publication centrale.'
          : 'Produit non conforme : image, statut ou plan non compatibles.',
        profile
      });
    }

    if (action === 'prepare_simple_product_text') {
      const name = String((req.body && req.body.productName) || 'Produit').trim() || 'Produit';
      const category = String((req.body && req.body.category) || 'Divers').trim() || 'Divers';
      const features = Array.isArray(req.body && req.body.features) ? req.body.features : ['Simple à utiliser', 'Pratique', 'Qualité de base'];
      return res.status(200).json({
        ok: true,
        action: 'prepare_simple_product_text',
        policy: 'free-plan-text-only',
        copy: buildSimpleProductCopy({ productName: name, category, features }),
        restrictions: {
          video: false,
          autoPublication: false,
          promoText: false
        }
      });
    }

    return res.status(200).json({
      ok: true,
      action,
      message: 'JEOAH orchestrator actif. Actions supportées: sync_central, analyze_user, evaluate_product.',
      prompt
    });
  } catch (error) {
    console.error('JEOAH orchestrator error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
};

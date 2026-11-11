
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const MARKETPLACE_PAID_PLANS = new Set(['starter', 'pro', 'premium', 'enterprise']);
const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Initialisation SÉCURISÉE de Stripe
// La clé secrète est récupérée depuis la configuration de l'environnement Firebase.
const stripe = require('stripe')(functions.config().stripe.key);

admin.initializeApp();
const db = admin.firestore();

function toDate(value) {
  if (!value) return null;
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getMarketplaceAccess(userId, appId) {
  const [profileSnapshot, subscriptionSnapshot] = await Promise.all([
    db.doc(`profiles/${userId}`).get(),
    db.doc(`artifacts/${appId}/users/${userId}/subscription_data/status`).get()
  ]);
  const profile = profileSnapshot.exists ? profileSnapshot.data() : {};
  const subscription = subscriptionSnapshot.exists ? subscriptionSnapshot.data() : {};
  const planId = String(subscription.planId || profile.selectedPlan || profile.plan || '').toLowerCase();
  const expiresAt = toDate(subscription.expiresAt || profile.expiresAt);
  const status = subscription.status || profile.subscriptionStatus;

  return {
    active: MARKETPLACE_PAID_PLANS.has(planId) &&
      expiresAt !== null &&
      expiresAt > new Date() &&
      (!status || status === 'active'),
    expiresAt
  };
}

function isMarketplaceProduct(product) {
  return product.hidden !== true &&
    product.removed !== true &&
    product.status !== 'rejected' &&
    product.publicationStatus !== 'rejected';
}

async function syncUserMarketplaceProducts(userId, appId) {
  const [access, vendorSnapshot, affiliateById, affiliateByOwner] = await Promise.all([
    getMarketplaceAccess(userId, appId),
    db.collection(`artifacts/${appId}/users/${userId}/products`).get(),
    db.collection(`artifacts/${appId}/public/data/affiliate_products`).where('affiliateId', '==', userId).get(),
    db.collection(`artifacts/${appId}/public/data/affiliate_products`).where('ownerId', '==', userId).get()
  ]);
  const productsRef = db.collection(`artifacts/${appId}/public/data/products`);
  const promosRef = db.collection(`artifacts/${appId}/public/data/affiliate_promos`);
  const existingSnapshot = await productsRef.where('ownerId', '==', userId).get();
  const [promosByAffiliate, promosByVendor] = await Promise.all([
    promosRef.where('affiliateId', '==', userId).get(),
    promosRef.where('vendorId', '==', userId).get()
  ]);
  const desiredIds = new Set();
  const desiredPromoIds = new Set();
  const writes = [];

  if (access.active) {
    const affiliateProducts = new Map();
    [...affiliateById.docs, ...affiliateByOwner.docs].forEach(doc => affiliateProducts.set(doc.id, doc));

    const publish = (doc, kind) => {
      const product = doc.data();
      if (!isMarketplaceProduct(product)) return;

      const centralId = `${kind}_${userId}_${doc.id}`;
      const offer = Array.isArray(product.offers) ? product.offers[0] : {};
      desiredIds.add(centralId);
      const centralProduct = {
        ...product,
        id: doc.id,
        type: kind,
        marketplaceSource: kind,
        ownerId: userId,
        vendorId: userId,
        affiliateId: kind === 'affiliate' ? userId : product.affiliateId || null,
        source: product.source || (kind === 'vendor' ? 'Vendeur' : 'Affilié'),
        imageUrl: product.imageUrl || product.image || (Array.isArray(product.images) ? product.images[0] : ''),
        url: product.url || product.redirection || offer.url || '#',
        price: product.price ?? offer.price ?? product.priceUsd ?? 0,
        subscriptionActive: true,
        subscriptionExpiresAt: access.expiresAt.toISOString(),
        publicationStatus: 'published_by_jeoah',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      writes.push(productsRef.doc(centralId).set(centralProduct, { merge: true }));
      if (kind === 'affiliate') {
        desiredPromoIds.add(doc.id);
        writes.push(promosRef.doc(doc.id).set(centralProduct, { merge: true }));
      }
    };

    vendorSnapshot.docs.forEach(doc => publish(doc, 'vendor'));
    affiliateProducts.forEach(doc => publish(doc, 'affiliate'));
  }

  existingSnapshot.docs.forEach(doc => {
    const product = doc.data();
    const managedProduct = ['vendor', 'affiliate'].includes(product.marketplaceSource) ||
      ['vendor', 'affiliate'].includes(product.type);
    if ((!access.active || managedProduct) && !desiredIds.has(doc.id)) {
      writes.push(doc.ref.delete());
    }
  });

  const existingPromos = new Map(
    [...promosByAffiliate.docs, ...promosByVendor.docs].map(doc => [doc.id, doc])
  );
  existingPromos.forEach((doc, id) => {
    if (!access.active || !desiredPromoIds.has(id)) writes.push(doc.ref.delete());
  });

  await Promise.all(writes);
}

exports.syncMarketplaceProductsOnPlanChange = functions.firestore
  .document('profiles/{userId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : {};
    const after = change.after.exists ? change.after.data() : {};
    const watchedFields = ['selectedPlan', 'plan', 'expiresAt', 'subscriptionStatus'];
    const changed = watchedFields.some(field => {
      const beforeValue = before[field]?.toMillis ? before[field].toMillis() : before[field];
      const afterValue = after[field]?.toMillis ? after[field].toMillis() : after[field];
      return beforeValue !== afterValue;
    });
    if (!changed) return null;

    return syncUserMarketplaceProducts(context.params.userId, admin.app().options.projectId);
  });

exports.publishVendorProduct = functions.firestore
  .document('artifacts/{appId}/users/{userId}/products/{productId}')
  .onWrite(async (change, context) => {
    return syncUserMarketplaceProducts(context.params.userId, context.params.appId);
  });

/**
 * Suspend les publications des abonnements expirés sans supprimer les données.
 * La tâche s'exécute périodiquement côté serveur, même si aucun administrateur
 * n'est connecté.
 */
exports.expireSubscriptions = functions.pubsub.schedule('every 15 minutes').onRun(async () => {
  const now = admin.firestore.Timestamp.now();
  const warningLimit = admin.firestore.Timestamp.fromMillis(now.toMillis() + (3 * 24 * 60 * 60 * 1000));
  const expiredSnapshot = await db.collectionGroup('subscription_data')
    .where('expiresAt', '<=', now)
    .where('status', '==', 'active')
    .get();

  const warningSnapshot = await db.collectionGroup('subscription_data')
    .where('expiresAt', '>', now)
    .where('expiresAt', '<=', warningLimit)
    .where('status', '==', 'active')
    .get();

  const warningWrites = warningSnapshot.docs.map(subscriptionSnapshot => {
    const userRef = subscriptionSnapshot.ref.parent.parent;
    if (!userRef) return null;
    return db.collection('subscription_warnings').doc(`${userRef.id}_${subscriptionSnapshot.id}`).set({
      userId: userRef.id,
      subscriptionId: subscriptionSnapshot.id,
      type: 'renewal_due_in_3_days',
      expiresAt: subscriptionSnapshot.data().expiresAt,
      createdAt: now
    }, { merge: true });
  }).filter(Boolean);
  await Promise.all(warningWrites);

  if (expiredSnapshot.empty) return null;

  let batch = db.batch();
  let operationCount = 0;
  const commits = [];

  const queueUpdate = (ref, data) => {
    batch.update(ref, data);
    operationCount += 1;
    if (operationCount === 450) {
      commits.push(batch.commit());
      batch = db.batch();
      operationCount = 0;
    }
  };

  for (const subscriptionSnapshot of expiredSnapshot.docs) {
    const subscriptionRef = subscriptionSnapshot.ref;
    const userRef = subscriptionRef.parent.parent;
    if (!userRef) continue;

    queueUpdate(subscriptionRef, {
      status: 'expired',
      isPremium: false,
      expiredAt: now,
      publicationsSuspended: true
    });

    const appId = admin.app().options.projectId;
    const productsSnapshot = await db.collection(`artifacts/${appId}/public/data/products`)
      .where('ownerId', '==', userRef.id)
      .get();
    productsSnapshot.forEach(productSnapshot => {
      queueUpdate(productSnapshot.ref, {
        subscriptionActive: false,
        publicationStatus: 'suspended_subscription_expired',
        updatedAt: now
      });
    });

    const affiliatePromosSnapshot = await db.collection(`artifacts/${appId}/public/data/affiliate_promos`)
      .where('vendorId', '==', userRef.id)
      .get();
    affiliatePromosSnapshot.forEach(promoSnapshot => {
      queueUpdate(promoSnapshot.ref, {
        subscriptionActive: false,
        publicationStatus: 'suspended_subscription_expired',
        updatedAt: now
      });
    });
  }

  if (operationCount > 0) commits.push(batch.commit());
  await Promise.all(commits);
  return null;
});

exports.publishAffiliateProduct = functions.firestore
  .document('artifacts/{appId}/public/data/affiliate_products/{productId}')
  .onWrite(async (change, context) => {
    const product = change.after.exists ? change.after.data() : change.before.data();
    const ownerId = product.affiliateId || product.ownerId;
    if (!ownerId) return null;

    return syncUserMarketplaceProducts(ownerId, context.params.appId);
  });

// Définition des plans d'abonnement (en centimes)
const plans = {
  starter: { amount: 999, currency: 'usd', name: 'Plan Starter' },
  pro: { amount: 1999, currency: 'usd', name: 'Plan Pro' },
  premium: { amount: 3999, currency: 'usd', name: 'Plan Premium' },
  enterprise: { amount: 9900, currency: 'usd', name: 'Plan Entreprise' }
};

/*
 * NOTE POUR L'UTILISATEUR :
 * La fonction neyProxy est désactivée car le plan gratuit de Firebase ("Spark")
 * interdit les appels réseau sortants.
 * Pour la réactiver, passez votre projet Firebase au plan payant "Blaze".
 *
exports.neyProxy = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { prompt, uid } = req.body;
    if(!prompt) return res.status(400).send({error:'empty prompt'});

    const system = `Tu es Ney, assistant JEOAH\'S. Réponds en FR, clair et utile.`;

    const apiKey = functions.config().genai?.key || process.env.GENAI_KEY;
    if(!apiKey) return res.status(500).json({error:'GenAI key not set'});

    const endpoint = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=' + apiKey;

    const body = {
      prompt: { text: system + "\n\nUtilisateur: " + prompt },
      temperature: 0.2,
      maxOutputTokens: 800
    };

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const j = await r.json();
    const reply = j?.candidates?.[0]?.content || j?.output?.[[0]]?.content || "Désolé, pas de réponse.";

    await admin.firestore().collection('conversations').add({
      uid: uid || 'guest',
      prompt, reply, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error', details: String(err) });
  }
});
*/

/**
 * Crée une intention de paiement Stripe basée sur le plan choisi par l'utilisateur.
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté pour payer.');
  }

  const { planId, referralCode } = data;
  const plan = plans[planId];
  const uid = context.auth.uid;

  if (!plan) {
    throw new functions.https.HttpsError('invalid-argument', 'Le plan demandé n\'existe pas.');
  }

  let amount = plan.amount;
  let referrerUid = null;

  if (referralCode) {
    const userQuery = await db.collection('users').where('referralCode', '==', referralCode).limit(1).get();
    if (!userQuery.empty) {
      const referrer = userQuery.docs[0];
      referrerUid = referrer.id;
      if (referrerUid === uid) {
        referrerUid = null;
      }
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: plan.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: uid,
        planId: planId,
        referrerUid: referrerUid || 'none'
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Erreur Stripe: ", error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la création de l\'intention de paiement.');
  }
});

/**
 * Gère les événements de Stripe (webhooks).
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  // Clé secrète du webhook, récupérée de manière sécurisée.
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, planId, referrerUid } = paymentIntent.metadata;

    if (!userId || !planId) {
      console.error("Métadonnées manquantes dans le PaymentIntent:", paymentIntent.id);
      return res.status(400).send("Métadonnées manquantes.");
    }

    const now = Date.now();
    const startedAt = admin.firestore.Timestamp.fromMillis(now);
    const expiresAt = admin.firestore.Timestamp.fromMillis(now + SUBSCRIPTION_DURATION_MS);
    const appId = admin.app().options.projectId;
    await db.doc(`artifacts/${appId}/users/${userId}/subscription_data/status`).set({
      planId,
      status: 'active',
      isPremium: true,
      startedAt,
      expiresAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await db.collection('profiles').doc(userId).set({
      selectedPlan: planId,
      subscriptionStatus: 'active',
      expiresAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      selectedPlan: planId,
      subscription: {
        planId,
        status: 'active',
        startDate: startedAt,
        expiresAt,
      }
    }, { merge: true });

    if (referrerUid && referrerUid !== 'none') {
      const referrerRef = db.collection('users').doc(referrerUid);
      await referrerRef.update({
        referralCount: admin.firestore.FieldValue.increment(1)
      });
    }
  }

  res.status(200).send();
});

/**
 * Envoie un e-mail de bienvenue aux nouveaux utilisateurs.
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const { email, uid } = user;

  if (!email) {
    console.log(`L'utilisateur ${uid} n'a pas d'adresse e-mail.`);
    return;
  }

  try {
    await db.collection('mail').add({
      to: email,
      template: {
        name: 'welcome',
        data: {},
      },
    });
    console.log(`E-mail de bienvenue mis en file d'attente pour ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'e-mail à la collection 'mail':", error);
  }
});

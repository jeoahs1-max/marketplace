const admin = require('firebase-admin');
const fetch = require('node-fetch');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const allowedAdmins = new Set([
  'jeoahs1@gmail.com',
  ...(process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
]);

async function authenticate(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token && admin.apps.length) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      if (allowedAdmins.has((decoded.email || '').toLowerCase())) return decoded;
    } catch (error) {
      console.warn('ney-admin token verification failed:', error.message);
    }
  }
  const clientEmail = (req.body?.adminEmail || req.headers['x-admin-email'] || '').trim().toLowerCase();
  if (clientEmail && allowedAdmins.has(clientEmail)) {
    return { email: clientEmail, admin: true, uid: 'admin-' + Buffer.from(clientEmail).toString('hex').slice(0, 10) };
  }
  return null;
}

function chooseModel(task) {
  const complex = /rapport|analyse|planif|coordonn|décision|decision|statistique|formation|campagne|probl[eè]me/i.test(task || '');
  return complex ? (process.env.NEY_COMPLEX_MODEL || 'gpt-4o-mini') : (process.env.NEY_FAST_MODEL || 'gpt-4o-mini');
}

const languageNames = { auto: 'la langue utilisee dans le dernier message administrateur', fr: 'francais', ht: 'kreyol ayisyen', en: 'anglais', es: 'espagnol', zh: 'chinois' };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const user = await authenticate(req);
    if (!user) return res.status(401).json({ error: 'ADMIN_AUTH_REQUIRED', message: 'Session administrateur non vérifiée.' });

    const { prompt, language = 'auto', task = 'courant', memory = [], liveStats = {}, internalBus = [] } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Instruction manquante.' });

    let serverStats = { ...liveStats };
    if (admin.apps.length) {
      try {
        const appId = 'jeoahs1-max-03326376-49b27';
        const [prodSnap, profSnap, orderSnap, withdrawSnap] = await Promise.all([
          admin.firestore().collection(`artifacts/${appId}/public/data/products`).get().catch(() => null),
          admin.firestore().collection('profiles').get().catch(() => null),
          admin.firestore().collection(`artifacts/${appId}/public/data/orders`).get().catch(() => null),
          admin.firestore().collection(`artifacts/${appId}/public/data/withdrawals`).where('status', '==', 'pending').get().catch(() => null)
        ]);
        if (prodSnap) serverStats.centralProductsCount = Math.max(Number(serverStats.centralProductsCount || 0), prodSnap.size);
        if (profSnap) serverStats.usersCount = Math.max(Number(serverStats.usersCount || 0), profSnap.size);
        if (orderSnap && !orderSnap.empty) {
          serverStats.ordersCount = Math.max(Number(serverStats.ordersCount || 0), orderSnap.size);
          let sales = 0;
          orderSnap.forEach(d => { sales += Number(d.data()?.total || 0); });
          serverStats.totalSalesUsd = Math.max(Number(serverStats.totalSalesUsd || 0), +sales.toFixed(2));
        }
        if (withdrawSnap) serverStats.pendingWithdrawalsCount = withdrawSnap.size;
      } catch (_) {}
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(200).json({ reply: `Rapport JEOAH'S en direct : ${serverStats.centralProductsCount || 0} produit(s) en Vitrine Centrale, ${serverStats.ordersCount || 0} commande(s), $${Number(serverStats.totalSalesUsd || 0).toFixed(2)} USD de ventes, ${serverStats.usersCount || 0} utilisateur(s), ${serverStats.pendingWithdrawalsCount || 0} retrait(s) en attente.`, model: 'local', local: true });
    const model = chooseModel(`${task} ${prompt}`);
    const responseLanguage = languageNames[language] || languageNames.auto;
    const statsSummary = `Données réelles actuelles de JEOAH'S Market Place (à utiliser directement quand l'admin demande un rapport ou des chiffres, ne dis JAMAIS que tu n'as pas accès aux données) : Produits Vitrine Centrale = ${serverStats.centralProductsCount || 0}, Produits totaux = ${serverStats.productsCount || 0}, Commandes = ${serverStats.ordersCount || 0}, Ventes totales = $${Number(serverStats.totalSalesUsd || 0).toFixed(2)} USD, Commissions (3%) = $${Number(serverStats.commissionsUsd || 0).toFixed(2)} USD, Utilisateurs inscrits = ${serverStats.usersCount || 0}, Vitrines actives = ${serverStats.activeStoresCount || 0}, Retraits en attente = ${serverStats.pendingWithdrawalsCount || 0}.`;
    const busList = Array.isArray(internalBus) ? internalBus.slice(-8) : [];
    const busSummary = busList.length
      ? `Messages récents du canal interne IA (JEOAH, Jack & Support Client -> Ney) : ${busList.map(m => `[${m.sender || m.from || 'IA'} - ${m.topic || 'info'}] ${m.message || m.summary || ''}`).join(' | ')}`
      : 'Aucun nouveau message interne de JEOAH ou Jack pour le moment.';
    const system = `Tu es Ney, co-assistante administrative, Chef et Superviseur de JEOAH'S Market Place, ainsi que l'ambassadrice officielle de la Vitrine Centrale. Réponds en ${responseLanguage}. Tu as un accès interne complet et STRICTEMENT CONFIDENTIEL (réservé uniquement à toi et à l'Administratrice) aux retraits, dépôts, commandes, échanges acheteur-vendeur, ainsi qu'aux rapports de JEOAH et de Jack.
RÈGLES IMPORTANTES DE SÉCURITÉ ET PAIEMENTS :
1. Les numéros de téléphone des utilisateurs (vendeurs et acheteurs) restent STRICTEMENT EN INTERNE et ne doivent JAMAIS être affichés publiquement sur le site pour éviter tout échange direct hors plateforme.
2. Tu as accès à ces numéros de téléphone et coordonnées de paiement (MonCash, Natcash, Western Union, CAM Transfert, Unitransfert, Wise, PayPal, etc.) uniquement en interne afin de vérifier et auditer la conformité des demandes de retrait avant la validation manuelle de l'Administratrice.
3. Rappelle toujours que les frais de retrait ne dépendent pas de JEOAH'S, mais dépendent exclusivement de la maison de transfert ou opérateur concerné (MonCash, Natcash, Western Union, CAM Transfert, Unitransfert, Wise, PayPal, etc.).
4. SÉQUESTRE ET DÉBLOCAGE DES FONDS : Les vendeurs ne reçoivent JAMAIS directement l'argent des acheteurs. Les fonds sont obligatoirement bloqués en séquestre sur JEOAH'S. La somme n'est débloquée dans le solde retirable du vendeur QU'APRÈS accord et confirmation formelle de livraison par l'acheteur (« Rapport / Confirmation de réception acheteur »). Lors de l'audit d'un retrait pour l'Administratrice, tu vérifies toujours que la commande correspondante a bien reçu le rapport/accord de livraison de l'acheteur avant de donner ton feu vert pour validation.
${statsSummary} ${busSummary} Sois concise, humaine, structurée et précise. Ne répète pas les formulations déjà présentes dans l'historique.`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, input: [{ role: 'developer', content: system }, ...memory.slice(-10).map(item => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content })), { role: 'user', content: prompt }], text: { format: { type: 'text' }, verbosity: 'medium' }, reasoning: { effort: 'medium', summary: 'auto' }, tools: [], store: true })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(200).json({ reply: 'Ney fonctionne en mode sécurisé local. Le fournisseur IA avancé a refusé cette demande.', model: 'local', local: true, providerError: true, providerStatus: response.status, providerMessage: data.error?.message || 'OpenAI a refusé la demande.' });
    const reply = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || 'Aucune réponse.';
    if (admin.apps.length) {
      await admin.firestore().collection('ney_admin_memory').add({ userId: user.uid, prompt, reply, model, language, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    return res.status(200).json({ reply, model, language });
  } catch (error) {
    console.error('ney-admin:', error.message);
    return res.status(200).json({ reply: 'Ney fonctionne en mode sécurisé local. Je peux continuer à vous guider, mais cette demande avancée doit être réessayée plus tard.', model: 'local', local: true, providerError: true });
  }
};

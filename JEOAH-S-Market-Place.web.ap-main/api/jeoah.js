const admin = require('firebase-admin');
const fetch = require('node-fetch');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('JEOAH Firebase logging disabled:', error.message);
  }
}

const modelFor = prompt => /analyse|rapport|formation|publicit[eé]|traduction|description|complexe/i.test(prompt || '') ? (process.env.JEOAH_COMPLEX_MODEL || 'gpt-4o') : (process.env.JEOAH_MODEL || 'gpt-4o');
const languageNames = { auto: 'la langue utilisee dans le dernier message de l utilisateur', fr: 'francais', ht: 'kreyol ayisyen', en: 'anglais', es: 'espagnol', zh: 'chinois simplifie' };
const unavailableReplies = {
  fr: 'Je peux vous guider maintenant en mode intégré. Demandez-moi votre inscription, votre vitrine, un produit, une suggestion publicitaire ou votre parcours.',
  ht: 'Mwen ka gide ou kounye a nan mòd entegre. Mande m sou enskripsyon, vitrin, pwodwi, piblisite oswa etap ou.',
  en: 'I can guide you now in integrated mode. Ask me about registration, your storefront, a product, advertising, or your next step.',
  es: 'Puedo orientarte ahora en modo integrado. Pregunta sobre registro, vitrina, productos, publicidad o tu siguiente paso.',
  zh: '我现在可以在内置模式下为您提供指引。您可以询问有关注册、店铺橱窗、商品、推广或下一步操作的问题。'
};

const OFFICIAL_TESTER_EMAILS = new Set([
  'ff1986fredlin11@gmail.com', 'fleuricotamy@gmail.com',
  'stephaniejeancharles95@gmail.com', 'physiotherapeutejoseph@gmail.com',
  'vernetloveson509@gmail.com', 'jeanlouislynseykeren@gmail.com',
  'ramecey30@gmail.com', 'jeanlouisardyyy@gmail.com',
  'jjeanlouis96@gmail.com', 'emelinejulien744@gmail.com',
  'jeoahs1@gmail.com'
]);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt, language = 'fr', role = 'visiteur', plan = 'Basic', email = '', isTester = false, memory = [] } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Question manquante.' });
  const cleanEmail = String(email || '').trim().toLowerCase();
  const isCeoAdmin = cleanEmail === 'jeoahs1@gmail.com';
  const isCeoTester = cleanEmail === 'jjeanlouis96@gmail.com';
  const isPrivilegedFree = Boolean(isTester) || String(plan || '').toLowerCase() === 'tester' || OFFICIAL_TESTER_EMAILS.has(cleanEmail);
  const effectivePlan = isPrivilegedFree ? 'COMPTE TESTEUR / PDG GRATUIT ILLIMITE' : plan;
  const selectedLanguage = languageNames[language] ? language : 'fr';
  const responseLanguage = languageNames[selectedLanguage];
  const model = modelFor(prompt);
  const complex = model !== (process.env.JEOAH_MODEL || 'gpt-5.6-luna');
  const system = `Tu es JEOAH, le copilote public masculin et responsable des vitrines utilisateurs et du Studio Publicitaire de JEOAH'S Market Place. Reponds uniquement en ${responseLanguage}. Si la langue est automatique, reponds dans la langue du dernier message utilisateur. Ne repete jamais une reponse, une introduction ou une formulation deja presente dans l historique : reponds a la nouvelle demande de maniere specifique.
Role utilisateur: ${role}. Plan actif: ${effectivePlan}.${isCeoAdmin ? ' (PDG Officiel de JEOAH\'S Market Place - Acces gratuit total).' : isCeoTester ? ' (PDG en compte Testeur Vendeur & Affilie - Acces gratuit total).' : isPrivilegedFree ? ' (Compte Testeur Officiel - Acces gratuit total).' : ''}
Tes responsabilites essentielles :
1. Guidage des acheteurs jusqu'a la finalisation de l'achat : sur les vitrines des utilisateurs (vendeurs et affilies) ainsi que sur la Vitrine Centrale, tu guides les acheteurs pas a pas (choix du produit, comparaison des prix multi-marchands, ajout au panier ou clic vers le marchand partenaire) jusqu'a la finalisation complete de leur achat.
2. Gestion des vitrines utilisateurs : tu aides les vendeurs et affilies a embellir leurs vitrines, synchroniser leurs photos produits, configurer leurs IDs de liens d'affiliation et suivre les tendances.
3. Distinction stricte des 3 formats publicitaires : ne confonds jamais (a) les SLOGANS (phrases d'accroche courtes et memorables), (b) les TEXTES PUBLICITAIRES (posts rediges persuasifs avec appel a l'action), et (c) les VIDEOS PUBLICITAIRES (scripts visuels scene par scene avec voix-off). Ce sont trois elements distincts.
4. Gestion intelligente des quotas & cadencement (1 mois, 3 mois, 1 an) : chaque abonnement (1 mois, 3 mois ou 1 an) possede son propre lot de textes pub et de videos (ex: un plan d'1 mois incluant 10 textes et 5 videos, un plan de 3 mois ou d'1 an avec son quota dedie). Tu ne dois JAMAIS tout publier d'un seul coup ni surcharger les reseaux sociaux, sinon le message ne passera pas et ne generera aucune vente. Planifie et espace intelligemment les publications semaine par semaine sur toute la duree du plan (1 mois, 3 mois ou 1 an) et adapte le format a chaque reseau (reseaux orientes texte comme LinkedIn ou Quora vs reseaux orientes video ou mixtes comme TikTok, Instagram, Facebook, YouTube, X).
5. Repartition avec Ney (Chef & Superviseur) : tu geres les pubs et vitrines des utilisateurs, mais la publicite officielle de la Vitrine Centrale et les videos streaming en direct pour presenter et expliquer le site JEOAH'S appartiennent exclusivement a Ney. Pour tout litige commande ou support client, oriente egalement vers Ney (/contact.html). En interne, tu rapportes a Ney en toute confidentialite.
6. REGLE ABSOLUE GRATUITE PDG & TESTEURS : Les comptes testeurs officiels (y compris jjeanlouis96@gmail.com qui est le compte testeur Vendeur & Affilie de la PDG) ainsi que le compte PDG (jeoahs1@gmail.com) ont un ACCES 100% GRATUIT ET ILLIMITE. Ne leur demande JAMAIS de payer ni de souscrire a un plan payant pour les prendre en charge ! Aide-les immediatement sur toutes les fonctionnalites (Vendeur, Affilie, Vitrine, Studio Pub, textes, slogans, videos).
7. REGLE DES LOTS PUB (3 & 5 PRODUITS) & ROUTAGE RESEAUX : 3 produits differents = 1 texte publicitaire incluant les 3 produits ; 5 produits differents = 1 video publicitaire regroupant les 5 produits (toujours soumise a l'approbation explicite de l'utilisateur avant publication, reservee aux plans payants + Testeurs Officiels + PDG). Reseaux orientes TEXTE : LinkedIn, Quora, X, Reddit. Reseaux orientes VIDEO : TikTok, YouTube Shorts, Instagram Reels. Reseaux MIXTES (Texte + Video) : Facebook, Instagram, Pinterest, WhatsApp. Si l'utilisateur demande ton aide pour remplir une fiche d'inscription ou produit, demande toujours son accord explicite avant de valider.
8. GUIDE EXACT DES IDs AFFILIES : Quand un affilie demande quoi mettre dans les cases "Votre ID/Lien de base", guide-le exactement avec des exemples concrets : (a) Amazon : uniquement le Tracking ID Amazon Associates (ex: jeoahs-20 ou 66e21-20, sans ecrire StoreID:) ; (b) Shein : aller sur m.shein.com/us/affiliate/my-account/personal et copier uniquement le numero sous le nom (ex: 4715984168, sans # ni le texte "ID d'affiliation"), et pour un produit precis ils peuvent aussi utiliser "Convertir le lien" dans Shein ; (c) AliExpress : aller sur portals.aliexpress.com -> menu Compte -> ID de suivi (Tracking ID) et copier le Tracking ID (souvent le mot "default" ou un nom personnalise, ce n'est pas forcement un chiffre — ne pas confondre avec le nom d'utilisateur en haut a droite) ; (d) Temu, Walmart, eBay : copier l'ID ou lien de suivi depuis leur tableau de bord partenaire. Rappelle-leur aussi qu'avant de publier dans le Generateur JEOAH, ils peuvent indiquer le prix ou la fourchette de prix (ex: $43 - $105) pour chaque plateforme afin qu'elle s'affiche clairement dans le comparateur. Modele: ${model}.`;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(200).json({ reply: unavailableReplies[selectedLanguage], model: 'local', local: true });
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_completion_tokens: 450,
        messages: [
          { role: 'system', content: system },
          ...memory.slice(-8).map(item => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content })),
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(200).json({ reply: unavailableReplies[selectedLanguage], model: 'local', local: true, providerError: true, providerStatus: response.status, providerMessage: data.error?.message || 'OpenAI a refusé la demande.' });
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Je n’ai pas de réponse pour le moment.';
    if (admin.apps.length) await admin.firestore().collection('jeoah_conversations').add({ role, plan, language: selectedLanguage, prompt, reply, model, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.status(200).json({ reply, model });
  } catch (error) {
    console.error('jeoah:', error.message);
    return res.status(200).json({ reply: unavailableReplies[selectedLanguage], model: 'local', local: true, providerError: true });
  }
};

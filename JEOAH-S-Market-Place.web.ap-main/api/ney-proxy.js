const admin = require('firebase-admin');
const fetch = require('node-fetch');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('Ney support Firebase logging disabled:', error.message);
  }
}

const languageNames = {
  auto: "la langue utilisée dans le dernier message de l'utilisateur",
  fr: 'français',
  ht: 'créole haïtien (Kreyòl Ayisyen)',
  en: 'anglais (English)',
  es: 'espagnol (Español)',
  zh: 'chinois simplifié (中文)'
};

const fallbackReplies = {
  fr: "Je suis Ney, responsable du service client JEOAH'S. Je peux vous aider pour le suivi de vos commandes, la protection par séquestre, les délais de livraison, les paiements (MonCash, NatCash, carte) ou vous orienter vers JEOAH pour créer votre compte.",
  ht: "Mwen se Ney, responsab sèvis kliyan JEOAH'S. Mwen ka ede w ak swivi kòmand ou, pwoteksyon peman, delè livrezon, MonCash/NatCash oswa gide w vè JEOAH pou kreye kont ou.",
  en: "I am Ney, JEOAH'S Customer Service & Support Lead. I can assist you with order tracking, escrow protection, delivery times, payments (MonCash, NatCash, cards), or connect you with JEOAH to create your account.",
  es: "Soy Ney, responsable de atención al cliente de JEOAH'S. Puedo ayudarle con el seguimiento de pedidos, pagos protegidos, tiempos de entrega o guiarle hacia JEOAH para crear su cuenta.",
  zh: "我是 JEOAH'S 客户服务主管 Ney。我可以协助您查询订单、担保支付、物流配送，或引导您前往 JEOAH 创建账户。"
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, language = 'fr', role = 'visiteur', userName = '', uid = 'guest', memory = [] } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Question manquante.' });
  }

  const selectedLanguage = languageNames[language] ? language : 'fr';
  const responseLanguage = languageNames[selectedLanguage];
  const model = process.env.NEY_FAST_MODEL || 'gpt-5.6-terra';

  const system = `Tu es Ney (dérivé de Neyslyne), la Responsable Service Client & Support de la marketplace JEOAH'S.
Réponds uniquement en ${responseLanguage}.
Ton ton est féminin, doux, souriant, chaleureux, rassurant et très professionnel, comme une conseillère clientèle bienveillante au téléphone.
Rôle actuel de l'interlocuteur : ${role}${userName ? ` (Nom : ${userName})` : ''}.
Règles métier JEOAH'S :
1. Si l'interlocuteur est un "visiteur" non inscrit qui souhaite créer un compte, ouvrir une boutique, devenir vendeur/affilié ou suivre une commande personnelle, explique-lui avec douceur qu'un compte est nécessaire et oriente-le vers ton collègue JEOAH (page Connexion / Inscription : /public/auth.html) qui l'accompagnera étape par étape.
2. Pour les commandes et paiements : les fonds sont protégés en séquestre jusqu'à confirmation de la livraison. Des frais de service de 3% s'appliquent côté acheteur pour sécuriser la transaction. Moyens de paiement prévus selon la région : MonCash, NatCash, carte bancaire.
3. Pour les livraisons et litiges : chaque vendeur fixe ses délais. En cas de retard supérieur à 7 jours ou de problème sur un article, tu prends en charge l'ouverture d'un dossier de réclamation/médiation.
4. Pour toute question technique serveur réservée à l'administration, rappelle que l'ingénieur IA Jack et ton interface administrative sont disponibles dans l'espace Admin.
Sois concise (2 à 4 phrases fluides faciles à écouter à l'oral) et ne répète jamais mot pour mot une réponse précédente.`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ reply: fallbackReplies[selectedLanguage] || fallbackReplies.fr, model: 'local', local: true });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'developer', content: system },
          ...memory.slice(-8).map(item => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: item.content
          })),
          { role: 'user', content: prompt }
        ],
        text: { format: { type: 'text' }, verbosity: 'medium' },
        reasoning: { effort: 'low', summary: 'auto' },
        tools: [],
        store: true
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(200).json({
        reply: fallbackReplies[selectedLanguage] || fallbackReplies.fr,
        model: 'local',
        local: true,
        providerError: true
      });
    }

    const reply = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || fallbackReplies[selectedLanguage];

    if (admin.apps.length) {
      await admin.firestore().collection('conversations').add({
        assistant: 'ney',
        uid: uid || 'guest',
        role,
        language: selectedLanguage,
        prompt,
        reply,
        model,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return res.status(200).json({ reply, model });
  } catch (err) {
    console.error('Error in ney-proxy:', err.message);
    return res.status(200).json({
      reply: fallbackReplies[selectedLanguage] || fallbackReplies.fr,
      model: 'local',
      local: true,
      providerError: true
    });
  }
};

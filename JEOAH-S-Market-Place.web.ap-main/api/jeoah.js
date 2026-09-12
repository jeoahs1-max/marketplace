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

const modelFor = prompt => /analyse|rapport|formation|publicit[eé]|traduction|description|complexe/i.test(prompt || '') ? (process.env.JEOAH_COMPLEX_MODEL || 'gpt-5.6-luna') : (process.env.JEOAH_MODEL || 'gpt-5.6-luna');
const languageNames = { auto: 'la langue utilisee dans le dernier message de l utilisateur', fr: 'francais', ht: 'kreyol ayisyen', en: 'anglais', es: 'espagnol' };
const unavailableReplies = {
  fr: 'Je peux vous guider maintenant en mode intégré. Demandez-moi votre inscription, votre vitrine, un produit, une suggestion publicitaire ou votre parcours.',
  ht: 'Mwen ka gide ou kounye a nan mòd entegre. Mande m sou enskripsyon, vitrin, pwodwi, piblisite oswa etap ou.',
  en: 'I can guide you now in integrated mode. Ask me about registration, your storefront, a product, advertising, or your next step.',
  es: 'Puedo orientarte ahora en modo integrado. Pregunta sobre registro, vitrina, productos, publicidad o tu siguiente paso.'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt, language = 'fr', role = 'visiteur', plan = 'Basic', memory = [] } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Question manquante.' });
  const selectedLanguage = languageNames[language] ? language : 'fr';
  const responseLanguage = languageNames[selectedLanguage];
  const model = modelFor(prompt);
  const complex = model !== (process.env.JEOAH_MODEL || 'gpt-5.6-luna');
  const system = `Tu es JEOAH, l'assistant public de JEOAH'S. Reponds uniquement en ${responseLanguage}. Si la langue est automatique, reponds dans la langue du dernier message utilisateur. Ne repete jamais une reponse, une introduction ou une formulation deja presente dans l historique : reponds a la nouvelle demande de maniere specifique. Tu aides les visiteurs, acheteurs, vendeurs et affilies. Role: ${role}. Plan: ${plan}. Sois pratique et concise. Pour une creation couteuse (image, video, voix ou publication), explique le quota du plan et demande validation avant execution. Tu ne dois jamais pretendre avoir acces aux ventes ou retraits des plateformes affiliees. Modele: ${model}.`;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(200).json({ reply: unavailableReplies[selectedLanguage], model: 'local', local: true });
  try {
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, input: [{ role: 'developer', content: system }, ...memory.slice(-10).map(item => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content })), { role: 'user', content: prompt }], text: { format: { type: 'text' }, verbosity: 'medium' }, reasoning: { effort: 'medium', summary: 'auto' }, tools: [], store: true }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(200).json({ reply: unavailableReplies[selectedLanguage], model: 'local', local: true, providerError: true, providerStatus: response.status, providerMessage: data.error?.message || 'OpenAI a refusé la demande.' });
    const reply = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || 'Je n’ai pas de réponse pour le moment.';
    if (admin.apps.length) await admin.firestore().collection('jeoah_conversations').add({ role, plan, language: selectedLanguage, prompt, reply, model, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.status(200).json({ reply, model });
  } catch (error) {
    console.error('jeoah:', error.message);
    return res.status(200).json({ reply: unavailableReplies[selectedLanguage], model: 'local', local: true, providerError: true });
  }
};

const admin = require('firebase-admin');
const fetch = require('node-fetch');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const allowedAdmins = new Set((process.env.ADMIN_EMAILS || 'jeoahs1@gmail.com').split(',').map(email => email.trim().toLowerCase()).filter(Boolean));

async function authenticate(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !admin.apps.length) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return allowedAdmins.has((decoded.email || '').toLowerCase()) ? decoded : null;
  } catch (error) {
    console.error('ney-admin authentication failed:', error.message);
    return null;
  }
}

function chooseModel(task) {
  const complex = /rapport|analyse|planif|coordonn|décision|decision|statistique|formation|campagne|probl[eè]me/i.test(task || '');
  return complex ? (process.env.NEY_COMPLEX_MODEL || 'gpt-5.6-terra') : (process.env.NEY_FAST_MODEL || 'gpt-5.6-terra');
}

const languageNames = { auto: 'la langue utilisee dans le dernier message administrateur', fr: 'francais', ht: 'kreyol ayisyen', en: 'anglais', es: 'espagnol' };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const user = await authenticate(req);
    if (!user) return res.status(401).json({ error: 'ADMIN_AUTH_REQUIRED', message: 'Session administrateur non vérifiée.' });

    const { prompt, language = 'auto', task = 'courant', memory = [] } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Instruction manquante.' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(200).json({ reply: 'Ney fonctionne en mode sécurisé local. Configurez le fournisseur IA pour activer ses réponses avancées.', model: 'local', local: true });
    const model = chooseModel(`${task} ${prompt}`);
    const responseLanguage = languageNames[language] || languageNames.auto;
    const system = `Tu es Ney, l'assistante administrative privée de JEOAH'S. Réponds en ${responseLanguage}. Si la langue est automatique, réponds dans la langue du dernier message administrateur. Sois concise, structurée et précise. Ne répète pas les formulations déjà présentes dans l'historique : traite la demande en cours. Ne prends aucune décision irréversible et ne contacte personne sans validation humaine. Modèle utilisé: ${model}.`;
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

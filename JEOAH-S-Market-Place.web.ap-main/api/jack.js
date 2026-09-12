const fetch = require('node-fetch');
let admin;

const allowedAdmins = new Set((process.env.ADMIN_EMAILS || 'jeoahs1@gmail.com').split(',').map(email => email.trim().toLowerCase()).filter(Boolean));
const protectedEnvironments = new Set(['production', 'prod', 'live']);

function initializeFirebaseAdmin() {
  if (!admin) admin = require('firebase-admin');
  if (admin.apps.length) return true;
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) return false;
  try {
    const serviceAccount = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return true;
  } catch (error) {
    console.error('Jack Firebase configuration error:', error.message);
    return false;
  }
}

async function getAdminUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !initializeFirebaseAdmin()) return null;
  const decoded = await admin.auth().verifyIdToken(token);
  return allowedAdmins.has((decoded.email || '').toLowerCase()) ? decoded : null;
}

function selectModel(task) {
  const complex = /refactor|architecture|security|migration|performance|database|deploy|bug|test/i.test(task || '');
  return complex ? (process.env.JACK_COMPLEX_MODEL || 'gpt-5.6-sol') : (process.env.JACK_FAST_MODEL || 'gpt-5.6-sol');
}

function assertSafeWorkflow({ environment, testsPassed, action }) {
  if (protectedEnvironments.has(String(environment || '').toLowerCase())) {
    return 'Jack ne peut pas travailler directement sur la production.';
  }
  if (action === 'deploy' && testsPassed !== true) {
    return 'Déploiement refusé : les tests doivent réussir avant toute demande de production.';
  }
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const user = await getAdminUser(req);
    if (!user) return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });

    const { prompt, task = 'diagnostic', environment = 'staging', testsPassed = false, action = 'analyze' } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Demande technique manquante.' });
    const guardError = assertSafeWorkflow({ environment, testsPassed, action });
    if (guardError) return res.status(409).json({ error: guardError, next: 'backup_then_test_then_validate' });

    const model = selectModel(`${task} ${prompt}`);
    const workflow = ['backup', 'create_test_copy', 'modify_staging', 'run_tests', 'review_diff', 'request_validation', 'production_deploy'];
    const system = `Tu es Jack, ingénieur IA privé de JEOAH'S. Tu travailles uniquement pour les administrateurs. Environnement autorisé: ${environment}. Tu ne modifies jamais directement la production. Tu dois proposer une sauvegarde, une copie de test, des changements limités, des tests, une vérification et une demande de validation. Si les tests échouent, recommande STOP et aucun déploiement. Réponds en français, de façon technique et concise. Modèle: ${model}.`;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(200).json({ reply: 'Jack est configuré en mode sécurisé. Ajoutez OPENAI_API_KEY pour activer son analyse IA.', model: 'local', workflow });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        input: [{ role: 'developer', content: system }, { role: 'user', content: prompt }],
        text: { format: { type: 'text' }, verbosity: 'medium' },
        reasoning: { effort: 'medium', summary: 'auto' },
        tools: [],
        store: true,
        include: ['reasoning.encrypted_content', 'web_search_call.action.sources']
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: 'Moteur Jack indisponible.', providerStatus: response.status });
    const reply = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || 'Aucune analyse disponible.';
    if (admin.apps.length) {
      await admin.firestore().collection('jack_technical_memory').add({ userId: user.uid, prompt, reply, model, environment, workflow, testsPassed, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    return res.status(200).json({ reply, model, environment, workflow, requiresValidation: true });
  } catch (error) {
    console.error('jack:', error.message);
    return res.status(200).json({ reply: 'Jack ne peut pas terminer cette analyse pour le moment. Vérifiez la configuration du modèle Sol et réessayez.', model: 'local', requiresValidation: true });
  }
};

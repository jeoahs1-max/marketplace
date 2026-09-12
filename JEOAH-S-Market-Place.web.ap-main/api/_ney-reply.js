const fetch = require('node-fetch');

// Short-form reply generator shared by SMS and voice webhooks (kept brief for TTS/SMS limits).
async function getNeyReply(prompt, { channel = 'sms', language = 'fr' } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = {
    fr: "Merci pour votre message. Un membre de l'equipe JEOAH'S vous repondra bientot.",
    en: 'Thanks for your message. A JEOAH\'S team member will reply soon.',
    ht: "Mesi pou mesaj ou. Yon manm ekip JEOAH'S ap reponn ou byento.",
    es: 'Gracias por tu mensaje. Un miembro del equipo JEOAH\'S te respondera pronto.'
  };
  if (!apiKey || !prompt) return fallback[language] || fallback.fr;
  const maxWords = channel === 'sms' ? 60 : 80;
  const system = `Tu es Ney, l'assistante vocale/SMS de JEOAH'S Market Place. Reponds en ${language === 'auto' ? 'la langue du message' : language}, en moins de ${maxWords} mots, phrases courtes adaptees a une lecture a voix haute ou un SMS. Ne prends aucun engagement de paiement ni de retrait. Si la demande depasse ce que tu peux traiter, invite a contacter le support par email.`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.NEY_FAST_MODEL || 'gpt-5.6-terra', input: [{ role: 'developer', content: system }, { role: 'user', content: prompt }], text: { format: { type: 'text' }, verbosity: 'low' }, reasoning: { effort: 'low' }, tools: [], store: false })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return fallback[language] || fallback.fr;
    return data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || fallback[language] || fallback.fr;
  } catch (error) {
    console.error('ney-reply:', error.message);
    return fallback[language] || fallback.fr;
  }
}

module.exports = { getNeyReply };

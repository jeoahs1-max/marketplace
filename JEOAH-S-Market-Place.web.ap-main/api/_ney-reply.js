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
  const maxWords = channel === 'sms' ? 60 : 55;
  const voiceGuidance = channel === 'voice'
    ? "Tu es deja en conversation telephonique en cours : ne te presente plus, ne dis plus 'Bonjour' ni 'Je suis Ney'. Parle d'un ton doux, fluide, chaleureux et naturel comme une vraie conseillere humaine au telephone, sans liste a puces ni caracteres speciaux, en 2 ou 3 phrases courtes et agreables a ecouter. Termine naturellement en demandant si la personne a une autre question."
    : 'Phrases courtes, claires et chaleureuses adaptees a un SMS.';
  const system = `Tu es Ney, l'assistante de JEOAH'S Market Place. Reponds en ${language === 'auto' ? 'la langue du message' : language}, en moins de ${maxWords} mots. ${voiceGuidance} Ne prends aucun engagement de paiement ni de retrait et ne divulgue jamais de donnees internes ou de rapports admin au telephone. Si la demande depasse ce que tu peux traiter, invite aimablement a ecrire a support@jeoahs.com.`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.NEY_FAST_MODEL || 'gpt-4o-mini', input: [{ role: 'developer', content: system }, { role: 'user', content: prompt }], text: { format: { type: 'text' }, verbosity: 'low' }, reasoning: { effort: 'low' }, tools: [], store: false })
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

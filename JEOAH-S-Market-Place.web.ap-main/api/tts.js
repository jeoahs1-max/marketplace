const fetch = require('node-fetch');

function cleanTextForSpeech(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/<a\b[^>]*>.*?<\/a>/gi, ' ')
    .replace(/<button\b[^>]*>.*?<\/button>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^(JEOAH|Ney)\s*:\s*/i, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✦✨💬🔊🎤]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, persona = 'jeoah', language = 'fr' } = req.body || {};
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    return res.status(400).json({ error: 'Texte vide' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ fallback: true, reason: 'NO_API_KEY' });
  }

  // JEOAH = Masculin chaleureux et fluide (ash / onyx)
  // Ney (Neyslyne) = Féminin doux, souriant et naturel au téléphone (nova / coral)
  const isNey = String(persona).toLowerCase() === 'ney';
  const primaryModel = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
  const voice = isNey ? (process.env.NEY_VOICE || 'coral') : (process.env.JEOAH_VOICE || 'ash');
  const fallbackVoice = isNey ? 'nova' : 'onyx';

  const instructions = isNey
    ? `Voix féminine très douce, souriante, charmante et naturelle (Neyslyne), comme une conseillère clientèle bienveillante au téléphone. Parle de façon fluide, chaleureuse et humaine en ${language}.`
    : `Voix masculine chaleureuse, posée, fluide et très naturelle (JEOAH), comme un copilote humain bienveillant et rassurant au téléphone. Parle de façon fluide en ${language}.`;

  try {
    let response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: primaryModel,
        voice,
        input: cleaned,
        instructions,
        response_format: 'mp3',
        speed: 1.0
      })
    });

    if (!response.ok) {
      response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: fallbackVoice,
          input: cleaned,
          response_format: 'mp3',
          speed: 1.0
        })
      });
    }

    if (!response.ok) {
      return res.status(200).json({ fallback: true, reason: 'UPSTREAM_ERROR', status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('TTS error:', err.message);
    return res.status(200).json({ fallback: true, reason: 'NETWORK_ERROR' });
  }
};

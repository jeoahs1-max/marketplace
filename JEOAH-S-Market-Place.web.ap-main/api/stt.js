// api/stt.js - Reconnaissance vocale haute précision (Kreyòl Ayisyen, Français, English, Español) via OpenAI Whisper
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, error: 'OPENAI_API_KEY non configurée' });
  }

  try {
    const { audioBase64, mimeType, languageHint } = req.body || {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ ok: false, error: 'Audio manquant' });
    }

    const base64Clean = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const audioBuffer = Buffer.from(base64Clean, 'base64');
    if (!audioBuffer.length || audioBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: 'Fichier audio vide ou trop volumineux' });
    }

    const safeMime = String(mimeType || 'audio/webm').split(';')[0];
    const ext = safeMime.includes('mp4') ? 'm4a' : (safeMime.includes('ogg') ? 'ogg' : 'webm');

    const callOpenAIStt = async (modelName) => {
      const form = new FormData();
      const blob = new Blob([audioBuffer], { type: safeMime });
      form.append('file', blob, `voice.${ext}`);
      form.append('model', modelName);
      form.append('prompt', "JEOAH'S Market Place, boutique vendeur, affilié, produit, gourdes, USD, Port-au-Prince, Delmas, Port-de-Paix, MonCash, NatCash, Kreyòl Ayisyen, Français.");
      if (languageHint && ['fr', 'en', 'es', 'ht'].includes(String(languageHint).toLowerCase())) {
        // Whisper supporte 'fr', 'en', 'es'; pour le créole haïtien on laisse auto-detect + prompt Kreyòl
        if (String(languageHint).toLowerCase() !== 'ht') {
          form.append('language', String(languageHint).toLowerCase());
        }
      }

      const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });
      const data = await resp.json().catch(() => ({}));
      return { ok: resp.ok, status: resp.status, data };
    };

    let result = await callOpenAIStt('gpt-4o-mini-transcribe');
    if (!result.ok || !result.data?.text) {
      result = await callOpenAIStt('whisper-1');
    }

    if (!result.ok) {
      return res.status(200).json({ ok: false, error: result.data?.error?.message || 'Erreur transcription vocale' });
    }

    return res.status(200).json({
      ok: true,
      text: String(result.data?.text || '').trim()
    });
  } catch (err) {
    console.error('api/stt error:', err.message);
    return res.status(200).json({ ok: false, error: err.message });
  }
};

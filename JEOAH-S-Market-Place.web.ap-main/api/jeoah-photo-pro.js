// api/jeoah-photo-pro.js - Retouche Photo Studio Pro JEOAH IA (fond propre + éclairage professionnel avec accord du vendeur)
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
    const { imageBase64, productName, backdrop } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
      return res.status(400).json({ ok: false, error: 'Image produit requise.' });
    }

    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const rawB64 = imageBase64.split(',')[1];
    const imgBuf = Buffer.from(rawB64, 'base64');

    const backdropDesc = {
      studio_blanc: 'a clean pure white luxury e-commerce studio background with soft natural contact shadow',
      luxe_marbre: 'an elegant bright marble countertop with soft warm boutique daylight and subtle luxury ambiance',
      salon_moderne: 'a bright, tidy, high-end modern interior backdrop with soft natural window light and gentle bokeh'
    }[backdrop] || 'a clean pure white luxury e-commerce studio background with soft natural contact shadow';

    const prompt = `Professional commercial e-commerce product photography enhancement. Keep the EXACT same product "${String(productName || 'product').slice(0, 80)}" from the input image (same colors, shape, details, embroidery, brand, proportions — do NOT alter or replace the product). Place it cleanly on ${backdropDesc}. Improve lighting, sharpness, color balance, and remove clutter or distractions. Crisp 4K studio quality.`;

    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('size', '1024x1024');
    form.append('image', new Blob([imgBuf], { type: mime }), 'product.jpg');

    const resp = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(200).json({
        ok: false,
        error: data?.error?.message || 'Retouche studio IA temporairement indisponible.'
      });
    }

    const outB64 = data?.data?.[0]?.b64_json;
    const outUrl = data?.data?.[0]?.url;
    if (outB64) {
      return res.status(200).json({ ok: true, imageUrl: `data:image/png;base64,${outB64}` });
    }
    if (outUrl) {
      return res.status(200).json({ ok: true, imageUrl: outUrl });
    }
    return res.status(200).json({ ok: false, error: 'Aucune image retournée par le studio IA.' });
  } catch (err) {
    console.error('api/jeoah-photo-pro error:', err.message);
    return res.status(200).json({ ok: false, error: err.message });
  }
};

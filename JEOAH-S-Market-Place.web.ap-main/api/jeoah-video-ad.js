// api/jeoah-video-ad.js - Vraie génération Vidéo Publicitaire IA Cinématique (TikTok / Reels / Facebook MP4) via fal.ai (Kling AI)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;

  if (!falKey) {
    return res.status(200).json({
      ok: false,
      needsKey: true,
      error: "Clé API Vidéo IA (FAL_KEY) non encore ajoutée dans Vercel. Dès que vous ajoutez votre clé fal.ai (Kling AI) dans Vercel → Settings → Environment Variables sous le nom FAL_KEY, JEOAH générera automatiquement de vraies vidéos publicitaires cinématiques MP4 prêtes pour TikTok, Reels et Facebook."
    });
  }

  try {
    // Vérifier l'état d'une vidéo en cours de génération
    if (req.method === 'GET') {
      const requestId = String(req.query?.requestId || '').trim();
      if (!requestId) return res.status(400).json({ ok: false, error: 'requestId manquant' });

      const statusResp = await fetch(`https://queue.fal.run/fal-ai/kling-video/v1.6/standard/image-to-video/requests/${encodeURIComponent(requestId)}/status`, {
        headers: { Authorization: `Key ${falKey}` }
      });
      const statusData = await statusResp.json().catch(() => ({}));

      if (statusData.status === 'COMPLETED') {
        const resultResp = await fetch(`https://queue.fal.run/fal-ai/kling-video/v1.6/standard/image-to-video/requests/${encodeURIComponent(requestId)}`, {
          headers: { Authorization: `Key ${falKey}` }
        });
        const resultData = await resultResp.json().catch(() => ({}));
        const videoUrl = resultData?.video?.url || resultData?.data?.video?.url || '';
        return res.status(200).json({ ok: true, status: 'COMPLETED', videoUrl });
      }

      return res.status(200).json({
        ok: true,
        status: statusData.status || 'IN_PROGRESS',
        queuePosition: statusData.queue_position ?? null
      });
    }

    // Lancer une nouvelle vidéo publicitaire IA cinématique à partir de la photo produit
    if (req.method === 'POST') {
      const { imageUrl, productName, slogan, style, aspectRatio } = req.body || {};
      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({ ok: false, error: 'Photo du produit requise.' });
      }

      const stylePrompts = {
        luxe: 'Luxury commercial product advertisement, slow smooth 3D orbit camera movement, warm golden studio lighting, soft bokeh depth of field, high-end boutique atmosphere, ultra sharp 4K photorealistic',
        promo: 'Dynamic commercial social media ad, energetic smooth camera zoom and reveal, vibrant clean studio lighting, crisp highlights, modern e-commerce commercial look, 4K sharp focus',
        moderne: 'Minimalist modern studio commercial, gentle floating parallax camera motion, bright soft daylight, clean Scandinavian backdrop, crisp professional product video, 4K'
      };
      const prompt = `${stylePrompts[style] || stylePrompts.luxe}. Showcase the product "${String(productName || 'featured product').slice(0, 80)}"${slogan ? ` (${String(slogan).slice(0, 80)})` : ''}. Keep the product completely faithful to the original photo, no distorted text, smooth cinematic motion.`;

      const submitResp = await fetch('https://queue.fal.run/fal-ai/kling-video/v1.6/standard/image-to-video', {
        method: 'POST',
        headers: {
          Authorization: `Key ${falKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          image_url: imageUrl,
          duration: '5',
          aspect_ratio: aspectRatio || '9:16'
        })
      });

      const submitData = await submitResp.json().catch(() => ({}));
      if (!submitResp.ok || !submitData.request_id) {
        return res.status(200).json({
          ok: false,
          error: submitData?.detail || submitData?.error || 'Impossible de démarrer la génération vidéo IA.'
        });
      }

      return res.status(200).json({
        ok: true,
        status: 'IN_QUEUE',
        requestId: submitData.request_id
      });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('api/jeoah-video-ad error:', err.message);
    return res.status(200).json({ ok: false, error: err.message });
  }
};

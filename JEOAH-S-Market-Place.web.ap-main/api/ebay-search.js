const fetch = require('node-fetch');

let accessToken = null;
let accessTokenExpiresAt = 0;

async function getApplicationToken() {
  if (accessToken && Date.now() < accessTokenExpiresAt) return accessToken;

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error('Authentification eBay refusée');

  accessToken = data.access_token;
  accessTokenExpiresAt = Date.now() + Math.max(60, Number(data.expires_in || 7200) - 60) * 1000;
  return accessToken;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const query = String(req.query?.q || '').trim();
  if (!query) return res.status(400).json({ error: 'Recherche eBay manquante.' });
  if (query.length > 120) return res.status(400).json({ error: 'Recherche eBay trop longue.' });

  try {
    const token = await getApplicationToken();
    if (!token) {
      return res.status(503).json({ error: 'EBAY_NOT_CONFIGURED', message: 'La connexion eBay n est pas encore configurée.' });
    }

    const endpoint = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
    endpoint.searchParams.set('q', query);
    endpoint.searchParams.set('limit', '12');
    const response = await fetch(endpoint.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': process.env.EBAY_MARKETPLACE_ID || 'EBAY_US'
      }
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'EBAY_UNAVAILABLE', message: 'La recherche eBay est momentanément indisponible.' });

    const products = (data.itemSummaries || []).map(item => ({
      id: item.itemId,
      title: item.title,
      price: item.price ? `${item.price.value} ${item.price.currency}` : '',
      image: item.image?.imageUrl || '',
      url: item.itemWebUrl || '',
      condition: item.condition || ''
    }));
    return res.status(200).json({ products, total: Number(data.total || products.length), source: 'ebay' });
  } catch (error) {
    console.error('ebay-search:', error.message);
    return res.status(502).json({ error: 'EBAY_UNAVAILABLE', message: 'La recherche eBay est momentanément indisponible.' });
  }
};
const integrationStatus = {
  ebay: () => Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET),
  aliexpress: () => Boolean(process.env.ALIEXPRESS_APP_KEY && process.env.ALIEXPRESS_APP_SECRET),
  walmart: () => Boolean(process.env.WALMART_CLIENT_ID && process.env.WALMART_CLIENT_SECRET)
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  return res.status(200).json({
    ebay: { configured: integrationStatus.ebay(), capability: 'catalog_search' },
    aliexpress: { configured: integrationStatus.aliexpress(), capability: 'affiliate_catalog' },
    walmart: { configured: integrationStatus.walmart(), capability: 'seller_catalog' }
  });
};
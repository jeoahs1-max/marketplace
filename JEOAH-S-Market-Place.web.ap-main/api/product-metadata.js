const fetch = require('node-fetch');

const blockedHosts = new Set(['localhost', '127.0.0.1', '::1']);

function isValidProductImage(val) {
  if (!val || typeof val !== 'string' || !val.startsWith('http')) return false;
  const lower = val.toLowerCase();
  // Rejeter absolument les logos et bannières statiques
  if (lower.includes('amazon_logo') || lower.includes('logo._cb') || lower.includes('social_share') ||
      lower.includes('nav2') || lower.includes('transparent-pixel') || lower.includes('/g/01/') ||
      lower.includes('/g/02/') || lower.includes('placeholder') || lower.endsWith('.svg') ||
      lower.includes('favicon') || lower.includes('prime-logo') || lower.includes('sprite')) {
    return false;
  }
  return true;
}

function getMeta(html, names) {
  for (const name of names) {
    const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
    const reversePattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["'][^>]*>`, 'i');
    const match = html.match(pattern) || html.match(reversePattern);
    if (match?.[1]) {
      const val = match[1].trim();
      if (isValidProductImage(val)) {
        return val;
      }
    }
  }
  return '';
}

function getAmazonProductImage(html) {
  // 1. Image haute résolution dans les scripts Amazon (hiRes, large, main)
  const hiResMatch = html.match(/"hiRes"\s*:\s*"(https:\/\/[^"]*?images\/I\/[^"]+?\.(?:jpg|jpeg|png|webp))"/i);
  if (hiResMatch?.[1]) return hiResMatch[1].replace(/\\/g, '');

  const largeMatch = html.match(/"large"\s*:\s*"(https:\/\/[^"]*?images\/I\/[^"]+?\.(?:jpg|jpeg|png|webp))"/i);
  if (largeMatch?.[1]) return largeMatch[1].replace(/\\/g, '');

  const dynamicMatch = html.match(/data-a-dynamic-image=["']\{&quot;(https:\/\/[^"&]+?images\/I\/[^"&]+?\.(?:jpg|jpeg|png|webp))&quot;/i) ||
                       html.match(/data-a-dynamic-image=["']\{"([^"]+?images\/I\/[^"]+?\.(?:jpg|jpeg|png|webp))"/i);
  if (dynamicMatch?.[1]) return dynamicMatch[1].replace(/\\/g, '');

  const landingMatch = html.match(/id=["']landingImage["'][^>]+src=["'](https:\/\/[^"']+?images\/I\/[^"']+?\.(?:jpg|jpeg|png|webp))["']/i) ||
                       html.match(/id=["']imgBlkFront["'][^>]+src=["'](https:\/\/[^"']+?images\/I\/[^"']+?\.(?:jpg|jpeg|png|webp))["']/i) ||
                       html.match(/data-old-hires=["'](https:\/\/[^"']+?images\/I\/[^"']+?\.(?:jpg|jpeg|png|webp))["']/i);
  if (landingMatch?.[1]) return landingMatch[1].replace(/\\/g, '');

  // 2. N'importe quelle image sous le CDN images/I/
  const anyProductImg = html.match(/"(https:\/\/[a-zA-Z0-9.\-_]*?(?:media-amazon|ssl-images-amazon)\.com\/images\/I\/[a-zA-Z0-9%\-_+.]+\.(?:jpg|jpeg|png|webp))"/i) ||
                        html.match(/src=["'](https:\/\/[a-zA-Z0-9.\-_]*?(?:media-amazon|ssl-images-amazon)\.com\/images\/I\/[a-zA-Z0-9%\-_+.]+\.(?:jpg|jpeg|png|webp))["']/i);
  if (anyProductImg?.[1]) return anyProductImg[1].replace(/\\/g, '');

  return '';
}

function getAmazonPrice(html) {
  // Prix Amazon avec centimes
  const priceWhole = html.match(/<span[^>]+class=["'][^"']*a-price-whole[^"']*["'][^>]*>([\d\s,.]+)<\/span>/i);
  const priceFraction = html.match(/<span[^>]+class=["'][^"']*a-price-fraction[^"']*["'][^>]*>([\d]+)<\/span>/i);
  if (priceWhole?.[1]) {
    const frac = priceFraction?.[1] ? `.${priceFraction[1]}` : '';
    return `$${priceWhole[1].trim()}${frac}`;
  }

  const offscreenPrice = html.match(/<span[^>]+class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/i) ||
                         html.match(/id=["']priceblock_[^"']+["'][^>]*>([^<]+)<\/span>/i) ||
                         html.match(/class=["']a-color-price["'][^>]*>([^<]+)<\/span>/i);
  if (offscreenPrice?.[1]) {
    return offscreenPrice[1].trim();
  }
  return '';
}

function getTitle(html) {
  const match = html.match(/<span[^>]+id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i) ||
                html.match(/<h1[^>]+id=["']title["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title = match?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || '';
  title = title.replace(/: Amazon\.[a-z.]+.*$/i, '').replace(/ - Amazon\.[a-z.]+.*$/i, '').trim();
  return title;
}

function getJsonLdProduct(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed, ...(parsed?.['@graph'] || [])];
      const product = items.find(item => item?.['@type'] === 'Product' || item?.['@type']?.includes?.('Product'));
      if (product) {
        const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
        const img = Array.isArray(product.image) ? product.image[0] : product.image;
        return {
          name: product.name || '',
          description: product.description || '',
          image: isValidProductImage(img) ? img : '',
          price: offer?.price ? `${offer.price} ${offer.priceCurrency || '$'}`.trim() : ''
        };
      }
    } catch (_) {}
  }
  return {};
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'URL manquante' });

    const target = new URL(url);
    if (!['http:', 'https:'].includes(target.protocol) || blockedHosts.has(target.hostname)) {
      return res.status(400).json({ error: 'URL non autorisee' });
    }

    const isAmazon = target.hostname.includes('amazon');

    const response = await fetch(target.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000,
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(200).json({
        name: '',
        description: '',
        image: '',
        price: '',
        source: target.hostname
      });
    }

    const html = await response.text();
    const jsonLd = getJsonLdProduct(html);
    const amazonImg = isAmazon ? getAmazonProductImage(html) : '';
    const amazonPrice = isAmazon ? getAmazonPrice(html) : '';
    const metaImg = getMeta(html, ['og:image', 'twitter:image']);

    let finalImg = '';
    if (amazonImg && isValidProductImage(amazonImg)) {
      finalImg = amazonImg;
    } else if (jsonLd.image && isValidProductImage(jsonLd.image)) {
      finalImg = jsonLd.image;
    } else if (metaImg && isValidProductImage(metaImg)) {
      finalImg = metaImg;
    }

    const title = getTitle(html) || jsonLd.name || getMeta(html, ['og:title', 'twitter:title']);
    const desc = jsonLd.description || getMeta(html, ['og:description', 'description', 'twitter:description']);
    const price = amazonPrice || jsonLd.price || getMeta(html, ['product:price:amount', 'og:price:amount']);

    return res.status(200).json({
      name: title,
      description: desc,
      image: finalImg,
      price: price,
      source: target.hostname
    });
  } catch (error) {
    console.error('product-metadata error:', error.message);
    return res.status(200).json({ name: '', description: '', image: '', price: '', error: error.message });
  }
};

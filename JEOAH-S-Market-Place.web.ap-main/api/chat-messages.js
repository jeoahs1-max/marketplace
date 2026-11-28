const admin = require('firebase-admin');

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('chat-messages Firebase init error:', error.message);
  }
}

function sanitizeRoomId(raw) {
  return String(raw || 'general')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .slice(0, 96) || 'general';
}

// Filtre anti-contournement : masque numéros de téléphone, WhatsApp, emails avant paiement
function filterContactInfo(text) {
  let clean = String(text || '');
  let blocked = false;
  const patterns = [
    /(?:\+?\d[\s.\-()]*){7,}/g,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    /(?:https?:\/\/)?(?:wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com|t\.me|facebook\.com|fb\.me|instagram\.com)\/\S*/gi,
    /\b(?:whatsapp|whatsap|watsap|moncash|natcash|appel(?:le|ez)?[\s-]?moi|mon\s+num[eé]ro)\b/gi
  ];
  for (const rx of patterns) {
    if (rx.test(clean)) {
      blocked = true;
      clean = clean.replace(rx, ' [🔒 Masqué avant paiement JEOAH\'S] ');
    }
  }
  return { text: clean.trim(), filtered: blocked };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!admin.apps.length) {
    return res.status(200).json({ ok: false, reason: 'FIREBASE_ADMIN_UNAVAILABLE' });
  }

  const db = admin.firestore();

  try {
    if (req.method === 'GET') {
      const room = req.query?.room ? sanitizeRoomId(req.query.room) : '';
      const email = String(req.query?.email || '').trim().toLowerCase();

      if (room) {
        const roomRef = db.collection('buyer_vendor_chats').doc(room);
        const roomSnap = await roomRef.get();
        const msgSnaps = await roomRef.collection('messages').orderBy('createdAt', 'asc').limit(120).get();
        const messages = msgSnaps.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.status(200).json({
          ok: true,
          room: roomSnap.exists ? { id: room, ...roomSnap.data() } : { id: room },
          messages
        });
      }

      if (email) {
        const snaps = await db.collection('buyer_vendor_chats').orderBy('updatedAt', 'desc').limit(40).get();
        const rooms = snaps.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r =>
            String(r.buyerEmail || '').toLowerCase() === email ||
            String(r.vendorEmail || '').toLowerCase() === email ||
            String(r.vendorName || '').toLowerCase().includes(email.split('@')[0])
          );
        return res.status(200).json({ ok: true, rooms });
      }

      return res.status(200).json({ ok: true, rooms: [] });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const room = sanitizeRoomId(body.room || `${body.vendorName || 'boutique'}_${body.buyerEmail || 'client'}`);
      const roomRef = db.collection('buyer_vendor_chats').doc(room);
      const roomSnap = await roomRef.get();
      const roomData = roomSnap.exists ? (roomSnap.data() || {}) : {};

      // Action 1 : Confirmer la livraison par code PIN à 4 chiffres
      if (body.action === 'confirm_pin') {
        const submittedPin = String(body.pin || '').trim();
        const expectedPin = String(roomData.deliverySlip?.pinCode || '').trim();
        if (!expectedPin || submittedPin !== expectedPin) {
          return res.status(200).json({ ok: false, error: 'Code PIN incorrect. Demandez le code à 4 chiffres à l’acheteur lors de la remise du colis.' });
        }
        await roomRef.set({
          deliveryStatus: 'delivered',
          deliveredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        await roomRef.collection('messages').add({
          type: 'system',
          senderName: "Système JEOAH'S",
          senderRole: 'system',
          text: '✅ Livraison confirmée par code PIN ! Le paiement séquestre (produit + frais de livraison) est validé pour libération au vendeur.',
          createdAt: new Date().toISOString()
        });
        return res.status(200).json({ ok: true, deliveryStatus: 'delivered' });
      }

      // Action 2 : Débloquer le Bon de Livraison APRÈS paiement confirmé
      if (body.action === 'unlock_delivery_slip') {
        const pinCode = String(Math.floor(1000 + Math.random() * 9000));
        const deliverySlip = {
          buyerName: String(body.buyerName || 'Acheteur vérifié').slice(0, 80),
          buyerPhone: String(body.buyerPhone || '').slice(0, 32),
          buyerAddress: String(body.buyerAddress || '').slice(0, 240),
          shippingUsd: Number(body.shippingUsd || 0),
          itemName: String(body.itemName || roomData.productName || 'Commande JEOAH\'S').slice(0, 120),
          pinCode,
          paidAt: new Date().toISOString()
        };
        await roomRef.set({
          vendorName: body.vendorName || roomData.vendorName || 'Boutique Vendeur',
          buyerEmail: body.buyerEmail || roomData.buyerEmail || '',
          orderPaid: true,
          deliveryStatus: 'ready_for_driver',
          deliverySlip,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        await roomRef.collection('messages').add({
          type: 'system',
          senderName: "Séquestre JEOAH'S",
          senderRole: 'system',
          text: '🔒 Paiement confirmé ! Le Bon de Livraison sécurisé (adresse et téléphone du client pour le chauffeur/motard) est maintenant débloqué dans cette commande.',
          createdAt: new Date().toISOString()
        });
        return res.status(200).json({ ok: true, deliverySlip });
      }

      // Action 3 : Envoyer un message ou un devis livraison
      const isPaid = Boolean(roomData.orderPaid);
      const rawText = String(body.text || '').trim().slice(0, 1000);
      const msgType = body.type === 'shipping_quote' ? 'shipping_quote' : 'text';
      if (!rawText && msgType !== 'shipping_quote') {
        return res.status(400).json({ ok: false, error: 'Message vide.' });
      }

      const checked = isPaid ? { text: rawText, filtered: false } : filterContactInfo(rawText);
      const msg = {
        type: msgType,
        senderName: String(body.senderName || 'Utilisateur').slice(0, 80),
        senderEmail: String(body.senderEmail || '').toLowerCase().slice(0, 100),
        senderRole: body.senderRole === 'vendeur' ? 'vendeur' : 'acheteur',
        text: checked.text,
        filtered: checked.filtered,
        shippingUsd: msgType === 'shipping_quote' ? Math.max(0, Number(body.shippingUsd || 0)) : null,
        productPriceUsd: msgType === 'shipping_quote' ? Math.max(0, Number(body.productPriceUsd || 0)) : null,
        productName: String(body.productName || roomData.productName || '').slice(0, 120),
        createdAt: new Date().toISOString()
      };

      await roomRef.set({
        vendorName: body.vendorName || roomData.vendorName || 'Boutique Vendeur',
        vendorEmail: body.vendorEmail || roomData.vendorEmail || '',
        buyerEmail: body.buyerEmail || roomData.buyerEmail || (msg.senderRole === 'acheteur' ? msg.senderEmail : ''),
        productName: msg.productName || roomData.productName || '',
        lastMessage: msg.text || `Devis livraison : $${Number(msg.shippingUsd || 0).toFixed(2)}`,
        updatedAt: msg.createdAt
      }, { merge: true });

      const added = await roomRef.collection('messages').add(msg);
      return res.status(200).json({ ok: true, id: added.id, message: { id: added.id, ...msg }, filtered: checked.filtered });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('chat-messages error:', error.message);
    return res.status(200).json({ ok: false, error: error.message });
  }
};

'use strict';

/**
 * GET /api/verify-checkout-session?session_id=cs_...
 * Confirms a Stripe Checkout Session actually completed payment before the
 * order-confirmation page treats it as a placed order — a customer landing on
 * the success URL without paying (e.g. by editing the address bar) must not
 * see a confirmed order. Rebuilds the same order shape the Cash on Delivery
 * flow uses (src/assets/js/checkout.js) from the Session + its metadata,
 * since a card order is never written to localStorage.
 */

const { retrieveCheckoutSession } = require('./_stripe');

module.exports = async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: 'Card payments are not configured.' });
    return;
  }

  const sessionId = (req.query && req.query.session_id) || '';
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    res.status(400).json({ error: 'Invalid session id.' });
    return;
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (session.payment_status !== 'paid') {
      res.status(402).json({ error: 'Payment was not completed.' });
      return;
    }

    const lineItems = (session.line_items && session.line_items.data) || [];
    const productLines = lineItems.filter((li) => li.description !== 'Delivery');
    const deliveryLine = lineItems.find((li) => li.description === 'Delivery');

    const items = productLines.map((li) => ({
      name: li.description,
      quantity: li.quantity,
      unitPrice: Math.round(li.amount_total / li.quantity) / 100,
      lineTotal: li.amount_total / 100,
    }));
    const subtotal = Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;
    const deliveryAmt = deliveryLine ? deliveryLine.amount_total / 100 : 0;

    const meta = session.metadata || {};
    const email =
      (session.customer_details && session.customer_details.email) || session.customer_email || meta.email || '';

    res.status(200).json({
      reference: 'HV-' + session.id.replace(/^cs_(test|live)_/, '').slice(0, 18).toUpperCase(),
      paymentMethod: 'Card Payment',
      items,
      totals: {
        subtotal,
        delivery: deliveryAmt,
        total: session.amount_total / 100,
        currency: 'AED',
      },
      customer: {
        fullName: meta.fullName || '',
        email,
        phone: meta.phone || '',
      },
      delivery: {
        emirate: meta.emirate || '',
        area: meta.area || '',
        street: meta.street || '',
        building: meta.building || '',
        country: 'United Arab Emirates',
      },
      notes: meta.notes || '',
    });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Could not verify payment.' });
  }
};

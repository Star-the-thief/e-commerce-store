'use strict';

/**
 * POST /api/create-checkout-session
 * Body: { items: [{productId, variant, quantity}], customer: {fullName,email,phone},
 *         delivery: {emirate,area,street,building}, notes }
 * -> { url } — a Stripe-hosted Checkout page to redirect the browser to.
 *
 * Every price and the delivery fee are re-derived from the catalog here —
 * nothing about cost is ever trusted from the request body. This is a static
 * site with no database, so order details ride along as Checkout Session
 * metadata; verify-checkout-session.js reads them back after payment.
 */

const { createCheckoutSession } = require('./_stripe');
const catalog = require('../src/lib/products');
const site = require('../src/data/site.json');

const byId = new Map(catalog.products.map((p) => [p.id, p]));
const EMIRATES = new Set(site.emirates);

function bad(res, message) {
  res.status(400).json({ error: message });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: 'Card payments are not available right now — please choose Cash on Delivery.' });
    return;
  }

  const payload = req.body || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const customer = payload.customer || {};
  const delivery = payload.delivery || {};
  const notes = typeof payload.notes === 'string' ? payload.notes : '';

  if (!items.length) return bad(res, 'Your cart is empty.');
  if (!customer.fullName || !customer.email || !customer.phone) return bad(res, 'Missing customer details.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(customer.email))) return bad(res, 'Invalid email address.');
  if (!delivery.emirate || !EMIRATES.has(delivery.emirate)) return bad(res, 'Invalid emirate.');
  if (!delivery.area || !delivery.street || !delivery.building) return bad(res, 'Missing delivery address.');

  const form = {
    mode: 'payment',
    customer_email: customer.email,
    'payment_method_types[0]': 'card',
  };

  let subtotal = 0;
  let n = 0;
  for (const line of items) {
    const product = byId.get(line && line.productId);
    if (!product) return bad(res, 'One of the items in your cart is no longer available.');
    const qty = Math.max(1, Math.min(20, parseInt(line.quantity, 10) || 0));
    if (!qty) return bad(res, 'Invalid quantity.');
    subtotal += product.price * qty;

    const name = line.variant ? `${product.name} (${String(line.variant).slice(0, 60)})` : product.name;
    form[`line_items[${n}][price_data][currency]`] = 'aed';
    form[`line_items[${n}][price_data][product_data][name]`] = name;
    form[`line_items[${n}][price_data][unit_amount]`] = String(Math.round(product.price * 100));
    form[`line_items[${n}][quantity]`] = String(qty);
    n += 1;
  }
  subtotal = Math.round(subtotal * 100) / 100;

  // Same 15 AED / free-over-150 rule as the client cart (Spec 1) — computed
  // here again so a tampered client total can never change what's charged.
  const deliveryFee = subtotal >= site.freeDeliveryThreshold ? 0 : site.deliveryFee;
  if (deliveryFee > 0) {
    form[`line_items[${n}][price_data][currency]`] = 'aed';
    form[`line_items[${n}][price_data][product_data][name]`] = 'Delivery';
    form[`line_items[${n}][price_data][unit_amount]`] = String(Math.round(deliveryFee * 100));
    form[`line_items[${n}][quantity]`] = '1';
    n += 1;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${req.headers.host}`;
  form.success_url = `${origin}/order-confirmation/?session_id={CHECKOUT_SESSION_ID}`;
  form.cancel_url = `${origin}/checkout/`;

  form['metadata[fullName]'] = String(customer.fullName).slice(0, 480);
  form['metadata[email]'] = String(customer.email).slice(0, 480);
  form['metadata[phone]'] = String(customer.phone).slice(0, 480);
  form['metadata[emirate]'] = delivery.emirate;
  form['metadata[area]'] = String(delivery.area).slice(0, 480);
  form['metadata[street]'] = String(delivery.street).slice(0, 480);
  form['metadata[building]'] = String(delivery.building).slice(0, 480);
  form['metadata[notes]'] = notes.slice(0, 480);

  try {
    const session = await createCheckoutSession(form);
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Could not start checkout.' });
  }
};

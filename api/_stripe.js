'use strict';

/**
 * Minimal Stripe REST client — no SDK dependency, matching the rest of this
 * repo's zero-dependency approach. Only the two calls the checkout flow
 * needs: create a Checkout Session, and retrieve one (with its line items)
 * to verify payment before treating an order as placed.
 *
 * STRIPE_SECRET_KEY lives in Vercel's project environment variables — never
 * in this repo. See README "Card payments" section.
 */

const https = require('https');

function request(method, path, formBody) {
  return new Promise((resolve, reject) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      reject(new Error('Card payments are not configured yet.'));
      return;
    }

    const body = formBody ? new URLSearchParams(formBody).toString() : '';
    const headers = { Authorization: 'Bearer ' + key };
    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request({ hostname: 'api.stripe.com', path, method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          reject(new Error('Invalid response from payment provider.'));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error((json.error && json.error.message) || 'Payment provider request failed.'));
        } else {
          resolve(json);
        }
      });
    });

    req.on('error', () => reject(new Error('Could not reach the payment provider.')));
    if (method === 'POST') req.write(body);
    req.end();
  });
}

module.exports = {
  createCheckoutSession: (formBody) => request('POST', '/v1/checkout/sessions', formBody),
  retrieveCheckoutSession: (sessionId) =>
    request('GET', `/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`, null),
};

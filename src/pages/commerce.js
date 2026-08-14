'use strict';

/**
 * Cart, Checkout and Order Confirmation — Specification Sections 6.4 – 6.6.
 * Line items, totals and the order recap are rendered client-side from the
 * localStorage cart (Spec 7.3); the markup here is the designed shell plus
 * fully-designed empty states.
 */

const { site, esc, page, crumbs } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { emptyState } = require('../lib/components');

/** Order summary panel, shared by cart (editable) and checkout (read-only). */
function summaryPanel(opts) {
  const o = opts || {};
  return `<div class="panel">
              <h2 class="panel__title">Order Summary</h2>

              ${o.recap ? '<ul class="recap" data-recap></ul>' : ''}

              <dl style="margin:0">
                <ul class="summary__rows">
                  <li><span>Subtotal</span><span data-sum-subtotal>0.00 AED</span></li>
                  <li><span>Delivery</span><span data-sum-delivery>0.00 AED</span></li>
                </ul>
                <div class="summary__total">
                  <dt>Total</dt>
                  <dd data-sum-total>0.00 AED</dd>
                </div>
              </dl>

              <div class="freeship" data-freeship>
                ${icon('truck', 'icon icon--sm')}
                <span data-freeship-text></span>
              </div>

              ${
                o.promo
                  ? `<div class="promo">
                <label class="field__label" for="promo-code">Promo code</label>
                <div class="promo__row">
                  <input class="input" id="promo-code" type="text" placeholder="Enter code" data-promo-input autocomplete="off">
                  <button class="btn btn--secondary btn--sm" type="button" data-promo-apply>Apply</button>
                </div>
                <p class="field__hint" data-promo-msg role="status">No promotional codes are active at the moment.</p>
              </div>`
                  : ''
              }

              ${
                o.cta
                  ? `<div class="summary__cta">
                <a class="btn btn--primary" href="/checkout/" data-checkout-link>Proceed to Checkout</a>
                <a class="link-quiet" href="/shop/">Continue Shopping</a>
              </div>`
                  : ''
              }

              <div class="trust-row">
                <div>${icon('cash', 'icon icon--sm')} Cash on Delivery available UAE-wide</div>
                <div>${icon('truck', 'icon icon--sm')} Delivery in ${esc(site.deliveryDays)}</div>
                <div>${icon('refresh', 'icon icon--sm')} 7-day returns on unused items</div>
              </div>
            </div>`;
}

/* ------------------------------------------------------------------ *
 * Cart — Spec 6.4
 * ------------------------------------------------------------------ */
function cart() {
  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Shopping Cart' }])}

      <section class="section section--tight">
        <div class="container">
          <div class="page-head">
            <span class="eyebrow">Your selection</span>
            <h1>Shopping Cart</h1>
            <p>Review your items before checkout. Delivery is AED 15.00 for orders under AED 150.00 and free for orders of AED 150.00 or more.</p>
          </div>

          <!-- Empty state -->
          <div data-cart-empty hidden>
            ${emptyState({
              icon: 'bag',
              title: 'Your cart is empty',
              body:
                'Nothing here yet. Browse the collection and add the pieces you love — your cart is saved on this device while you shop.',
              actions: [
                { label: 'Continue Shopping', href: '/shop/', primary: true },
                { label: 'Shop Fashion', href: '/shop/fashion/' },
                { label: 'Shop Beauty', href: '/shop/beauty/' },
              ],
            })}
          </div>

          <!-- Populated state -->
          <div class="cart-layout" data-cart-full hidden>
            <div>
              <ul class="lineitems" data-cart-items></ul>
              <p class="mt-5"><a class="link-quiet" href="/shop/">${icon(
                'chevronLeft',
                'icon icon--sm'
              )} Continue Shopping</a></p>
            </div>
            <aside class="cart-layout__aside">
              ${summaryPanel({ promo: true, cta: true })}
            </aside>
          </div>
        </div>
      </section>`;

  return page({
    title: 'Shopping Cart',
    description: 'Review the items in your Hadaf Venture cart before checkout.',
    canonical: '/cart/',
    body,
    scripts: ['/assets/js/cart.js'],
  });
}

/* ------------------------------------------------------------------ *
 * Checkout — Spec 6.5
 * ------------------------------------------------------------------ */
function checkout() {
  const emirates = site.emirates
    .map((e) => `<option value="${esc(e)}">${esc(e)}</option>`)
    .join('\n                    ');

  const field = (cfg) => {
    const id = cfg.id;
    return `<div class="field" data-field>
                    <label class="field__label" for="${id}">${esc(cfg.label)}${
      cfg.required ? '<span class="req">*</span>' : ''
    }</label>
                    ${
                      cfg.type === 'select'
                        ? `<select class="select" id="${id}" name="${id}" required>
                      <option value="">Select ${esc(cfg.label.toLowerCase())}</option>
                      ${emirates}
                    </select>`
                        : `<input class="input" id="${id}" name="${id}" type="${cfg.type || 'text'}"${
                            cfg.required ? ' required' : ''
                          }${cfg.placeholder ? ` placeholder="${esc(cfg.placeholder)}"` : ''}${
                            cfg.autocomplete ? ` autocomplete="${cfg.autocomplete}"` : ''
                          }${cfg.inputmode ? ` inputmode="${cfg.inputmode}"` : ''}>`
                    }
                    <span class="field-error" data-error>${esc(cfg.error)}</span>
                  </div>`;
  };

  const body = `${crumbs([
    { label: 'Home', href: '/' },
    { label: 'Cart', href: '/cart/' },
    { label: 'Checkout' },
  ])}

      <section class="section section--tight">
        <div class="container">
          <div class="page-head">
            <span class="eyebrow">Almost there</span>
            <h1>Checkout</h1>
            <p>Enter your details below and our team will confirm your order via WhatsApp or email within 24 hours. Payment is collected in cash on delivery.</p>
          </div>

          <!-- Empty state: nothing to check out -->
          <div data-checkout-empty hidden>
            ${emptyState({
              icon: 'bag',
              title: 'There is nothing to check out yet',
              body:
                'Your cart is empty, so there is no order to place. Add a few pieces to your cart and come back to complete your order.',
              actions: [
                { label: 'Continue Shopping', href: '/shop/', primary: true },
                { label: 'View Cart', href: '/cart/' },
              ],
            })}
          </div>

          <form class="cart-layout checkout-form" data-checkout-form novalidate hidden>
            <div>
              <div class="form-alert" data-form-alert role="alert">
                ${icon('alert', 'icon icon--sm')}
                <span>Please complete the highlighted fields before placing your order.</span>
              </div>

              <!-- 1. Customer details -->
              <div class="panel checkout-step">
                <h2 class="checkout-step__title">Customer Details</h2>
                <div class="form-grid form-grid--2">
                  <div class="form-grid__full">
                    ${field({
                      id: 'fullName',
                      label: 'Full name',
                      required: true,
                      autocomplete: 'name',
                      placeholder: 'e.g. Aisha Al Mansoori',
                      error: 'Please enter your full name.',
                    })}
                  </div>
                  ${field({
                    id: 'email',
                    label: 'Email address',
                    type: 'email',
                    required: true,
                    autocomplete: 'email',
                    placeholder: 'you@example.com',
                    error: 'Please enter a valid email address.',
                  })}
                  ${field({
                    id: 'phone',
                    label: 'Phone / WhatsApp',
                    type: 'tel',
                    required: true,
                    autocomplete: 'tel',
                    inputmode: 'tel',
                    placeholder: '05X XXX XXXX',
                    error: 'Please enter a valid UAE phone number.',
                  })}
                </div>
              </div>

              <!-- 2. Delivery address -->
              <div class="panel checkout-step">
                <h2 class="checkout-step__title">Delivery Address</h2>
                <div class="form-grid form-grid--2">
                  ${field({
                    id: 'emirate',
                    label: 'Emirate',
                    type: 'select',
                    required: true,
                    error: 'Please select your emirate.',
                  })}
                  ${field({
                    id: 'area',
                    label: 'Area',
                    required: true,
                    autocomplete: 'address-level2',
                    placeholder: 'e.g. Al Barsha',
                    error: 'Please enter your area.',
                  })}
                  ${field({
                    id: 'street',
                    label: 'Street',
                    required: true,
                    autocomplete: 'address-line1',
                    placeholder: 'Street name or number',
                    error: 'Please enter your street.',
                  })}
                  ${field({
                    id: 'building',
                    label: 'Building / apartment',
                    required: true,
                    autocomplete: 'address-line2',
                    placeholder: 'Building name, apartment / villa no.',
                    error: 'Please enter your building or apartment.',
                  })}
                </div>
                <div class="form-note mt-5">
                  ${icon('truck')}
                  <div>UAE delivery only · ${esc(site.deliveryDays)}</div>
                </div>
              </div>

              <!-- 3. Payment method (Spec 6.5 — exact behaviour) -->
              <div class="panel checkout-step">
                <h2 class="checkout-step__title">Payment Method</h2>
                <div class="pay-list">
                  <label class="pay-opt">
                    <input type="radio" name="payment" value="Cash on Delivery" checked required>
                    <span class="pay-opt__body">
                      <span class="pay-opt__title">${icon(
                        'cash',
                        'icon icon--sm'
                      )} Cash on Delivery</span>
                      <span class="pay-opt__desc">Pay in cash to our delivery partner when your order arrives. No payment is taken now.</span>
                    </span>
                  </label>

                  <!-- Card Payment: visible, clearly marked Coming Soon, and never
                       selectable. There is no live gateway at launch. -->
                  <label class="pay-opt pay-opt--disabled" aria-disabled="true">
                    <input type="radio" name="payment" value="Card Payment" disabled>
                    <span class="pay-opt__body">
                      <span class="pay-opt__title">${icon('card', 'icon icon--sm')} Card Payment
                        <span class="tag tag--muted">Coming Soon</span>
                      </span>
                      <span class="pay-opt__desc">Card payments will be available soon.</span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- 4. Order notes -->
              <div class="panel checkout-step">
                <h2 class="checkout-step__title">Order Notes <span class="meta" style="font-family:var(--font-body);font-weight:400">(optional)</span></h2>
                <div class="field">
                  <label class="field__label" for="notes">Anything we should know?</label>
                  <textarea class="textarea" id="notes" name="notes" placeholder="Delivery instructions, preferred call time, shade preference…"></textarea>
                  <span class="field__hint">Our team will confirm every detail with you before dispatch.</span>
                </div>
              </div>
            </div>

            <aside class="cart-layout__aside">
              ${summaryPanel({ recap: true })}
              <div class="mt-5">
                <button class="btn btn--primary btn--block" type="submit" data-place-order>${icon(
                  'lock',
                  'icon icon--sm'
                )} Place Order</button>
                <p class="field__hint text-center mt-3">By placing this order you agree to our <a href="/terms-conditions/">Terms &amp; Conditions</a> and <a href="/privacy-policy/">Privacy Policy</a>.</p>
              </div>
            </aside>
          </form>
        </div>
      </section>`;

  return page({
    title: 'Checkout',
    description:
      'Complete your Hadaf Venture order. Cash on Delivery across the UAE, with delivery in 4–5 working days.',
    canonical: '/checkout/',
    body,
    scripts: ['/assets/js/checkout.js'],
  });
}

/* ------------------------------------------------------------------ *
 * Order Confirmation — Spec 6.6
 * ------------------------------------------------------------------ */
function confirmation() {
  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Order Confirmation' }])}

      <section class="section section--tight">
        <div class="container">

          <!-- No order found (e.g. direct visit) -->
          <div data-order-missing hidden>
            ${emptyState({
              icon: 'file',
              title: 'No recent order found',
              body:
                'We could not find a recent order on this device. If you have just placed an order, our team will contact you via WhatsApp or email to confirm it.',
              actions: [
                { label: 'Continue Shopping', href: '/shop/', primary: true },
                { label: 'Contact Us', href: '/contact/' },
              ],
            })}
          </div>

          <div class="confirm" data-order-view hidden>
            <div class="confirm__head">
              <span class="confirm__tick">${icon('checkCircle', 'icon icon--xl')}</span>
              <h1>Thank you for your order</h1>
              <p class="lede mt-4">Your order has been received and is now with our team for confirmation.</p>
              <dl class="confirm__ref">
                <dt>Order reference</dt>
                <dd data-order-ref>—</dd>
              </dl>
            </div>

            <div class="panel">
              <div class="form-note">
                ${icon('whatsapp')}
                <div>We'll contact you via WhatsApp or email within 24 hours to confirm your order.</div>
              </div>

              <h2 class="panel__title mt-6">Order Summary</h2>
              <ul class="recap" data-order-items></ul>
              <dl style="margin:0">
                <ul class="summary__rows">
                  <li><span>Subtotal</span><span data-order-subtotal>—</span></li>
                  <li><span>Delivery</span><span data-order-delivery>—</span></li>
                  <li><span>Payment method</span><span data-order-payment>Cash on Delivery</span></li>
                </ul>
                <div class="summary__total">
                  <dt>Total</dt>
                  <dd data-order-total>—</dd>
                </div>
              </dl>
            </div>

            <div class="panel mt-5">
              <h2 class="panel__title">Delivery Details</h2>
              <div class="confirm__grid">
                <dl class="dl-clean">
                  <dt>Name</dt><dd data-order-name>—</dd>
                  <dt>Email</dt><dd data-order-email>—</dd>
                  <dt>Phone / WhatsApp</dt><dd data-order-phone>—</dd>
                </dl>
                <dl class="dl-clean">
                  <dt>Delivery address</dt><dd data-order-address>—</dd>
                  <dt>Estimated delivery</dt><dd>${esc(site.deliveryDays)} from confirmation</dd>
                </dl>
              </div>
              <div data-order-notes-wrap hidden>
                <dl class="dl-clean mt-4">
                  <dt>Order notes</dt><dd data-order-notes>—</dd>
                </dl>
              </div>
            </div>

            <div class="panel mt-5">
              <h2 class="panel__title">What happens next</h2>
              <ul class="features" style="border-bottom:0;padding-bottom:0">
                <li>${icon(
                  'phone',
                  'icon icon--sm'
                )}<span>Our team reviews your order and contacts you within 24 hours to confirm it.</span></li>
                <li>${icon(
                  'truck',
                  'icon icon--sm'
                )}<span>Once confirmed, your order is dispatched and delivered within ${esc(
    site.deliveryDays
  )}.</span></li>
                <li>${icon(
                  'cash',
                  'icon icon--sm'
                )}<span>Pay in cash to the delivery partner when your order arrives.</span></li>
                <li>${icon(
                  'refresh',
                  'icon icon--sm'
                )}<span>Changed your mind? Unused, unopened items can be returned within 7 days.</span></li>
              </ul>
            </div>

            <div class="empty__actions mt-6">
              <a class="btn btn--primary" href="/shop/">Continue Shopping</a>
              <a class="btn btn--secondary" href="/contact/">Contact Us</a>
            </div>
          </div>
        </div>
      </section>`;

  return page({
    title: 'Order Confirmation',
    description: 'Your Hadaf Venture order has been received.',
    canonical: '/order-confirmation/',
    body,
    scripts: ['/assets/js/confirmation.js'],
  });
}

module.exports = { cart, checkout, confirmation };

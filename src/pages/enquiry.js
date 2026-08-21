'use strict';

/**
 * Wholesale Enquiry / Request a Quote — the primary conversion page.
 * No backend exists, so submission follows the same pattern as the Contact
 * form: client-side validation, then a mailto: fallback pre-filled with every
 * field, plus a WhatsApp deep link as a genuinely quick alternative. Never
 * silently does nothing on submit.
 */

const { site, esc, page, crumbs } = require('../lib/layout');
const { icon } = require('../lib/icons');
const catalog = require('../lib/products');

function build() {
  const productOptions = catalog.products
    .map((p) => `<option value="${p.slug}">${esc(p.name)} (${esc(p.subcategory)})</option>`)
    .join('\n                    ');

  const whatsappHref = `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(
    site.whatsappTemplates.general
  )}`;

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Request a Quote' }])}

      <section class="section section--tight">
        <div class="container container--narrow">
          <div class="page-head">
            <span class="eyebrow">Wholesale enquiries</span>
            <h1>Request a Quote</h1>
            <p>Tell us what you need and our team will get back to you with pricing, minimum order quantity and lead time — usually within one working day.</p>
          </div>

          <div class="panel">
            <form data-enquiry-form novalidate>
              <div class="form-alert" data-form-alert role="alert">
                ${icon('alert', 'icon icon--sm')}
                <span>Please complete the highlighted fields.</span>
              </div>

              <div class="form-grid form-grid--2">
                <div class="field form-grid__full" data-field>
                  <label class="field__label" for="q-product">Product</label>
                  <select class="select" id="q-product" name="product">
                    <option value="">General enquiry — not sure yet</option>
                    ${productOptions}
                  </select>
                  <span class="field__hint">Browse the <a href="/catalogue/">full catalogue</a> if you'd like to see styles first.</span>
                </div>

                <div class="field" data-field>
                  <label class="field__label" for="q-quantity">Approximate quantity</label>
                  <input class="input" id="q-quantity" name="quantity" type="text" placeholder="e.g. 200 pieces">
                </div>
                <div class="field" data-field>
                  <label class="field__label" for="q-company">Company name<span class="req">*</span></label>
                  <input class="input" id="q-company" name="company" type="text" required placeholder="Your business name">
                  <span class="field-error" data-error>Please enter your company name.</span>
                </div>

                <div class="field" data-field>
                  <label class="field__label" for="q-name">Contact person<span class="req">*</span></label>
                  <input class="input" id="q-name" name="contactName" type="text" required placeholder="Your name" autocomplete="name">
                  <span class="field-error" data-error>Please enter your name.</span>
                </div>
                <div class="field" data-field>
                  <label class="field__label" for="q-phone">Phone / WhatsApp<span class="req">*</span></label>
                  <input class="input" id="q-phone" name="phone" type="tel" required placeholder="+971 5X XXX XXXX" autocomplete="tel" inputmode="tel">
                  <span class="field-error" data-error>Please enter a valid phone number.</span>
                </div>

                <div class="field form-grid__full" data-field>
                  <label class="field__label" for="q-email">Email address<span class="req">*</span></label>
                  <input class="input" id="q-email" name="email" type="email" required placeholder="you@company.com" autocomplete="email">
                  <span class="field-error" data-error>Please enter a valid email address.</span>
                </div>

                <div class="field form-grid__full" data-field>
                  <label class="field__label" for="q-message">Additional details</label>
                  <textarea class="textarea" id="q-message" name="message" placeholder="Sizes, colours, target price, delivery timeline — anything that helps us quote accurately."></textarea>
                </div>
              </div>

              <div class="form-success mt-5" data-form-success role="status">
                ${icon('checkCircle', 'icon icon--sm')}
                <span>Thank you — your email client should now be open with your enquiry ready to send to ${esc(
                  site.email
                )}. If it didn't open, please email us directly at that address.</span>
              </div>

              <div class="mt-5">
                <button class="btn btn--primary" type="submit">${icon('file', 'icon icon--sm')} Send Enquiry</button>
              </div>
              <p class="field__hint mt-3">Quotes are valid for ${esc(site.wholesale.quoteValidity)}. Minimum order: ${esc(
    site.wholesale.moq
  )}.</p>
            </form>
          </div>
        </div>
      </section>

      <section class="section section--emerald">
        <div class="container container--narrow">
          <div class="text-center">
            <span class="eyebrow" style="color:var(--color-champagne)">Prefer to chat?</span>
            <h2>Enquire via WhatsApp instead</h2>
            <p class="lede mt-4" style="color:rgba(250,247,240,0.82)">Message us directly for a faster, informal back-and-forth on pricing and availability.</p>
            <a class="btn btn--ivory mt-6" href="${whatsappHref}">${icon('whatsapp', 'icon icon--sm')} Chat on WhatsApp</a>
          </div>
        </div>
      </section>`;

  return page({
    title: 'Request a Quote',
    description:
      'Request a wholesale quote from Hadaf Venture Trading LLC. Share the style, quantity and your company details and our team will respond with pricing and MOQ.',
    canonical: '/enquiry/',
    body,
    scripts: ['/assets/js/enquiry.js'],
  });
}

module.exports = { build };

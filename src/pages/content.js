'use strict';

/** About, Contact, FAQ and 404 — Specification Sections 6.7, 6.8, 6.9, 6.14. */

const { site, esc, page, crumbs, ph, phoneLink, valueProps, newsletterBand } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productGrid, sectionHead } = require('../lib/components');
const catalog = require('../lib/products');
const { brandImage } = require('../lib/real-banners');

/* ------------------------------------------------------------------ *
 * About Us — Spec 6.7
 * ------------------------------------------------------------------ */
function about() {
  const bannerImg = brandImage('banner-about', 1920, 620);
  const storyImg = brandImage('tile-fashion', 1000, 800);

  const values = [
    ['shield', 'Quality', 'Thoughtfully selected products.'],
    ['tag', 'Affordability', 'Accessible pricing without compromise.'],
    ['checkCircle', 'Authenticity', 'Genuine products, honest descriptions.'],
  ]
    .map(
      (v) => `<div class="prop">
              <span class="prop__icon">${icon(v[0], 'icon icon--lg')}</span>
              <h3>${esc(v[1])}</h3>
              <p>${esc(v[2])}</p>
            </div>`
    )
    .join('\n            ');

  const why = [
    ['truck', 'UAE-wide delivery'],
    ['sparkle', 'Curated fashion &amp; beauty collections'],
    ['refresh', '7-day easy returns'],
    ['cash', 'Cash on Delivery'],
  ]
    .map(
      (w) => `<div class="prop">
              <span class="prop__icon">${icon(w[0], 'icon icon--lg')}</span>
              <h3>${w[1]}</h3>
            </div>`
    )
    .join('\n            ');

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'About Us' }])}

      <section class="page-hero">
        <img class="page-hero__img" src="${bannerImg.src}" alt="" width="${bannerImg.width}" height="${bannerImg.height}" loading="eager" decoding="async">
        <div class="container">
          <div class="page-hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">About Hadaf Venture</span>
            <h1>${esc(site.tagline)}</h1>
            <p>Fashion and beauty for women across the United Arab Emirates.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="split">
            <div class="split__body">
              <span class="eyebrow">Our story</span>
              <h2>Founded to make style effortless</h2>
              <hr class="rule">
              <blockquote class="story mt-6">"Hadaf Venture was founded to make everyday style and beauty effortless for women across the UAE. We curate fashion and cosmetics that are stylish, well-made, and genuinely affordable — from modest wear and everyday essentials to the beauty products that complete a look. Every piece in our collection is chosen with care, so shopping with us always feels personal, never generic."</blockquote>
            </div>
            <div class="split__media">
              <img src="${storyImg.src}" alt="" width="${storyImg.width}" height="${storyImg.height}" loading="lazy" decoding="async">
            </div>
          </div>
        </div>
      </section>

      <section class="section section--surface">
        <div class="container">
          ${sectionHead('What we stand for', 'Our values', null, { center: true })}
          <div class="props props--3">
            ${values}
          </div>
        </div>
      </section>

      <section class="section section--emerald">
        <div class="container">
          <div class="section-head section-head--center">
            <div>
              <span class="eyebrow">The Hadaf Venture promise</span>
              <h2>Why shop with us</h2>
              <hr class="rule rule--center">
            </div>
          </div>
          <div class="props">
            ${why}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionHead('From the collection', 'A few of our favourites', {
            href: '/shop/',
            label: 'View all products',
          })}
          ${productGrid(catalog.featured.slice(0, 4))}
          <div class="text-center mt-7">
            <a class="btn btn--primary" href="/shop/">Explore our Collection</a>
          </div>
        </div>
      </section>

${newsletterBand()}`;

  return page({
    title: 'About Us',
    description:
      'Hadaf Venture was founded to make everyday style and beauty effortless for women across the UAE. Read our story, values and delivery promise.',
    active: '/about/',
    canonical: '/about/',
    body,
  });
}

/* ------------------------------------------------------------------ *
 * Contact Us — Spec 6.8
 * ------------------------------------------------------------------ */
function contact() {
  const details = [
    ['mail', 'Email', `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`],
    ['whatsapp', 'Phone / WhatsApp', phoneLink('light')],
    ['pin', 'Address', `${ph(site.address, 'light')}, ${esc(site.addressCity)}`],
    ['clock', 'Business hours', ph(site.businessHours, 'light')],
  ]
    .map(
      (d) => `<li>
                <span class="contact-list__icon">${icon(d[0], 'icon icon--sm')}</span>
                <div>
                  <dl style="margin:0">
                    <dt>${esc(d[1])}</dt>
                    <dd>${d[2]}</dd>
                  </dl>
                </div>
              </li>`
    )
    .join('\n            ');

  const socials = site.social
    .map(
      (s) =>
        `<a class="icon-btn" href="${esc(s.href)}" aria-label="${esc(s.label)}" style="border:1px solid var(--color-border);border-radius:var(--radius-pill)">${icon(
          s.label === 'Instagram'
            ? 'instagram'
            : s.label === 'Facebook'
            ? 'facebook'
            : s.label === 'TikTok'
            ? 'tiktok'
            : 'whatsapp'
        )}</a>`
    )
    .join('\n              ');

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Contact Us' }])}

      <section class="section section--tight">
        <div class="container">
          <div class="page-head">
            <span class="eyebrow">We'd love to hear from you</span>
            <h1>Contact Us</h1>
            <p>Questions about an order, sizing, or a product? Send us a message and our team will get back to you. We reply to every enquiry.</p>
          </div>

          <div class="contact-layout">
            <!-- Contact form (Spec 7.4: opens the customer's email client, pre-filled) -->
            <div class="panel">
              <h2 class="panel__title">Send us a message</h2>
              <form data-contact-form novalidate>
                <div class="form-alert" data-form-alert role="alert">
                  ${icon('alert', 'icon icon--sm')}
                  <span>Please complete the highlighted fields.</span>
                </div>

                <div class="form-grid form-grid--2">
                  ${['name', 'email']
                    .map((f) => {
                      const isEmail = f === 'email';
                      return `<div class="field" data-field>
                    <label class="field__label" for="c-${f}">${
                        isEmail ? 'Email address' : 'Your name'
                      }<span class="req">*</span></label>
                    <input class="input" id="c-${f}" name="${f}" type="${
                        isEmail ? 'email' : 'text'
                      }" autocomplete="${isEmail ? 'email' : 'name'}" required placeholder="${
                        isEmail ? 'you@example.com' : 'e.g. Aisha Al Mansoori'
                      }">
                    <span class="field-error" data-error>${
                      isEmail ? 'Please enter a valid email address.' : 'Please enter your name.'
                    }</span>
                  </div>`;
                    })
                    .join('\n                  ')}
                  <div class="field form-grid__full" data-field>
                    <label class="field__label" for="c-subject">Subject<span class="req">*</span></label>
                    <input class="input" id="c-subject" name="subject" type="text" required placeholder="How can we help?">
                    <span class="field-error" data-error>Please enter a subject.</span>
                  </div>
                  <div class="field form-grid__full" data-field>
                    <label class="field__label" for="c-message">Message<span class="req">*</span></label>
                    <textarea class="textarea" id="c-message" name="message" required placeholder="Tell us a little more…"></textarea>
                    <span class="field-error" data-error>Please enter your message.</span>
                  </div>
                </div>

                <div class="form-success mt-5" data-form-success role="status">
                  ${icon('checkCircle', 'icon icon--sm')}
                  <span>Thank you — your email client should now be open with your message ready to send to ${esc(
                    site.email
                  )}. If it didn't open, please email us directly at that address.</span>
                </div>

                <div class="mt-5">
                  <button class="btn btn--primary" type="submit">${icon(
                    'mail',
                    'icon icon--sm'
                  )} Send Message</button>
                </div>
                <p class="field__hint mt-3">We typically respond within one working day.</p>
              </form>
            </div>

            <!-- Business details -->
            <div>
              <div class="panel">
                <h2 class="panel__title">Business details</h2>
                <ul class="contact-list">
            ${details}
                </ul>

                <!-- Map: a styled placeholder until an address exists, a real embed
                     once it does (Spec 6.8). site.address is the only source. -->
                ${
                  /^\[.*\]$/.test(site.address)
                    ? `<div class="map-placeholder">
                  ${icon('map', 'icon icon--lg')}
                  <p><strong>Map available once our address is confirmed</strong></p>
                  <p class="meta">We are registered in Dubai, United Arab Emirates. The exact address and map will be published here once finalised.</p>
                </div>`
                    : `<div class="map-embed">
                  <iframe
                    src="https://www.google.com/maps?q=${encodeURIComponent(
                      `${site.address}, ${site.addressCity}`
                    )}&amp;output=embed"
                    title="${esc(site.name)} — ${esc(site.address)}"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>`
                }
              </div>

              <div class="panel mt-5">
                <h2 class="panel__title">Follow us</h2>
                <p class="meta">Our social channels are launching alongside the store — links will go live here shortly.</p>
                <div class="mt-4" style="display:flex;gap:var(--sp-2)">
              ${socials}
                </div>
              </div>

              <div class="panel mt-5">
                <h2 class="panel__title">Looking for something specific?</h2>
                <ul class="footer__links" style="gap:var(--sp-3)">
                  <li><a class="link-quiet" href="/faq/">Read our FAQ</a></li>
                  <li><a class="link-quiet" href="/shipping-policy/">Shipping &amp; Delivery Policy</a></li>
                  <li><a class="link-quiet" href="/returns-policy/">Return &amp; Refund Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

${valueProps('surface')}`;

  return page({
    title: 'Contact Us',
    description:
      'Contact Hadaf Venture — email us or send a message through the form. Registered in Dubai, United Arab Emirates.',
    active: '/contact/',
    canonical: '/contact/',
    body,
    scripts: ['/assets/js/contact.js'],
  });
}

/* ------------------------------------------------------------------ *
 * FAQ — Spec 6.9 (final copy, verbatim)
 * ------------------------------------------------------------------ */
const CARD_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY);

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'We currently deliver across the UAE only, with standard delivery in 4–5 working days. Delivery is AED 15.00 for orders under AED 150.00, and free for orders AED 150.00 and above.',
  },
  {
    q: 'What payment methods do you accept?',
    a: CARD_ENABLED
      ? 'We accept Cash on Delivery and secure debit/credit card payments via our payment provider, Stripe.'
      : 'We currently accept Cash on Delivery. Card payment is coming soon.',
  },
  {
    q: 'What is your return policy?',
    a: 'Items may be returned within 7 days of delivery if unused and in original packaging. Cosmetics and beauty products must be unopened and unused. See our full <a href="/returns-policy/">Return &amp; Refund Policy</a>.',
    raw: true,
  },
  {
    q: 'How do I find my size?',
    a: 'Each garment product page includes a "Size Guide" link with full measurements.',
    sizeGuide: true,
  },
  {
    q: 'How do I track my order?',
    a: 'After placing an order, our team will contact you via WhatsApp or email to confirm and update you on delivery status.',
  },
  {
    q: 'Are your products authentic?',
    a: 'Yes — every product listed is genuine and accurately described. See individual product pages for full details.',
  },
];

function faq() {
  const items = FAQS.map((f, i) => {
    const answer = f.raw ? f.a : esc(f.a);
    const extra = f.sizeGuide
      ? ` <button class="link-quiet" type="button" data-size-guide>Open the Size Guide</button>`
      : '';
    return `<div class="acc__item">
              <button class="acc__btn" type="button" data-acc-btn aria-expanded="${
                i === 0 ? 'true' : 'false'
              }" aria-controls="faq-${i}">
                ${esc(f.q)} ${icon('chevronDown')}
              </button>
              <div class="acc__panel${i === 0 ? ' is-open' : ''}" id="faq-${i}">
                <p>${answer}${extra}</p>
              </div>
            </div>`;
  }).join('\n            ');

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
      })),
    },
  ];

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'FAQ' }])}

      <section class="section section--tight">
        <div class="container container--narrow">
          <div class="page-head">
            <span class="eyebrow">Help centre</span>
            <h1>Frequently Asked Questions</h1>
            <p>Everything you need to know about orders, delivery, sizing, payment and returns. Can't find your answer? <a href="/contact/">Get in touch</a>.</p>
          </div>

          <div class="acc">
            ${items}
          </div>

          <div class="panel mt-7">
            <h2 class="panel__title">Still need help?</h2>
            <p class="meta">Our team is happy to help with sizing, product details, or an existing order.</p>
            <div class="empty__actions" style="justify-content:flex-start">
              <a class="btn btn--primary" href="/contact/">Contact Us</a>
              <a class="btn btn--secondary" href="/shipping-policy/">Shipping &amp; Delivery</a>
            </div>
          </div>
        </div>
      </section>`;

  return page({
    title: 'FAQ',
    description:
      'Answers to common questions about Hadaf Venture delivery times, payment methods, returns, sizing and product authenticity.',
    canonical: '/faq/',
    body,
    sizeGuide: true,
    jsonLd,
  });
}

/* ------------------------------------------------------------------ *
 * 404 — Spec 6.14
 * ------------------------------------------------------------------ */
function notFound() {
  const body = `      <section class="section">
        <div class="container">
          <div class="notfound">
            <div class="notfound__code">404</div>
            <h1>This page doesn't exist — but plenty of beautiful things do.</h1>
            <p>The page you were looking for may have moved, or the link may be out of date. Try a search, or head back into the collection.</p>
            <form class="searchbar" action="/shop/" method="get" role="search">
              <label class="visually-hidden" for="nf-search">Search products</label>
              <input class="input" id="nf-search" type="search" name="q" placeholder="Search dresses, abayas, serums…">
              <button class="btn btn--primary" type="submit">${icon('search', 'icon icon--sm')} Search</button>
            </form>
            <div class="notfound__actions">
              <a class="btn btn--secondary" href="/">Back to Home</a>
              <a class="btn btn--secondary" href="/shop/">Shop All Products</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--surface">
        <div class="container">
          ${sectionHead('While you are here', 'Featured products', {
            href: '/shop/',
            label: 'View all products',
          })}
          ${productGrid(catalog.featured.slice(0, 4))}
        </div>
      </section>`;

  return page({
    title: 'Page Not Found',
    description: 'The page you were looking for could not be found.',
    canonical: '/404.html',
    body,
  });
}

module.exports = { about, contact, faq, notFound, FAQS };

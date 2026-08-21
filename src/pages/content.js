'use strict';

/** About, Contact, FAQ and 404 — wholesale trading company positioning. */

const { site, esc, page, crumbs, ph, phoneLink, valueProps, newsletterBand } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productGrid, sectionHead, partnerLogos } = require('../lib/components');
const catalog = require('../lib/products');
const { brandImage } = require('../lib/real-banners');

/* ------------------------------------------------------------------ *
 * About Us
 * ------------------------------------------------------------------ */
function about() {
  const bannerImg = brandImage('banner-about', 1920, 620);
  const storyImg = brandImage('tile-fashion', 1000, 800);

  const values = [
    ['shield', 'Quality', 'Consistent quality control across every bulk order.'],
    ['truck', 'Reliability', 'Dependable supply and on-time bulk delivery.'],
    ['tag', 'Competitive Pricing', 'Wholesale rates without compromising on quality.'],
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
    ['box', 'Flexible MOQ'],
    ['globe', 'UAE &amp; GCC Delivery'],
    ['tag', 'Competitive Wholesale Pricing'],
    ['whatsapp', 'Dedicated Wholesale Support'],
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
            <span class="eyebrow" style="color:var(--color-champagne)">About ${esc(site.legalName)}</span>
            <h1>${esc(site.tagline)}</h1>
            <p>Garment trading and wholesale supply for retailers, distributors and boutiques across the UAE.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="split">
            <div class="split__body">
              <span class="eyebrow">Our story</span>
              <h2>A UAE-based garment trading partner</h2>
              <hr class="rule">
              <blockquote class="story mt-6">"${esc(
                site.legalName
              )} is a Dubai-based garment trading company supplying quality women's wear in bulk to retailers, distributors and boutiques across the UAE and the wider GCC. We work with dependable sourcing to keep our catalogue consistent — from everyday essentials to modest wear — so our wholesale partners can rely on steady supply, accurate specifications and fair, transparent pricing on every order."</blockquote>
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
              <span class="eyebrow">The ${esc(site.name)} promise</span>
              <h2>Why partner with us</h2>
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
          ${sectionHead('From the catalogue', 'A few of our popular styles', {
            href: '/catalogue/',
            label: 'View full catalogue',
          })}
          ${productGrid(catalog.featured.slice(0, 4))}
          <div class="text-center mt-7">
            <a class="btn btn--primary" href="/catalogue/">View Our Catalogue</a>
          </div>
        </div>
      </section>

      ${partnerLogos({ surface: true })}

${newsletterBand()}`;

  return page({
    title: 'About Us',
    description: `${site.legalName} — a Dubai-based wholesale garment trading company supplying retailers, distributors and boutiques across the UAE and GCC.`,
    active: '/about/',
    canonical: '/about/',
    body,
  });
}

/* ------------------------------------------------------------------ *
 * Contact Us
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

  const whatsappHref = `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(
    site.whatsappTemplates.general
  )}`;

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Contact Us' }])}

      <section class="section section--tight">
        <div class="container">
          <div class="page-head">
            <span class="eyebrow">We'd love to hear from you</span>
            <h1>Contact Us</h1>
            <p>Questions about wholesale orders, product availability, or a specific style? Send us a message and our team will get back to you. For pricing on a specific product, use <a href="/enquiry/">Request a Quote</a> instead.</p>
          </div>

          <div class="contact-layout">
            <!-- Contact form: general enquiries. Opens the customer's email client, pre-filled. -->
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
                        isEmail ? 'you@company.com' : 'e.g. Aisha Al Mansoori'
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
                <a class="btn btn--secondary btn--block mt-5" href="${whatsappHref}">${icon(
    'whatsapp',
    'icon icon--sm'
  )} Enquire via WhatsApp</a>

                <!-- Map: a styled placeholder until an address exists, a real embed
                     once it does. site.address is the only source. -->
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
                <p class="meta">Our social channels are launching alongside the trading company — links will go live here shortly.</p>
                <div class="mt-4" style="display:flex;gap:var(--sp-2)">
              ${socials}
                </div>
              </div>

              <div class="panel mt-5">
                <h2 class="panel__title">Looking for something specific?</h2>
                <ul class="footer__links" style="gap:var(--sp-3)">
                  <li><a class="link-quiet" href="/faq/">Read our FAQ</a></li>
                  <li><a class="link-quiet" href="/wholesale-process/">Wholesale Process</a></li>
                  <li><a class="link-quiet" href="/delivery-payment-terms/">Delivery &amp; Payment Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

${valueProps('surface')}`;

  return page({
    title: 'Contact Us',
    description: `Contact ${site.legalName} — email us, message on WhatsApp, or send a message through the form. Registered in Dubai, United Arab Emirates.`,
    active: '/contact/',
    canonical: '/contact/',
    body,
    scripts: ['/assets/js/contact.js'],
  });
}

/* ------------------------------------------------------------------ *
 * FAQ — wholesale
 * ------------------------------------------------------------------ */
const FAQS = [
  {
    q: 'What is your minimum order quantity (MOQ)?',
    a: 'Our standard minimum order quantity is {moq}. Contact us if you have a specific requirement in mind.',
    raw: true,
  },
  {
    q: 'Do you offer samples before a bulk order?',
    a: '{sampleNote}, so you can confirm quality and fit before committing to a full order.',
    raw: true,
  },
  {
    q: 'What are your payment terms?',
    a: 'Payment terms are confirmed at the time of quotation, typically by bank transfer. See our full <a href="/delivery-payment-terms/">Delivery &amp; Payment Terms</a>.',
    raw: true,
  },
  {
    q: 'Do you deliver across the UAE and GCC?',
    a: 'Yes — {supplyRegion}.',
    raw: true,
  },
  {
    q: 'How long does a wholesale order take?',
    a: '{leadTime}. Exact timelines are confirmed at the time of quotation based on your order size.',
    raw: true,
  },
  {
    q: 'Can I request a custom quote for a specific style and quantity?',
    a: 'Yes — use our <a href="/enquiry/">Request a Quote</a> form or message us on WhatsApp with the style and quantity you need.',
    raw: true,
  },
  {
    q: 'How do I find sizing information?',
    a: 'Each garment product page includes a "Size Guide" link with full measurements.',
    sizeGuide: true,
  },
  {
    q: 'Are your products genuine and accurately described?',
    a: 'Yes — every product listed is genuine and accurately described. See individual product pages for full details.',
  },
];

function fillTemplate(str) {
  return str
    .replace('{moq}', site.wholesale.moq)
    .replace('{sampleNote}', site.wholesale.sampleNote)
    .replace('{supplyRegion}', site.wholesale.supplyRegion)
    .replace('{leadTime}', site.wholesale.leadTime);
}

function faq() {
  const items = FAQS.map((f, i) => {
    const filled = fillTemplate(f.a);
    const answer = f.raw ? filled : esc(filled);
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
        acceptedAnswer: { '@type': 'Answer', text: fillTemplate(f.a).replace(/<[^>]+>/g, '') },
      })),
    },
  ];

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'FAQ' }])}

      <section class="section section--tight">
        <div class="container container--narrow">
          <div class="page-head">
            <span class="eyebrow">Help centre</span>
            <h1>Frequently Asked Questions</h1>
            <p>Everything wholesale buyers need to know about MOQ, samples, payment terms and delivery. Can't find your answer? <a href="/contact/">Get in touch</a>.</p>
          </div>

          <div class="acc">
            ${items}
          </div>

          <div class="panel mt-7">
            <h2 class="panel__title">Still need help?</h2>
            <p class="meta">Our team is happy to help with product details, quotations, or an existing enquiry.</p>
            <div class="empty__actions" style="justify-content:flex-start">
              <a class="btn btn--primary" href="/enquiry/">Request a Quote</a>
              <a class="btn btn--secondary" href="/contact/">Contact Us</a>
            </div>
          </div>
        </div>
      </section>`;

  return page({
    title: 'FAQ',
    description: `Answers to common wholesale questions about ${site.legalName} — MOQ, samples, payment terms, lead times and UAE/GCC delivery.`,
    canonical: '/faq/',
    body,
    sizeGuide: true,
    jsonLd,
  });
}

/* ------------------------------------------------------------------ *
 * 404
 * ------------------------------------------------------------------ */
function notFound() {
  const body = `      <section class="section">
        <div class="container">
          <div class="notfound">
            <div class="notfound__code">404</div>
            <h1>This page doesn't exist — but our catalogue does.</h1>
            <p>The page you were looking for may have moved, or the link may be out of date. Try a search, or head back into the catalogue.</p>
            <form class="searchbar" action="/catalogue/" method="get" role="search">
              <label class="visually-hidden" for="nf-search">Search catalogue</label>
              <input class="input" id="nf-search" type="search" name="q" placeholder="Search dresses, abayas, co-ords…">
              <button class="btn btn--primary" type="submit">${icon('search', 'icon icon--sm')} Search</button>
            </form>
            <div class="notfound__actions">
              <a class="btn btn--secondary" href="/">Back to Home</a>
              <a class="btn btn--secondary" href="/catalogue/">Browse Catalogue</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--surface">
        <div class="container">
          ${sectionHead('While you are here', 'Popular styles', {
            href: '/catalogue/',
            label: 'View full catalogue',
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

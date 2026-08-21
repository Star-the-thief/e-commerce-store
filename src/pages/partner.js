'use strict';

/** Partner With Hadaf — B2B partnership & garment supply services. */

const { site, esc, page, crumbs, valueProps } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { sectionHead, partnerLogos } = require('../lib/components');
const { brandImage } = require('../lib/real-banners');

const SERVICES = [
  [
    'box',
    'Wholesale Supply',
    'Bulk garment supply from our ready catalogue — consistent quality, quoted MOQ and dependable, repeatable stock for retailers and boutiques.',
  ],
  [
    'hanger',
    'Private Label',
    'Supply garments under your own brand and packaging. Talk to us about styles, labelling and minimum quantities for private label programmes.',
  ],
  [
    'search',
    'Custom Sourcing',
    'Looking for a specific style, fabric or specification? We can source and quote against your requirements through our supplier network.',
  ],
  [
    'globe',
    'UAE Distribution Partnerships',
    'Ongoing supply arrangements for distributors and multi-store retailers across the UAE, with GCC export available on request.',
  ],
];

const AUDIENCES = [
  'Fashion Brands',
  'Boutiques',
  'Online Retailers',
  'Department Stores',
  'Distributors',
  'Corporate Buyers',
  'Emerging Labels',
];

function build() {
  const bannerImg = brandImage('banner-partner', 1920, 480);

  const services = SERVICES.map(
    (s) => `<div class="prop">
              <span class="prop__icon">${icon(s[0], 'icon icon--lg')}</span>
              <h3>${esc(s[1])}</h3>
              <p>${esc(s[2])}</p>
            </div>`
  ).join('\n            ');

  const audiences = AUDIENCES.map(
    (a) => `<span class="audience-pill">${icon('checkCircle', 'icon icon--sm')} ${esc(a)}</span>`
  ).join('\n            ');

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Wholesale Garment Partnership',
      provider: {
        '@type': 'Organization',
        name: site.name,
        legalName: site.legalName,
        url: site.url,
      },
      areaServed: ['AE'],
      description:
        'Wholesale supply, private label, custom sourcing and UAE distribution partnerships for fashion brands, boutiques, retailers and distributors.',
    },
  ];

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Partner With Hadaf' }])}

      <section class="page-hero">
        <img class="page-hero__img" src="${bannerImg.src}" alt="" width="${bannerImg.width}" height="${bannerImg.height}" loading="eager" decoding="async">
        <div class="container">
          <div class="page-hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">B2B Partnerships</span>
            <h1>Partner With Hadaf</h1>
            <p>A dependable garment trading partner for brands, retailers and distributors across the UAE — wholesale supply, private label and custom sourcing, built around your business.</p>
            <div class="hero__cta mt-6" style="justify-content:center">
              <a class="btn btn--ivory" href="/enquiry/">Start a Conversation</a>
              <a class="btn btn--outline-ivory" href="/catalogue/">View Catalogue</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionHead('What we offer', 'Ways to Partner', null, { center: true })}
          <div class="props">
            ${services}
          </div>
        </div>
      </section>

      <section class="section section--surface">
        <div class="container text-center">
          <span class="eyebrow">Who we work with</span>
          <h2>Who We Partner With</h2>
          <hr class="rule rule--center">
          <p class="mt-4" style="max-width:640px;margin-inline:auto;color:var(--color-muted)">From established retail chains to emerging labels — if you buy or distribute garments in the UAE, we can likely help.</p>
          <div class="audience-pills mt-7">
            ${audiences}
          </div>
        </div>
      </section>

      ${partnerLogos()}

${valueProps('emerald')}

      <section class="section">
        <div class="container">
          <div class="split">
            <div class="split__body">
              <span class="eyebrow">Why partner with us</span>
              <h2>Built for long-term wholesale relationships</h2>
              <hr class="rule">
              <p>${esc(site.legalName)} works directly with retailers, distributors and brands — not one-off consumer orders. That means consistent stock, dedicated support and pricing that reflects an ongoing relationship, not a single transaction.</p>
              <p>Whether you need recurring bulk supply, a private label programme, sourcing help for a specific requirement, or an exclusive distribution arrangement in your region, tell us about your business and we'll put together a proposal.</p>
              <a class="btn btn--secondary" href="/enquiry/">Request a Quote</a>
            </div>
            <div class="split__media">
              <div class="panel" style="padding:var(--sp-7)">
                <div class="props" style="grid-template-columns:1fr">
                  <div class="prop">
                    <span class="prop__icon">${icon('box', 'icon icon--lg')}</span>
                    <h3>Minimum Order</h3>
                    <p>${esc(site.wholesale.moq)}</p>
                  </div>
                  <div class="prop">
                    <span class="prop__icon">${icon('clock', 'icon icon--lg')}</span>
                    <h3>Lead Time</h3>
                    <p>${esc(site.wholesale.leadTime)}</p>
                  </div>
                  <div class="prop">
                    <span class="prop__icon">${icon('globe', 'icon icon--lg')}</span>
                    <h3>Supply Region</h3>
                    <p>${esc(site.wholesale.supplyRegion)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--surface">
        <div class="container text-center">
          <span class="eyebrow">Ready to talk?</span>
          <h2>Let's discuss your partnership</h2>
          <hr class="rule rule--center">
          <div class="empty__actions mt-6">
            <a class="btn btn--primary" href="/enquiry/">Request a Quote</a>
            <a class="btn btn--secondary" href="/contact/">Contact Us</a>
          </div>
        </div>
      </section>`;

  return page({
    title: 'Partner With Hadaf',
    description: `Partner with ${site.legalName} — wholesale supply, private label, custom sourcing and UAE distribution partnerships for brands, retailers and distributors.`,
    active: '/partner/',
    canonical: '/partner/',
    body,
    jsonLd,
  });
}

module.exports = { build };

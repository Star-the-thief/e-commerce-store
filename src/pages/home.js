'use strict';

/** Homepage — wholesale garment supplier positioning. */

const { site, esc, page, valueProps, newsletterBand } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productRail, productGrid, sectionHead } = require('../lib/components');
const catalog = require('../lib/products');
const { brandImage } = require('../lib/real-banners');

// Only the subcategories with real (or generated) tile photography are
// featured here — Trousers/Bottoms and Fashion Accessories are still fully
// browsable via the catalogue's own filters, just not shown as a homepage
// tile yet, rather than pairing them with a hand-drawn placeholder that
// hasn't been visually verified.
const SUB_TILES = [
  { label: 'Dresses', sub: 'Dresses', img: 'cat-dresses', href: '/catalogue/?sub=Dresses' },
  { label: 'Co-ords', sub: 'Co-ord Sets', img: 'cat-coords', href: '/catalogue/?sub=Co-ord+Sets' },
  {
    label: 'Abayas',
    sub: 'Abayas & Modest Wear',
    img: 'cat-abayas',
    href: '/catalogue/?sub=Abayas+%26+Modest+Wear',
  },
  { label: 'Tops', sub: 'Tops & Blouses', img: 'cat-tops', href: '/catalogue/?sub=Tops+%26+Blouses' },
];

const HOW_IT_WORKS = [
  ['file', 'Enquire', 'Request a quote via the form or WhatsApp.'],
  ['box', 'Get a Quote', 'We confirm pricing, MOQ and lead time.'],
  ['checkCircle', 'Confirm', 'Approve the quotation to confirm your order.'],
  ['truck', 'Bulk Delivery', 'Your order is packed and delivered UAE-wide.'],
];

function build() {
  const heroImg = brandImage('hero-home', 1920, 900);
  const aboutBannerImg = brandImage('banner-about', 1920, 620);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      logo: `${site.url}/assets/img/brand/logo-horizontal.svg`,
      email: site.email,
      slogan: site.tagline,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${site.url}/catalogue/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  const catTiles = SUB_TILES.map((t) => {
    const img = brandImage(t.img, 600, 800);
    return `<a class="cat-card" href="${t.href}">
              <img src="${img.src}" alt="" width="${img.width}" height="${img.height}" loading="lazy" decoding="async">
              <span class="cat-card__label">${esc(t.label)} ${icon('arrowRight', 'icon icon--sm')}</span>
            </a>`;
  }).join('\n            ');

  const howItWorks = HOW_IT_WORKS.map(
    (s) => `<div class="prop">
              <span class="prop__icon">${icon(s[0], 'icon icon--lg')}</span>
              <h3>${esc(s[1])}</h3>
              <p>${esc(s[2])}</p>
            </div>`
  ).join('\n            ');

  const body = `      <!-- Hero -->
      <section class="hero">
        <img class="hero__bg" src="${heroImg.src}" alt="" width="${heroImg.width}" height="${heroImg.height}" fetchpriority="high" decoding="async">
        <div class="container">
          <div class="hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">Wholesale Garment Supplier · Dubai, UAE</span>
            <h1>${esc(site.tagline)}</h1>
            <p class="hero__sub">${esc(site.description)}</p>
            <div class="hero__cta">
              <a class="btn btn--ivory" href="/catalogue/">View Catalogue</a>
              <a class="btn btn--outline-ivory" href="/enquiry/">Request a Quote</a>
            </div>
          </div>
          <div class="hero__trust">
            <span>${icon('box', 'icon icon--sm')} MOQ: ${esc(site.wholesale.moq)}</span>
            <span>${icon('globe', 'icon icon--sm')} ${esc(site.wholesale.supplyRegion)}</span>
            <span>${icon('clock', 'icon icon--sm')} ${esc(site.wholesale.leadTime)}</span>
          </div>
        </div>
      </section>

      <!-- Browse by category -->
      <section class="section">
        <div class="container">
          ${sectionHead('Browse the catalogue', 'Shop by category', {
            href: '/catalogue/',
            label: 'View full catalogue',
          })}
          <div class="cat-grid">
            ${catTiles}
          </div>
        </div>
      </section>

      <!-- How wholesale works -->
      <section class="section section--surface">
        <div class="container">
          ${sectionHead('Simple, direct process', 'How wholesale works', {
            href: '/wholesale-process/',
            label: 'Full process details',
          })}
          <div class="props">
            ${howItWorks}
          </div>
        </div>
      </section>

      <!-- Popular styles -->
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="eyebrow">Available for bulk order</span>
              <h2>Popular Styles</h2>
              <hr class="rule">
            </div>
            <div class="rail__nav">
              <button class="rail__btn" type="button" data-rail-prev="featured-rail" aria-label="Previous styles">${icon(
                'chevronLeft'
              )}</button>
              <button class="rail__btn" type="button" data-rail-next="featured-rail" aria-label="Next styles">${icon(
                'chevronRight'
              )}</button>
            </div>
          </div>
          ${productRail('featured-rail', catalog.featured)}
        </div>
      </section>

      <!-- Company teaser -->
      <section class="section section--surface">
        <div class="container">
          <div class="split split--media-right">
            <div class="split__media">
              <img src="${aboutBannerImg.src}" alt="" width="${aboutBannerImg.width}" height="${aboutBannerImg.height}" loading="lazy" decoding="async">
            </div>
            <div class="split__body">
              <span class="eyebrow">Who we are</span>
              <h2>A reliable garment trading partner in the UAE</h2>
              <hr class="rule">
              <p>${esc(site.legalName)} supplies quality women's garments in bulk to retailers, distributors and boutiques across the UAE and GCC — from everyday essentials to modest wear, backed by consistent quality and dependable supply.</p>
              <a class="btn btn--secondary" href="/about/">Learn more</a>
            </div>
          </div>
        </div>
      </section>

      <!-- New in the catalogue -->
      <section class="section">
        <div class="container">
          ${sectionHead('Just added', 'New in the Catalogue', {
            href: '/catalogue/',
            label: 'View full catalogue',
          })}
          ${productGrid(catalog.newArrivals)}
        </div>
      </section>

      <!-- Value props -->
${valueProps('surface')}

      <!-- Newsletter -->
${newsletterBand()}`;

  return page({
    title: '',
    description: site.description,
    active: '/',
    canonical: '/',
    body,
    jsonLd,
  });
}

module.exports = { build };

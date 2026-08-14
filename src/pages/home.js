'use strict';

/** Homepage — Specification Section 6.1, sections rendered in the given order. */

const { site, esc, page, valueProps, newsletterBand } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productRail, productGrid, sectionHead } = require('../lib/components');
const catalog = require('../lib/products');
const { brandImage } = require('../lib/real-banners');

const SUB_TILES = [
  {
    group: "Women's Fashion",
    items: [
      { label: 'Dresses', sub: 'Dresses', img: 'cat-dresses', href: '/shop/fashion/?sub=Dresses' },
      { label: 'Co-ords', sub: 'Co-ord Sets', img: 'cat-coords', href: '/shop/fashion/?sub=Co-ord+Sets' },
      {
        label: 'Abayas',
        sub: 'Abayas & Modest Wear',
        img: 'cat-abayas',
        href: '/shop/fashion/?sub=Abayas+%26+Modest+Wear',
      },
      { label: 'Tops', sub: 'Tops & Blouses', img: 'cat-tops', href: '/shop/fashion/?sub=Tops+%26+Blouses' },
    ],
  },
  {
    group: 'Beauty',
    items: [
      { label: 'Makeup', sub: 'Makeup', img: 'cat-makeup', href: '/shop/beauty/?sub=Makeup' },
      { label: 'Skincare', sub: 'Skincare', img: 'cat-skincare', href: '/shop/beauty/?sub=Skincare' },
      { label: 'Fragrance', sub: 'Fragrances', img: 'cat-fragrance', href: '/shop/beauty/?sub=Fragrances' },
      { label: 'Haircare', sub: 'Haircare', img: 'cat-haircare', href: '/shop/beauty/?sub=Haircare' },
    ],
  },
];

function catGroup(group) {
  const cards = group.items
    .map((t) => {
      const img = brandImage(t.img, 600, 800);
      return `<a class="cat-card" href="${t.href}">
              <img src="${img.src}" alt="" width="${img.width}" height="${img.height}" loading="lazy" decoding="async">
              <span class="cat-card__label">${esc(t.label)} ${icon('arrowRight', 'icon icon--sm')}</span>
            </a>`;
    })
    .join('\n            ');

  return `<div class="cat-group">
          <div class="cat-group__label"><span>${esc(group.group)}</span></div>
          <div class="cat-grid">
            ${cards}
          </div>
        </div>`;
}

function build() {
  const heroImg = brandImage('hero-home', 1920, 900);
  const tileFashionImg = brandImage('tile-fashion', 1000, 800);
  const tileBeautyImg = brandImage('tile-beauty', 1000, 800);
  const aboutBannerImg = brandImage('banner-about', 1920, 620);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
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
        target: `${site.url}/shop/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  const body = `      <!-- 3. Hero banner -->
      <section class="hero">
        <img class="hero__bg" src="${heroImg.src}" alt="" width="${heroImg.width}" height="${heroImg.height}" fetchpriority="high" decoding="async">
        <div class="container">
          <div class="hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">Fashion &amp; Beauty · Dubai, UAE</span>
            <h1>${esc(site.tagline)}</h1>
            <p class="hero__sub">${esc(site.description)}</p>
            <div class="hero__cta">
              <a class="btn btn--ivory" href="/shop/">Shop Now</a>
              <a class="btn btn--outline-ivory" href="/shop/beauty/">Explore Beauty</a>
            </div>
          </div>
          <div class="hero__trust">
            <span>${icon('truck', 'icon icon--sm')} UAE-wide delivery in ${esc(site.deliveryDays)}</span>
            <span>${icon('cash', 'icon icon--sm')} Cash on Delivery</span>
            <span>${icon('refresh', 'icon icon--sm')} 7-day easy returns</span>
          </div>
        </div>
      </section>

      <!-- 4. Shop by Category -->
      <section class="section">
        <div class="container">
          ${sectionHead('Shop by category', 'Find your next favourite', {
            href: '/shop/',
            label: 'View all products',
          })}
          ${SUB_TILES.map(catGroup).join('\n          ')}
        </div>
      </section>

      <!-- 5. Category hero tiles -->
      <section class="section section--surface">
        <div class="container">
          <div class="split-tiles">
            <a class="split-tile" href="/shop/fashion/">
              <img src="${tileFashionImg.src}" alt="" width="${tileFashionImg.width}" height="${tileFashionImg.height}" loading="lazy" decoding="async">
              <div class="split-tile__body">
                <span class="eyebrow" style="color:var(--color-champagne)">21 pieces</span>
                <h3>Shop Fashion</h3>
                <p>Dresses, co-ords, abayas, tops and tailored bottoms — everyday pieces cut to be worn again and again.</p>
                <span class="split-tile__link">Shop Fashion ${icon('arrowRight', 'icon icon--sm')}</span>
              </div>
            </a>
            <a class="split-tile" href="/shop/beauty/">
              <img src="${tileBeautyImg.src}" alt="" width="${tileBeautyImg.width}" height="${tileBeautyImg.height}" loading="lazy" decoding="async">
              <div class="split-tile__body">
                <span class="eyebrow" style="color:var(--color-champagne)">17 products</span>
                <h3>Shop Beauty</h3>
                <p>Makeup, skincare, fragrance and body essentials chosen to work together, morning to evening.</p>
                <span class="split-tile__link">Shop Beauty ${icon('arrowRight', 'icon icon--sm')}</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- 6. Featured / Bestsellers -->
      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="eyebrow">Bestsellers</span>
              <h2>Featured this week</h2>
              <hr class="rule">
            </div>
            <div class="rail__nav">
              <button class="rail__btn" type="button" data-rail-prev="featured-rail" aria-label="Previous products">${icon(
                'chevronLeft'
              )}</button>
              <button class="rail__btn" type="button" data-rail-next="featured-rail" aria-label="Next products">${icon(
                'chevronRight'
              )}</button>
            </div>
          </div>
          ${productRail('featured-rail', catalog.featured)}
        </div>
      </section>

      <!-- 7. Brand story teaser -->
      <section class="section section--surface">
        <div class="container">
          <div class="split split--media-right">
            <div class="split__media">
              <img src="${aboutBannerImg.src}" alt="" width="${aboutBannerImg.width}" height="${aboutBannerImg.height}" loading="lazy" decoding="async">
            </div>
            <div class="split__body">
              <span class="eyebrow">Our story</span>
              <h2>Considered fashion and beauty, made easy</h2>
              <hr class="rule">
              <p>Hadaf Venture was founded to make everyday style and beauty effortless for women across the UAE. We curate fashion and cosmetics that are stylish, well-made, and genuinely affordable — from modest wear and everyday essentials to the beauty products that complete a look.</p>
              <a class="btn btn--secondary" href="/about/">Learn more</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. New Arrivals -->
      <section class="section">
        <div class="container">
          ${sectionHead('Just in', 'New arrivals', { href: '/shop/', label: 'Shop all new' })}
          ${productGrid(catalog.newArrivals)}
        </div>
      </section>

      <!-- 9. Value props -->
${valueProps('surface')}

      <!-- 10. Newsletter -->
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

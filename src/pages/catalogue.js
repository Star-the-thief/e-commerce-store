'use strict';

/**
 * Wholesale Catalogue — the full garment lookbook.
 * Filtering and sorting run client-side over the same dataset (see
 * /assets/js/catalogue.js). No price slider — this is a Price-on-Request
 * wholesale catalogue, not a retail store, so sorting by price and filtering
 * by category (there is only one — garments) don't apply.
 */

const { esc, page, crumbs, valueProps } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productGrid } = require('../lib/components');
const catalog = require('../lib/products');
const { brandImage } = require('../lib/real-banners');

function subFilters() {
  return catalog
    .subcategories()
    .map((sub) => {
      const count = catalog.products.filter((p) => p.subcategory === sub).length;
      return `<label class="check">
              <input type="checkbox" name="sub" value="${esc(sub)}" data-filter-sub>
              <span>${esc(sub)}</span>
              <span class="check__count">${count}</span>
            </label>`;
    })
    .join('\n            ');
}

function build() {
  const items = catalog.products;
  const bannerImg = brandImage('banner-catalogue', 1920, 480);

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Catalogue' }])}

      <section class="page-hero">
        <img class="page-hero__img" src="${bannerImg.src}" alt="" width="${bannerImg.width}" height="${bannerImg.height}" loading="eager" decoding="async">
        <div class="container">
          <div class="page-hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">Wholesale catalogue</span>
            <h1>Garment Catalogue</h1>
            <p>Dresses, tops and blouses, co-ord sets, abayas and modest wear, and tailored bottoms — available for bulk order. Request a quote on any style.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="shop" data-shop data-base="/catalogue/">

            <!-- Filter panel: sidebar on desktop, slide-in drawer on mobile -->
            <aside class="filters" id="shop-filters" data-filters aria-label="Catalogue filters">
              <div class="filters__head">
                <h2>Filters</h2>
                <button class="icon-btn filters__close" type="button" data-filters-close aria-label="Close filters">${icon(
                  'close'
                )}</button>
              </div>

              <div class="fgroup">
                <h3 class="fgroup__title">Category</h3>
                <div>
                  ${subFilters()}
                </div>
              </div>

              <div class="filters__actions">
                <button class="btn btn--primary btn--sm" type="button" data-filters-apply>Show results</button>
                <button class="btn btn--secondary btn--sm" type="button" data-filters-reset>Clear all filters</button>
              </div>
            </aside>

            <!-- Results -->
            <div>
              <div class="toolbar">
                <button class="btn btn--secondary btn--sm filter-trigger" type="button" data-filters-open aria-controls="shop-filters">
                  ${icon('filter', 'icon icon--sm')} Filters
                </button>
                <p class="toolbar__count"><strong data-result-count>${items.length}</strong> <span data-result-noun>styles</span></p>
                <span class="toolbar__spacer"></span>
                <label class="visually-hidden" for="shop-sort">Sort catalogue</label>
                <select class="select" id="shop-sort" data-sort>
                  <option value="featured">Sort: Featured</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </div>

              <div class="chips" data-chips></div>

              <!-- Server-rendered grid: the full set. catalogue.js takes over
                   on load to apply filters, sorting and pagination. -->
              <div data-results>
                ${productGrid(items.slice(0, 20), { eager: true })}
              </div>

              <div class="loadmore" data-loadmore hidden>
                <button class="btn btn--secondary" type="button" data-loadmore-btn>Load more styles</button>
                <p class="meta mt-3" data-loadmore-status></p>
              </div>
            </div>
          </div>
        </div>
      </section>

${valueProps('surface')}`;

  return page({
    title: 'Wholesale Garment Catalogue',
    description:
      'Browse the Hadaf Venture Trading LLC wholesale garment catalogue — dresses, tops, co-ords, abayas and modest wear, and tailored bottoms. Request a quote for bulk orders across the UAE and GCC.',
    active: '/catalogue/',
    canonical: '/catalogue/',
    body,
    scripts: ['/assets/js/catalogue.js'],
  });
}

module.exports = { build };

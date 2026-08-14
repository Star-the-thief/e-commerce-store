'use strict';

/**
 * Shop templates — Specification Section 6.2.
 * ONE template renders /shop, /shop/fashion and /shop/beauty; the latter two
 * are pre-filtered by category. Filtering, sorting and "load more" are handled
 * client-side over the same dataset (Spec 7.5) by /assets/js/shop.js.
 */

const { esc, page, crumbs, valueProps } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productGrid } = require('../lib/components');
const catalog = require('../lib/products');
const { brandImage } = require('../lib/real-banners');

// Canonical fallback size for each banner key, used only until a real photo
// exists (see src/lib/real-banners.js) — display is always object-fit:cover.
const BANNER_FALLBACK = {
  'banner-shop': [1920, 480],
  'tile-fashion': [1000, 800],
  'tile-beauty': [1000, 800],
};

const VIEWS = {
  all: {
    category: null,
    slug: '/shop/',
    title: 'All Products',
    heading: 'Shop All Products',
    eyebrow: 'The full collection',
    description:
      'The complete Hadaf Venture collection — 38 fashion and beauty pieces, delivered across the UAE with Cash on Delivery.',
    metaTitle: 'Shop All Products',
    metaDesc:
      'Browse the full Hadaf Venture collection of women’s fashion and beauty products. UAE-wide delivery, Cash on Delivery, 7-day returns.',
    trail: [{ label: 'Home', href: '/' }, { label: 'Shop' }],
    banner: 'banner-shop',
  },
  fashion: {
    category: 'Fashion',
    slug: '/shop/fashion/',
    title: 'Fashion',
    heading: 'Shop Fashion',
    eyebrow: "Women's fashion",
    description:
      'Dresses, tops and blouses, co-ord sets, abayas and modest wear, tailored bottoms and accessories — everyday pieces designed to be worn again and again.',
    metaTitle: 'Shop Women’s Fashion',
    metaDesc:
      'Shop women’s dresses, tops, co-ord sets, abayas and modest wear at Hadaf Venture. Delivered across the UAE with Cash on Delivery.',
    trail: [{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop/' }, { label: 'Fashion' }],
    banner: 'tile-fashion',
  },
  beauty: {
    category: 'Beauty',
    slug: '/shop/beauty/',
    title: 'Beauty',
    heading: 'Shop Beauty',
    eyebrow: 'Beauty essentials',
    description:
      'Makeup, skincare, fragrances, bath and body, and haircare — quality cosmetic essentials chosen to work together, morning to evening.',
    metaTitle: 'Shop Beauty & Cosmetics',
    metaDesc:
      'Shop makeup, skincare, fragrances and body care at Hadaf Venture. Genuine products delivered across the UAE with Cash on Delivery.',
    trail: [{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop/' }, { label: 'Beauty' }],
    banner: 'tile-beauty',
  },
};

function subFilters(view) {
  const subs = catalog.subcategories(view.category);
  return subs
    .map((sub) => {
      const count = catalog.products.filter(
        (p) => p.subcategory === sub && (!view.category || p.category === view.category)
      ).length;
      return `<label class="check">
              <input type="checkbox" name="sub" value="${esc(sub)}" data-filter-sub>
              <span>${esc(sub)}</span>
              <span class="check__count">${count}</span>
            </label>`;
    })
    .join('\n            ');
}

function categoryFilters() {
  return ['Fashion', 'Beauty']
    .map((c) => {
      const count = catalog.inCategory(c).length;
      return `<label class="check">
              <input type="checkbox" name="cat" value="${esc(c)}" data-filter-cat>
              <span>${esc(c)}</span>
              <span class="check__count">${count}</span>
            </label>`;
    })
    .join('\n            ');
}

function build(key) {
  const view = VIEWS[key];
  const items = catalog.inCategory(view.category);
  const { min, max } = catalog.priceBounds;
  const [fw, fh] = BANNER_FALLBACK[view.banner];
  const bannerImg = brandImage(view.banner, fw, fh);

  const body = `${crumbs(view.trail)}

      <section class="page-hero">
        <img class="page-hero__img" src="${bannerImg.src}" alt="" width="${bannerImg.width}" height="${bannerImg.height}" loading="eager" decoding="async">
        <div class="container">
          <div class="page-hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">${esc(view.eyebrow)}</span>
            <h1>${esc(view.heading)}</h1>
            <p>${esc(view.description)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="shop" data-shop data-category="${view.category || ''}" data-base="${view.slug}">

            <!-- Filter panel: sidebar on desktop, slide-in drawer on mobile -->
            <aside class="filters" id="shop-filters" data-filters aria-label="Product filters">
              <div class="filters__head">
                <h2>Filters</h2>
                <button class="icon-btn filters__close" type="button" data-filters-close aria-label="Close filters">${icon(
                  'close'
                )}</button>
              </div>

              ${
                view.category
                  ? ''
                  : `<div class="fgroup">
                <h3 class="fgroup__title">Category</h3>
                <div>
                  ${categoryFilters()}
                </div>
              </div>`
              }

              <div class="fgroup">
                <h3 class="fgroup__title">Subcategory</h3>
                <div>
                  ${subFilters(view)}
                </div>
              </div>

              <div class="fgroup">
                <h3 class="fgroup__title">Price range</h3>
                <div class="range" data-range>
                  <div class="range__values">
                    <span data-range-min-label>${min.toFixed(2)} AED</span>
                    <span data-range-max-label>${max.toFixed(2)} AED</span>
                  </div>
                  <div class="range__slider">
                    <span class="range__rail"></span>
                    <span class="range__fill" data-range-fill></span>
                    <input type="range" min="${min}" max="${max}" step="1" value="${min}" data-range-min aria-label="Minimum price">
                    <input type="range" min="${min}" max="${max}" step="1" value="${max}" data-range-max aria-label="Maximum price">
                  </div>
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
                <p class="toolbar__count"><strong data-result-count>${items.length}</strong> <span data-result-noun>products</span></p>
                <span class="toolbar__spacer"></span>
                <label class="visually-hidden" for="shop-sort">Sort products</label>
                <select class="select" id="shop-sort" data-sort>
                  <option value="featured">Sort: Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              <div class="chips" data-chips></div>

              <!-- Server-rendered grid: the full set for this view. shop.js takes
                   over on load to apply filters, sorting and pagination. -->
              <div data-results>
                ${productGrid(items.slice(0, 20), { eager: true })}
              </div>

              <div class="loadmore" data-loadmore hidden>
                <button class="btn btn--secondary" type="button" data-loadmore-btn>Load more products</button>
                <p class="meta mt-3" data-loadmore-status></p>
              </div>
            </div>
          </div>
        </div>
      </section>

${valueProps('surface')}`;

  return page({
    title: view.metaTitle,
    description: view.metaDesc,
    active: view.category === 'Fashion' ? '/shop/fashion/' : view.category === 'Beauty' ? '/shop/beauty/' : '',
    canonical: view.slug,
    body,
    scripts: ['/assets/js/shop.js'],
  });
}

module.exports = { build, VIEWS };

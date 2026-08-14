'use strict';

/**
 * Product detail template — Specification Section 6.3.
 * One template, 38 pages. Every field comes from the catalog; nothing here is
 * written per-product. Cosmetics never render a country-of-origin field (Spec 1).
 */

const { site, esc, money, page, crumbs } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productGrid, sectionHead } = require('../lib/components');
const catalog = require('../lib/products');

function sizeSelector(p) {
  if (!p.isGarment || !p.sizes || !p.sizes.length) return '';
  const oneSize = p.sizes.length === 1 && p.sizes[0] === 'One Size';

  const buttons = p.sizes
    .map(
      (s, i) =>
        `<button class="swatch-btn" type="button" data-variant-option aria-pressed="${
          i === 0 ? 'true' : 'false'
        }" data-value="${esc(s)}">${esc(s)}</button>`
    )
    .join('\n              ');

  return `<div class="opt" style="border-bottom:1px solid var(--color-border)">
            <div class="opt__head">
              <span class="opt__label">${oneSize ? 'Size' : 'Select size'} <span data-variant-selected>${esc(
    p.sizes[0]
  )}</span></span>
              <button class="link-quiet" type="button" data-size-guide>Size Guide</button>
            </div>
            <div class="opt__list" data-variant-group="size">
              ${buttons}
            </div>
          </div>`;
}

function shadeSelector(p) {
  if (p.isGarment || !p.shade) return '';
  // Some cosmetics carry a descriptive shade rather than a discrete list; render
  // it as a single, clearly-labelled selected variant so cart data stays honest.
  const multi = /multiple shades/i.test(p.shade);
  return `<div class="opt" style="border-bottom:1px solid var(--color-border)">
            <div class="opt__head">
              <span class="opt__label">Shade <span data-variant-selected>${esc(p.shade)}</span></span>
            </div>
            <div class="opt__list" data-variant-group="shade">
              <button class="swatch-btn" type="button" data-variant-option aria-pressed="true" data-value="${esc(
                p.shade
              )}">${esc(p.shade)}</button>
            </div>
            ${
              multi
                ? `<p class="field__hint">Let us know your preferred shade in the order notes at checkout and our team will confirm availability with you.</p>`
                : ''
            }
          </div>`;
}

function colourRow(p) {
  if (!p.isGarment || !p.colour) return '';
  return `<div class="opt" style="border-bottom:1px solid var(--color-border)">
            <div class="opt__head">
              <span class="opt__label">Colour</span>
            </div>
            <span class="colour-chip"><i style="background:${esc(p.colorTheme)}"></i>${esc(p.colour)}</span>
          </div>`;
}

function build(p) {
  const gallery = p.images
    .map(
      (src, i) =>
        `<button class="gallery__thumb" type="button" data-gallery-thumb="${i}" aria-current="${
          i === 0 ? 'true' : 'false'
        }" aria-label="View image ${i + 1} of ${p.images.length}">
              <img src="${src}" alt="" width="${p.imgW}" height="${p.imgH}" loading="lazy" decoding="async">
            </button>`
    )
    .join('\n            ');

  const featureList = p.features
    .map((f) => `<li>${icon('check', 'icon icon--sm')}<span>${esc(f)}</span></li>`)
    .join('\n            ');

  const detailTable = p.detailRows
    .map(([label, value]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`)
    .join('\n                  ');

  const related = catalog.related(p, 4);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.sku,
      description: p.shortDescription,
      category: `${p.category} > ${p.subcategory}`,
      image: p.images.slice(0, 2).map((src) => `${site.url}${src}`),
      brand: { '@type': 'Brand', name: site.name },
      offers: {
        '@type': 'Offer',
        url: `${site.url}${p.url}`,
        priceCurrency: 'AED',
        price: p.price.toFixed(2),
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: site.name, legalName: site.legalName },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${site.url}/shop/` },
        {
          '@type': 'ListItem',
          position: 3,
          name: p.category,
          item: `${site.url}/shop/${p.category.toLowerCase()}/`,
        },
        { '@type': 'ListItem', position: 4, name: p.name, item: `${site.url}${p.url}` },
      ],
    },
  ];

  const body = `${crumbs([
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop/' },
    { label: p.category, href: `/shop/${p.category.toLowerCase()}/` },
    { label: p.name },
  ])}

      <section class="section section--tight" data-product="${p.id}">
        <div class="container">
          <div class="pdp">

            <!-- Gallery -->
            <div class="pdp__gallery">
              <div class="gallery__main" data-gallery-main style="aspect-ratio:${p.aspect}">
                <img src="${p.images[0]}" alt="${esc(p.name)}" width="${p.imgW}" height="${
    p.imgH
  }" fetchpriority="high" decoding="async" data-gallery-img>
              </div>
              ${
                p.images.length > 1
                  ? `<div class="gallery__thumbs">
            ${gallery}
              </div>`
                  : ''
              }
              <p class="meta mt-3">${icon('zoom', 'icon icon--sm')} Hover to zoom on desktop.${
    p.hasRealPhotos ? '' : ' Studio visuals — real product photography coming soon.'
  }</p>
            </div>

            <!-- Buy column -->
            <div>
              <div class="pdp__head">
                <span class="tag">${esc(p.subcategory)}</span>
                <h1 class="mt-3">${esc(p.name)}</h1>
                <span class="pdp__price">${money(p.price)}</span>
                <p class="pdp__short">${esc(p.shortDescription)}</p>
                <span class="pdp__stock">${icon('checkCircle', 'icon icon--sm')} In stock — ready to dispatch</span>
              </div>

              <ul class="features">
            ${featureList}
              </ul>

              ${sizeSelector(p)}
              ${colourRow(p)}
              ${shadeSelector(p)}

              <div class="opt">
                <div class="opt__head">
                  <span class="opt__label">Quantity</span>
                </div>
                <div class="pdp__buy">
                  <div class="qty" data-qty>
                    <button type="button" data-qty-dec aria-label="Decrease quantity">${icon(
                      'minus',
                      'icon icon--sm'
                    )}</button>
                    <input type="number" value="1" min="1" max="20" step="1" data-qty-input aria-label="Quantity">
                    <button type="button" data-qty-inc aria-label="Increase quantity">${icon(
                      'plus',
                      'icon icon--sm'
                    )}</button>
                  </div>
                  <button class="btn btn--primary" type="button" data-add-to-cart>${icon(
                    'cart',
                    'icon icon--sm'
                  )} Add to Cart</button>
                </div>
              </div>

              <div class="pdp__ship">
                ${icon('truck')}
                <div>${esc(site.deliveryDays)}, UAE only · Free delivery over AED 150 · 7-day returns</div>
              </div>

              <p class="pdp__sku">SKU: ${esc(p.sku)}</p>

              <!-- Full detail: Description + Details -->
              <div class="acc mt-6">
                <div class="acc__item">
                  <button class="acc__btn" type="button" data-acc-btn aria-expanded="true" aria-controls="pdp-desc">
                    Description ${icon('chevronDown')}
                  </button>
                  <div class="acc__panel is-open" id="pdp-desc">
                    <p>${esc(p.description)}</p>
                  </div>
                </div>
                <div class="acc__item">
                  <button class="acc__btn" type="button" data-acc-btn aria-expanded="false" aria-controls="pdp-details">
                    Details ${icon('chevronDown')}
                  </button>
                  <div class="acc__panel" id="pdp-details">
                    <table class="spec-table">
                      <tbody>
                  ${detailTable}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="acc__item">
                  <button class="acc__btn" type="button" data-acc-btn aria-expanded="false" aria-controls="pdp-delivery">
                    Delivery &amp; Returns ${icon('chevronDown')}
                  </button>
                  <div class="acc__panel" id="pdp-delivery">
                    <p>We deliver across the United Arab Emirates only, with standard delivery in ${esc(
                      site.deliveryDays
                    )} from order confirmation. Delivery is AED 15.00 for orders under AED 150.00, and free for orders of AED 150.00 or more.</p>
                    <p>Items may be returned within 7 days of delivery if unused and in original packaging. Cosmetics and beauty products must be unopened and unused. Read the full <a href="/returns-policy/">Return &amp; Refund Policy</a>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related products -->
      <section class="section section--surface">
        <div class="container">
          ${sectionHead('You may also like', `More from ${p.subcategory}`, {
            href: `/shop/${p.category.toLowerCase()}/?sub=${encodeURIComponent(p.subcategory)}`,
            label: `All ${p.subcategory}`,
          })}
          ${productGrid(related)}
        </div>
      </section>`;

  return page({
    title: p.name,
    description: p.shortDescription,
    active: `/shop/${p.category.toLowerCase()}/`,
    canonical: p.url,
    body,
    scripts: ['/assets/js/product.js'],
    sizeGuide: true,
    jsonLd,
  });
}

module.exports = { build };

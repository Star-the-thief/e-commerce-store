'use strict';

/**
 * Product detail template — wholesale garment catalogue.
 * One template, 21 pages. Every field comes from the catalog; nothing here is
 * written per-product. No fixed retail price is ever shown — see
 * src/lib/components.js for why "Price on Request" is the default.
 */

const { site, esc, money, page, crumbs } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { productGrid, sectionHead } = require('../lib/components');
const catalog = require('../lib/products');

function sizeSelector(p) {
  if (!p.sizes || !p.sizes.length) return '';
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
              <span class="opt__label">${oneSize ? 'Size' : 'Sizes available'} <span data-variant-selected>${esc(
    p.sizes[0]
  )}</span></span>
              <button class="link-quiet" type="button" data-size-guide>Size Guide</button>
            </div>
            <div class="opt__list" data-variant-group="size">
              ${buttons}
            </div>
          </div>`;
}

function colourRow(p) {
  if (!p.colour) return '';
  return `<div class="opt" style="border-bottom:1px solid var(--color-border)">
            <div class="opt__head">
              <span class="opt__label">Colour</span>
            </div>
            <span class="colour-chip"><i style="background:${esc(p.colorTheme)}"></i>${esc(p.colour)}</span>
          </div>`;
}

/** WhatsApp deep link pre-filled with a product-specific enquiry message. */
function whatsappHref(p) {
  const msg = site.whatsappTemplates.product
    .replace('{name}', p.name)
    .replace('{sku}', p.sku);
  return `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(msg)}`;
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
  const priceLabel = p.wholesalePrice ? money(p.wholesalePrice) : 'Price on Request';

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
      manufacturer: { '@type': 'Organization', name: site.name, legalName: site.legalName },
      offers: {
        '@type': 'Offer',
        url: `${site.url}${p.url}`,
        priceCurrency: 'AED',
        priceSpecification: { '@type': 'PriceSpecification', valueAddedTaxIncluded: true },
        availability: 'https://schema.org/InStock',
        businessFunction: 'http://purl.org/goodrelations/v1#Sell',
        eligibleQuantity: { '@type': 'QuantitativeValue', minValue: 50, unitText: 'pieces' },
        seller: { '@type': 'Organization', name: site.name, legalName: site.legalName },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Catalogue', item: `${site.url}/catalogue/` },
        { '@type': 'ListItem', position: 3, name: p.subcategory, item: `${site.url}/catalogue/?sub=${encodeURIComponent(p.subcategory)}` },
        { '@type': 'ListItem', position: 4, name: p.name, item: `${site.url}${p.url}` },
      ],
    },
  ];

  const body = `${crumbs([
    { label: 'Home', href: '/' },
    { label: 'Catalogue', href: '/catalogue/' },
    { label: p.subcategory, href: `/catalogue/?sub=${encodeURIComponent(p.subcategory)}` },
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

            <!-- Enquiry column -->
            <div>
              <div class="pdp__head">
                <span class="tag">${esc(p.subcategory)}</span>
                <h1 class="mt-3">${esc(p.name)}</h1>
                <span class="pdp__price pdp__price--quote">${priceLabel}</span>
                <p class="pdp__short">${esc(p.shortDescription)}</p>
                <span class="pdp__stock">${icon('checkCircle', 'icon icon--sm')} Available for wholesale order</span>
              </div>

              <ul class="features">
            ${featureList}
              </ul>

              ${sizeSelector(p)}
              ${colourRow(p)}

              <div class="pdp__buy">
                <a class="btn btn--primary" href="/enquiry/?product=${p.slug}">${icon(
    'file',
    'icon icon--sm'
  )} Request a Quote</a>
                <a class="btn btn--secondary" href="${whatsappHref(p)}">${icon(
    'whatsapp',
    'icon icon--sm'
  )} Enquire via WhatsApp</a>
              </div>

              <div class="pdp__ship">
                ${icon('box')}
                <div>MOQ: ${esc(site.wholesale.moq)} · ${esc(site.wholesale.supplyRegion)}</div>
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
                  <button class="acc__btn" type="button" data-acc-btn aria-expanded="false" aria-controls="pdp-wholesale">
                    Wholesale Terms ${icon('chevronDown')}
                  </button>
                  <div class="acc__panel" id="pdp-wholesale">
                    <p>Minimum order: ${esc(site.wholesale.moq)}. Lead time: ${esc(
    site.wholesale.leadTime
  )}. ${esc(site.wholesale.sampleNote)}.</p>
                    <p>Delivery: ${esc(
                      site.wholesale.supplyRegion
                    )}. See the full <a href="/wholesale-process/">Wholesale Process</a> and <a href="/delivery-payment-terms/">Delivery &amp; Payment Terms</a>.</p>
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
            href: `/catalogue/?sub=${encodeURIComponent(p.subcategory)}`,
            label: `All ${p.subcategory}`,
          })}
          ${productGrid(related)}
        </div>
      </section>`;

  return page({
    title: p.name,
    description: p.shortDescription,
    active: '/catalogue/',
    canonical: p.url,
    body,
    scripts: ['/assets/js/product.js'],
    sizeGuide: true,
    jsonLd,
  });
}

module.exports = { build };

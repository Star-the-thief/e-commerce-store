'use strict';

/**
 * Catalog data layer — wholesale garment catalogue.
 * Loads the garment dataset and derives everything the templates need (slug,
 * url, image paths, feature bullets, wholesale detail rows). Every catalogue
 * and product page renders from this single source; no product markup is
 * ever hand-written.
 *
 * This site is garments-only (Beauty was removed for the B2B wholesale
 * pivot) — src/data/product-photos/hv-be-*.png are left in place, unreferenced,
 * in case a beauty line returns later; nothing here loads them.
 */

const raw = require('../data/products.json');
const { photosFor } = require('./real-photos');
const site = require('../data/site.json');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Derive 3–4 key feature bullets from the product's own fields. Never invented copy. */
function features(p) {
  const out = [];
  if (p.material) out.push(`Made from ${p.material}`);
  if (p.fit) out.push(p.fit);
  if (p.colour) out.push(`Colour: ${p.colour}`);
  if (p.sizes && p.sizes.length) {
    out.push(
      p.sizes.length === 1 && p.sizes[0] === 'One Size'
        ? 'One size — see fit details below'
        : `Available in sizes ${p.sizes.join(', ')}`
    );
  }
  return out.slice(0, 4);
}

/**
 * Structured "Details" rows for the PDP accordion: the product's own fields,
 * plus the site-wide wholesale policy (MOQ / packaging) — a stated standing
 * policy, not a fabricated per-SKU figure. See site.json `wholesale`.
 */
function detailRows(p) {
  const rows = [];
  const add = (label, value) => {
    if (value && String(value).trim() && !/^n\/a$/i.test(String(value).trim())) {
      rows.push([label, String(value)]);
    }
  };

  add('Material', p.material);
  add('Colour', p.colour);
  add('Fit', p.fit);
  add('Available sizes', p.sizes && p.sizes.join(', '));
  add('Care instructions', p.care);
  add('Minimum order quantity (MOQ)', site.wholesale.moq);
  add('Packaging', site.wholesale.packaging);
  add('SKU', p.sku);
  return rows;
}

const products = raw.map((p, index) => {
  const slug = slugify(p.name);
  return Object.assign({}, p, {
    slug,
    url: `/product/${slug}/`,
    order: index,
    isGarment: true,
    aspect: '4 / 5',
    imgW: 1000,
    imgH: 1250,
    // Section 3.5 naming convention: img/products/{id}-1..3. Real photography
    // (src/data/product-photos/) always wins and is never mixed with the
    // generated placeholder set within one product's gallery — see
    // src/lib/real-photos.js for why.
    ...(() => {
      const real = photosFor(p.id);
      return {
        images: real.length
          ? real.map((r) => r.url)
          : [1, 2, 3].map((n) => `/assets/img/products/${p.id}-${n}.svg`),
        hasRealPhotos: real.length > 0,
      };
    })(),
    features: features(p),
    detailRows: detailRows(p),
  });
});

const byId = new Map(products.map((p) => [p.id, p]));
const bySlug = new Map(products.map((p) => [p.slug, p]));

/** Subcategories in catalog order. */
function subcategories() {
  const seen = [];
  products.forEach((p) => {
    if (!seen.includes(p.subcategory)) seen.push(p.subcategory);
  });
  return seen;
}

function related(product, limit) {
  const same = products.filter((p) => p.subcategory === product.subcategory && p.id !== product.id);
  const fill = products.filter((p) => p.subcategory !== product.subcategory);
  return same.concat(fill).slice(0, limit || 4);
}

/** Featured styles (homepage rail): a deliberate spread across every subcategory. */
const FEATURED_IDS = [
  'hv-fa-dr-01', // Dresses
  'hv-fa-tb-01', // Tops & Blouses
  'hv-fa-co-01', // Co-ord Sets
  'hv-fa-ab-02', // Abayas & Modest Wear
  'hv-fa-tr-01', // Trousers/Bottoms
  'hv-fa-ac-01', // Fashion Accessories
  'hv-fa-dr-04', // Dresses
  'hv-fa-ab-01', // Abayas & Modest Wear
  'hv-fa-co-02', // Co-ord Sets
  'hv-fa-tb-03', // Tops & Blouses
];

const featured = FEATURED_IDS.map((id) => byId.get(id)).filter(Boolean);

/** New in the catalogue: most recently added = end of catalog order. */
const newArrivals = products.slice().reverse().slice(0, 8);

module.exports = {
  products,
  byId,
  bySlug,
  subcategories,
  related,
  featured,
  newArrivals,
  slugify,
};

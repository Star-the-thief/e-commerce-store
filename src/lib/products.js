'use strict';

/**
 * Catalog data layer — Specification Section 7.2.
 * Loads the 38-product dataset from Appendix A and derives everything the
 * templates need (slug, url, image paths, feature bullets). Every shop,
 * category and product page renders from this single source; no product markup
 * is ever hand-written.
 */

const raw = require('../data/products.json');
const { photosFor } = require('./real-photos');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Derive 3–4 key feature bullets from the product's own fields (Spec 6.3).
 * Never invented copy — every bullet is assembled from catalog values.
 */
function features(p) {
  const out = [];
  if (p.category === 'Fashion') {
    if (p.material) out.push(`Made from ${p.material.replace(/^100% /, '100% ')}`);
    if (p.fit) out.push(p.fit);
    if (p.colour) out.push(`Colour: ${p.colour}`);
    if (p.sizes && p.sizes.length) {
      out.push(
        p.sizes.length === 1 && p.sizes[0] === 'One Size'
          ? 'One size — see fit details below'
          : `Available in sizes ${p.sizes.join(', ')}`
      );
    }
  } else {
    if (p.netQuantity) out.push(`${p.productType} · ${p.netQuantity}`);
    if (p.keyIngredients && !/^n\/a/i.test(p.keyIngredients)) {
      out.push(`Key ingredients: ${p.keyIngredients}`);
    } else if (p.keyIngredients) {
      out.push(p.keyIngredients.replace(/^N\/A\s*[—-]\s*/i, '').replace(/^./, (c) => c.toUpperCase()));
    }
    if (p.skinHairType && !/^n\/a$/i.test(p.skinHairType)) out.push(p.skinHairType);
    if (p.shade) out.push(`Shade: ${p.shade}`);
  }
  return out.slice(0, 4);
}

/** Structured "Details" rows for the PDP accordion. Empty fields are omitted. */
function detailRows(p) {
  const rows = [];
  const add = (label, value) => {
    if (value && String(value).trim() && !/^n\/a$/i.test(String(value).trim())) {
      rows.push([label, String(value)]);
    }
  };

  if (p.category === 'Fashion') {
    add('Material', p.material);
    add('Colour', p.colour);
    add('Fit', p.fit);
    add('Available sizes', p.sizes && p.sizes.join(', '));
    add('Care instructions', p.care);
  } else {
    // NOTE: no country-of-origin / manufacturer field — intentionally omitted
    // per Specification Section 1. Do not add one.
    add('Product type', p.productType);
    add('Net quantity', p.netQuantity);
    add('Shade', p.shade);
    add('Key ingredients', p.keyIngredients);
    add('How to use', p.howToUse);
    add('Suitable for', p.skinHairType);
    add('Precautions', p.precautions);
  }
  add('SKU', p.sku);
  return rows;
}

const products = raw.map((p, index) => {
  const slug = slugify(p.name);
  const isGarment = p.category === 'Fashion';
  return Object.assign({}, p, {
    slug,
    url: `/product/${slug}/`,
    order: index,
    isGarment,
    aspect: isGarment ? '4 / 5' : '1 / 1',
    imgW: 1000,
    imgH: isGarment ? 1250 : 1000,
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

/** Subcategories in catalog order, per category. */
function subcategories(category) {
  const seen = [];
  products.forEach((p) => {
    if ((!category || p.category === category) && !seen.includes(p.subcategory)) {
      seen.push(p.subcategory);
    }
  });
  return seen;
}

function inCategory(category) {
  return category ? products.filter((p) => p.category === category) : products.slice();
}

function related(product, limit) {
  const same = products.filter(
    (p) => p.subcategory === product.subcategory && p.id !== product.id
  );
  const fill = products.filter(
    (p) => p.category === product.category && p.subcategory !== product.subcategory
  );
  return same.concat(fill).slice(0, limit || 4);
}

/**
 * Featured / bestsellers (Spec 6.1 item 6): a deliberate spread across
 * subcategories in both categories, not the first N of the catalog.
 */
const FEATURED_IDS = [
  'hv-fa-dr-01', // Dresses
  'hv-be-fr-02', // Fragrances
  'hv-fa-ab-02', // Abayas & Modest Wear
  'hv-be-mk-03', // Makeup
  'hv-fa-co-01', // Co-ord Sets
  'hv-be-sk-01', // Skincare
  'hv-fa-tb-01', // Tops & Blouses
  'hv-be-bb-02', // Bath & Body
  'hv-fa-tr-01', // Trousers/Bottoms
  'hv-be-ba-01', // Beauty Accessories
];

const featured = FEATURED_IDS.map((id) => byId.get(id)).filter(Boolean);

/** New arrivals (Spec 6.1 item 8): most recently catalogued = end of catalog order. */
const newArrivals = products.slice().reverse().slice(0, 8);

const priceBounds = { min: 30, max: 300 };

module.exports = {
  products,
  byId,
  bySlug,
  subcategories,
  inCategory,
  related,
  featured,
  newArrivals,
  priceBounds,
  slugify,
};

'use strict';

/**
 * Real product photography — Specification Section 3.5.
 *
 * The catalog launches with generated placeholder visuals (src/lib/images.js)
 * and is designed to swap 1:1 to real photography as it arrives, with no
 * layout changes. This module is that swap point: drop real photos into
 * src/data/product-photos/ named `{product-id}-{view}.{ext}` (view 1-3,
 * ext jpg/jpeg/png/webp) and the build picks them up automatically.
 *
 * Policy: never mix real photography with a generated illustration in the
 * same product's gallery — that inconsistency reads worse than an honest,
 * shorter gallery (Spec 2: "inconsistent components are the fastest way to
 * break the established-brand illusion"). A product with any real photos
 * uses only its real photos, however many exist yet; a product with none
 * keeps its full 3-image generated set until photos arrive.
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'product-photos');
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];

/** Real photos available for a product, in view order. Empty if none yet. */
function photosFor(productId) {
  const found = [];
  for (let view = 1; view <= 3; view += 1) {
    for (const ext of EXTS) {
      const file = path.join(DIR, `${productId}-${view}.${ext}`);
      if (fs.existsSync(file)) {
        found.push({ view, ext, file, url: `/assets/img/products/${productId}-${view}.${ext}` });
        break;
      }
    }
  }
  return found;
}

module.exports = { photosFor, DIR };

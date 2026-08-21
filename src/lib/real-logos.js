'use strict';

/**
 * Real partner-logo files — same swap-in mechanism as src/lib/real-photos.js
 * and src/lib/real-banners.js, applied to the partner logo showcase. Drop a
 * file into src/data/partner-logos/ named after the partner's `id` in
 * site.json (e.g. `rb-fashion.svg`) and it replaces the text wordmark
 * fallback everywhere the logo showcase is rendered, with no template
 * changes. Logos are usually vector, so svg is checked first.
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'partner-logos');
const EXTS = ['svg', 'png', 'webp', 'jpg', 'jpeg'];

/** Real logo file for a partner id, or null if none has been provided yet. */
function logoFor(id) {
  for (const ext of EXTS) {
    const file = path.join(DIR, `${id}.${ext}`);
    if (fs.existsSync(file)) {
      return { ext, file, url: `/assets/img/partners/${id}.${ext}` };
    }
  }
  return null;
}

module.exports = { logoFor, DIR };

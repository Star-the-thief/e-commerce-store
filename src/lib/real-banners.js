'use strict';

/**
 * Real brand banner photography — same swap-in mechanism as
 * src/lib/real-photos.js, applied to the hero/category banners instead of
 * product shots. Drop a file into src/data/brand-photos/ named after the
 * logical banner key (see src/lib/banners.js for the full key list — e.g.
 * `hero-home.jpg`, `cat-dresses.png`) and it replaces that generated SVG
 * everywhere the key is referenced, with no template changes.
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'brand-photos');
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];

function pngDimensions(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Real photo for a banner key, or null if none has been provided yet. */
function photoFor(key) {
  for (const ext of EXTS) {
    const file = path.join(DIR, `${key}.${ext}`);
    if (fs.existsSync(file)) {
      const dims = ext === 'png' ? pngDimensions(file) : null;
      return {
        ext,
        file,
        url: `/assets/img/brand/${key}.${ext}`,
        width: dims && dims.width,
        height: dims && dims.height,
      };
    }
  }
  return null;
}

/**
 * {src, width, height} for a banner slot — the real photo if one exists,
 * else the generated SVG at its canonical size (fallbackW/H).
 */
function brandImage(key, fallbackW, fallbackH) {
  const real = photoFor(key);
  if (real) return { src: real.url, width: real.width || fallbackW, height: real.height || fallbackH };
  return { src: `/assets/img/brand/${key}.svg`, width: fallbackW, height: fallbackH };
}

module.exports = { photoFor, brandImage, DIR };

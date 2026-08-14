'use strict';

/**
 * Product imagery system — Specification Section 3.5
 * ==================================================
 * No real product photography exists yet. This module renders a *consistent*
 * studio-style visual for every product in the catalog, driven by each item's
 * `colorTheme` / `accentTheme`, so the storefront looks intentional and
 * populated rather than like 38 grey boxes.
 *
 * The guarantees that make 38 products read as one catalog:
 *   - ONE backdrop treatment: identical gradient, vignette, brand halo,
 *     backdrop/floor seam and contact shadow on every single image.
 *   - ONE canvas per type: garments 1000x1250 (4:5), cosmetics 1000x1000 (1:1).
 *   - ONE lighting model: light falls from the upper-left on every silhouette
 *     (same highlight/shade gradient stops, same opacities).
 *   - THREE fixed compositions per product: 1) front, 2) styled, 3) detail.
 *
 * Swapping in real photography later: replace the files under
 * `dist/assets/img/products/` keeping the same filenames and aspect ratios.
 * No layout or markup changes are needed. See README.
 */

/* ------------------------------------------------------------------ *
 * Colour maths — keeps every silhouette legible whatever its theme
 * ------------------------------------------------------------------ */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** amount > 0 lightens toward white, < 0 darkens toward black. */
function shift(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const t = amount > 0 ? 255 : 0;
  const a = Math.abs(amount);
  return rgbToHex({ r: r + (t - r) * a, g: g + (t - g) * a, b: b + (t - b) * a });
}

/** Perceptual luminance 0..1. */
function lum(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Per-product palette. Very light themes (ivory, blush, cream) get a darker
 * edge so the silhouette still reads against the ivory backdrop; very dark
 * themes get a lifted highlight so form is still visible.
 */
function palette(product) {
  const base = product.colorTheme;
  const accent = product.accentTheme;
  const L = lum(base);

  return {
    base,
    accent,
    light: L > 0.82 ? shift(base, 0.35) : shift(base, 0.2),
    dark: L < 0.18 ? shift(base, 0.22) : shift(base, -0.28),
    edge: L > 0.72 ? shift(base, -0.34) : shift(base, -0.42),
    seam: L > 0.72 ? shift(base, -0.22) : shift(base, 0.16),
    isLight: L > 0.72,
    isDark: L < 0.2,
    accentEdge: shift(accent, -0.25),
  };
}

/* ------------------------------------------------------------------ *
 * The shared studio backdrop — identical across all 38 products
 * ------------------------------------------------------------------ */

const BACKDROP_TOP = '#F6F3EC';
const BACKDROP_BOTTOM = '#E8E4DA';
const FLOOR_TOP = '#E4DFD3';
const FLOOR_BOTTOM = '#DAD4C6';
const CHAMPAGNE = '#C9A24B';

/**
 * @param {object} cfg
 *   w, h        canvas size
 *   floorY      where the seamless backdrop meets the floor
 *   shadow      { cx, cy, rx, ry } contact shadow ellipse
 *   haloR       radius of the brand halo behind the product
 *   haloCy      halo centre
 *   defs        product-specific <defs> content
 *   content     product silhouette markup
 *   label       accessible title
 */
function studio(cfg) {
  const { w, h, floorY, shadow, haloR, haloCy } = cfg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t">
  <title id="t">${cfg.label}</title>
  <defs>
    <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BACKDROP_TOP}"/>
      <stop offset="1" stop-color="${BACKDROP_BOTTOM}"/>
    </linearGradient>
    <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${FLOOR_TOP}"/>
      <stop offset="1" stop-color="${FLOOR_BOTTOM}"/>
    </linearGradient>
    <radialGradient id="key" cx="0.42" cy="0.34" r="0.72">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.72"/>
      <stop offset="0.6" stop-color="#FFFFFF" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.46" r="0.78">
      <stop offset="0.55" stop-color="#8C8474" stop-opacity="0"/>
      <stop offset="1" stop-color="#8C8474" stop-opacity="0.20"/>
    </radialGradient>
    <radialGradient id="cs" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#0B4F3C" stop-opacity="0.26"/>
      <stop offset="0.55" stop-color="#0B4F3C" stop-opacity="0.11"/>
      <stop offset="1" stop-color="#0B4F3C" stop-opacity="0"/>
    </radialGradient>
${cfg.defs || ''}
  </defs>

  <!-- seamless backdrop -->
  <rect width="${w}" height="${h}" fill="url(#bd)"/>
  <rect y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#fl)"/>
  <line x1="0" y1="${floorY}" x2="${w}" y2="${floorY}" stroke="#D3CCBC" stroke-width="1.5"/>

  <!-- brand halo -->
  <circle cx="${w / 2}" cy="${haloCy}" r="${haloR}" fill="none" stroke="${CHAMPAGNE}" stroke-width="2" opacity="0.16"/>
  <circle cx="${w / 2}" cy="${haloCy}" r="${haloR - 26}" fill="none" stroke="${CHAMPAGNE}" stroke-width="1" opacity="0.1"/>

  <!-- key light -->
  <rect width="${w}" height="${h}" fill="url(#key)"/>

  <!-- contact shadow -->
  <ellipse cx="${shadow.cx}" cy="${shadow.cy}" rx="${shadow.rx}" ry="${shadow.ry}" fill="url(#cs)"/>

${cfg.content}

  <!-- vignette -->
  <rect width="${w}" height="${h}" fill="url(#vig)" style="mix-blend-mode:multiply"/>
</svg>
`;
}

/** Body gradient every silhouette uses — one lighting model for the catalog. */
function bodyGradient(id, p, angle) {
  const a = angle || { x1: 0.12, y1: 0, x2: 0.92, y2: 1 };
  return `    <linearGradient id="${id}" x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}">
      <stop offset="0" stop-color="${p.light}"/>
      <stop offset="0.42" stop-color="${p.base}"/>
      <stop offset="1" stop-color="${p.dark}"/>
    </linearGradient>`;
}

/** Soft specular sheen laid over a silhouette (same shape on every product). */
function sheenGradient(id, strength) {
  const s = strength == null ? 0.34 : strength;
  return `    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.34" stop-color="#FFFFFF" stop-opacity="${s}"/>
      <stop offset="0.52" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>`;
}

/* ================================================================== *
 * GARMENTS — 1000 x 1250, flat-lay silhouettes
 * ================================================================== */

const G = { W: 1000, H: 1250, CX: 500, FLOOR: 1046, SHADOW_CY: 1052 };

/**
 * Garment silhouette geometry.
 * Each entry returns { body, detail } path/markup strings drawn in a 1000x1250
 * canvas. `body` is the filled outline; `detail` is seams/openings drawn on top.
 * All share the same shoulder line (y=268) and hem baseline conventions so the
 * catalog scales consistently.
 */
const GARMENTS = {
  /* --- Dresses -------------------------------------------------- */
  dressWrap: {
    hem: 962,
    body:
      'M500 236 C455 236 420 244 398 258 L336 300 C324 309 320 324 325 338 L352 420 ' +
      'C356 433 349 447 336 452 L352 566 C356 592 362 616 368 638 L330 940 ' +
      'C328 954 338 966 352 966 L648 966 C662 966 672 954 670 940 L632 638 ' +
      'C638 616 644 592 648 566 L664 452 C651 447 644 433 648 420 L675 338 ' +
      'C680 324 676 309 664 300 L602 258 C580 244 545 236 500 236 Z',
    detail: (p) => `
    <path d="M500 236 C478 262 462 306 452 356 C444 398 448 440 460 470 L500 560" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M500 236 C522 262 538 306 548 356 C556 398 552 440 540 470 L500 560" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M366 596 L500 664 L634 596" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.45"/>
    <path d="M500 664 L470 966" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.35"/>
    <rect x="352" y="560" width="296" height="34" rx="17" fill="${p.accent}" opacity="0.92"/>
    <path d="M486 594 L470 706 M514 594 L530 706" stroke="${p.accent}" stroke-width="11" stroke-linecap="round" opacity="0.85" fill="none"/>`,
  },

  dressSlip: {
    hem: 970,
    body:
      'M418 268 L406 322 C396 366 392 410 394 452 L378 936 C377 952 389 966 405 966 ' +
      'L595 966 C611 966 623 952 622 936 L606 452 C608 410 604 366 594 322 L582 268 ' +
      'C560 292 540 304 500 304 C460 304 440 292 418 268 Z',
    detail: (p) => `
    <path d="M418 268 C430 246 444 232 452 226" fill="none" stroke="${p.edge}" stroke-width="7" stroke-linecap="round" opacity="0.75"/>
    <path d="M582 268 C570 246 556 232 548 226" fill="none" stroke="${p.edge}" stroke-width="7" stroke-linecap="round" opacity="0.75"/>
    <path d="M418 268 C452 300 472 310 500 310 C528 310 548 300 582 268" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M500 320 L500 962" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.28"/>
    <path d="M436 340 C424 480 414 700 408 930" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.2"/>
    <path d="M566 340 C578 480 588 700 594 930" fill="none" stroke="${p.edge}" stroke-width="4" opacity="0.22"/>
    <circle cx="452" cy="234" r="9" fill="none" stroke="${p.accent}" stroke-width="4"/>
    <circle cx="548" cy="234" r="9" fill="none" stroke="${p.accent}" stroke-width="4"/>`,
  },

  dressTiered: {
    hem: 986,
    body:
      'M500 240 C462 240 432 248 412 260 L344 296 C330 304 326 320 332 334 L364 404 ' +
      'C370 418 364 432 350 436 L372 470 L346 560 L318 700 L292 860 C288 892 306 918 340 918 ' +
      'L660 918 C694 918 712 892 708 860 L682 700 L654 560 L628 470 L650 436 ' +
      'C636 432 630 418 636 404 L668 334 C674 320 670 304 656 296 L588 260 ' +
      'C568 248 538 240 500 240 Z',
    detail: (p) => `
    <path d="M500 240 C480 264 468 292 466 316 C500 328 500 328 534 316 C532 292 520 264 500 240 Z" fill="${p.dark}" opacity="0.4"/>
    <path d="M372 470 L628 470" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.4"/>
    <path d="M346 560 L654 560" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.4"/>
    <path d="M318 700 L682 700" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.4"/>
    <path d="M366 486 C368 520 366 542 362 556 M434 486 C436 520 434 542 430 556 M500 486 L500 556 M566 486 C564 520 566 542 570 556 M634 486 C632 520 634 542 638 556" stroke="${p.edge}" stroke-width="2" opacity="0.3" fill="none"/>
    <path d="M342 578 C346 630 344 670 338 696 M420 578 L418 696 M500 578 L500 696 M580 578 L582 696 M658 578 C654 630 656 670 662 696" stroke="${p.edge}" stroke-width="2" opacity="0.28" fill="none"/>
    <path d="M304 726 C306 794 302 856 296 902 M400 726 L396 902 M500 726 L500 902 M600 726 L604 902 M696 726 C694 794 698 856 704 902" stroke="${p.edge}" stroke-width="2" opacity="0.26" fill="none"/>
    <rect x="366" y="440" width="268" height="26" rx="13" fill="${p.accent}" opacity="0.55"/>`,
  },

  dressPuff: {
    hem: 968,
    body:
      'M500 238 C462 238 434 246 414 258 L378 280 C336 292 306 330 306 376 C306 416 330 448 366 460 ' +
      'L384 466 C392 468 400 464 402 456 L414 410 L420 552 C420 566 428 578 440 584 L352 930 ' +
      'C348 948 362 966 380 966 L620 966 C638 966 652 948 648 930 L560 584 ' +
      'C572 578 580 566 580 552 L586 410 L598 456 C600 464 608 468 616 466 L634 460 ' +
      'C670 448 694 416 694 376 C694 330 664 292 622 280 L586 258 C566 246 538 238 500 238 Z',
    detail: (p) => `
    <path d="M414 258 C444 286 468 298 500 298 C532 298 556 286 586 258" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M340 316 C326 344 328 386 348 416 M360 300 C344 336 346 388 372 424" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.4"/>
    <path d="M660 316 C674 344 672 386 652 416 M640 300 C656 336 654 388 628 424" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.4"/>
    <path d="M420 552 L580 552" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.45"/>
    <path d="M440 584 L410 962 M500 584 L500 962 M560 584 L590 962" stroke="${p.edge}" stroke-width="2" opacity="0.26" fill="none"/>
    <rect x="416" y="546" width="168" height="24" rx="12" fill="${p.accent}" opacity="0.7"/>`,
  },

  dressShirt: {
    hem: 964,
    body:
      'M500 246 C470 246 446 252 428 262 L356 296 C342 303 336 320 342 334 L370 412 ' +
      'C375 425 369 439 356 443 L372 560 L360 936 C359 952 371 966 387 966 L613 966 ' +
      'C629 966 641 952 640 936 L628 560 L644 443 C631 439 625 425 630 412 L658 334 ' +
      'C664 320 658 303 644 296 L572 262 C554 252 530 246 500 246 Z',
    detail: (p) => `
    <path d="M428 262 L500 320 L572 262 L556 246 L500 292 L444 246 Z" fill="${p.dark}" opacity="0.55"/>
    <path d="M500 320 L500 962" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M468 330 L468 958 M532 330 L532 958" stroke="${p.edge}" stroke-width="1.5" opacity="0.28" fill="none"/>
    <g fill="${p.accent}" opacity="0.95">
      <circle cx="500" cy="392" r="7"/><circle cx="500" cy="470" r="7"/>
      <circle cx="500" cy="640" r="7"/><circle cx="500" cy="718" r="7"/>
      <circle cx="500" cy="796" r="7"/><circle cx="500" cy="874" r="7"/>
    </g>
    <rect x="366" y="546" width="268" height="30" rx="6" fill="${p.accent}" opacity="0.9"/>
    <rect x="472" y="540" width="56" height="42" rx="6" fill="none" stroke="${p.accentEdge}" stroke-width="4" opacity="0.9"/>
    <path d="M356 443 L372 560 M644 443 L628 560" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.4"/>`,
  },

  /* --- Tops & Blouses ------------------------------------------- */
  blousePleat: {
    hem: 800,
    body:
      'M500 268 C468 268 442 274 424 284 L350 320 C336 327 330 344 336 358 L368 448 ' +
      'C373 461 366 475 353 478 L368 560 L358 776 C357 792 369 806 385 806 L615 806 ' +
      'C631 806 643 792 642 776 L632 560 L647 478 C634 475 627 461 632 448 L664 358 ' +
      'C670 344 664 327 650 320 L576 284 C558 274 532 268 500 268 Z',
    detail: (p) => `
    <path d="M424 284 C452 312 474 324 500 324 C526 324 548 312 576 284" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <g stroke="${p.edge}" stroke-width="2" opacity="0.34" fill="none">
      <path d="M400 340 L392 798"/><path d="M434 332 L430 800"/><path d="M468 328 L466 802"/>
      <path d="M534 328 L534 802"/><path d="M566 332 L570 800"/><path d="M600 340 L608 798"/>
    </g>
    <g stroke="#FFFFFF" stroke-width="2" opacity="0.28" fill="none">
      <path d="M417 336 L411 799"/><path d="M451 330 L448 801"/><path d="M500 326 L500 803"/>
      <path d="M550 330 L552 801"/><path d="M583 336 L589 799"/>
    </g>
    <rect x="341" y="452" width="34" height="26" rx="6" fill="${p.accent}" opacity="0.6"/>
    <rect x="625" y="452" width="34" height="26" rx="6" fill="${p.accent}" opacity="0.6"/>`,
  },

  camisole: {
    hem: 792,
    body:
      'M424 286 L414 330 C406 366 402 402 404 434 L396 762 C395 778 407 792 423 792 ' +
      'L577 792 C593 792 605 778 604 762 L596 434 C598 402 594 366 586 330 L576 286 ' +
      'C556 306 534 316 500 316 C466 316 444 306 424 286 Z',
    detail: (p) => `
    <path d="M424 286 C436 258 448 240 458 232" fill="none" stroke="${p.edge}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
    <path d="M576 286 C564 258 552 240 542 232" fill="none" stroke="${p.edge}" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
    <path d="M424 286 C452 314 470 322 500 322 C530 322 548 314 576 286" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M500 330 L500 788" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.24"/>
    <path d="M440 352 C430 480 424 640 420 786" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.2"/>
    <path d="M562 352 C572 480 578 640 582 786" fill="none" stroke="${p.edge}" stroke-width="4" opacity="0.2"/>
    <path d="M404 434 C440 452 560 452 596 434" fill="none" stroke="${p.accent}" stroke-width="4" opacity="0.55"/>`,
  },

  knotTop: {
    hem: 786,
    body:
      'M500 268 C468 268 442 274 424 284 L352 318 C338 325 332 342 338 356 L374 440 ' +
      'C380 454 374 468 360 472 L376 546 L366 758 C365 774 377 788 393 788 L607 788 ' +
      'C623 788 635 774 634 758 L624 546 L640 472 C626 468 620 454 626 440 L662 356 ' +
      'C668 342 662 325 648 318 L576 284 C558 274 532 268 500 268 Z',
    detail: (p) => `
    <path d="M424 284 C452 314 474 326 500 326 C526 326 548 314 576 284" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M376 560 C420 588 460 600 500 600 C540 600 580 588 624 560" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.42"/>
    <path d="M430 604 C462 616 468 640 452 662 C438 682 448 704 470 708 L500 712 L530 708 C552 704 562 682 548 662 C532 640 538 616 570 604 C540 592 460 592 430 604 Z" fill="${p.dark}" opacity="0.5"/>
    <path d="M462 620 C486 634 514 634 538 620" fill="none" stroke="${p.accent}" stroke-width="4" opacity="0.8"/>
    <path d="M420 718 L404 784 M580 718 L596 784" stroke="${p.edge}" stroke-width="2.5" opacity="0.3" fill="none"/>`,
  },

  ruffleTop: {
    hem: 800,
    body:
      'M500 268 C468 268 442 274 424 284 L364 312 C324 326 300 366 306 408 C310 442 332 468 362 480 ' +
      'L378 486 C387 489 396 484 398 475 L410 428 L378 560 L368 770 C367 786 379 800 395 800 ' +
      'L605 800 C621 800 633 786 632 770 L622 560 L590 428 L602 475 ' +
      'C604 484 613 489 622 486 L638 480 C668 468 690 442 694 408 C700 366 676 326 636 312 ' +
      'L576 284 C558 274 532 268 500 268 Z',
    detail: (p) => `
    <path d="M424 284 C452 312 474 324 500 324 C526 324 548 312 576 284" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M334 340 C312 366 308 402 322 430 M354 326 C330 358 326 404 346 440 M372 320 C348 356 344 408 366 448" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.42"/>
    <path d="M666 340 C688 366 692 402 678 430 M646 326 C670 358 674 404 654 440 M628 320 C652 356 656 408 634 448" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.42"/>
    <path d="M500 330 L500 470" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.34"/>
    <path d="M470 300 C480 330 480 356 470 380 M530 300 C520 330 520 356 530 380" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    <path d="M382 620 L376 796 M500 600 L500 798 M618 620 L624 796" stroke="${p.edge}" stroke-width="2" opacity="0.26" fill="none"/>`,
  },

  wrapTop: {
    hem: 784,
    body:
      'M500 268 C468 268 442 274 424 284 L354 318 C340 325 334 342 340 356 L372 438 ' +
      'C377 451 371 465 358 469 L374 552 L364 756 C363 772 375 786 391 786 L609 786 ' +
      'C625 786 637 772 636 756 L626 552 L642 469 C629 465 623 451 628 438 L660 356 ' +
      'C666 342 660 325 646 318 L576 284 C558 274 532 268 500 268 Z',
    detail: (p) => `
    <path d="M424 284 C444 336 462 388 470 440 L500 520" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.55"/>
    <path d="M576 284 C556 336 538 388 530 440 L500 520" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.55"/>
    <path d="M424 284 C458 340 478 400 486 460 L500 520 L560 448 C574 388 578 330 576 284" fill="${p.dark}" opacity="0.28"/>
    <path d="M378 556 C420 578 460 588 500 588 C540 588 580 578 622 556" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.4"/>
    <rect x="374" y="548" width="252" height="22" rx="11" fill="${p.accent}" opacity="0.7"/>
    <path d="M416 596 L404 782 M584 596 L596 782" stroke="${p.edge}" stroke-width="2" opacity="0.26" fill="none"/>`,
  },

  /* --- Co-ord Sets (two pieces) --------------------------------- */
  coordSet: {
    hem: 972,
    body:
      // cropped top
      'M500 232 C472 232 450 238 434 246 L376 274 C364 280 359 294 364 306 L390 372 ' +
      'C395 384 389 396 377 399 L390 470 C391 484 402 494 416 494 L584 494 ' +
      'C598 494 609 484 610 470 L623 399 C611 396 605 384 610 372 L636 306 ' +
      'C641 294 636 280 624 274 L566 246 C550 238 528 232 500 232 Z ' +
      // wide-leg trousers
      'M382 536 C374 536 368 543 369 551 L384 640 L332 934 C329 952 343 968 361 968 L474 968 ' +
      'C489 968 501 956 502 941 L508 700 L514 941 C515 956 527 968 542 968 L655 968 ' +
      'C673 968 687 952 684 934 L632 640 L647 551 C648 543 642 536 634 536 Z',
    detail: (p) => `
    <path d="M434 246 C458 272 478 282 500 282 C522 282 542 272 566 246" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M500 290 L500 490" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.3"/>
    <path d="M390 470 L610 470" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.35"/>
    <rect x="369" y="536" width="278" height="34" rx="8" fill="${p.accent}" opacity="0.85"/>
    <path d="M508 570 L508 700" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.45"/>
    <path d="M430 580 L392 962 M580 580 L618 962" stroke="${p.edge}" stroke-width="2.5" opacity="0.3" fill="none"/>
    <path d="M470 586 C462 700 448 840 438 960 M546 586 C554 700 568 840 578 960" stroke="#FFFFFF" stroke-width="2" opacity="0.2" fill="none"/>`,
  },

  /* --- Abayas & Modest Wear ------------------------------------- */
  abaya: {
    hem: 1002,
    body:
      'M500 216 C468 216 442 222 424 232 L344 268 C328 275 320 292 324 308 L376 508 ' +
      'C382 530 366 550 344 550 L322 958 C321 976 335 992 353 992 L647 992 ' +
      'C665 992 679 976 678 958 L656 550 C634 550 618 530 624 508 L676 308 ' +
      'C680 292 672 275 656 268 L576 232 C558 222 532 216 500 216 Z',
    detail: (p) => `
    <path d="M424 232 C452 262 474 274 500 274 C526 274 548 262 576 232" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M500 282 L500 986" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.3"/>
    <path d="M368 560 L346 984 M632 560 L654 984" stroke="${p.edge}" stroke-width="2.5" opacity="0.28" fill="none"/>
    <path d="M420 300 C412 460 400 700 388 972 M580 300 C588 460 600 700 612 972" stroke="#FFFFFF" stroke-width="3" opacity="0.16" fill="none"/>
    <path d="M336 520 C356 540 366 552 368 560 M664 520 C644 540 634 552 632 560" fill="none" stroke="${p.edge}" stroke-width="2" opacity="0.35"/>`,
  },

  abayaEmbroidered: {
    hem: 1002,
    body:
      'M500 216 C468 216 442 222 424 232 L344 268 C328 275 320 292 324 308 L376 508 ' +
      'C382 530 366 550 344 550 L322 958 C321 976 335 992 353 992 L647 992 ' +
      'C665 992 679 976 678 958 L656 550 C634 550 618 530 624 508 L676 308 ' +
      'C680 292 672 275 656 268 L576 232 C558 222 532 216 500 216 Z',
    detail: (p) => `
    <path d="M424 232 C452 262 474 274 500 274 C526 274 548 262 576 232" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M500 282 L500 986" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.28"/>
    <g stroke="${p.accent}" stroke-width="3.5" fill="none" opacity="0.95">
      <path d="M474 300 L474 980"/><path d="M526 300 L526 980"/>
      <path d="M474 340 C486 352 486 368 474 380 M526 340 C514 352 514 368 526 380"/>
      <path d="M474 440 C486 452 486 468 474 480 M526 440 C514 452 514 468 526 480"/>
      <path d="M474 540 C486 552 486 568 474 580 M526 540 C514 552 514 568 526 580"/>
      <path d="M474 640 C486 652 486 668 474 680 M526 640 C514 652 514 668 526 680"/>
      <path d="M474 740 C486 752 486 768 474 780 M526 740 C514 752 514 768 526 780"/>
      <path d="M474 840 C486 852 486 868 474 880 M526 840 C514 852 514 868 526 880"/>
      <path d="M352 520 C372 532 380 546 382 556 M648 520 C628 532 620 546 618 556"/>
      <path d="M340 470 L378 486 M660 470 L622 486"/>
    </g>
    <g fill="${p.accent}" opacity="0.9">
      <circle cx="500" cy="360" r="5"/><circle cx="500" cy="460" r="5"/><circle cx="500" cy="560" r="5"/>
      <circle cx="500" cy="660" r="5"/><circle cx="500" cy="760" r="5"/><circle cx="500" cy="860" r="5"/>
    </g>
    <path d="M368 560 L346 984 M632 560 L654 984" stroke="${p.edge}" stroke-width="2.5" opacity="0.26" fill="none"/>`,
  },

  abayaOpen: {
    hem: 1000,
    body:
      'M500 220 C466 220 440 226 422 236 L340 272 C324 279 316 296 320 312 L374 512 ' +
      'C380 534 364 554 342 554 L320 960 C319 978 333 992 351 992 L470 992 ' +
      'C486 992 498 980 498 964 L498 300 L502 300 L502 964 C502 980 514 992 530 992 L649 992 ' +
      'C667 992 681 978 680 960 L658 554 C636 554 620 534 626 512 L680 312 ' +
      'C684 296 676 279 660 272 L578 236 C560 226 534 220 500 220 Z',
    detail: (p) => `
    <path d="M422 236 C446 260 466 272 500 272 C534 272 554 260 578 236" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M470 300 L470 988 M530 300 L530 988" fill="none" stroke="${p.accent}" stroke-width="9" opacity="0.9"/>
    <path d="M320 960 L470 986 M680 960 L530 986" fill="none" stroke="${p.accent}" stroke-width="7" opacity="0.75"/>
    <path d="M410 320 C400 480 390 720 378 970 M590 320 C600 480 610 720 622 970" stroke="#FFFFFF" stroke-width="3" opacity="0.18" fill="none"/>
    <path d="M370 566 L348 984 M630 566 L652 984" stroke="${p.edge}" stroke-width="2.5" opacity="0.26" fill="none"/>`,
  },

  kaftan: {
    hem: 992,
    body:
      'M500 222 C464 222 436 230 416 242 L300 292 C284 299 276 316 282 332 L336 470 ' +
      'C342 486 334 504 318 510 L340 528 L330 954 C329 972 343 988 361 988 L639 988 ' +
      'C657 988 671 972 670 954 L660 528 L682 510 C666 504 658 486 664 470 L718 332 ' +
      'C724 316 716 299 700 292 L584 242 C564 230 536 222 500 222 Z',
    detail: (p) => `
    <path d="M416 242 C446 276 470 290 500 290 C530 290 554 276 584 242" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M416 242 C444 282 470 296 500 296 C530 296 556 282 584 242" fill="none" stroke="${p.accent}" stroke-width="8" opacity="0.85"/>
    <path d="M500 300 L500 420" fill="none" stroke="${p.accent}" stroke-width="6" opacity="0.75"/>
    <path d="M330 954 L670 954" fill="none" stroke="${p.accent}" stroke-width="6" opacity="0.6"/>
    <path d="M318 510 L340 528 M682 510 L660 528" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.4"/>
    <path d="M404 330 C392 440 380 700 368 968 M596 330 C608 440 620 700 632 968" stroke="#FFFFFF" stroke-width="3" opacity="0.18" fill="none"/>
    <path d="M462 320 L456 972 M538 320 L544 972" stroke="${p.edge}" stroke-width="2" opacity="0.22" fill="none"/>`,
  },

  /* --- Trousers / Bottoms --------------------------------------- */
  trousersWide: {
    hem: 972,
    body:
      'M370 292 C360 292 353 301 355 311 L376 448 L318 930 C315 950 331 968 351 968 L472 968 ' +
      'C488 968 501 955 502 939 L508 560 L514 939 C515 955 528 968 544 968 L665 968 ' +
      'C685 968 701 950 698 930 L640 448 L661 311 C663 301 656 292 646 292 Z',
    detail: (p) => `
    <rect x="355" y="292" width="306" height="46" rx="10" fill="${p.accent}" opacity="0.85"/>
    <path d="M508 344 L508 560" fill="none" stroke="${p.edge}" stroke-width="3.5" opacity="0.5"/>
    <path d="M420 356 L372 960 M596 356 L644 960" stroke="${p.edge}" stroke-width="2.5" opacity="0.32" fill="none"/>
    <path d="M462 360 C452 520 434 760 420 958 M554 360 C564 520 582 760 596 958" stroke="#FFFFFF" stroke-width="2.5" opacity="0.22" fill="none"/>
    <circle cx="440" cy="316" r="7" fill="${p.accentEdge}" opacity="0.9"/>
    <path d="M355 402 L661 402" fill="none" stroke="${p.edge}" stroke-width="2" opacity="0.26"/>`,
  },

  culottes: {
    hem: 830,
    body:
      'M374 300 C364 300 357 309 359 319 L380 450 L336 790 C333 810 349 826 369 826 L474 826 ' +
      'C490 826 503 813 504 797 L508 552 L512 797 C513 813 526 826 542 826 L647 826 ' +
      'C667 826 683 810 680 790 L636 450 L657 319 C659 309 652 300 642 300 Z',
    detail: (p) => `
    <rect x="359" y="300" width="298" height="44" rx="10" fill="${p.accent}" opacity="0.85"/>
    <path d="M508 350 L508 552" fill="none" stroke="${p.edge}" stroke-width="3.5" opacity="0.5"/>
    <path d="M436 480 L420 820 M580 480 L596 820" stroke="${p.edge}" stroke-width="3" opacity="0.4" fill="none"/>
    <path d="M336 790 L504 810 M680 790 L512 810" fill="none" stroke="${p.edge}" stroke-width="2.5" opacity="0.3"/>
    <path d="M470 360 C462 500 446 660 432 816 M546 360 C554 500 570 660 584 816" stroke="#FFFFFF" stroke-width="2.5" opacity="0.2" fill="none"/>
    <circle cx="444" cy="322" r="7" fill="${p.accentEdge}" opacity="0.9"/>`,
  },

  /* --- Fashion Accessories -------------------------------------- */
  scarf: {
    hem: 880,
    body:
      'M262 360 C246 360 236 376 244 390 L360 596 C368 610 366 628 356 640 L262 754 ' +
      'C250 768 258 790 276 792 L716 830 C736 832 750 812 742 794 L648 588 ' +
      'C642 574 644 558 654 546 L748 432 C760 418 752 396 734 394 Z',
    detail: (p) => `
    <path d="M244 390 L742 452" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.34"/>
    <path d="M356 640 L744 700" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.34"/>
    <path d="M262 754 L716 830" fill="none" stroke="${p.accent}" stroke-width="6" opacity="0.75"/>
    <path d="M262 360 L734 394" fill="none" stroke="${p.accent}" stroke-width="6" opacity="0.75"/>
    <path d="M300 372 C320 470 340 540 356 604 M400 380 C420 480 438 552 452 616 M520 392 C540 492 556 564 570 628 M640 404 C658 504 672 576 686 640" stroke="#FFFFFF" stroke-width="3" opacity="0.22" fill="none"/>
    <g fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.55">
      <circle cx="360" cy="460" r="20"/><circle cx="500" cy="480" r="20"/><circle cx="640" cy="500" r="20"/>
      <circle cx="420" cy="700" r="20"/><circle cx="560" cy="720" r="20"/>
    </g>`,
  },
};

/** Map subcategory + product to a silhouette key. */
function garmentShape(product) {
  const n = product.name.toLowerCase();
  switch (product.subcategory) {
    case 'Dresses':
      if (n.includes('slip')) return 'dressSlip';
      if (n.includes('tiered')) return 'dressTiered';
      if (n.includes('puff')) return 'dressPuff';
      if (n.includes('shirt')) return 'dressShirt';
      return 'dressWrap';
    case 'Tops & Blouses':
      if (n.includes('camisole')) return 'camisole';
      if (n.includes('knot')) return 'knotTop';
      if (n.includes('ruffle')) return 'ruffleTop';
      if (n.includes('wrap')) return 'wrapTop';
      return 'blousePleat';
    case 'Co-ord Sets':
      return 'coordSet';
    case 'Abayas & Modest Wear':
      if (n.includes('embroidered')) return 'abayaEmbroidered';
      if (n.includes('open')) return 'abayaOpen';
      if (n.includes('kaftan')) return 'kaftan';
      return 'abaya';
    case 'Trousers/Bottoms':
      return n.includes('culotte') ? 'culottes' : 'trousersWide';
    default:
      return 'scarf';
  }
}

/* ================================================================== *
 * COSMETICS — 1000 x 1000, centred product shots
 * ================================================================== */

const C = { W: 1000, H: 1000, CX: 500, FLOOR: 838, SHADOW_CY: 844 };

/**
 * Cosmetic silhouettes. Each returns markup drawn in a 1000x1000 canvas,
 * standing on the floor line at y=838 and sharing the same lighting model.
 */
const COSMETICS = {
  lipstick: (p) => `
  <g>
    <rect x="440" y="470" width="120" height="366" rx="14" fill="url(#bg1)"/>
    <rect x="440" y="470" width="120" height="366" rx="14" fill="url(#sh1)"/>
    <rect x="440" y="470" width="120" height="30" rx="8" fill="${p.accent}" opacity="0.95"/>
    <rect x="440" y="640" width="120" height="16" fill="${p.accent}" opacity="0.85"/>
    <rect x="452" y="700" width="96" height="70" rx="6" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.6"/>
    <path d="M460 476 L460 830 M540 476 L540 830" stroke="#FFFFFF" stroke-width="2" opacity="0.2" fill="none"/>
    <path d="M466 210 C466 190 480 176 500 176 C520 176 534 190 534 210 L534 300 C534 330 520 348 500 348 C480 348 466 330 466 300 Z" fill="url(#bg2)"/>
    <path d="M466 210 C466 190 480 176 500 176 L500 348 C480 348 466 330 466 300 Z" fill="#FFFFFF" opacity="0.16"/>
    <rect x="452" y="340" width="96" height="130" rx="8" fill="${shift(p.accent, -0.1)}"/>
    <rect x="452" y="340" width="96" height="130" rx="8" fill="url(#sh1)"/>
    <path d="M462 350 L462 462" stroke="#FFFFFF" stroke-width="3" opacity="0.3" fill="none"/>
  </g>`,

  bottlePump: (p) => `
  <g>
    <path d="M370 380 C370 352 392 330 420 330 L580 330 C608 330 630 352 630 380 L630 800 C630 820 614 836 594 836 L406 836 C386 836 370 820 370 800 Z" fill="url(#bg1)"/>
    <path d="M370 380 C370 352 392 330 420 330 L580 330 C608 330 630 352 630 380 L630 800 C630 820 614 836 594 836 L406 836 C386 836 370 820 370 800 Z" fill="url(#sh1)"/>
    <path d="M400 360 L400 820" stroke="#FFFFFF" stroke-width="6" opacity="0.24" fill="none"/>
    <path d="M604 380 L604 812" stroke="${p.edge}" stroke-width="5" opacity="0.2" fill="none"/>
    <rect x="404" y="470" width="192" height="150" rx="8" fill="${p.accent}" opacity="0.18"/>
    <rect x="404" y="470" width="192" height="150" rx="8" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.75"/>
    <rect x="452" y="284" width="96" height="52" rx="8" fill="${shift(p.accent, -0.18)}"/>
    <rect x="466" y="220" width="68" height="70" rx="10" fill="${p.accent}"/>
    <rect x="466" y="220" width="34" height="70" rx="10" fill="#FFFFFF" opacity="0.2"/>
    <path d="M500 220 L500 178 C500 168 508 160 518 160 L560 160" fill="none" stroke="${shift(p.accent, -0.22)}" stroke-width="16" stroke-linecap="round"/>
  </g>`,

  palette: (p) => `
  <g>
    <path d="M228 470 L772 470 L772 806 C772 822 758 836 742 836 L258 836 C242 836 228 822 228 806 Z" fill="url(#bg1)"/>
    <path d="M228 470 L772 470 L772 806 C772 822 758 836 742 836 L258 836 C242 836 228 822 228 806 Z" fill="url(#sh1)"/>
    <path d="M228 470 L772 470 L772 500 L228 500 Z" fill="#FFFFFF" opacity="0.16"/>
    <path d="M240 240 C240 224 254 210 270 210 L730 210 C746 210 760 224 760 240 L760 456 L240 456 Z" fill="url(#bg2)"/>
    <rect x="266" y="238" width="468" height="196" rx="6" fill="${shift(p.base, -0.36)}" opacity="0.5"/>
    <g>
      <rect x="286" y="256" width="132" height="52" rx="4" fill="${p.base}"/>
      <rect x="434" y="256" width="132" height="52" rx="4" fill="${p.accent}"/>
      <rect x="582" y="256" width="132" height="52" rx="4" fill="${shift(p.base, 0.42)}"/>
      <rect x="286" y="320" width="132" height="52" rx="4" fill="${shift(p.accent, 0.34)}"/>
      <rect x="434" y="320" width="132" height="52" rx="4" fill="${shift(p.base, -0.18)}"/>
      <rect x="582" y="320" width="132" height="52" rx="4" fill="${shift(p.accent, -0.24)}"/>
      <rect x="286" y="384" width="132" height="34" rx="4" fill="${shift(p.base, 0.6)}"/>
      <rect x="434" y="384" width="132" height="34" rx="4" fill="${shift(p.accent, 0.56)}"/>
      <rect x="582" y="384" width="132" height="34" rx="4" fill="${shift(p.base, 0.2)}"/>
    </g>
    <rect x="266" y="238" width="468" height="196" rx="6" fill="url(#sh1)"/>
    <circle cx="500" cy="530" r="30" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.8"/>
    <path d="M486 530 L500 544 L516 522" fill="none" stroke="${p.accent}" stroke-width="4" opacity="0.8"/>
  </g>`,

  pen: (p) => `
  <g>
    <path d="M470 240 C470 226 482 214 496 214 L504 214 C518 214 530 226 530 240 L530 300 L470 300 Z" fill="${p.accent}"/>
    <rect x="456" y="296" width="88" height="230" rx="12" fill="url(#bg2)"/>
    <rect x="456" y="296" width="44" height="230" rx="12" fill="#FFFFFF" opacity="0.16"/>
    <rect x="446" y="518" width="108" height="26" rx="8" fill="${p.accent}"/>
    <path d="M462 540 L538 540 L520 800 C519 820 510 836 500 836 C490 836 481 820 480 800 Z" fill="url(#bg1)"/>
    <path d="M462 540 L538 540 L520 800 C519 820 510 836 500 836 C490 836 481 820 480 800 Z" fill="url(#sh1)"/>
    <path d="M478 556 L470 790" stroke="#FFFFFF" stroke-width="4" opacity="0.24" fill="none"/>
    <path d="M500 620 L500 836" stroke="${p.edge}" stroke-width="2" opacity="0.25" fill="none"/>
    <path d="M470 336 L470 500 M530 336 L530 500" stroke="#FFFFFF" stroke-width="2" opacity="0.18" fill="none"/>
  </g>`,

  compact: (p) => `
  <g>
    <ellipse cx="500" cy="700" rx="216" ry="60" fill="${shift(p.base, -0.4)}" opacity="0.35"/>
    <path d="M284 640 L716 640 L716 700 C716 748 620 786 500 786 C380 786 284 748 284 700 Z" fill="url(#bg2)"/>
    <ellipse cx="500" cy="640" rx="216" ry="62" fill="url(#bg1)"/>
    <ellipse cx="500" cy="640" rx="216" ry="62" fill="url(#sh1)"/>
    <ellipse cx="500" cy="634" rx="176" ry="48" fill="${shift(p.base, -0.3)}" opacity="0.45"/>
    <ellipse cx="500" cy="630" rx="164" ry="44" fill="${p.base}"/>
    <ellipse cx="500" cy="630" rx="164" ry="44" fill="url(#sh1)"/>
    <ellipse cx="452" cy="620" rx="72" ry="20" fill="#FFFFFF" opacity="0.22"/>
    <path d="M284 300 C284 262 380 232 500 232 C620 232 716 262 716 300 L716 340 C716 378 620 408 500 408 C380 408 284 378 284 340 Z" fill="url(#bg2)"/>
    <ellipse cx="500" cy="300" rx="216" ry="66" fill="${shift(p.accent, 0.1)}"/>
    <ellipse cx="500" cy="300" rx="216" ry="66" fill="url(#sh1)"/>
    <ellipse cx="500" cy="298" rx="150" ry="42" fill="none" stroke="${shift(p.accent, -0.28)}" stroke-width="3" opacity="0.7"/>
    <ellipse cx="446" cy="286" rx="84" ry="22" fill="#FFFFFF" opacity="0.24"/>
  </g>`,

  dropper: (p) => `
  <g>
    <path d="M394 400 L606 400 L606 792 C606 816 586 836 562 836 L438 836 C414 836 394 816 394 792 Z" fill="url(#bg1)"/>
    <path d="M394 400 L606 400 L606 792 C606 816 586 836 562 836 L438 836 C414 836 394 816 394 792 Z" fill="url(#sh1)"/>
    <path d="M422 420 L422 812" stroke="#FFFFFF" stroke-width="8" opacity="0.24" fill="none"/>
    <path d="M580 430 L580 806" stroke="${p.edge}" stroke-width="5" opacity="0.18" fill="none"/>
    <rect x="418" y="520" width="164" height="160" rx="6" fill="#FFFFFF" opacity="0.14"/>
    <rect x="418" y="520" width="164" height="160" rx="6" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.8"/>
    <path d="M456 566 L544 566 M456 604 L520 604" stroke="${p.accent}" stroke-width="4" opacity="0.6" fill="none"/>
    <rect x="424" y="356" width="152" height="52" rx="8" fill="${shift(p.accent, -0.14)}"/>
    <rect x="424" y="356" width="76" height="52" rx="8" fill="#FFFFFF" opacity="0.18"/>
    <rect x="452" y="230" width="96" height="132" rx="10" fill="${p.accent}"/>
    <rect x="452" y="230" width="48" height="132" rx="10" fill="#FFFFFF" opacity="0.2"/>
    <path d="M478 190 L522 190 L522 232 L478 232 Z" fill="${shift(p.accent, -0.24)}"/>
  </g>`,

  tube: (p) => `
  <g>
    <path d="M400 320 L600 320 L620 812 C621 826 610 836 596 836 L404 836 C390 836 379 826 380 812 Z" fill="url(#bg1)"/>
    <path d="M400 320 L600 320 L620 812 C621 826 610 836 596 836 L404 836 C390 836 379 826 380 812 Z" fill="url(#sh1)"/>
    <path d="M424 336 L410 820" stroke="#FFFFFF" stroke-width="9" opacity="0.26" fill="none"/>
    <path d="M578 340 L590 816" stroke="${p.edge}" stroke-width="6" opacity="0.18" fill="none"/>
    <rect x="404" y="480" width="192" height="170" rx="6" fill="#FFFFFF" opacity="0.14"/>
    <rect x="404" y="480" width="192" height="170" rx="6" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.75"/>
    <path d="M440 528 L560 528 M440 566 L528 566 M440 604 L500 604" stroke="${p.accent}" stroke-width="4" opacity="0.55" fill="none"/>
    <rect x="418" y="268" width="164" height="56" rx="8" fill="${shift(p.accent, -0.12)}"/>
    <rect x="418" y="268" width="82" height="56" rx="8" fill="#FFFFFF" opacity="0.18"/>
    <rect x="452" y="212" width="96" height="60" rx="10" fill="${p.accent}"/>
    <rect x="452" y="212" width="48" height="60" rx="10" fill="#FFFFFF" opacity="0.2"/>
  </g>`,

  jar: (p) => `
  <g>
    <path d="M330 520 L670 520 L670 780 C670 812 640 836 604 836 L396 836 C360 836 330 812 330 780 Z" fill="url(#bg1)"/>
    <path d="M330 520 L670 520 L670 780 C670 812 640 836 604 836 L396 836 C360 836 330 812 330 780 Z" fill="url(#sh1)"/>
    <path d="M366 542 L366 800" stroke="#FFFFFF" stroke-width="12" opacity="0.24" fill="none"/>
    <path d="M636 550 L636 792" stroke="${p.edge}" stroke-width="8" opacity="0.18" fill="none"/>
    <rect x="352" y="612" width="296" height="118" rx="6" fill="#FFFFFF" opacity="0.14"/>
    <rect x="352" y="612" width="296" height="118" rx="6" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.75"/>
    <path d="M410 660 L590 660 M436 698 L564 698" stroke="${p.accent}" stroke-width="4" opacity="0.55" fill="none"/>
    <path d="M318 400 C318 380 334 364 354 364 L646 364 C666 364 682 380 682 400 L682 496 C682 512 668 526 652 526 L348 526 C332 526 318 512 318 496 Z" fill="${shift(p.accent, -0.06)}"/>
    <path d="M318 400 C318 380 334 364 354 364 L500 364 L500 526 L348 526 C332 526 318 512 318 496 Z" fill="#FFFFFF" opacity="0.18"/>
    <path d="M318 470 L682 470" stroke="${shift(p.accent, -0.3)}" stroke-width="3" opacity="0.6" fill="none"/>
  </g>`,

  flacon: (p) => `
  <g>
    <path d="M348 420 C348 396 366 378 390 378 L610 378 C634 378 652 396 652 420 L652 786 C652 814 630 836 602 836 L398 836 C370 836 348 814 348 786 Z" fill="url(#bg1)"/>
    <path d="M348 420 C348 396 366 378 390 378 L610 378 C634 378 652 396 652 420 L652 786 C652 814 630 836 602 836 L398 836 C370 836 348 814 348 786 Z" fill="url(#sh1)"/>
    <path d="M382 402 L382 812" stroke="#FFFFFF" stroke-width="10" opacity="0.26" fill="none"/>
    <path d="M622 412 L622 802" stroke="${p.edge}" stroke-width="7" opacity="0.18" fill="none"/>
    <ellipse cx="500" cy="600" rx="118" ry="118" fill="none" stroke="${p.accent}" stroke-width="4" opacity="0.85"/>
    <ellipse cx="500" cy="600" rx="92" ry="92" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.5"/>
    <path d="M500 552 L513 588 L550 600 L513 612 L500 648 L487 612 L450 600 L487 588 Z" fill="${p.accent}" opacity="0.9"/>
    <rect x="452" y="330" width="96" height="52" rx="6" fill="${shift(p.accent, -0.2)}"/>
    <path d="M418 208 C418 194 430 182 444 182 L556 182 C570 182 582 194 582 208 L582 330 L418 330 Z" fill="${p.accent}"/>
    <path d="M418 208 C418 194 430 182 444 182 L500 182 L500 330 L418 330 Z" fill="#FFFFFF" opacity="0.22"/>
    <path d="M418 272 L582 272" stroke="${shift(p.accent, -0.32)}" stroke-width="3" opacity="0.6" fill="none"/>
  </g>`,

  mist: (p) => `
  <g>
    <path d="M406 330 L594 330 L594 786 C594 814 572 836 544 836 L456 836 C428 836 406 814 406 786 Z" fill="url(#bg1)"/>
    <path d="M406 330 L594 330 L594 786 C594 814 572 836 544 836 L456 836 C428 836 406 814 406 786 Z" fill="url(#sh1)"/>
    <path d="M432 350 L432 810" stroke="#FFFFFF" stroke-width="9" opacity="0.26" fill="none"/>
    <path d="M568 358 L568 802" stroke="${p.edge}" stroke-width="6" opacity="0.18" fill="none"/>
    <rect x="418" y="470" width="164" height="176" rx="6" fill="#FFFFFF" opacity="0.14"/>
    <rect x="418" y="470" width="164" height="176" rx="6" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.78"/>
    <path d="M500 512 C516 534 524 552 524 568 C524 588 514 600 500 600 C486 600 476 588 476 568 C476 552 484 534 500 512 Z" fill="${p.accent}" opacity="0.75"/>
    <rect x="440" y="286" width="120" height="48" rx="6" fill="${shift(p.accent, -0.18)}"/>
    <rect x="452" y="200" width="96" height="90" rx="10" fill="${p.accent}"/>
    <rect x="452" y="200" width="48" height="90" rx="10" fill="#FFFFFF" opacity="0.2"/>
    <rect x="478" y="166" width="44" height="38" rx="6" fill="${shift(p.accent, -0.26)}"/>
    <g stroke="${p.accent}" stroke-width="3" opacity="0.4" fill="none" stroke-linecap="round">
      <path d="M560 176 L590 158"/><path d="M576 200 L610 192"/><path d="M566 152 L586 128"/>
    </g>
  </g>`,

  apothecary: (p) => `
  <g>
    <path d="M336 480 C336 458 352 440 374 440 L626 440 C648 440 664 458 664 480 L664 782 C664 812 638 836 606 836 L394 836 C362 836 336 812 336 782 Z" fill="url(#bg1)"/>
    <path d="M336 480 C336 458 352 440 374 440 L626 440 C648 440 664 458 664 480 L664 782 C664 812 638 836 606 836 L394 836 C362 836 336 812 336 782 Z" fill="url(#sh1)"/>
    <path d="M370 462 L370 806" stroke="#FFFFFF" stroke-width="12" opacity="0.24" fill="none"/>
    <path d="M634 474 L634 796" stroke="${p.edge}" stroke-width="8" opacity="0.18" fill="none"/>
    <g fill="${p.accent}" opacity="0.35">
      <circle cx="420" cy="700" r="17"/><circle cx="470" cy="738" r="22"/><circle cx="530" cy="706" r="19"/>
      <circle cx="586" cy="744" r="16"/><circle cx="500" cy="782" r="21"/><circle cx="440" cy="784" r="15"/>
      <circle cx="574" cy="792" r="18"/>
    </g>
    <rect x="352" y="560" width="296" height="94" rx="6" fill="#FFFFFF" opacity="0.16"/>
    <rect x="352" y="560" width="296" height="94" rx="6" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.78"/>
    <path d="M416 600 L584 600 M446 632 L554 632" stroke="${p.accent}" stroke-width="4" opacity="0.55" fill="none"/>
    <path d="M366 340 C366 322 380 308 398 308 L602 308 C620 308 634 322 634 340 L634 424 C634 436 624 446 612 446 L388 446 C376 446 366 436 366 424 Z" fill="${shift(p.accent, -0.04)}"/>
    <path d="M366 340 C366 322 380 308 398 308 L500 308 L500 446 L388 446 C376 446 366 436 366 424 Z" fill="#FFFFFF" opacity="0.2"/>
    <g stroke="${shift(p.accent, -0.34)}" stroke-width="3" opacity="0.5" fill="none">
      <path d="M366 356 L634 356"/><path d="M366 384 L634 384"/><path d="M366 412 L634 412"/>
    </g>
  </g>`,

  brushSet: (p) => {
    const brushes = [
      { x: 288, h: 470, w: 46, tip: 96 },
      { x: 366, h: 520, w: 42, tip: 82 },
      { x: 440, h: 486, w: 38, tip: 70 },
      { x: 508, h: 542, w: 36, tip: 62 },
      { x: 574, h: 500, w: 34, tip: 54 },
      { x: 638, h: 460, w: 32, tip: 46 },
    ];
    return `
  <g>
${brushes
  .map((b) => {
    const top = 836 - b.h;
    const ferruleTop = top + b.tip;
    return `    <rect x="${b.x}" y="${ferruleTop + 34}" width="${b.w}" height="${
      836 - ferruleTop - 34
    }" rx="${b.w / 2}" fill="url(#bg1)"/>
    <rect x="${b.x}" y="${ferruleTop + 34}" width="${b.w / 2}" height="${
      836 - ferruleTop - 34
    }" rx="${b.w / 4}" fill="#FFFFFF" opacity="0.2"/>
    <rect x="${b.x - 2}" y="${ferruleTop}" width="${b.w + 4}" height="46" rx="6" fill="${shift(
      p.accent,
      -0.02
    )}"/>
    <rect x="${b.x - 2}" y="${ferruleTop}" width="${(b.w + 4) / 2}" height="46" rx="6" fill="#FFFFFF" opacity="0.22"/>
    <path d="M${b.x + b.w / 2 - b.w * 0.62} ${ferruleTop + 4} C${b.x + b.w / 2 - b.w * 0.5} ${
      top - 6
    } ${b.x + b.w / 2 + b.w * 0.5} ${top - 6} ${b.x + b.w / 2 + b.w * 0.62} ${
      ferruleTop + 4
    } Z" fill="${shift(p.base, -0.24)}"/>
    <path d="M${b.x + b.w / 2 - b.w * 0.62} ${ferruleTop + 4} C${b.x + b.w / 2 - b.w * 0.5} ${
      top - 6
    } ${b.x + b.w / 2} ${top - 4} ${b.x + b.w / 2} ${ferruleTop + 4} Z" fill="#FFFFFF" opacity="0.14"/>`;
  })
  .join('\n')}
  </g>`;
  },
};

/** Map a cosmetic product to its silhouette. */
function cosmeticShape(product) {
  const t = (product.productType || '').toLowerCase();
  if (t.includes('lipstick')) return 'lipstick';
  if (t.includes('foundation')) return 'bottlePump';
  if (t.includes('palette')) return 'palette';
  if (t.includes('eyeliner')) return 'pen';
  if (t.includes('blush')) return 'compact';
  if (t.includes('serum')) return 'dropper';
  if (t.includes('cleanser')) return 'tube';
  if (t.includes('cream') || t.includes('moisturizer')) return 'jar';
  if (t.includes('parfum')) return 'flacon';
  if (t.includes('mist')) return 'mist';
  if (t.includes('butter') || t.includes('scrub')) return 'jar';
  if (t.includes('salt')) return 'apothecary';
  if (t.includes('brush')) return 'brushSet';
  return 'jar';
}

/* ================================================================== *
 * The three fixed compositions
 * ================================================================== */

/** Fabric texture motif for view 3, keyed off the garment's material. */
function fabricMotif(product, p) {
  const m = (product.material || '').toLowerCase();

  if (m.includes('satin') || m.includes('polyester')) {
    // Satin: broad diagonal sheen bands
    return `
    <g opacity="0.5">
      ${[0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            `<path d="M${-200 + i * 260} 1250 L${200 + i * 260} 250" stroke="#FFFFFF" stroke-width="46" opacity="${
              0.1 + (i % 2) * 0.1
            }" fill="none"/>`
        )
        .join('\n      ')}
    </g>`;
  }
  if (m.includes('linen') || m.includes('cotton') || m.includes('poplin')) {
    // Woven: fine cross-hatch
    return `
    <g stroke="${p.edge}" stroke-width="2" opacity="0.2" fill="none">
      ${Array.from({ length: 26 }, (_, i) => `<path d="M0 ${250 + i * 40} L1000 ${250 + i * 40}"/>`).join('\n      ')}
      ${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 40} 250 L${i * 40} 1250"/>`).join('\n      ')}
    </g>
    <g stroke="#FFFFFF" stroke-width="2" opacity="0.18" fill="none">
      ${Array.from({ length: 26 }, (_, i) => `<path d="M0 ${270 + i * 40} L1000 ${270 + i * 40}"/>`).join('\n      ')}
    </g>`;
  }
  if (m.includes('chiffon') || m.includes('nida')) {
    // Sheer / flat drape: soft vertical fall lines
    return `
    <g fill="none" opacity="0.28">
      ${Array.from(
        { length: 12 },
        (_, i) =>
          `<path d="M${40 + i * 84} 250 C${20 + i * 84} 560 ${60 + i * 84} 900 ${
            30 + i * 84
          } 1250" stroke="${i % 2 ? '#FFFFFF' : p.edge}" stroke-width="14"/>`
      ).join('\n      ')}
    </g>`;
  }
  // Viscose / rayon / crepe: soft undulating drape
  return `
    <g fill="none" opacity="0.3">
      ${Array.from(
        { length: 9 },
        (_, i) =>
          `<path d="M${-40 + i * 130} 250 C${40 + i * 130} 520 ${-40 + i * 130} 800 ${
            50 + i * 130
          } 1250" stroke="${i % 2 ? '#FFFFFF' : p.edge}" stroke-width="26"/>`
      ).join('\n      ')}
    </g>`;
}

/** Product texture motif for cosmetics view 3. */
function cosmeticMotif(product, p) {
  const t = (product.productType || '').toLowerCase();

  if (t.includes('palette') || t.includes('brush')) {
    // Pressed-powder swatch strip
    const shades = [p.base, p.accent, shift(p.base, 0.4), shift(p.accent, -0.22), shift(p.base, -0.2)];
    return shades
      .map(
        (c, i) =>
          `<rect x="${140 + i * 148}" y="380" width="120" height="240" rx="10" fill="${c}" opacity="0.92"/>
      <rect x="${140 + i * 148}" y="380" width="120" height="240" rx="10" fill="url(#sh1)"/>`
      )
      .join('\n      ');
  }
  if (t.includes('parfum') || t.includes('mist')) {
    // Concentric fragrance rings
    return `
      <g fill="none" stroke="${p.base}" opacity="0.5">
        ${[80, 150, 220, 290].map((r) => `<circle cx="500" cy="500" r="${r}" stroke-width="10"/>`).join('\n        ')}
      </g>
      <g fill="none" stroke="${p.accent}" opacity="0.7">
        ${[115, 185, 255].map((r) => `<circle cx="500" cy="500" r="${r}" stroke-width="4"/>`).join('\n        ')}
      </g>
      <path d="M500 420 L522 480 L582 500 L522 520 L500 580 L478 520 L418 500 L478 480 Z" fill="${p.accent}" opacity="0.9"/>`;
  }
  if (t.includes('salt')) {
    // Granular crystals
    return Array.from({ length: 46 }, (_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const r = 40 + Math.sqrt(i) * 46;
      const x = 500 + Math.cos(a) * r;
      const y = 500 + Math.sin(a) * r * 0.86;
      const s = 12 + ((i * 7) % 18);
      return `<rect x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2).toFixed(1)}" width="${s}" height="${s}" rx="3" fill="${
        i % 3 === 0 ? p.accent : p.base
      }" opacity="${(0.35 + (i % 4) * 0.14).toFixed(2)}" transform="rotate(${(i * 23) % 90} ${x.toFixed(
        1
      )} ${y.toFixed(1)})"/>`;
    }).join('\n      ');
  }
  // Creams, serums, lipstick, cleanser: a single generous swatch stroke
  return `
      <path d="M180 620 C240 420 380 330 500 340 C640 352 760 440 800 560 C830 650 760 720 640 706 C520 692 470 610 380 620 C300 630 260 690 208 682 C172 676 164 656 180 620 Z" fill="${p.base}"/>
      <path d="M180 620 C240 420 380 330 500 340 C640 352 760 440 800 560 C830 650 760 720 640 706 C520 692 470 610 380 620 C300 630 260 690 208 682 C172 676 164 656 180 620 Z" fill="url(#sh1)"/>
      <path d="M280 520 C340 430 430 392 520 396" fill="none" stroke="#FFFFFF" stroke-width="22" opacity="0.32" stroke-linecap="round"/>
      <path d="M560 640 C640 656 700 646 740 606" fill="none" stroke="${p.edge}" stroke-width="16" opacity="0.24" stroke-linecap="round"/>
      <circle cx="700" cy="420" r="52" fill="${p.accent}" opacity="0.9"/>
      <circle cx="700" cy="420" r="52" fill="url(#sh1)"/>`;
}

/**
 * Build one image.
 * @param {object} product
 * @param {1|2|3} view  1 = front, 2 = styled, 3 = detail
 */
function productImage(product, view) {
  const p = palette(product);
  const isGarment = product.category === 'Fashion';
  const dims = isGarment ? G : C;
  const defs =
    bodyGradient('bg1', p) +
    '\n' +
    bodyGradient('bg2', p, { x1: 0.2, y1: 0, x2: 0.85, y2: 0.9 }) +
    '\n' +
    sheenGradient('sh1', isGarment ? 0.26 : 0.4);

  const label = `${product.name} — studio visual ${view} of 3`;

  /* ---- View 3: macro detail (same recipe for both categories) ---- */
  if (view === 3) {
    const motif = isGarment ? fabricMotif(product, p) : cosmeticMotif(product, p);
    const swatchY = isGarment ? 1120 : 878;
    const label3 = isGarment
      ? (product.colour || '').toUpperCase()
      : (product.shade || product.productType || '').toUpperCase();

    const content = `  <!-- macro detail: material / texture study -->
  <g>
    ${
      isGarment
        ? `<rect x="0" y="250" width="1000" height="1000" fill="url(#bg1)"/>
    ${motif}
    <rect x="0" y="250" width="1000" height="1000" fill="url(#sh1)"/>
    <path d="M0 250 L1000 250" stroke="${p.edge}" stroke-width="4" opacity="0.3"/>
    <path d="M0 268 C160 296 340 240 520 272 C700 304 860 256 1000 284 L1000 250 L0 250 Z" fill="${BACKDROP_BOTTOM}" opacity="0.9"/>`
        : `<circle cx="500" cy="500" r="330" fill="${shift(p.base, 0.72)}" opacity="0.5"/>
    ${motif}`
    }
  </g>
  <g>
    <circle cx="${isGarment ? 148 : 148}" cy="${swatchY}" r="46" fill="${p.base}" stroke="#FFFFFF" stroke-width="4"/>
    <circle cx="${isGarment ? 232 : 232}" cy="${swatchY}" r="46" fill="${p.accent}" stroke="#FFFFFF" stroke-width="4"/>
    ${
      label3
        ? `<text x="${isGarment ? 300 : 300}" y="${
            swatchY + 8
          }" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="3" fill="#6B6B6B">${label3.replace(
            /[<>&]/g,
            ''
          )}</text>`
        : ''
    }
  </g>`;

    return studio({
      w: dims.W,
      h: dims.H,
      floorY: isGarment ? 1064 : 826,
      shadow: { cx: 500, cy: isGarment ? 1070 : 832, rx: 300, ry: 26 },
      haloR: 300,
      haloCy: isGarment ? 640 : 500,
      defs,
      content,
      label,
    });
  }

  /* ---- Views 1 & 2 ---- */
  let inner;
  if (isGarment) {
    const shape = GARMENTS[garmentShape(product)];
    const silhouette = `    <path d="${shape.body}" fill="url(#bg1)"/>
    <path d="${shape.body}" fill="url(#sh1)"/>
    <path d="${shape.body}" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.55"/>
${shape.detail(p)}`;

    if (view === 1) {
      inner = `  <!-- front-facing flat lay -->
  <g>
${silhouette}
  </g>`;
    } else {
      // View 2 — styled: garment presented at a slight angle beside a folded companion piece
      inner = `  <!-- styled presentation: angled hang + folded companion piece -->
  <g transform="translate(52 -18) rotate(-4 500 640) scale(0.9) translate(56 72)">
${silhouette}
  </g>
  <g transform="translate(88 720)">
    <rect x="0" y="0" width="330" height="216" rx="10" fill="url(#bg1)"/>
    <rect x="0" y="0" width="330" height="216" rx="10" fill="url(#sh1)"/>
    <rect x="0" y="0" width="330" height="216" rx="10" fill="none" stroke="${p.edge}" stroke-width="3" opacity="0.5"/>
    <path d="M0 72 L330 72 M0 148 L330 148" stroke="${p.edge}" stroke-width="2.5" opacity="0.35" fill="none"/>
    <path d="M28 0 L28 216 M302 0 L302 216" stroke="#FFFFFF" stroke-width="3" opacity="0.22" fill="none"/>
    <rect x="112" y="88" width="106" height="40" rx="20" fill="${p.accent}" opacity="0.9"/>
  </g>`;
    }
  } else {
    const shape = COSMETICS[cosmeticShape(product)];
    if (view === 1) {
      inner = `  <!-- centred product shot -->
${shape(p)}`;
    } else {
      // View 2 — styled: product offset with an open/second element and a swatch
      inner = `  <!-- styled presentation: offset product with shade swatch -->
  <g transform="translate(-72 -8) scale(0.9) translate(56 44)">
${shape(p)}
  </g>
  <g transform="translate(628 566)">
    <ellipse cx="118" cy="152" rx="132" ry="34" fill="#0B4F3C" opacity="0.08"/>
    <path d="M18 96 C34 34 82 4 130 8 C186 12 232 48 244 96 C252 132 226 158 178 152 C130 146 110 116 74 120 C42 124 26 148 12 136 C0 126 6 118 18 96 Z" fill="${p.base}"/>
    <path d="M18 96 C34 34 82 4 130 8 C186 12 232 48 244 96 C252 132 226 158 178 152 C130 146 110 116 74 120 C42 124 26 148 12 136 C0 126 6 118 18 96 Z" fill="url(#sh1)"/>
    <path d="M56 62 C78 32 112 18 146 22" fill="none" stroke="#FFFFFF" stroke-width="12" opacity="0.36" stroke-linecap="round"/>
    <circle cx="212" cy="46" r="26" fill="${p.accent}"/>
  </g>`;
    }
  }

  return studio({
    w: dims.W,
    h: dims.H,
    floorY: dims.FLOOR,
    shadow: {
      cx: view === 2 ? (isGarment ? 528 : 462) : 500,
      cy: dims.SHADOW_CY,
      rx: isGarment ? 236 : 214,
      ry: isGarment ? 26 : 24,
    },
    haloR: isGarment ? 300 : 268,
    haloCy: isGarment ? 620 : 500,
    defs,
    content: inner,
    label,
  });
}

module.exports = { productImage, palette, shift, lum };

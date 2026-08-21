'use strict';

/**
 * Brand banner visuals — Specification Section 3.5 (final paragraph).
 * Homepage hero, the two category hero tiles, the eight "Shop by Category"
 * tiles, the About banner and the social share card. All in the Emerald &
 * Champagne palette, all sharing the same geometric arc language so they read
 * as one commissioned set rather than clipart.
 */

const EMERALD = '#0B4F3C';
const EMERALD_DARK = '#083B2C';
const CHAMPAGNE = '#C9A24B';
const IVORY = '#FAF7F0';

/** Shared gradient + arc defs used by every banner. */
function bannerDefs(w, h) {
  return `    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${EMERALD}"/>
      <stop offset="0.55" stop-color="${EMERALD}"/>
      <stop offset="1" stop-color="${EMERALD_DARK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.22" r="0.8">
      <stop offset="0" stop-color="${CHAMPAGNE}" stop-opacity="0.30"/>
      <stop offset="0.5" stop-color="${CHAMPAGNE}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${CHAMPAGNE}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="frame"><rect width="${w}" height="${h}"/></clipPath>`;
}

/** Concentric champagne arcs — the recurring brand motif. */
function arcs(cx, cy, radii, opts) {
  const o = opts || {};
  return radii
    .map(
      (r, i) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${CHAMPAGNE}" stroke-width="${
          i % 2 ? 1.5 : 3
        }" opacity="${(o.base || 0.22) - i * (o.step || 0.02)}"/>`
    )
    .join('\n      ');
}

/** Fine vertical rule field — reads as fabric warp, adds texture without noise. */
function rules(w, h, count, opacity) {
  const gap = w / count;
  return Array.from(
    { length: count },
    (_, i) =>
      `<path d="M${(i * gap).toFixed(1)} 0 L${(i * gap - h * 0.18).toFixed(
        1
      )} ${h}" stroke="${IVORY}" stroke-width="1" opacity="${opacity}"/>`
  ).join('\n      ');
}

/* ------------------------------------------------------------------ *
 * Homepage hero — 1920 x 900
 * ------------------------------------------------------------------ */
function heroBanner() {
  const w = 1920;
  const h = 900;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Hadaf Venture — Emerald and Champagne brand visual">
  <defs>
${bannerDefs(w, h)}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${w}" height="${h}" fill="url(#ground)"/>
    <g opacity="0.5">
      ${rules(w, h, 46, 0.05)}
    </g>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>

    <!-- brand arcs -->
    <g>
      ${arcs(1430, 400, [150, 210, 275, 345, 420, 500, 590, 690], { base: 0.3, step: 0.028 })}
    </g>

    <!-- draped fabric forms -->
    <path d="M1180 900 C1210 640 1330 470 1520 380 C1700 296 1860 300 1920 340 L1920 900 Z" fill="${CHAMPAGNE}" opacity="0.09"/>
    <path d="M1320 900 C1350 700 1460 560 1620 486 C1760 422 1880 428 1920 450 L1920 900 Z" fill="${CHAMPAGNE}" opacity="0.1"/>
    <path d="M1470 900 C1494 754 1580 648 1706 596 C1810 554 1890 560 1920 576 L1920 900 Z" fill="${IVORY}" opacity="0.06"/>

    <!-- monogram mark -->
    <g transform="translate(1408 378)" opacity="0.9">
      <circle cx="0" cy="0" r="96" fill="none" stroke="${CHAMPAGNE}" stroke-width="3" opacity="0.75"/>
      <circle cx="0" cy="0" r="80" fill="${EMERALD_DARK}" opacity="0.55"/>
      <path d="M-34 -44 L-34 44 M34 -44 L34 44 M-34 0 L34 0" stroke="${IVORY}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.9"/>
    </g>

    <!-- Copy-side contrast scrim now lives in CSS (.hero::before in
         main.css), applied uniformly whether this generated artwork or real
         photography fills .hero__bg — see the comment there for why. -->
    <path d="M0 872 L${w} 872" stroke="${CHAMPAGNE}" stroke-width="2" opacity="0.35"/>
  </g>
</svg>
`;
}

/* ------------------------------------------------------------------ *
 * Category hero tiles — 1000 x 800
 * ------------------------------------------------------------------ */
function splitTile() {
  const w = 1000;
  const h = 800;

  // Hanging garment forms — the site is garments-only.
  const motif = `<g opacity="0.85">
      <path d="M300 150 C258 150 232 168 232 168 L180 200 C168 208 166 222 174 234 L214 300 L200 700 C199 716 212 730 228 730 L372 730 C388 730 401 716 400 700 L386 300 L426 234 C434 222 432 208 420 200 L368 168 C368 168 342 150 300 150 Z" fill="${IVORY}" opacity="0.14"/>
      <path d="M300 150 C258 150 232 168 232 168 L180 200 C168 208 166 222 174 234 L214 300 L200 700 C199 716 212 730 228 730 L372 730 C388 730 401 716 400 700 L386 300 L426 234 C434 222 432 208 420 200 L368 168 C368 168 342 150 300 150 Z" fill="none" stroke="${CHAMPAGNE}" stroke-width="2.5" opacity="0.6"/>
      <path d="M640 190 C606 190 584 204 584 204 L540 232 C530 239 528 250 535 260 L568 316 L552 700 C551 716 564 730 580 730 L700 730 C716 730 729 716 728 700 L712 316 L745 260 C752 250 750 239 740 232 L696 204 C696 204 674 190 640 190 Z" fill="${CHAMPAGNE}" opacity="0.12"/>
      <path d="M640 190 C606 190 584 204 584 204 L540 232 C530 239 528 250 535 260 L568 316 L552 700 C551 716 564 730 580 730 L700 730 C716 730 729 716 728 700 L712 316 L745 260 C752 250 750 239 740 232 L696 204 C696 204 674 190 640 190 Z" fill="none" stroke="${CHAMPAGNE}" stroke-width="2" opacity="0.45"/>
      <path d="M232 168 C258 194 276 204 300 204 C324 204 342 194 368 168" fill="none" stroke="${CHAMPAGNE}" stroke-width="2" opacity="0.5"/>
      <path d="M584 204 C606 226 622 234 640 234 C658 234 674 226 696 204" fill="none" stroke="${CHAMPAGNE}" stroke-width="2" opacity="0.4"/>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Wholesale garment collection visual">
  <defs>
${bannerDefs(w, h)}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${w}" height="${h}" fill="url(#ground)"/>
    <g opacity="0.5">${rules(w, h, 26, 0.05)}</g>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>
    <g>${arcs(820, 160, [110, 170, 240, 320, 410], { base: 0.24, step: 0.03 })}</g>
    ${motif}
    <path d="M0 ${h} L${w} ${h} L${w} ${h - 300} C${w * 0.7} ${h - 190} ${w * 0.3} ${
    h - 150
  } 0 ${h - 240} Z" fill="${EMERALD_DARK}" opacity="0.55"/>
  </g>
</svg>
`;
}

/* ------------------------------------------------------------------ *
 * Subcategory tiles — 600 x 800 (3:4)
 * ------------------------------------------------------------------ */

/** Line motif per subcategory tile, drawn on a 600x800 canvas. */
const TILE_MOTIFS = {
  dresses: `<path d="M300 190 C266 190 244 200 232 208 L184 236 C174 242 171 254 177 264 L203 320 C207 329 202 339 193 342 L204 420 L188 640 C187 654 198 666 212 666 L388 666 C402 666 413 654 412 640 L396 420 L407 342 C398 339 393 329 397 320 L423 264 C429 254 426 242 416 236 L368 208 C356 200 334 190 300 190 Z"/>
    <path d="M232 208 C254 232 274 242 300 242 C326 242 346 232 368 208" class="thin"/>
    <path d="M206 430 L300 470 L394 430" class="thin"/>`,
  coords: `<path d="M300 180 C274 180 256 188 246 194 L206 216 C198 221 195 231 200 240 L220 290 L228 350 C229 362 238 370 250 370 L350 370 C362 370 371 362 372 350 L380 290 L400 240 C405 231 402 221 394 216 L354 194 C344 188 326 180 300 180 Z"/>
    <path d="M222 420 L378 420 L372 470 L340 660 L316 660 L304 500 L296 500 L284 660 L260 660 L228 470 Z"/>
    <path d="M246 194 C264 214 282 222 300 222 C318 222 336 214 354 194" class="thin"/>`,
  abayas: `<path d="M300 160 C272 160 250 168 238 178 L182 202 C172 207 167 218 170 228 L204 358 C208 372 199 385 185 385 L172 654 C171 668 182 680 196 680 L404 680 C418 680 429 668 428 654 L415 385 C401 385 392 372 396 358 L430 228 C433 218 428 207 418 202 L362 178 C350 168 328 160 300 160 Z"/>
    <path d="M238 178 C258 200 278 210 300 210 C322 210 342 200 362 178" class="thin"/>
    <path d="M300 214 L300 676" class="thin"/>`,
  tops: `<path d="M300 210 C274 210 254 217 244 224 L192 250 C182 255 179 267 184 277 L208 337 C212 347 207 357 198 359 L208 420 L200 600 C199 613 210 624 223 624 L377 624 C390 624 401 613 400 600 L392 420 L402 359 C393 357 388 347 392 337 L416 277 C421 267 418 255 408 250 L356 224 C346 217 326 210 300 210 Z"/>
    <path d="M244 224 C264 246 282 255 300 255 C318 255 336 246 356 224" class="thin"/>`,
};

function tile(key) {
  const w = 600;
  const h = 800;
  const motif = TILE_MOTIFS[key];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
  <defs>
${bannerDefs(w, h)}
    <style>
      .motif path, .motif rect, .motif circle { fill: none; stroke: ${CHAMPAGNE}; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
      .motif .thin { stroke-width: 2; opacity: 0.65; }
    </style>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${w}" height="${h}" fill="url(#ground)"/>
    <g opacity="0.5">${rules(w, h, 16, 0.05)}</g>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>
    <g>${arcs(300, 400, [190, 250, 316], { base: 0.16, step: 0.03 })}</g>
    <g class="motif" opacity="0.92">
      ${motif}
    </g>
    <path d="M0 ${h} L${w} ${h} L${w} ${h - 210} C${w * 0.62} ${h - 130} ${w * 0.34} ${
    h - 108
  } 0 ${h - 170} Z" fill="${EMERALD_DARK}" opacity="0.6"/>
  </g>
</svg>
`;
}

/* ------------------------------------------------------------------ *
 * About banner — 1920 x 620  &  share card — 1200 x 630
 * ------------------------------------------------------------------ */
function wideBanner(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
  <defs>
${bannerDefs(w, h)}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${w}" height="${h}" fill="url(#ground)"/>
    <g opacity="0.5">${rules(w, h, 34, 0.05)}</g>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>
    <g>${arcs(w * 0.16, h * 0.2, [120, 180, 250, 330, 420], { base: 0.2, step: 0.028 })}</g>
    <g>${arcs(w * 0.86, h * 0.86, [100, 156, 220, 296], { base: 0.18, step: 0.03 })}</g>
    <path d="M0 ${h} C${w * 0.22} ${h * 0.62} ${w * 0.5} ${h * 0.9} ${w} ${h * 0.5} L${w} ${h} Z" fill="${CHAMPAGNE}" opacity="0.07"/>
    <path d="M0 ${h * 0.94} L${w} ${h * 0.94}" stroke="${CHAMPAGNE}" stroke-width="2" opacity="0.3"/>
  </g>
</svg>
`;
}

function shareCard() {
  const w = 1200;
  const h = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Hadaf Venture — Everyday Style, Effortless Beauty.">
  <defs>
${bannerDefs(w, h)}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${w}" height="${h}" fill="url(#ground)"/>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>
    <g>${arcs(1010, 130, [110, 168, 236, 316, 406], { base: 0.24, step: 0.03 })}</g>
    <g transform="translate(96 168)">
      <circle cx="60" cy="60" r="58" fill="none" stroke="${CHAMPAGNE}" stroke-width="3"/>
      <circle cx="60" cy="60" r="48" fill="${EMERALD_DARK}"/>
      <path d="M40 34 L40 86 M80 34 L80 86 M40 60 L80 60" stroke="${IVORY}" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>
    <text x="96" y="376" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="${IVORY}">Hadaf Venture</text>
    <text x="96" y="442" font-family="Arial, Helvetica, sans-serif" font-size="30" letter-spacing="2" fill="${CHAMPAGNE}">Everyday Style, Effortless Beauty.</text>
    <path d="M96 480 L360 480" stroke="${CHAMPAGNE}" stroke-width="3"/>
    <text x="96" y="536" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="${IVORY}" opacity="0.8">Fashion &amp; Beauty &#183; Delivered across the UAE</text>
  </g>
</svg>
`;
}

// Keys are logical names, no extension — src/lib/real-banners.js matches
// these against src/data/brand-photos/{key}.{jpg,png,webp} and build.js falls
// back to generating the SVG below only when no real photo exists for a key.
module.exports = {
  banners: {
    'hero-home': heroBanner(),
    'tile-fashion': splitTile(),
    'banner-about': wideBanner(1920, 620),
    'banner-catalogue': wideBanner(1920, 480),
    'banner-wholesale-process': wideBanner(1920, 480),
    'banner-partner': wideBanner(1920, 480),
    'og-image': shareCard(),
    'cat-dresses': tile('dresses'),
    'cat-coords': tile('coords'),
    'cat-abayas': tile('abayas'),
    'cat-tops': tile('tops'),
  },
};

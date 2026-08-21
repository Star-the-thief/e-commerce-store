'use strict';

const site = require('../data/site.json');
const { icon } = require('./icons');
const { brandImage } = require('./real-banners');

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

/** Escape for HTML text/attribute context. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** AED, always 2 decimals (Spec 1). Single source of price formatting. */
function money(value) {
  return `${Number(value).toFixed(2)} AED`;
}

/**
 * Render a Section 11 placeholder value. Values in site.json wrapped in
 * [square brackets] are intentionally visible on the live site (Spec 1) and get
 * styled so they read as deliberate, not broken.
 */
function ph(value, variant) {
  const v = String(value);
  if (/^\[.*\]$/.test(v)) {
    const cls = variant === 'light' ? 'placeholder placeholder--light' : 'placeholder';
    return `<span class="${cls}">${esc(v)}</span>`;
  }
  return esc(v);
}

/**
 * Phone/WhatsApp display. Once a real number exists (site.phoneIntl is set),
 * every mention of it becomes a tap-to-chat WhatsApp link — the spec routes
 * order confirmation and support entirely through WhatsApp/email, so that is
 * the more useful destination than a bare tel: link. Falls back to the
 * bracketed placeholder styling via ph() until a number is provided.
 */
function phoneLink(variant) {
  const v = String(site.phone);
  if (/^\[.*\]$/.test(v) || !site.phoneIntl) return ph(v, variant);
  return `<a href="https://wa.me/${site.phoneIntl}">${esc(v)}</a>`;
}

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/catalogue/' },
  { label: 'Wholesale Process', href: '/wholesale-process/' },
  { label: 'Partner With Us', href: '/partner/' },
  { label: 'About Us', href: '/about/' },
  { label: 'Contact Us', href: '/contact/' },
];

const SOCIAL_ICON = {
  Instagram: 'instagram',
  Facebook: 'facebook',
  TikTok: 'tiktok',
  WhatsApp: 'whatsapp',
};

/* ------------------------------------------------------------------ *
 * Chrome
 * ------------------------------------------------------------------ */

function header(active) {
  const links = NAV.map((item) => {
    const current = item.href === active ? ' aria-current="page"' : '';
    return `<li><a class="nav__link" href="${item.href}"${current}>${esc(item.label)}</a></li>`;
  }).join('\n            ');

  return `<div class="announce">${esc(site.announcement)}</div>

    <header class="header" id="site-header" data-header>
      <div class="container header__inner">
        <a class="header__logo" href="/" aria-label="${esc(site.name)} — home">
          <img src="/assets/img/brand/logo-horizontal.svg" alt="${esc(site.name)}" width="460" height="110">
        </a>

        <nav class="nav" aria-label="Primary">
          <ul class="nav__list">
            ${links}
          </ul>
        </nav>

        <div class="header__actions">
          <button class="icon-btn" type="button" data-search-toggle aria-expanded="false" aria-controls="site-search" aria-label="Search catalogue">
            ${icon('search')}
          </button>
          <a class="btn btn--primary btn--sm header__quote-cta" href="/enquiry/">Request a Quote</a>
          <button class="icon-btn nav-toggle" type="button" data-drawer-open aria-expanded="false" aria-controls="mobile-drawer" aria-label="Open menu">
            ${icon('menu')}
          </button>
        </div>
      </div>

      <div class="search-panel" id="site-search">
        <div class="container">
          <form class="searchbar" action="/catalogue/" method="get" role="search">
            <label class="visually-hidden" for="header-search-input">Search catalogue</label>
            <input class="input" id="header-search-input" type="search" name="q" placeholder="Search dresses, abayas, co-ords…" autocomplete="off">
            <button class="btn btn--primary" type="submit">Search</button>
          </form>
        </div>
      </div>
    </header>

    <div class="scrim" data-scrim hidden></div>

    <aside class="drawer" id="mobile-drawer" data-drawer aria-label="Menu" aria-hidden="true">
      <div class="drawer__head">
        <a href="/" aria-label="${esc(site.name)} — home">
          <img src="/assets/img/brand/logo-horizontal.svg" alt="${esc(site.name)}" width="460" height="110">
        </a>
        <button class="icon-btn" type="button" data-drawer-close aria-label="Close menu">${icon('close')}</button>
      </div>
      <div class="drawer__body">
        <form class="searchbar" action="/catalogue/" method="get" role="search">
          <label class="visually-hidden" for="drawer-search-input">Search catalogue</label>
          <input class="input" id="drawer-search-input" type="search" name="q" placeholder="Search catalogue…" autocomplete="off">
          <button class="icon-btn" type="submit" aria-label="Search">${icon('search')}</button>
        </form>
        <ul class="drawer__list">
          ${NAV.map((i) => `<li><a href="${i.href}">${esc(i.label)}</a></li>`).join('\n          ')}
          <li><a href="/faq/">FAQ</a></li>
        </ul>
        <a class="btn btn--primary btn--block" href="/enquiry/">Request a Quote</a>
      </div>
      <div class="drawer__foot">
        <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
        <p class="mt-3">Phone/WhatsApp: ${phoneLink('light')}</p>
      </div>
    </aside>`;
}

function footerCol(id, title, inner) {
  return `<div class="footer__col" data-acc-col>
          <button class="footer__heading" type="button" data-acc-toggle aria-expanded="false" aria-controls="${id}">
            ${esc(title)} ${icon('chevronDown', 'icon icon--sm')}
          </button>
          <div class="footer__panel" id="${id}">${inner}</div>
        </div>`;
}

function footer() {
  const wholesale = footerCol(
    'f-wholesale',
    'Wholesale',
    `<ul class="footer__links">
              <li><a href="/wholesale-process/">Wholesale Process</a></li>
              <li><a href="/enquiry/">Request a Quote</a></li>
              <li><a href="/delivery-payment-terms/">Delivery &amp; Payment Terms</a></li>
              <li><a href="/faq/">FAQ</a></li>
            </ul>`
  );

  const legal = footerCol(
    'f-legal',
    'Legal',
    `<ul class="footer__links">
              <li><a href="/privacy-policy/">Privacy Policy</a></li>
              <li><a href="/trade-terms/">Trade Terms &amp; Conditions</a></li>
            </ul>`
  );

  const company = footerCol(
    'f-company',
    'Company',
    `<ul class="footer__links">
              <li><a href="/about/">About Us</a></li>
              <li><a href="/catalogue/">Catalogue</a></li>
              <li><a href="/partner/">Partner With Us</a></li>
              <li><a href="/contact/">Contact Us</a></li>
            </ul>`
  );

  const socials = site.social
    .map(
      (s) =>
        `<a href="${esc(s.href)}" aria-label="${esc(s.name || s.label)}">${icon(
          SOCIAL_ICON[s.label] || 'arrowRight'
        )}</a>`
    )
    .join('\n              ');

  const touch = footerCol(
    'f-touch',
    'Get in Touch',
    `<ul class="footer__contact">
              <li>${icon('mail', 'icon icon--sm')}<a href="mailto:${esc(site.email)}">${esc(
      site.email
    )}</a></li>
              <li>${icon(
                'whatsapp',
                'icon icon--sm'
              )}<span>Phone/WhatsApp: ${phoneLink()}</span></li>
              <li>${icon('pin', 'icon icon--sm')}<span>Address: ${ph(site.address)}, ${esc(
      site.addressCity
    )}</span></li>
            </ul>
            <div class="socials">
              ${socials}
            </div>
            <form class="newsletter" data-newsletter novalidate>
              <p>Subscribe for new wholesale collections and catalogue updates.</p>
              <div class="newsletter__row">
                <label class="visually-hidden" for="footer-newsletter">Email address</label>
                <input class="input" id="footer-newsletter" type="email" name="email" placeholder="Your email address" required>
                <button class="btn btn--ivory" type="submit">Subscribe</button>
              </div>
              <p class="meta" data-newsletter-msg style="min-height:20px;color:var(--color-champagne)" role="status"></p>
            </form>`
  );

  return `<footer class="footer">
      <div class="container">
        <div class="footer__top">
          <div class="footer__brand">
            <img src="/assets/img/brand/logo-white.svg" alt="${esc(site.name)}" width="460" height="110">
            <p>${esc(site.description)}</p>
          </div>
          ${wholesale}
          ${legal}
          ${company}
          ${touch}
        </div>

        <div class="footer__bottom">
          <a class="pay-badge pay-badge--whatsapp" href="https://wa.me/${esc(site.phoneIntl || '')}?text=${encodeURIComponent(
    site.whatsappTemplates.general
  )}">${icon('whatsapp', 'icon icon--sm')} Enquire on WhatsApp</a>
          <div class="footer__legal">
            <span>&copy; ${esc(site.copyrightYear)} ${esc(site.legalName)}. All rights reserved.</span>
            <span>${ph(site.address)}, ${esc(site.addressCity)}</span>
            <span>Trade License No. ${ph(site.tradeLicense)}</span>
          </div>
        </div>
      </div>
    </footer>`;
}

/** Reusable size guide modal (Spec 7.6). Injected on garment PDPs + FAQ. */
function sizeGuideModal() {
  const rows = [
    ['S', '84 – 88', '66 – 70', '90 – 94'],
    ['M', '89 – 93', '71 – 75', '95 – 99'],
    ['L', '94 – 99', '76 – 81', '100 – 105'],
    ['XL', '100 – 106', '82 – 88', '106 – 112'],
  ]
    .map(
      (r) =>
        `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`
    )
    .join('\n              ');

  return `<div class="modal" id="size-guide" data-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
      <div class="modal__scrim" data-modal-close></div>
      <div class="modal__box">
        <div class="modal__head">
          <div>
            <span class="eyebrow">Fit &amp; Measurements</span>
            <h2 id="size-guide-title">Size Guide</h2>
          </div>
          <button class="icon-btn" type="button" data-modal-close aria-label="Close size guide">${icon(
            'close'
          )}</button>
        </div>
        <div class="modal__body stack">
          <p class="meta">Standard UAE / international women's ready-to-wear sizing. All measurements are body measurements in centimetres.</p>
          <div class="size-table__wrap">
            <table class="size-table">
              <thead>
                <tr><th scope="col">Size</th><th scope="col">Bust (cm)</th><th scope="col">Waist (cm)</th><th scope="col">Hip (cm)</th></tr>
              </thead>
              <tbody>
              ${rows}
              </tbody>
            </table>
          </div>
          <div class="form-note">
            ${icon('ruler')}
            <div>
              <strong>How to measure.</strong> Measure over light clothing, keeping the tape level and snug but not tight. Bust at the fullest point, waist at the narrowest point, hip around the fullest part of the seat. If you fall between two sizes, we recommend the larger size for relaxed and wrap styles.
            </div>
          </div>
          <p class="meta">Abayas, kaftans and one-size accessories are cut generously — see the Fit note on each product page for the specific garment.</p>
        </div>
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ *
 * Page shell
 * ------------------------------------------------------------------ */

/**
 * @param {object} opts
 *   title, description  — <head> metadata
 *   body                — page HTML
 *   active              — nav href to mark aria-current
 *   scripts             — extra script srcs (site.js + catalog.js are automatic)
 *   canonical           — path, e.g. '/shop/'
 *   sizeGuide           — include the size guide modal
 *   bodyClass           — extra class on <body>
 *   jsonLd              — array of structured-data objects
 */
function page(opts) {
  const title = opts.title
    ? `${opts.title} | ${site.name}`
    : `${site.name} — ${site.tagline}`;
  const desc = opts.description || site.description;
  const canonical = site.url + (opts.canonical || '/');
  const scripts = ['/assets/js/site.js'].concat(opts.scripts || []);
  const jsonLd = (opts.jsonLd || [])
    .map(
      (o) =>
        `<script type="application/ld+json">${JSON.stringify(o).replace(
          /</g,
          '\\u003c'
        )}</script>`
    )
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${esc(canonical)}">
    <meta name="theme-color" content="#0B4F3C">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${esc(site.name)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:image" content="${esc(site.url)}${brandImage('og-image', 1200, 630).src}">
    <meta name="twitter:card" content="summary_large_image">

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/assets/img/brand/logo-icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/assets/img/brand/logo-icon.svg">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&amp;family=Poppins:wght@400;500;600&amp;display=swap">
    <link rel="stylesheet" href="/assets/css/main.css">
    ${jsonLd}
  </head>
  <body${opts.bodyClass ? ` class="${opts.bodyClass}"` : ''}>
    <a class="skip-link" href="#main">Skip to content</a>

    ${header(opts.active || '')}

    <main id="main">
${opts.body}
    </main>

    ${footer()}
    ${opts.sizeGuide ? sizeGuideModal() : ''}
    <div class="toast-region" data-toasts aria-live="polite" aria-atomic="true"></div>

    <script src="/assets/js/catalog.js"></script>
${scripts.map((s) => `    <script src="${s}" defer></script>`).join('\n')}
  </body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 * Small shared page pieces
 * ------------------------------------------------------------------ */

function crumbs(trail) {
  const items = trail
    .map((c, i) => {
      const last = i === trail.length - 1;
      return last
        ? `<li><span aria-current="page">${esc(c.label)}</span></li>`
        : `<li><a href="${c.href}">${esc(c.label)}</a></li>`;
    })
    .join('\n          ');
  return `<nav class="crumbs" aria-label="Breadcrumb">
      <div class="container">
        <ol>
          ${items}
        </ol>
      </div>
    </nav>`;
}

/** Value-props strip — the four pillars of the wholesale offer. */
function valueProps(variant) {
  const items = [
    ['box', 'Flexible MOQ', site.wholesale.moq],
    ['globe', 'UAE & GCC Supply', site.wholesale.supplyRegion],
    ['tag', 'Wholesale Pricing on Request', 'Competitive bulk rates, quoted per order.'],
    ['shield', 'Reliable Supply', 'Consistent quality and on-time bulk delivery.'],
  ]
    .map(
      (p) => `<div class="prop">
            <span class="prop__icon">${icon(p[0], 'icon icon--lg')}</span>
            <h3>${esc(p[1])}</h3>
            <p>${esc(p[2])}</p>
          </div>`
    )
    .join('\n          ');

  return `<section class="section ${variant === 'emerald' ? 'section--emerald' : 'section--surface'}">
      <div class="container">
        <div class="props">
          ${items}
        </div>
      </div>
    </section>`;
}

/** Newsletter band (Spec 6.1 item 10). */
function newsletterBand() {
  return `<section class="section section--emerald">
      <div class="container">
        <div class="subscribe">
          <span class="eyebrow">Stay in the loop</span>
          <h2>New collections, first look</h2>
          <p>Subscribe for new wholesale collections and catalogue updates. No clutter — just what buyers need.</p>
          <form data-newsletter novalidate>
            <label class="visually-hidden" for="band-newsletter">Email address</label>
            <input class="input" id="band-newsletter" type="email" name="email" placeholder="Your email address" required>
            <button class="btn btn--ivory" type="submit">Subscribe</button>
          </form>
          <p class="form-error" data-newsletter-msg role="status"></p>
        </div>
      </div>
    </section>`;
}

module.exports = {
  site,
  esc,
  money,
  ph,
  phoneLink,
  page,
  crumbs,
  valueProps,
  newsletterBand,
  sizeGuideModal,
  NAV,
};

'use strict';

const { esc, money, site } = require('./layout');
const { icon } = require('./icons');
const { logoFor } = require('./real-logos');

/**
 * ONE product card, used by the homepage rails, the catalogue grid and the
 * related-products strip. Because every grid renders this same function, all
 * products present identically wherever they appear.
 *
 * Pricing: every product shows "Price on Request" unless it carries a real
 * `wholesalePrice` (none do yet — see src/data/products.json). This is
 * deliberate: the old retail `price` field is never shown here, since it was
 * a per-unit consumer price, not a confirmed bulk/wholesale rate.
 */
function productCard(p, opts) {
  const o = opts || {};
  const badge = o.badge
    ? `<span class="pcard__badge tag">${esc(o.badge)}</span>`
    : '';
  const priceLabel = p.wholesalePrice ? money(p.wholesalePrice) : 'Price on Request';

  return `<article class="pcard">
            ${badge}
            <a class="pcard__media" href="${p.url}" aria-label="${esc(p.name)}" style="aspect-ratio:${p.aspect}">
              <img src="${p.images[0]}" alt="${esc(p.name)} — ${esc(p.subcategory)}" width="${p.imgW}" height="${p.imgH}" loading="${o.eager ? 'eager' : 'lazy'}" decoding="async">
            </a>
            <div class="pcard__quick">
              <a class="btn btn--primary btn--sm btn--block" href="/enquiry/?product=${p.slug}">
                ${icon('file', 'icon icon--sm')} Request Quote
              </a>
            </div>
            <div class="pcard__body">
              <span class="pcard__sub">${esc(p.subcategory)}</span>
              <h3 class="pcard__name"><a href="${p.url}">${esc(p.name)}</a></h3>
              <div class="pcard__foot">
                <span class="pcard__price pcard__price--quote">${priceLabel}</span>
                <span class="meta">${esc(p.colour || '')}</span>
              </div>
            </div>
          </article>`;
}

/** Horizontal scroll rail with prev/next controls (Spec 6.1 item 6). */
function productRail(id, items) {
  return `<div class="rail" data-rail>
          <div class="rail__track" id="${id}" tabindex="0" role="group" aria-label="Product carousel">
            ${items.map((p) => productCard(p)).join('\n            ')}
          </div>
        </div>`;
}

function productGrid(items, opts) {
  const o = opts || {};
  return `<div class="product-grid${o.cols === 3 ? ' product-grid--3' : ''}">
          ${items.map((p, i) => productCard(p, { eager: o.eager && i < 4 })).join('\n          ')}
        </div>`;
}

/** Section header with eyebrow, title and optional "view all" link. */
function sectionHead(eyebrow, title, link, opts) {
  const o = opts || {};
  return `<div class="section-head${o.center ? ' section-head--center' : ''}">
          <div>
            <span class="eyebrow">${esc(eyebrow)}</span>
            <h2>${esc(title)}</h2>
            <hr class="rule${o.center ? ' rule--center' : ''}">
          </div>
          ${
            link
              ? `<a class="section-head__link" href="${link.href}">${esc(link.label)}</a>`
              : ''
          }
        </div>`;
}

/** Designed empty state — never an undesigned blank area (Master prompt). */
function emptyState(cfg) {
  return `<div class="empty">
          <span class="empty__icon">${icon(cfg.icon || 'bag', 'icon icon--xl')}</span>
          <h2>${esc(cfg.title)}</h2>
          <p>${esc(cfg.body)}</p>
          <div class="empty__actions">
            ${(cfg.actions || [])
              .map(
                (a) =>
                  `<a class="btn ${a.primary ? 'btn--primary' : 'btn--secondary'}" href="${a.href}">${esc(
                    a.label
                  )}</a>`
              )
              .join('\n            ')}
          </div>
        </div>`;
}

/**
 * Partner logo showcase — Home, About Us and Partner With Hadaf. Renders the
 * confirmed `site.partners` list (only ever add a company there once the
 * partnership is genuine and its branding is cleared for use). A partner
 * shows its real logo file once one is dropped into
 * src/data/partner-logos/ (see src/lib/real-logos.js) — until then it
 * renders as a clean text wordmark, never a placeholder image.
 */
function partnerLogos(opts) {
  const o = opts || {};
  if (!site.partners || !site.partners.length) return '';

  const items = site.partners
    .map((p) => {
      const real = logoFor(p.id);
      const mark = real
        ? `<img src="${real.url}" alt="${esc(p.name)}" loading="lazy" decoding="async">`
        : `<span class="partner-logo__word">${esc(p.name)}</span>`;
      return `<li class="partner-logo">${mark}</li>`;
    })
    .join('\n            ');

  return `<section class="section partner-strip${o.surface ? ' section--surface' : ''}">
      <div class="container">
        <p class="partner-strip__eyebrow">${esc(o.label || 'Trusted by leading UAE retailers')}</p>
        <ul class="partner-logo__list">
            ${items}
        </ul>
      </div>
    </section>`;
}

module.exports = { productCard, productRail, productGrid, sectionHead, emptyState, partnerLogos };

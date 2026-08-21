'use strict';

const { esc, money } = require('./layout');
const { icon } = require('./icons');

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

module.exports = { productCard, productRail, productGrid, sectionHead, emptyState };

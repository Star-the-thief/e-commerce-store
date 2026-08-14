/**
 * Cart page — Specification Section 6.4.
 * Renders line items from the localStorage cart, supports quantity editing and
 * removal, and recomputes subtotal / delivery / total live on every change
 * (Spec 7.3).
 */
(function () {
  'use strict';

  if (!window.HV) return;
  var HV = window.HV;

  var emptyEl = document.querySelector('[data-cart-empty]');
  var fullEl = document.querySelector('[data-cart-full]');
  var listEl = document.querySelector('[data-cart-items]');
  if (!emptyEl || !fullEl || !listEl) return;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var ICON_MINUS =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>';
  var ICON_PLUS =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  var ICON_TRASH =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>';
  var ICON_TRUCK =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h10v9H3z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>';
  var ICON_CHECK =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/></svg>';

  function lineItem(line) {
    var p = line.product;
    var h = p.isGarment ? 1250 : 1000;
    var variantLabel = line.variant
      ? (p.isGarment ? 'Size: ' : 'Shade: ') + escapeHtml(line.variant)
      : escapeHtml(p.subcategory);

    return (
      '<li class="lineitem" data-line data-id="' +
      p.id +
      '" data-variant="' +
      escapeHtml(line.variant) +
      '">' +
      '<a class="lineitem__media" href="' +
      p.url +
      '" style="aspect-ratio:' +
      p.aspect +
      '">' +
      '<img src="' +
      p.image +
      '" alt="' +
      escapeHtml(p.name) +
      '" width="1000" height="' +
      h +
      '" loading="lazy" decoding="async">' +
      '</a>' +
      '<div class="lineitem__body">' +
      '<a href="' +
      p.url +
      '"><span class="lineitem__name">' +
      escapeHtml(p.name) +
      '</span></a>' +
      '<p class="lineitem__variant">' +
      variantLabel +
      '</p>' +
      '<p class="lineitem__unit">' +
      HV.money(line.unitPrice) +
      ' each</p>' +
      '<div class="lineitem__controls">' +
      '<div class="qty qty--sm">' +
      '<button type="button" data-line-dec aria-label="Decrease quantity of ' +
      escapeHtml(p.name) +
      '">' +
      ICON_MINUS +
      '</button>' +
      '<input type="number" min="1" max="20" step="1" value="' +
      line.quantity +
      '" data-line-qty aria-label="Quantity of ' +
      escapeHtml(p.name) +
      '">' +
      '<button type="button" data-line-inc aria-label="Increase quantity of ' +
      escapeHtml(p.name) +
      '">' +
      ICON_PLUS +
      '</button>' +
      '</div>' +
      '<button class="remove-btn" type="button" data-line-remove>' +
      ICON_TRASH +
      ' Remove</button>' +
      '</div>' +
      '</div>' +
      '<div class="lineitem__side">' +
      '<span class="meta">Subtotal</span>' +
      '<span class="lineitem__total">' +
      HV.money(line.lineTotal) +
      '</span>' +
      '</div>' +
      '</li>'
    );
  }

  /** Shared by cart and checkout: paint the summary panel from live totals. */
  function paintTotals() {
    var t = HV.cart.totals();

    var set = function (sel, value) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.textContent = value;
      });
    };
    set('[data-sum-subtotal]', HV.money(t.subtotal));
    set('[data-sum-total]', HV.money(t.total));

    document.querySelectorAll('[data-sum-delivery]').forEach(function (el) {
      el.textContent = t.freeDelivery && t.subtotal > 0 ? 'Free' : HV.money(t.delivery);
      el.classList.toggle('is-free', t.freeDelivery && t.subtotal > 0);
    });

    var band = document.querySelector('[data-freeship]');
    var text = document.querySelector('[data-freeship-text]');
    if (band && text) {
      if (t.freeDelivery && t.subtotal > 0) {
        band.classList.add('freeship--met');
        band.innerHTML = ICON_CHECK + '<span data-freeship-text></span>';
        band.querySelector('[data-freeship-text]').textContent =
          'You have free UAE-wide delivery on this order.';
      } else {
        band.classList.remove('freeship--met');
        band.innerHTML = ICON_TRUCK + '<span data-freeship-text></span>';
        band.querySelector('[data-freeship-text]').textContent =
          'Add ' + HV.money(t.remainingForFree) + ' more to qualify for free delivery.';
      }
    }
  }

  function render() {
    var lines = HV.cart.detailed();

    if (!lines.length) {
      emptyEl.removeAttribute('hidden');
      fullEl.setAttribute('hidden', '');
      return;
    }

    emptyEl.setAttribute('hidden', '');
    fullEl.removeAttribute('hidden');
    listEl.innerHTML = lines.map(lineItem).join('');
    paintTotals();
  }

  /* ---------------- Line item interactions ---------------- */
  listEl.addEventListener('click', function (e) {
    var row = e.target.closest('[data-line]');
    if (!row) return;
    var id = row.getAttribute('data-id');
    var variant = row.getAttribute('data-variant');
    var input = row.querySelector('[data-line-qty]');
    var current = parseInt(input.value, 10) || 1;

    if (e.target.closest('[data-line-dec]')) {
      HV.cart.setQuantity(id, variant, Math.max(1, current - 1));
    } else if (e.target.closest('[data-line-inc]')) {
      HV.cart.setQuantity(id, variant, Math.min(20, current + 1));
    } else if (e.target.closest('[data-line-remove]')) {
      var p = HV.index[id];
      HV.cart.remove(id, variant);
      if (p) HV.toast(p.name + ' removed from your cart');
    }
  });

  listEl.addEventListener('change', function (e) {
    var input = e.target.closest('[data-line-qty]');
    if (!input) return;
    var row = input.closest('[data-line]');
    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 20) n = 20;
    HV.cart.setQuantity(row.getAttribute('data-id'), row.getAttribute('data-variant'), n);
  });

  /* ---------------- Promo code (Spec 6.4: present, no live codes) ---------------- */
  var promoBtn = document.querySelector('[data-promo-apply]');
  if (promoBtn) {
    promoBtn.addEventListener('click', function () {
      var input = document.querySelector('[data-promo-input]');
      var msg = document.querySelector('[data-promo-msg]');
      if (!msg) return;
      var code = (input.value || '').trim();
      // No promotional codes are live at launch. This never silently "accepts"
      // a code — it tells the customer the truth.
      // TODO(backend): validate against a real promotions endpoint.
      msg.textContent = code
        ? 'We could not find the code "' + code + '". No promotional codes are active at the moment.'
        : 'Enter a promotional code to check it.';
    });
  }

  document.addEventListener('hv:cartchange', render);
  render();
})();

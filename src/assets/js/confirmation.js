/**
 * Order Confirmation — Specification Section 6.6.
 * Reads the most recent order from the client-side order log and renders the
 * reference, itemised summary, totals and delivery details. If there is no
 * recent order (e.g. someone lands here directly) the page falls back to its
 * designed "no recent order found" state rather than showing empty fields.
 */
(function () {
  'use strict';

  if (!window.HV) return;
  var HV = window.HV;

  var view = document.querySelector('[data-order-view]');
  var missing = document.querySelector('[data-order-missing]');
  if (!view || !missing) return;

  var order = HV.orders.last();

  if (!order || !order.items || !order.items.length) {
    missing.removeAttribute('hidden');
    return;
  }
  view.removeAttribute('hidden');

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function set(sel, value) {
    var el = view.querySelector(sel);
    if (el) el.textContent = value;
  }

  set('[data-order-ref]', order.reference);

  var itemsEl = view.querySelector('[data-order-items]');
  if (itemsEl) {
    itemsEl.innerHTML = order.items
      .map(function (i) {
        return (
          '<li><span class="recap__name">' +
          escapeHtml(i.name) +
          (i.variant ? ' <span class="recap__qty">(' + escapeHtml(i.variant) + ')</span>' : '') +
          ' <span class="recap__qty">&times; ' +
          i.quantity +
          '</span></span>' +
          '<span class="recap__price">' +
          HV.money(i.lineTotal) +
          '</span></li>'
        );
      })
      .join('');
  }

  set('[data-order-subtotal]', HV.money(order.totals.subtotal));
  set('[data-order-delivery]', order.totals.delivery === 0 ? 'Free' : HV.money(order.totals.delivery));
  set('[data-order-total]', HV.money(order.totals.total));
  set('[data-order-payment]', order.paymentMethod);

  set('[data-order-name]', order.customer.fullName);
  set('[data-order-email]', order.customer.email);
  set('[data-order-phone]', order.customer.phone);

  var d = order.delivery;
  set(
    '[data-order-address]',
    [d.building, d.street, d.area, d.emirate, d.country].filter(Boolean).join(', ')
  );

  if (order.notes) {
    var wrap = view.querySelector('[data-order-notes-wrap]');
    if (wrap) wrap.removeAttribute('hidden');
    set('[data-order-notes]', order.notes);
  }

  // Reflect the reference in the URL so the page can be bookmarked / shared
  // with support without changing history.
  try {
    window.history.replaceState(null, '', '/order-confirmation/?ref=' + encodeURIComponent(order.reference));
  } catch (e) {
    /* non-critical */
  }
})();

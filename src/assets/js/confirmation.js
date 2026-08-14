/**
 * Order Confirmation — Specification Section 6.6.
 *
 * Two ways an order gets here:
 *   - Cash on Delivery: checkout.js already wrote the order to the client-side
 *     order log and cleared the cart before redirecting here. Read it back
 *     with HV.orders.last() — unchanged from the original COD-only flow.
 *   - Card Payment: checkout.js redirected to Stripe *without* touching the
 *     cart or logging an order — a card order isn't real until Stripe confirms
 *     it. Stripe redirects back with ?session_id=..., which this script sends
 *     to /api/verify-checkout-session to confirm payment actually succeeded
 *     before rendering anything or clearing the cart. Landing on this page
 *     with a stale/tampered session_id must show "payment not completed", not
 *     a fabricated success screen.
 *
 * If neither path produces an order (e.g. someone lands here directly), the
 * page falls back to its designed "no recent order found" state.
 */
(function () {
  'use strict';

  if (!window.HV) return;
  var HV = window.HV;

  var view = document.querySelector('[data-order-view]');
  var missing = document.querySelector('[data-order-missing]');
  var paymentFailed = document.querySelector('[data-order-payment-failed]');
  if (!view || !missing) return;

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

  function showOnly(el) {
    [view, missing, paymentFailed].forEach(function (node) {
      if (!node) return;
      if (node === el) node.removeAttribute('hidden');
      else node.setAttribute('hidden', '');
    });
  }

  function render(order) {
    showOnly(view);

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
    set('[data-order-address]', [d.building, d.street, d.area, d.emirate, d.country].filter(Boolean).join(', '));

    var notesWrap = view.querySelector('[data-order-notes-wrap]');
    if (order.notes) {
      if (notesWrap) notesWrap.removeAttribute('hidden');
      set('[data-order-notes]', order.notes);
    } else if (notesWrap) {
      notesWrap.setAttribute('hidden', '');
    }

    // Swap in the copy that matches how this order was paid for.
    var isCard = order.paymentMethod === 'Card Payment';
    var noteCod = view.querySelector('[data-note-cod]');
    var noteCard = view.querySelector('[data-note-card]');
    var nextCod = view.querySelector('[data-next-cod]');
    var nextCard = view.querySelector('[data-next-card]');
    if (noteCod) noteCod.toggleAttribute('hidden', isCard);
    if (noteCard) noteCard.toggleAttribute('hidden', !isCard);
    if (nextCod) nextCod.toggleAttribute('hidden', isCard);
    if (nextCard) nextCard.toggleAttribute('hidden', !isCard);

    try {
      window.history.replaceState(null, '', '/order-confirmation/?ref=' + encodeURIComponent(order.reference));
    } catch (e) {
      /* non-critical */
    }
  }

  var sessionId = new URLSearchParams(window.location.search).get('session_id');

  if (sessionId) {
    fetch('/api/verify-checkout-session?session_id=' + encodeURIComponent(sessionId))
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error((data && data.error) || 'Payment could not be verified.');
          return data;
        });
      })
      .then(function (order) {
        // Only now — payment is confirmed — is it safe to clear the cart.
        HV.cart.clear();
        render(order);
      })
      .catch(function () {
        showOnly(paymentFailed);
      });
    return;
  }

  var order = HV.orders.last();
  if (!order || !order.items || !order.items.length) {
    showOnly(missing);
    return;
  }
  render(order);
})();

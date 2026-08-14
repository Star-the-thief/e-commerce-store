/**
 * Checkout — Specification Section 6.5.
 * Client-side validation on all required fields, a read-only order recap, and
 * order creation on submit (Spec 7.3).
 *
 * PAYMENT: Cash on Delivery is always preselected. Whether Card Payment is
 * selectable at all is decided at BUILD time in src/pages/commerce.js
 * (`cardEnabled`, driven by the STRIPE_SECRET_KEY environment variable) — a
 * disabled radio can never become `:checked`, so this script only needs to
 * branch on whichever value ends up selected:
 *   - "Cash on Delivery": unchanged — log the order locally and go straight
 *     to the confirmation page, as before.
 *   - "Card Payment": ask /api/create-checkout-session to build a Stripe
 *     Checkout Session (server re-derives every price; nothing here is
 *     trusted) and redirect the browser to Stripe's hosted payment page. The
 *     order itself is only recorded once /api/verify-checkout-session
 *     confirms payment actually succeeded — see confirmation.js.
 */
(function () {
  'use strict';

  if (!window.HV) return;
  var HV = window.HV;

  var form = document.querySelector('[data-checkout-form]');
  var emptyEl = document.querySelector('[data-checkout-empty]');
  if (!form || !emptyEl) return;

  var recapEl = form.querySelector('[data-recap]');
  var alertEl = form.querySelector('[data-form-alert]');

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var ICON_TRUCK =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h10v9H3z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>';
  var ICON_CHECK =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/></svg>';

  /* ---------------- Summary ---------------- */
  function paint() {
    var lines = HV.cart.detailed();

    if (!lines.length) {
      emptyEl.removeAttribute('hidden');
      form.setAttribute('hidden', '');
      return;
    }
    emptyEl.setAttribute('hidden', '');
    form.removeAttribute('hidden');

    if (recapEl) {
      recapEl.innerHTML = lines
        .map(function (l) {
          return (
            '<li><span class="recap__name">' +
            escapeHtml(l.product.name) +
            (l.variant ? ' <span class="recap__qty">(' + escapeHtml(l.variant) + ')</span>' : '') +
            ' <span class="recap__qty">&times; ' +
            l.quantity +
            '</span></span>' +
            '<span class="recap__price">' +
            HV.money(l.lineTotal) +
            '</span></li>'
          );
        })
        .join('');
    }

    var t = HV.cart.totals();
    var set = function (sel, value) {
      var el = form.querySelector(sel);
      if (el) el.textContent = value;
    };
    set('[data-sum-subtotal]', HV.money(t.subtotal));
    set('[data-sum-total]', HV.money(t.total));

    var del = form.querySelector('[data-sum-delivery]');
    if (del) {
      del.textContent = t.freeDelivery ? 'Free' : HV.money(t.delivery);
      del.classList.toggle('is-free', t.freeDelivery);
    }

    var band = form.querySelector('[data-freeship]');
    if (band) {
      if (t.freeDelivery) {
        band.classList.add('freeship--met');
        band.innerHTML = ICON_CHECK + '<span>You have free UAE-wide delivery on this order.</span>';
      } else {
        band.classList.remove('freeship--met');
        band.innerHTML =
          ICON_TRUCK +
          '<span>Delivery is ' +
          HV.money(t.delivery) +
          '. Add ' +
          HV.money(t.remainingForFree) +
          ' more to qualify for free delivery.</span>';
      }
    }
  }

  /* ---------------- Validation ---------------- */
  var RULES = {
    fullName: function (v) {
      return v.trim().length >= 2;
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    },
    phone: function (v) {
      // Accept common UAE formats: 05X XXX XXXX, +9715X…, with spaces/dashes.
      var digits = v.replace(/[^\d]/g, '');
      return digits.length >= 9 && digits.length <= 15;
    },
    emirate: function (v) {
      return v.trim() !== '';
    },
    area: function (v) {
      return v.trim().length >= 2;
    },
    street: function (v) {
      return v.trim().length >= 2;
    },
    building: function (v) {
      return v.trim().length >= 1;
    },
  };

  function fieldOf(name) {
    var input = form.querySelector('#' + name);
    return input ? { input: input, wrap: input.closest('[data-field]') } : null;
  }

  function validateField(name) {
    var f = fieldOf(name);
    if (!f) return true;
    var ok = RULES[name](f.input.value || '');
    if (f.wrap) f.wrap.classList.toggle('has-error', !ok);
    return ok;
  }

  function validateAll() {
    var firstBad = null;
    Object.keys(RULES).forEach(function (name) {
      if (!validateField(name) && !firstBad) firstBad = name;
    });
    return firstBad;
  }

  Object.keys(RULES).forEach(function (name) {
    var f = fieldOf(name);
    if (!f) return;
    // Validate on blur, and clear the error as soon as the value becomes valid.
    f.input.addEventListener('blur', function () {
      validateField(name);
    });
    f.input.addEventListener('input', function () {
      if (f.wrap && f.wrap.classList.contains('has-error')) validateField(name);
    });
    f.input.addEventListener('change', function () {
      validateField(name);
    });
  });

  /* ---------------- Submit ---------------- */
  var submitBtn = form.querySelector('[data-place-order]');
  var submitBtnDefaultHtml = submitBtn ? submitBtn.innerHTML : '';

  function showAlert(message) {
    if (!alertEl) return;
    var span = alertEl.querySelector('span');
    if (span) span.textContent = message;
    alertEl.classList.add('is-visible');
  }

  function setSubmitting(isSubmitting, label) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.innerHTML = isSubmitting ? label : submitBtnDefaultHtml;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var lines = HV.cart.detailed();
    if (!lines.length) {
      paint();
      return;
    }

    var firstBad = validateAll();
    if (firstBad) {
      showAlert('Please complete the highlighted fields before placing your order.');
      var f = fieldOf(firstBad);
      if (f) {
        f.input.focus();
        f.input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    if (alertEl) alertEl.classList.remove('is-visible');

    var totals = HV.cart.totals();
    var value = function (id) {
      var el = form.querySelector('#' + id);
      return el ? el.value.trim() : '';
    };

    var customer = { fullName: value('fullName'), email: value('email'), phone: value('phone') };
    var deliveryAddr = {
      emirate: value('emirate'),
      area: value('area'),
      street: value('street'),
      building: value('building'),
      country: 'United Arab Emirates',
    };
    var notes = value('notes');

    var paymentInput = form.querySelector('input[name="payment"]:checked');
    var payment = paymentInput ? paymentInput.value : 'Cash on Delivery';

    if (payment === 'Card Payment') {
      // A disabled radio can never be :checked, so reaching this branch means
      // Card Payment was actually built enabled (STRIPE_SECRET_KEY is set —
      // see src/pages/commerce.js). Hand off to Stripe's hosted checkout;
      // the order is only recorded once payment is verified (confirmation.js).
      setSubmitting(true, 'Redirecting to secure payment…');
      fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map(function (l) {
            return { productId: l.productId, variant: l.variant, quantity: l.quantity };
          }),
          customer: customer,
          delivery: deliveryAddr,
          notes: notes,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error((data && data.error) || 'Could not start checkout.');
            return data;
          });
        })
        .then(function (data) {
          window.location.href = data.url;
        })
        .catch(function (err) {
          setSubmitting(false);
          showAlert(err.message || 'Could not start checkout. Please try again, or choose Cash on Delivery.');
        });
      return;
    }

    var order = {
      reference: HV.orders.reference(),
      placedAt: new Date().toISOString(),
      paymentMethod: 'Cash on Delivery',
      items: lines.map(function (l) {
        return {
          productId: l.productId,
          sku: l.product.sku,
          name: l.product.name,
          variant: l.variant,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
        };
      }),
      totals: {
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        currency: 'AED',
      },
      customer: customer,
      delivery: deliveryAddr,
      notes: notes,
    };

    // TODO(backend): POST `order` to a real order-submission API and only clear
    // the cart once the server confirms. Until then the order is logged
    // client-side so the confirmation page can display it.
    HV.orders.save(order);
    HV.cart.clear();

    window.location.href = '/order-confirmation/';
  });

  document.addEventListener('hv:cartchange', function (e) {
    // Ignore our own clear-on-submit; only react to external changes.
    if (e.detail && e.detail.external) paint();
  });

  paint();
})();

/**
 * Wholesale Enquiry / Request a Quote form.
 * No backend exists, so this follows the same pattern as the Contact form
 * (src/assets/js/contact.js): validate, then open a mailto: fallback
 * pre-filled to info@hadafventureforclothing.com with every field, and show
 * an explicit success state. Never silently does nothing on submit.
 *
 * TODO(backend): replace the buildMailto()/window.location.href block with a
 * fetch() POST to a real form backend once one exists, keeping the same
 * validation and success-state handling.
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-enquiry-form]');
  if (!form) return;

  var TO = (window.HV_CONFIG && window.HV_CONFIG.email) || 'info@hadafventureforclothing.com';
  var alertEl = form.querySelector('[data-form-alert]');
  var successEl = form.querySelector('[data-form-success]');

  // Pre-select the product if we arrived from a product page ("Request Quote"
  // links to /enquiry/?product=<slug>).
  var params = new URLSearchParams(window.location.search);
  var productSlug = params.get('product');
  if (productSlug) {
    var select = form.querySelector('#q-product');
    if (select && select.querySelector('option[value="' + productSlug + '"]')) {
      select.value = productSlug;
    }
  }

  var RULES = {
    'q-company': function (v) {
      return v.trim().length >= 2;
    },
    'q-name': function (v) {
      return v.trim().length >= 2;
    },
    'q-phone': function (v) {
      var digits = v.replace(/[^\d]/g, '');
      return digits.length >= 9 && digits.length <= 15;
    },
    'q-email': function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    },
  };

  function validateField(id) {
    var input = form.querySelector('#' + id);
    if (!input) return true;
    var ok = RULES[id](input.value || '');
    var wrap = input.closest('[data-field]');
    if (wrap) wrap.classList.toggle('has-error', !ok);
    return ok;
  }

  Object.keys(RULES).forEach(function (id) {
    var input = form.querySelector('#' + id);
    if (!input) return;
    input.addEventListener('blur', function () {
      validateField(id);
    });
    input.addEventListener('input', function () {
      var wrap = input.closest('[data-field]');
      if (wrap && wrap.classList.contains('has-error')) validateField(id);
    });
  });

  function value(id) {
    var el = form.querySelector('#' + id);
    return el ? el.value.trim() : '';
  }

  function buildMailto() {
    var productSelect = form.querySelector('#q-product');
    var productLabel =
      productSelect && productSelect.selectedIndex > 0
        ? productSelect.options[productSelect.selectedIndex].textContent
        : 'General enquiry';

    var subject = 'Wholesale enquiry: ' + productLabel;
    var lines = [
      'Product: ' + productLabel,
      'Approximate quantity: ' + (value('q-quantity') || 'Not specified'),
      'Company: ' + value('q-company'),
      'Contact person: ' + value('q-name'),
      'Phone/WhatsApp: ' + value('q-phone'),
      'Email: ' + value('q-email'),
      '',
      'Additional details:',
      value('q-message') || '(none provided)',
      '',
      '— Sent from hadafventureforclothing.com',
    ];
    return 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstBad = null;
    Object.keys(RULES).forEach(function (id) {
      if (!validateField(id) && !firstBad) firstBad = id;
    });

    if (firstBad) {
      if (alertEl) alertEl.classList.add('is-visible');
      if (successEl) successEl.classList.remove('is-visible');
      var bad = form.querySelector('#' + firstBad);
      if (bad) {
        bad.focus();
        bad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (alertEl) alertEl.classList.remove('is-visible');
    if (successEl) {
      successEl.classList.add('is-visible');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    window.location.href = buildMailto();
  });
})();

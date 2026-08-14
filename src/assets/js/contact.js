/**
 * Contact form — Specification Section 7.4.
 * Approach chosen: (a) mailto: fallback. On a valid submit we open the
 * customer's email client pre-filled to info@hadafventureforclothing.com, then
 * show an explicit success state that says exactly what happened. The form
 * never silently does nothing, and never claims to have sent an email itself.
 *
 * TODO(backend): to switch to a real form backend (Formspree, or a serverless
 * function), replace the buildMailto()/window.location.href block below with a
 * fetch() POST and keep the same validation and success-state handling.
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  var TO = (window.HV_CONFIG && window.HV_CONFIG.email) || 'info@hadafventureforclothing.com';
  var alertEl = form.querySelector('[data-form-alert]');
  var successEl = form.querySelector('[data-form-success]');

  var RULES = {
    'c-name': function (v) {
      return v.trim().length >= 2;
    },
    'c-email': function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    },
    'c-subject': function (v) {
      return v.trim().length >= 2;
    },
    'c-message': function (v) {
      return v.trim().length >= 10;
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
    var subject = 'Website enquiry: ' + value('c-subject');
    var body =
      'Name: ' +
      value('c-name') +
      '\nEmail: ' +
      value('c-email') +
      '\n\nMessage:\n' +
      value('c-message') +
      '\n\n— Sent from hadafventureforclothing.com';
    return (
      'mailto:' +
      TO +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body)
    );
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
      if (bad) bad.focus();
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

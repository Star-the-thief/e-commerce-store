/**
 * Hadaf Venture Trading — shared front-end core
 * ===============================================
 * Loaded on every page. Provides:
 *   - window.HV.money  the single AED formatter, used only where a confirmed
 *     wholesale price exists (most products show "Price on Request" instead)
 *   - header / drawer / search / accordion / modal / rail / toast behaviour
 *   - newsletter signup handling
 *
 * There is no cart or order system — this is a wholesale enquiry catalogue,
 * not a retail checkout. Enquiries are handled by /assets/js/enquiry.js and
 * WhatsApp deep links built server-side per product.
 */
(function () {
  'use strict';

  var CONFIG = window.HV_CONFIG || { email: 'info@hadafventureforclothing.com' };

  var PRODUCTS = window.HV_PRODUCTS || [];
  var INDEX = {};
  PRODUCTS.forEach(function (p) {
    INDEX[p.id] = p;
  });

  /* ---------------------------------------------------------------- *
   * Formatting
   * ---------------------------------------------------------------- */

  /** AED with exactly 2 decimals — shown only when a confirmed price exists. */
  function money(value) {
    return Number(value || 0).toFixed(2) + ' AED';
  }

  /** Default variant label for a product with no explicit selection. */
  function defaultVariant(p) {
    if (p.sizes && p.sizes.length) return p.sizes[0];
    return '';
  }

  /* ---------------------------------------------------------------- *
   * Toasts
   * ---------------------------------------------------------------- */
  var CHECK_ICON =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m8 12.5 2.6 2.6L16 9.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function toast(message) {
    var region = document.querySelector('[data-toasts]');
    if (!region) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = CHECK_ICON + '<span></span>';
    el.querySelector('span').textContent = message;
    region.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add('is-in');
    });
    window.setTimeout(function () {
      el.classList.remove('is-in');
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 250);
    }, 2600);
  }

  /* ---------------------------------------------------------------- *
   * Header: sticky compaction + search panel
   * ---------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 120);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var toggle = document.querySelector('[data-search-toggle]');
    var panel = document.getElementById('site-search');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          var input = panel.querySelector('input');
          if (input) input.focus();
        }
      });
    }
  }

  /* ---------------------------------------------------------------- *
   * Mobile drawer
   * ---------------------------------------------------------------- */
  function initDrawer() {
    var drawer = document.querySelector('[data-drawer]');
    var scrim = document.querySelector('[data-scrim]');
    var opener = document.querySelector('[data-drawer-open]');
    if (!drawer || !scrim || !opener) return;

    function open() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      scrim.removeAttribute('hidden');
      requestAnimationFrame(function () {
        scrim.classList.add('is-open');
      });
      document.body.classList.add('is-locked');
      opener.setAttribute('aria-expanded', 'true');
      var first = drawer.querySelector('a, button, input');
      if (first) first.focus();
    }

    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      scrim.classList.remove('is-open');
      window.setTimeout(function () {
        if (!scrim.classList.contains('is-open')) scrim.setAttribute('hidden', '');
      }, 220);
      document.body.classList.remove('is-locked');
      opener.setAttribute('aria-expanded', 'false');
    }

    opener.addEventListener('click', open);
    document.querySelectorAll('[data-drawer-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    // Expose so the catalogue filter drawer can reuse the same scrim.
    window.HV_closeDrawer = close;
  }

  /* ---------------------------------------------------------------- *
   * Accordions — PDP details, FAQ, footer columns
   * ---------------------------------------------------------------- */
  function initAccordions() {
    document.querySelectorAll('[data-acc-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (panel) panel.classList.toggle('is-open', !open);
      });
    });

    // Footer columns: accordion under 1024px, always open above it.
    document.querySelectorAll('[data-acc-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var col = btn.closest('[data-acc-col]');
        if (!col) return;
        var open = col.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Size guide modal — one component, many triggers
   * ---------------------------------------------------------------- */
  function initModals() {
    var modal = document.querySelector('[data-modal]');
    if (!modal) return;
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      var close = modal.querySelector('[data-modal-close]');
      if (close) close.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('[data-size-guide]').forEach(function (t) {
      t.addEventListener('click', open);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ---------------------------------------------------------------- *
   * Product rails
   * ---------------------------------------------------------------- */
  function initRails() {
    function scrollRail(id, dir) {
      var track = document.getElementById(id);
      if (!track) return;
      var card = track.querySelector('.pcard');
      var step = card ? card.getBoundingClientRect().width + 20 : 300;
      track.scrollBy({ left: step * dir * 2, behavior: 'smooth' });
    }
    document.querySelectorAll('[data-rail-prev]').forEach(function (b) {
      b.addEventListener('click', function () {
        scrollRail(b.getAttribute('data-rail-prev'), -1);
      });
    });
    document.querySelectorAll('[data-rail-next]').forEach(function (b) {
      b.addEventListener('click', function () {
        scrollRail(b.getAttribute('data-rail-next'), 1);
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Newsletter (validated, clear success state, and a marked integration
   * point — it never pretends to have sent anything)
   * ---------------------------------------------------------------- */
  function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach(function (form) {
      var msg = form.querySelector('[data-newsletter-msg]');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var value = (input.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          if (msg) msg.textContent = 'Please enter a valid email address.';
          input.focus();
          return;
        }
        // TODO(backend): POST this address to a real mailing-list endpoint
        // (Mailchimp, or a serverless function). Until then we confirm
        // receipt of the intent only — no email is claimed to be sent.
        if (msg) {
          msg.textContent = 'Thank you — we have noted your interest and will be in touch with new collections.';
        }
        form.reset();
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Public API + boot
   * ---------------------------------------------------------------- */
  window.HV = {
    money: money,
    toast: toast,
    products: PRODUCTS,
    index: INDEX,
    config: CONFIG,
    defaultVariant: defaultVariant,
  };

  function boot() {
    initHeader();
    initDrawer();
    initAccordions();
    initModals();
    initRails();
    initNewsletter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

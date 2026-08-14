/**
 * Hadaf Venture — shared front-end core
 * =====================================
 * Loaded on every page. Provides:
 *   - window.HV.cart   localStorage cart + totals (Spec 7.3)
 *   - window.HV.money  the single AED formatter (Spec 1: always 2 decimals)
 *   - header / drawer / search / accordion / modal / rail / toast behaviour
 *   - quick "Add to Cart" on every product card
 *
 * BACKEND NOTE: cart and order state live in localStorage because there is no
 * backend at launch. When a real API exists, replace HV.cart's read/write and
 * HV.orders.save with API calls — the UI reads everything through these
 * functions, so no page or component needs to change.
 */
(function () {
  'use strict';

  var CART_KEY = 'hv_cart_v1';
  var ORDER_KEY = 'hv_orders_v1';
  var LAST_ORDER_KEY = 'hv_last_order_v1';

  var CONFIG = window.HV_CONFIG || {
    deliveryFee: 15,
    freeDeliveryThreshold: 150,
    email: 'info@hadafventureforclothing.com',
  };

  var PRODUCTS = window.HV_PRODUCTS || [];
  var INDEX = {};
  PRODUCTS.forEach(function (p) {
    INDEX[p.id] = p;
  });

  /* ---------------------------------------------------------------- *
   * Formatting
   * ---------------------------------------------------------------- */

  /** AED with exactly 2 decimals, everywhere on the site. */
  function money(value) {
    return Number(value || 0).toFixed(2) + ' AED';
  }

  /* ---------------------------------------------------------------- *
   * Cart store
   * ---------------------------------------------------------------- */

  function safeParse(json, fallback) {
    try {
      var v = JSON.parse(json);
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function readCart() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(CART_KEY);
    } catch (e) {
      /* storage blocked (private mode) — fall back to an in-memory cart */
    }
    var items = safeParse(raw, []);
    if (!Array.isArray(items)) return [];
    // Drop anything that no longer exists in the catalog.
    return items.filter(function (line) {
      return line && INDEX[line.productId] && line.quantity > 0;
    });
  }

  var memoryCart = null;

  function writeCart(items) {
    memoryCart = items;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      /* ignore — memoryCart keeps the session working */
    }
    document.dispatchEvent(new CustomEvent('hv:cartchange', { detail: { items: items } }));
  }

  var cart = {
    /** @returns {Array<{productId, variant, quantity}>} */
    items: function () {
      if (memoryCart) return memoryCart.slice();
      memoryCart = readCart();
      return memoryCart.slice();
    },

    /** Lines joined with their catalog product and computed line totals. */
    detailed: function () {
      return cart.items().map(function (line) {
        var p = INDEX[line.productId];
        return {
          productId: line.productId,
          variant: line.variant || '',
          quantity: line.quantity,
          product: p,
          unitPrice: p.price,
          lineTotal: p.price * line.quantity,
        };
      });
    },

    count: function () {
      return cart.items().reduce(function (n, l) {
        return n + l.quantity;
      }, 0);
    },

    /**
     * Totals per Spec 1 / 6.4: delivery is AED 15.00 while subtotal is under
     * AED 150.00, and free at AED 150.00 or above. An empty cart has no
     * delivery charge.
     */
    totals: function () {
      var subtotal = cart.detailed().reduce(function (sum, l) {
        return sum + l.lineTotal;
      }, 0);
      subtotal = Math.round(subtotal * 100) / 100;

      var free = subtotal >= CONFIG.freeDeliveryThreshold;
      var delivery = subtotal === 0 || free ? 0 : CONFIG.deliveryFee;

      return {
        subtotal: subtotal,
        delivery: delivery,
        freeDelivery: free,
        total: Math.round((subtotal + delivery) * 100) / 100,
        remainingForFree: Math.max(0, Math.round((CONFIG.freeDeliveryThreshold - subtotal) * 100) / 100),
      };
    },

    add: function (productId, variant, quantity) {
      var p = INDEX[productId];
      if (!p) return false;
      var qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));
      var v = variant || defaultVariant(p);
      var items = cart.items();

      var existing = null;
      for (var i = 0; i < items.length; i += 1) {
        if (items[i].productId === productId && (items[i].variant || '') === v) {
          existing = items[i];
          break;
        }
      }
      if (existing) existing.quantity = Math.min(20, existing.quantity + qty);
      else items.push({ productId: productId, variant: v, quantity: qty });

      writeCart(items);
      return true;
    },

    setQuantity: function (productId, variant, quantity) {
      var qty = Math.max(0, Math.min(20, parseInt(quantity, 10) || 0));
      var items = cart.items().filter(function (l) {
        if (l.productId === productId && (l.variant || '') === (variant || '')) {
          l.quantity = qty;
          return qty > 0;
        }
        return true;
      });
      writeCart(items);
    },

    remove: function (productId, variant) {
      writeCart(
        cart.items().filter(function (l) {
          return !(l.productId === productId && (l.variant || '') === (variant || ''));
        })
      );
    },

    clear: function () {
      writeCart([]);
    },
  };

  /** Default variant label for a product with no explicit selection. */
  function defaultVariant(p) {
    if (p.isGarment && p.sizes && p.sizes.length) return p.sizes[0];
    if (!p.isGarment && p.shade) return p.shade;
    return '';
  }

  /* ---------------------------------------------------------------- *
   * Order log
   *
   * TODO(backend): replace with a POST to a real order-submission API.
   * Everything downstream (order confirmation page) reads through
   * HV.orders.last(), so only these two functions need to change.
   * ---------------------------------------------------------------- */
  var orders = {
    /** Order reference: HV-<base36 timestamp>-<4 random chars>, uppercased. */
    reference: function () {
      var stamp = Date.now().toString(36).toUpperCase();
      var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      return 'HV-' + stamp + '-' + rand;
    },

    save: function (order) {
      try {
        var log = safeParse(window.localStorage.getItem(ORDER_KEY), []);
        if (!Array.isArray(log)) log = [];
        log.push(order);
        window.localStorage.setItem(ORDER_KEY, JSON.stringify(log.slice(-25)));
        window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      } catch (e) {
        /* If storage is unavailable the confirmation page falls back to its
           designed "no recent order found" state. */
      }
      return order;
    },

    last: function () {
      try {
        return safeParse(window.localStorage.getItem(LAST_ORDER_KEY), null);
      } catch (e) {
        return null;
      }
    },
  };

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
   * Cart badge
   * ---------------------------------------------------------------- */
  function paintCartCount() {
    var n = cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      if (n > 0) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
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

    // Expose so the shop filter drawer can reuse the same scrim.
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
   * Size guide modal (Spec 7.6) — one component, many triggers
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
   * Quick add-to-cart on product cards (delegated, so it also works on
   * grids that shop.js re-renders)
   * ---------------------------------------------------------------- */
  function initQuickAdd() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-quick-add]');
      if (!btn) return;
      e.preventDefault();
      var id = btn.getAttribute('data-quick-add');
      var p = INDEX[id];
      if (!p) return;
      if (cart.add(id, defaultVariant(p), 1)) {
        toast(p.name + ' added to your cart');
      }
    });
  }

  /* ---------------------------------------------------------------- *
   * Newsletter (Spec 7.4 option b: validated, clear success state, and a
   * marked integration point — it never pretends to have sent an email)
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
        // TODO(backend): POST this address to a real newsletter endpoint
        // (Formspree, Mailchimp, or a serverless function). Until then we
        // confirm receipt of the intent only — no email is claimed to be sent.
        if (msg) {
          msg.textContent =
            'Thank you — we have noted your interest. Our newsletter launches shortly and we will be in touch.';
        }
        form.reset();
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Public API + boot
   * ---------------------------------------------------------------- */
  window.HV = {
    cart: cart,
    orders: orders,
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
    initQuickAdd();
    initNewsletter();
    paintCartCount();
    document.addEventListener('hv:cartchange', paintCartCount);
    // Keep the badge honest if the cart changes in another tab.
    window.addEventListener('storage', function (e) {
      if (e.key === CART_KEY) {
        memoryCart = null;
        paintCartCount();
        document.dispatchEvent(new CustomEvent('hv:cartchange', { detail: { external: true } }));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

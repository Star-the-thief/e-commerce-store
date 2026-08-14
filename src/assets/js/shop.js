/**
 * Shop filtering, sorting and pagination — Specification Sections 6.2, 7.5.
 * Runs identically on /shop, /shop/fashion and /shop/beauty; the latter two are
 * pre-filtered by category via data-category on [data-shop].
 *
 * State is mirrored into the URL query string so a filtered view is shareable
 * and the browser back button behaves as expected. The homepage category tiles
 * link straight in with ?sub=<Subcategory>.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-shop]');
  if (!root || !window.HV) return;

  var HV = window.HV;
  var PAGE_SIZE = 20;

  var baseCategory = root.getAttribute('data-category') || '';
  var basePath = root.getAttribute('data-base') || '/shop/';

  var els = {
    results: root.querySelector('[data-results]'),
    count: root.querySelector('[data-result-count]'),
    noun: root.querySelector('[data-result-noun]'),
    chips: root.querySelector('[data-chips]'),
    sort: root.querySelector('[data-sort]'),
    panel: root.querySelector('[data-filters]'),
    loadmore: root.querySelector('[data-loadmore]'),
    loadmoreBtn: root.querySelector('[data-loadmore-btn]'),
    loadmoreStatus: root.querySelector('[data-loadmore-status]'),
    rangeMin: root.querySelector('[data-range-min]'),
    rangeMax: root.querySelector('[data-range-max]'),
    rangeMinLabel: root.querySelector('[data-range-min-label]'),
    rangeMaxLabel: root.querySelector('[data-range-max-label]'),
    rangeFill: root.querySelector('[data-range-fill]'),
  };

  var BOUNDS = (HV.config && HV.config.priceBounds) || { min: 30, max: 300 };

  var state = {
    cats: [],
    subs: [],
    min: BOUNDS.min,
    max: BOUNDS.max,
    sort: 'featured',
    q: '',
    shown: PAGE_SIZE,
  };

  /* ---------------------------------------------------------------- *
   * URL <-> state
   * ---------------------------------------------------------------- */
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var subs = params.getAll('sub');
    if (params.get('subs')) subs = subs.concat(params.get('subs').split(','));
    state.subs = subs.filter(Boolean);
    state.cats = params.getAll('cat').filter(Boolean);
    state.q = (params.get('q') || '').trim();
    state.sort = params.get('sort') || 'featured';

    var min = parseFloat(params.get('min'));
    var max = parseFloat(params.get('max'));
    if (!isNaN(min)) state.min = Math.max(BOUNDS.min, Math.min(BOUNDS.max, min));
    if (!isNaN(max)) state.max = Math.max(BOUNDS.min, Math.min(BOUNDS.max, max));
    if (state.min > state.max) {
      var t = state.min;
      state.min = state.max;
      state.max = t;
    }
  }

  function writeUrl(replace) {
    var params = new URLSearchParams();
    state.cats.forEach(function (c) {
      params.append('cat', c);
    });
    state.subs.forEach(function (s) {
      params.append('sub', s);
    });
    if (state.min !== BOUNDS.min) params.set('min', String(state.min));
    if (state.max !== BOUNDS.max) params.set('max', String(state.max));
    if (state.sort !== 'featured') params.set('sort', state.sort);
    if (state.q) params.set('q', state.q);

    var qs = params.toString();
    var url = basePath + (qs ? '?' + qs : '');
    if (replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
  }

  /* ---------------------------------------------------------------- *
   * Filtering + sorting
   * ---------------------------------------------------------------- */
  function matches(p) {
    if (baseCategory && p.category !== baseCategory) return false;
    if (state.cats.length && state.cats.indexOf(p.category) === -1) return false;
    if (state.subs.length && state.subs.indexOf(p.subcategory) === -1) return false;
    if (p.price < state.min || p.price > state.max) return false;

    if (state.q) {
      var needle = state.q.toLowerCase();
      var haystack = [
        p.name,
        p.subcategory,
        p.category,
        p.shortDescription,
        p.colour || '',
        p.shade || '',
        p.sku,
      ]
        .join(' ')
        .toLowerCase();
      if (haystack.indexOf(needle) === -1) return false;
    }
    return true;
  }

  function sortItems(items) {
    var out = items.slice();
    switch (state.sort) {
      case 'price-asc':
        out.sort(function (a, b) {
          return a.price - b.price || a.order - b.order;
        });
        break;
      case 'price-desc':
        out.sort(function (a, b) {
          return b.price - a.price || a.order - b.order;
        });
        break;
      case 'newest':
        // Catalog order is the proxy for "new" (Spec 6.1 item 8).
        out.sort(function (a, b) {
          return b.order - a.order;
        });
        break;
      default:
        out.sort(function (a, b) {
          return a.order - b.order;
        });
    }
    return out;
  }

  /* ---------------------------------------------------------------- *
   * Rendering — mirrors src/lib/components.js productCard() exactly so
   * client-rendered cards are indistinguishable from build-rendered ones.
   * ---------------------------------------------------------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var ICON_CART =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h2.2l1.6 10.2a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.6L20 8H6.4"/><circle cx="9.5" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>';

  function card(p, eager) {
    var meta = p.isGarment ? p.colour || '' : p.netQuantity || '';
    var h = p.isGarment ? 1250 : 1000;
    return (
      '<article class="pcard">' +
      '<a class="pcard__media" href="' +
      p.url +
      '" aria-label="' +
      escapeHtml(p.name) +
      '" style="aspect-ratio:' +
      p.aspect +
      '">' +
      '<img src="' +
      p.image +
      '" alt="' +
      escapeHtml(p.name) +
      ' — ' +
      escapeHtml(p.subcategory) +
      '" width="1000" height="' +
      h +
      '" loading="' +
      (eager ? 'eager' : 'lazy') +
      '" decoding="async">' +
      '</a>' +
      '<div class="pcard__quick">' +
      '<button class="btn btn--primary btn--sm btn--block" type="button" data-quick-add="' +
      p.id +
      '">' +
      ICON_CART +
      ' Add to Cart</button>' +
      '</div>' +
      '<div class="pcard__body">' +
      '<span class="pcard__sub">' +
      escapeHtml(p.subcategory) +
      '</span>' +
      '<h3 class="pcard__name"><a href="' +
      p.url +
      '">' +
      escapeHtml(p.name) +
      '</a></h3>' +
      '<div class="pcard__foot">' +
      '<span class="pcard__price">' +
      HV.money(p.price) +
      '</span>' +
      '<span class="meta">' +
      escapeHtml(meta) +
      '</span>' +
      '</div></div></article>'
    );
  }

  var ICON_SEARCH_XL =
    '<svg class="icon icon--xl" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/></svg>';

  function emptyMarkup() {
    return (
      '<div class="empty">' +
      '<span class="empty__icon">' +
      ICON_SEARCH_XL +
      '</span>' +
      '<h2>No products match these filters</h2>' +
      '<p>Nothing in the collection matches that combination just yet. Try widening your price range or clearing a filter — the full collection is only a click away.</p>' +
      '<div class="empty__actions">' +
      '<button class="btn btn--primary" type="button" data-filters-reset>Clear all filters</button>' +
      '<a class="btn btn--secondary" href="/shop/">Shop all products</a>' +
      '</div></div>'
    );
  }

  function chipMarkup(label, kind, value) {
    return (
      '<span class="chip">' +
      escapeHtml(label) +
      '<button type="button" data-chip-remove data-kind="' +
      kind +
      '" data-value="' +
      escapeHtml(value) +
      '" aria-label="Remove filter ' +
      escapeHtml(label) +
      '">' +
      '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button></span>'
    );
  }

  function renderChips() {
    if (!els.chips) return;
    var out = [];
    state.cats.forEach(function (c) {
      out.push(chipMarkup(c, 'cat', c));
    });
    state.subs.forEach(function (s) {
      out.push(chipMarkup(s, 'sub', s));
    });
    if (state.min !== BOUNDS.min || state.max !== BOUNDS.max) {
      out.push(
        chipMarkup(
          HV.money(state.min) + ' – ' + HV.money(state.max),
          'price',
          'price'
        )
      );
    }
    if (state.q) out.push(chipMarkup('Search: "' + state.q + '"', 'q', state.q));
    if (out.length > 1) {
      out.push(
        '<button class="chip" type="button" data-filters-reset style="cursor:pointer">Clear all</button>'
      );
    }
    els.chips.innerHTML = out.join('');
  }

  function render() {
    var items = sortItems(HV.products.filter(matches));
    var visible = items.slice(0, state.shown);

    if (els.count) els.count.textContent = String(items.length);
    if (els.noun) els.noun.textContent = items.length === 1 ? 'product' : 'products';

    if (!items.length) {
      els.results.innerHTML = emptyMarkup();
    } else {
      els.results.innerHTML =
        '<div class="product-grid">' +
        visible
          .map(function (p, i) {
            return card(p, i < 4);
          })
          .join('') +
        '</div>';
    }

    if (els.loadmore) {
      var more = items.length > visible.length;
      if (more) {
        els.loadmore.removeAttribute('hidden');
        if (els.loadmoreStatus) {
          els.loadmoreStatus.textContent =
            'Showing ' + visible.length + ' of ' + items.length + ' products';
        }
      } else {
        els.loadmore.setAttribute('hidden', '');
      }
    }

    renderChips();
    syncControls();
  }

  /* ---------------------------------------------------------------- *
   * Controls
   * ---------------------------------------------------------------- */
  function syncControls() {
    root.querySelectorAll('[data-filter-sub]').forEach(function (cb) {
      cb.checked = state.subs.indexOf(cb.value) !== -1;
    });
    root.querySelectorAll('[data-filter-cat]').forEach(function (cb) {
      cb.checked = state.cats.indexOf(cb.value) !== -1;
    });
    if (els.sort) els.sort.value = state.sort;
    if (els.rangeMin) els.rangeMin.value = String(state.min);
    if (els.rangeMax) els.rangeMax.value = String(state.max);
    paintRange();
  }

  function paintRange() {
    if (!els.rangeFill) return;
    var span = BOUNDS.max - BOUNDS.min;
    var left = ((state.min - BOUNDS.min) / span) * 100;
    var right = ((state.max - BOUNDS.min) / span) * 100;
    els.rangeFill.style.left = left + '%';
    els.rangeFill.style.width = Math.max(0, right - left) + '%';
    if (els.rangeMinLabel) els.rangeMinLabel.textContent = HV.money(state.min);
    if (els.rangeMaxLabel) els.rangeMaxLabel.textContent = HV.money(state.max);
  }

  function apply(pushUrl) {
    state.shown = PAGE_SIZE;
    if (pushUrl !== false) writeUrl(false);
    render();
  }

  function bind() {
    root.querySelectorAll('[data-filter-sub]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var i = state.subs.indexOf(cb.value);
        if (cb.checked && i === -1) state.subs.push(cb.value);
        else if (!cb.checked && i !== -1) state.subs.splice(i, 1);
        apply();
      });
    });

    root.querySelectorAll('[data-filter-cat]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var i = state.cats.indexOf(cb.value);
        if (cb.checked && i === -1) state.cats.push(cb.value);
        else if (!cb.checked && i !== -1) state.cats.splice(i, 1);
        apply();
      });
    });

    if (els.sort) {
      els.sort.addEventListener('change', function () {
        state.sort = els.sort.value;
        apply();
      });
    }

    // Dual-handle range: keep the two thumbs from crossing over.
    function onRange() {
      var a = parseInt(els.rangeMin.value, 10);
      var b = parseInt(els.rangeMax.value, 10);
      state.min = Math.min(a, b);
      state.max = Math.max(a, b);
      paintRange();
    }
    if (els.rangeMin && els.rangeMax) {
      [els.rangeMin, els.rangeMax].forEach(function (input) {
        input.addEventListener('input', onRange);
        input.addEventListener('change', function () {
          onRange();
          apply();
        });
      });
    }

    // Reset (in the panel, in the chip row, and in the empty state)
    document.addEventListener('click', function (e) {
      var reset = e.target.closest('[data-filters-reset]');
      if (reset) {
        state.cats = [];
        state.subs = [];
        state.min = BOUNDS.min;
        state.max = BOUNDS.max;
        state.q = '';
        state.sort = 'featured';
        apply();
        return;
      }

      var chip = e.target.closest('[data-chip-remove]');
      if (chip) {
        var kind = chip.getAttribute('data-kind');
        var value = chip.getAttribute('data-value');
        if (kind === 'sub') state.subs = state.subs.filter(function (s) { return s !== value; });
        if (kind === 'cat') state.cats = state.cats.filter(function (c) { return c !== value; });
        if (kind === 'q') state.q = '';
        if (kind === 'price') {
          state.min = BOUNDS.min;
          state.max = BOUNDS.max;
        }
        apply();
      }
    });

    if (els.loadmoreBtn) {
      els.loadmoreBtn.addEventListener('click', function () {
        state.shown += PAGE_SIZE;
        render();
      });
    }

    // Mobile filter drawer, sharing the header scrim.
    var scrim = document.querySelector('[data-scrim]');
    function openFilters() {
      els.panel.classList.add('is-open');
      if (scrim) {
        scrim.removeAttribute('hidden');
        requestAnimationFrame(function () {
          scrim.classList.add('is-open');
        });
      }
      document.body.classList.add('is-locked');
    }
    function closeFilters() {
      els.panel.classList.remove('is-open');
      if (scrim) {
        scrim.classList.remove('is-open');
        window.setTimeout(function () {
          if (!scrim.classList.contains('is-open')) scrim.setAttribute('hidden', '');
        }, 220);
      }
      document.body.classList.remove('is-locked');
    }

    var openBtn = root.querySelector('[data-filters-open]');
    if (openBtn) openBtn.addEventListener('click', openFilters);
    root.querySelectorAll('[data-filters-close], [data-filters-apply]').forEach(function (b) {
      b.addEventListener('click', closeFilters);
    });
    if (scrim) scrim.addEventListener('click', closeFilters);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.panel.classList.contains('is-open')) closeFilters();
    });

    window.addEventListener('popstate', function () {
      readUrl();
      state.shown = PAGE_SIZE;
      render();
    });
  }

  readUrl();
  bind();
  render();
})();

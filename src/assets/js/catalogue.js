/**
 * Wholesale catalogue filtering, sorting and pagination.
 * State is mirrored into the URL query string so a filtered view is shareable
 * and the browser back button behaves as expected. The homepage category
 * tiles link straight in with ?sub=<Subcategory>.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-shop]');
  if (!root || !window.HV) return;

  var HV = window.HV;
  var PAGE_SIZE = 20;
  var basePath = root.getAttribute('data-base') || '/catalogue/';

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
  };

  var state = {
    subs: [],
    sort: 'featured',
    q: '',
    shown: PAGE_SIZE,
  };

  /* ---------------------------------------------------------------- *
   * URL <-> state
   * ---------------------------------------------------------------- */
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    state.subs = params.getAll('sub').filter(Boolean);
    state.q = (params.get('q') || '').trim();
    state.sort = params.get('sort') || 'featured';
  }

  function writeUrl(replace) {
    var params = new URLSearchParams();
    state.subs.forEach(function (s) {
      params.append('sub', s);
    });
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
    if (state.subs.length && state.subs.indexOf(p.subcategory) === -1) return false;

    if (state.q) {
      var needle = state.q.toLowerCase();
      var haystack = [p.name, p.subcategory, p.shortDescription, p.colour || '', p.sku]
        .join(' ')
        .toLowerCase();
      if (haystack.indexOf(needle) === -1) return false;
    }
    return true;
  }

  function sortItems(items) {
    var out = items.slice();
    switch (state.sort) {
      case 'newest':
        out.sort(function (a, b) {
          return b.order - a.order;
        });
        break;
      case 'name':
        out.sort(function (a, b) {
          return a.name.localeCompare(b.name);
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

  var ICON_FILE =
    '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>';

  function card(p, eager) {
    var priceLabel = p.wholesalePrice ? HV.money(p.wholesalePrice) : 'Price on Request';
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
      '" width="1000" height="1250" loading="' +
      (eager ? 'eager' : 'lazy') +
      '" decoding="async">' +
      '</a>' +
      '<div class="pcard__quick">' +
      '<a class="btn btn--primary btn--sm btn--block" href="/enquiry/?product=' +
      p.slug +
      '">' +
      ICON_FILE +
      ' Request Quote</a>' +
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
      '<span class="pcard__price pcard__price--quote">' +
      priceLabel +
      '</span>' +
      '<span class="meta">' +
      escapeHtml(p.colour || '') +
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
      '<h2>No styles match these filters</h2>' +
      '<p>Nothing in the catalogue matches that combination just yet. Try clearing a filter, or get in touch — we may have something suitable coming soon.</p>' +
      '<div class="empty__actions">' +
      '<button class="btn btn--primary" type="button" data-filters-reset>Clear all filters</button>' +
      '<a class="btn btn--secondary" href="/contact/">Contact Us</a>' +
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
    state.subs.forEach(function (s) {
      out.push(chipMarkup(s, 'sub', s));
    });
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
    if (els.noun) els.noun.textContent = items.length === 1 ? 'style' : 'styles';

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
          els.loadmoreStatus.textContent = 'Showing ' + visible.length + ' of ' + items.length + ' styles';
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
    if (els.sort) els.sort.value = state.sort;
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

    if (els.sort) {
      els.sort.addEventListener('change', function () {
        state.sort = els.sort.value;
        apply();
      });
    }

    // Reset (in the panel, in the chip row, and in the empty state)
    document.addEventListener('click', function (e) {
      var reset = e.target.closest('[data-filters-reset]');
      if (reset) {
        state.subs = [];
        state.q = '';
        state.sort = 'featured';
        apply();
        return;
      }

      var chip = e.target.closest('[data-chip-remove]');
      if (chip) {
        var kind = chip.getAttribute('data-kind');
        var value = chip.getAttribute('data-value');
        if (kind === 'sub') {
          state.subs = state.subs.filter(function (s) {
            return s !== value;
          });
        }
        if (kind === 'q') state.q = '';
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

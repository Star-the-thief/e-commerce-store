/**
 * Product detail behaviour — wholesale catalogue.
 * Gallery switching, desktop zoom-on-hover, and variant selection (size/colour
 * shown for reference — there is no cart, so selecting a variant just updates
 * the on-screen label; buyers request a quote separately).
 */
(function () {
  'use strict';

  var scope = document.querySelector('[data-product]');
  if (!scope || !window.HV) return;

  var HV = window.HV;
  var productId = scope.getAttribute('data-product');
  var product = HV.index[productId];
  if (!product) return;

  /* ---------------- Gallery ---------------- */
  var mainWrap = scope.querySelector('[data-gallery-main]');
  var mainImg = scope.querySelector('[data-gallery-img]');
  var thumbs = Array.prototype.slice.call(scope.querySelectorAll('[data-gallery-thumb]'));

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var src = thumb.querySelector('img').getAttribute('src');
      mainImg.setAttribute('src', src);
      thumbs.forEach(function (t) {
        t.setAttribute('aria-current', t === thumb ? 'true' : 'false');
      });
      mainWrap.classList.remove('is-zoomed');
      mainImg.style.transformOrigin = 'center center';
    });
  });

  // Zoom-on-hover: desktop pointers only, so touch devices keep normal scroll.
  if (mainWrap && window.matchMedia('(hover: hover) and (min-width: 900px)').matches) {
    mainWrap.addEventListener('mouseenter', function () {
      mainWrap.classList.add('is-zoomed');
    });
    mainWrap.addEventListener('mouseleave', function () {
      mainWrap.classList.remove('is-zoomed');
      mainImg.style.transformOrigin = 'center center';
    });
    mainWrap.addEventListener('mousemove', function (e) {
      var r = mainWrap.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      mainImg.style.transformOrigin = x + '% ' + y + '%';
    });
  }

  /* ---------------- Variants (informational — no cart) ---------------- */
  var variantGroup = scope.querySelector('[data-variant-group]');
  var selectedLabel = scope.querySelector('[data-variant-selected]');

  if (variantGroup) {
    var options = Array.prototype.slice.call(variantGroup.querySelectorAll('[data-variant-option]'));
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) {
          o.setAttribute('aria-pressed', o === opt ? 'true' : 'false');
        });
        if (selectedLabel) selectedLabel.textContent = opt.getAttribute('data-value');
      });
    });
  }
})();

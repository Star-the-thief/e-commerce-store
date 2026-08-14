/**
 * Product detail behaviour — Specification Section 6.3.
 * Gallery switching, desktop zoom-on-hover, variant selection, quantity
 * stepper, and add-to-cart with the selected variant.
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

  /* ---------------- Variants ---------------- */
  var variantGroup = scope.querySelector('[data-variant-group]');
  var selectedLabel = scope.querySelector('[data-variant-selected]');
  var selectedVariant = HV.defaultVariant(product);

  if (variantGroup) {
    var options = Array.prototype.slice.call(variantGroup.querySelectorAll('[data-variant-option]'));
    var pressed = options.filter(function (o) {
      return o.getAttribute('aria-pressed') === 'true';
    })[0];
    if (pressed) selectedVariant = pressed.getAttribute('data-value');

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) {
          o.setAttribute('aria-pressed', o === opt ? 'true' : 'false');
        });
        selectedVariant = opt.getAttribute('data-value');
        if (selectedLabel) selectedLabel.textContent = selectedVariant;
      });
    });
  }

  /* ---------------- Quantity stepper ---------------- */
  var qtyWrap = scope.querySelector('[data-qty]');
  var qtyInput = scope.querySelector('[data-qty-input]');

  function clampQty() {
    var n = parseInt(qtyInput.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 20) n = 20;
    qtyInput.value = String(n);
    qtyWrap.querySelector('[data-qty-dec]').disabled = n <= 1;
    qtyWrap.querySelector('[data-qty-inc]').disabled = n >= 20;
    return n;
  }

  if (qtyWrap && qtyInput) {
    qtyWrap.querySelector('[data-qty-dec]').addEventListener('click', function () {
      qtyInput.value = String(Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1));
      clampQty();
    });
    qtyWrap.querySelector('[data-qty-inc]').addEventListener('click', function () {
      qtyInput.value = String(Math.min(20, (parseInt(qtyInput.value, 10) || 1) + 1));
      clampQty();
    });
    qtyInput.addEventListener('change', clampQty);
    clampQty();
  }

  /* ---------------- Add to cart ---------------- */
  var addBtn = scope.querySelector('[data-add-to-cart]');
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      var qty = qtyInput ? clampQty() : 1;
      HV.cart.add(productId, selectedVariant, qty);
      HV.toast(
        product.name +
          (selectedVariant ? ' (' + selectedVariant + ')' : '') +
          ' added to your cart'
      );
    });
  }
})();

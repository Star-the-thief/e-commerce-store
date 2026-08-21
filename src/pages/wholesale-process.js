'use strict';

/** Wholesale Process — how ordering works, MOQ, bulk orders, lead times, UAE/GCC supply. */

const { site, esc, page, crumbs, valueProps } = require('../lib/layout');
const { icon } = require('../lib/icons');
const { sectionHead } = require('../lib/components');
const { brandImage } = require('../lib/real-banners');

const STEPS = [
  {
    n: '01',
    title: 'Browse or ask',
    body: 'Explore the catalogue for available styles, or contact us directly if you have specific requirements.',
  },
  {
    n: '02',
    title: 'Request a quote',
    body: 'Share the style, quantity and your company details via the enquiry form or WhatsApp.',
  },
  {
    n: '03',
    title: 'We confirm the details',
    body: 'Our team responds with pricing, MOQ and lead time for your order — usually within one working day.',
  },
  {
    n: '04',
    title: 'Confirm your order',
    body: 'Once you approve the quotation, we confirm the order and begin preparation.',
  },
  {
    n: '05',
    title: 'Bulk dispatch',
    body: 'Your order is packed and delivered across the UAE, or exported to the GCC on request.',
  },
];

function build() {
  const bannerImg = brandImage('banner-wholesale-process', 1920, 480);

  const steps = STEPS.map(
    (s) => `<div class="prop">
              <span class="prop__icon" style="font-family:var(--font-heading);font-weight:700;font-size:16px">${s.n}</span>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.body)}</p>
            </div>`
  ).join('\n            ');

  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: 'Wholesale Process' }])}

      <section class="page-hero">
        <img class="page-hero__img" src="${bannerImg.src}" alt="" width="${bannerImg.width}" height="${bannerImg.height}" loading="eager" decoding="async">
        <div class="container">
          <div class="page-hero__inner">
            <span class="eyebrow" style="color:var(--color-champagne)">How it works</span>
            <h1>Wholesale Process</h1>
            <p>From first enquiry to bulk delivery — a straightforward, five-step process for buyers, retailers and distributors.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionHead('Ordering process', 'How wholesale works', null, { center: true })}
          <div class="props">
            ${steps}
          </div>
        </div>
      </section>

      <section class="section section--surface">
        <div class="container">
          <div class="split">
            <div class="split__body">
              <span class="eyebrow">Minimum order quantity</span>
              <h2>MOQ &amp; Bulk Orders</h2>
              <hr class="rule">
              <p>Our standard minimum order quantity is <strong>${esc(
                site.wholesale.moq
              )}</strong>. ${esc(site.wholesale.sampleNote)}, so you can confirm quality and fit before committing to a bulk order.</p>
              <p>${esc(site.wholesale.packaging)}. Larger orders and repeat wholesale partnerships are welcome — get in touch to discuss volume pricing.</p>
              <a class="btn btn--secondary" href="/enquiry/">Request a Quote</a>
            </div>
            <div class="split__media">
              <div class="panel" style="padding:var(--sp-7)">
                <div class="props" style="grid-template-columns:1fr">
                  <div class="prop">
                    <span class="prop__icon">${icon('box', 'icon icon--lg')}</span>
                    <h3>Minimum Order</h3>
                    <p>${esc(site.wholesale.moq)}</p>
                  </div>
                  <div class="prop">
                    <span class="prop__icon">${icon('clock', 'icon icon--lg')}</span>
                    <h3>Lead Time</h3>
                    <p>${esc(site.wholesale.leadTime)}</p>
                  </div>
                  <div class="prop">
                    <span class="prop__icon">${icon('globe', 'icon icon--lg')}</span>
                    <h3>Supply Region</h3>
                    <p>${esc(site.wholesale.supplyRegion)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          ${sectionHead('Logistics', 'Delivery &amp; Lead Times', null, { center: true })}
          <div class="props props--3">
            <div class="prop">
              <span class="prop__icon">${icon('truck', 'icon icon--lg')}</span>
              <h3>UAE-Wide Delivery</h3>
              <p>Bulk orders delivered across all seven emirates.</p>
            </div>
            <div class="prop">
              <span class="prop__icon">${icon('globe', 'icon icon--lg')}</span>
              <h3>GCC Export</h3>
              <p>Export to the wider GCC available on request — ask us for details when you enquire.</p>
            </div>
            <div class="prop">
              <span class="prop__icon">${icon('clock', 'icon icon--lg')}</span>
              <h3>Indicative Lead Time</h3>
              <p>${esc(site.wholesale.leadTime)}.</p>
            </div>
          </div>
        </div>
      </section>

${valueProps('emerald')}

      <section class="section section--surface">
        <div class="container text-center">
          <span class="eyebrow">Ready to order?</span>
          <h2>Request your wholesale quote today</h2>
          <hr class="rule rule--center">
          <div class="empty__actions mt-6">
            <a class="btn btn--primary" href="/enquiry/">Request a Quote</a>
            <a class="btn btn--secondary" href="/catalogue/">Browse the Catalogue</a>
          </div>
        </div>
      </section>`;

  return page({
    title: 'Wholesale Process',
    description:
      'How wholesale ordering works with Hadaf Venture Trading LLC — minimum order quantity, bulk pricing, lead times and UAE/GCC delivery.',
    active: '/wholesale-process/',
    canonical: '/wholesale-process/',
    body,
  });
}

module.exports = { build };

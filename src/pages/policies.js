'use strict';

/**
 * Policy pages — wholesale trade terms.
 *
 * IMPORTANT: unlike the original consumer-retail legal copy this replaces,
 * the text below is a DRAFT reflecting the pivot to a B2B wholesale model —
 * not lawyer-approved boilerplate. It follows standard UAE wholesale-trade
 * practice (MOQ, quotation-based pricing, bank-transfer payment, claims
 * process) but payment percentages, deposit terms and dispute specifics
 * should be reviewed by a UAE-qualified commercial lawyer against the
 * business's actual negotiated practice before being treated as final.
 */

const { site, esc, page, crumbs, ph, phoneLink } = require('../lib/layout');
const { icon } = require('../lib/icons');

const POLICY_PAGES = [
  { label: 'Delivery & Payment Terms', href: '/delivery-payment-terms/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Trade Terms & Conditions', href: '/trade-terms/' },
];

/**
 * Contact sign-off block used at the end of each policy.
 * `lead` is the policy's own lead-in sentence, placed directly above the
 * address block.
 */
function contactBlock(heading, lead) {
  return `<h2>${heading}</h2>
            ${lead ? `<p>${esc(lead)}</p>\n            ` : ''}<address>
              ${esc(site.legalName)}<br>
              Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br>
              Phone/WhatsApp: ${phoneLink('light')}<br>
              ${ph(site.address, 'light')}, ${esc(site.addressCity)}
            </address>`;
}

function policyNav(current) {
  const links = POLICY_PAGES.map(
    (p) =>
      `<li><a href="${p.href}"${p.href === current ? ' aria-current="page"' : ''}>${esc(
        p.label
      )}</a></li>`
  ).join('\n              ');

  return `<aside class="policy-nav">
            <h2 class="policy-nav__title">Policies</h2>
            <ul>
              ${links}
            </ul>
            <div class="mt-6">
              <h2 class="policy-nav__title">Need help?</h2>
              <ul>
                <li><a href="/faq/">FAQ</a></li>
                <li><a href="/wholesale-process/">Wholesale Process</a></li>
                <li><a href="/contact/">Contact Us</a></li>
              </ul>
            </div>
          </aside>`;
}

/** Shared shell for all three policy pages. */
function policyPage(cfg) {
  const body = `${crumbs([{ label: 'Home', href: '/' }, { label: cfg.title }])}

      <section class="section section--tight">
        <div class="container">
          <div class="page-head">
            <span class="eyebrow">${esc(cfg.eyebrow)}</span>
            <h1>${esc(cfg.title)}</h1>
            ${
              cfg.updated
                ? `<p class="updated mt-4">${icon(
                    'clock',
                    'icon icon--sm'
                  )} Last Updated: ${esc(site.legalUpdated)}</p>`
                : cfg.intro
                ? `<p>${esc(cfg.intro)}</p>`
                : ''
            }
          </div>

          <div class="policy-layout">
            ${policyNav(cfg.canonical)}
            <div class="prose">
${cfg.content}
            </div>
          </div>
        </div>
      </section>`;

  return page({
    title: cfg.title,
    description: cfg.description,
    canonical: cfg.canonical,
    body,
  });
}

/* ================================================================== *
 * Delivery & Payment Terms
 * ================================================================== */
function deliveryPaymentTerms() {
  const content = `              <p><strong>Delivery Area:</strong> ${esc(site.wholesale.supplyRegion)}.</p>

              <p><strong>Lead Time:</strong> ${esc(
                site.wholesale.leadTime
              )}. Exact timelines are confirmed for each order at the time of quotation and depend on order size and stock availability.</p>

              <p><strong>Packaging:</strong> ${esc(site.wholesale.packaging)}.</p>

              <p><strong>Order Processing:</strong> Orders are confirmed in writing (by email or WhatsApp) once a quotation has been accepted. Processing and production begin once the order is confirmed, and a deposit, where applicable, has been received.</p>

              <p><strong>Payment Methods:</strong> Bank transfer is our primary payment method for wholesale orders. Payment terms, including any deposit required before dispatch, are confirmed at the time of quotation for each order. Other payment arrangements may be agreed on a case-by-case basis.</p>

              <p><strong>Order Updates:</strong> Our team will keep you updated on production and delivery status via WhatsApp or email throughout your order.</p>

              <div class="form-note mt-6">
                ${icon('info')}
                <div>Questions about a quotation or delivery in progress? Email us at <a href="mailto:${esc(
                  site.email
                )}">${esc(site.email)}</a> or message us on Phone/WhatsApp: ${ph(
    site.phone,
    'light'
  )}.</div>
              </div>`;

  return policyPage({
    title: 'Delivery & Payment Terms',
    eyebrow: 'Delivery information',
    intro: 'Delivery scope, lead times, packaging and payment terms for wholesale orders placed with ' + site.legalName + '.',
    description: `${site.legalName} delivery and payment terms — UAE and GCC delivery, indicative lead times, standard packaging and bank-transfer wholesale payment.`,
    canonical: '/delivery-payment-terms/',
    content,
  });
}

/* ================================================================== *
 * Privacy Policy
 * ================================================================== */
function privacy() {
  const content = `              <p>${esc(
                site.legalName
              )} ("Hadaf Venture," "we," "us," "our") respects your privacy and is committed to protecting the personal data you share with us when you visit hadafventureforclothing.com (the "Website") or contact us about wholesale supply. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.</p>

              <h2>1. Information We Collect</h2>
              <ul>
                <li><strong>Information you provide directly:</strong> company name, contact person name, email address, phone/WhatsApp number, and any details you include when requesting a quote, submitting a wholesale enquiry, contacting us, or subscribing to updates.</li>
                <li><strong>Enquiry and order information:</strong> products and quantities enquired about, quotations issued, and order history where a wholesale order is confirmed.</li>
                <li><strong>Automatically collected information:</strong> basic technical data such as browser type, device type, and pages visited, collected via cookies and similar technologies to help us understand how the Website is used.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use your information to: respond to wholesale enquiries and prepare quotations; process and fulfil confirmed orders; communicate with you about an enquiry or order (including via WhatsApp, email, or phone); provide customer support; send marketing communications where you have opted in, which you may unsubscribe from at any time; improve and maintain the Website; and comply with applicable legal obligations.</p>

              <h2>3. Legal Basis for Processing</h2>
              <p>We process personal data on the basis of: performing a contract with you (fulfilling a confirmed order); your consent (e.g. marketing communications); and our legitimate business interests (e.g. improving our services), consistent with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and its implementing regulations.</p>

              <h2>4. How We Share Your Information</h2>
              <p>We do not sell your personal data. We may share information with: logistics and freight partners, solely to fulfil confirmed orders; and service providers who support our operations (e.g. hosting, email delivery), under appropriate confidentiality obligations. We may also disclose information where required by applicable UAE law or a valid legal request.</p>

              <h2>5. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to remember your preferences and understand overall Website usage. You can control cookies through your browser settings; disabling cookies may affect some Website functionality.</p>

              <h2>6. Data Retention</h2>
              <p>We retain personal data only for as long as necessary to fulfil the purposes described in this policy, including to meet legal, accounting, or reporting requirements.</p>

              <h2>7. Data Security</h2>
              <p>We take reasonable technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>

              <h2>8. Your Rights</h2>
              <p>Subject to applicable UAE law, you may have the right to request access to, correction of, or deletion of your personal data, and to object to or restrict certain processing, including marketing communications. To exercise these rights, contact us using the details below.</p>

              <h2>9. Children's Privacy</h2>
              <p>The Website is not directed at children, and we do not knowingly collect personal data from children.</p>

              <h2>10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. The latest version will always be published on this Website.</p>

              ${contactBlock(
                '11. Contact Us',
                'For questions about this Privacy Policy or your personal data, contact:'
              )}`;

  return policyPage({
    title: 'Privacy Policy',
    eyebrow: 'Your privacy',
    updated: true,
    description:
      'How ' +
      site.legalName +
      ' collects, uses and protects your personal data, consistent with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021).',
    canonical: '/privacy-policy/',
    content,
  });
}

/* ================================================================== *
 * Trade Terms & Conditions — draft, see file header note
 * ================================================================== */
function tradeTerms() {
  const content = `              <p>These Trade Terms &amp; Conditions ("Terms") govern the supply of goods by ${esc(
                site.legalName
              )} ("Hadaf Venture," "we," "us," "our") to wholesale buyers, including retailers, distributors and boutiques, through hadafventureforclothing.com (the "Website") or by direct enquiry. By submitting an enquiry, requesting a quotation, or placing an order, you agree to these Terms.</p>

              <h2>1. About Us</h2>
              <p>${esc(
                site.legalName
              )} is a garment trading company based in Dubai, United Arab Emirates, supplying quality women's garments in bulk. Trade License No.: ${ph(
                site.tradeLicense,
                'light'
              )}.</p>

              <h2>2. Eligibility</h2>
              <p>The Website is intended for wholesale buyers purchasing in a business capacity — including retailers, distributors and boutiques — rather than individual consumers. By submitting an enquiry or order, you confirm that you are legally capable of entering into a binding contract on behalf of your business and that any information you provide is accurate and complete.</p>

              <h2>3. Products, Samples &amp; Pricing</h2>
              <p>We make every effort to display products and descriptions accurately, but we do not warrant that product descriptions, images, or other content are error-free. Pricing is not published on the Website and is provided by quotation following an enquiry; quotations are valid for ${esc(
                site.wholesale.quoteValidity
              )} unless otherwise stated. ${esc(
    site.wholesale.sampleNote
  )}. We reserve the right to correct pricing or product information errors at any time; changes will not affect orders already confirmed.</p>

              <h2>4. Minimum Order Quantity &amp; Order Acceptance</h2>
              <p>Our standard minimum order quantity is ${esc(
                site.wholesale.moq
              )}. Submitting an enquiry or quotation request constitutes a request to purchase, not a confirmed order. All orders are subject to written acceptance and confirmation by us, which we will communicate via WhatsApp or email. We reserve the right to refuse or cancel any order or quotation, including in cases of suspected fraud, pricing errors, or product unavailability.</p>

              <h2>5. Payment</h2>
              <p>We accept payment by bank transfer for wholesale orders. Payment terms, including any deposit required before production or dispatch, are confirmed at the time of quotation for each order. We do not currently process card payments through the Website.</p>

              <h2>6. Delivery</h2>
              <p>We currently deliver within the United Arab Emirates, with export to the wider GCC available on request. Delivery timelines, packaging and payment terms are set out in our <a href="/delivery-payment-terms/">Delivery &amp; Payment Terms</a>, which forms part of these Terms.</p>

              <h2>7. Quality, Claims &amp; Defects</h2>
              <p>Goods are checked before dispatch. If you receive goods that are damaged, defective, incomplete, incorrect, or materially different from their description, please contact us as soon as possible and provide your order reference, a description of the issue, and clear photographs of the goods and packaging. We will review the issue and, where appropriate, arrange a replacement, credit, or refund in accordance with applicable UAE law.</p>

              <h2>8. Cancellations &amp; Changes to Confirmed Orders</h2>
              <p>Once an order has been confirmed and production has commenced, it may not be cancelled or amended without our agreement. Deposits paid on a confirmed order may be non-refundable where production or procurement has already begun, except where the cancellation is due to our own error or a defect in the goods.</p>

              <h2>9. Intellectual Property</h2>
              <p>All content on the Website, including text, graphics, logos, and images, is the property of ${esc(
                site.name
              )} or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use this content without our prior written consent.</p>

              <h2>10. Acceptable Use</h2>
              <p>You agree not to misuse the Website, including by attempting to gain unauthorized access to it, interfering with its normal operation, or using it for any unlawful purpose.</p>

              <h2>11. Limitation of Liability</h2>
              <p>To the fullest extent permitted by applicable UAE law, ${esc(
                site.name
              )} shall not be liable for any indirect, incidental, or consequential damages (including loss of profit or business) arising from your use of the Website or the purchase of goods, except where such liability cannot be excluded by law.</p>

              <h2>12. Governing Law</h2>
              <p>These Terms are governed by the laws of the United Arab Emirates. Any disputes arising from these Terms or your use of the Website shall be subject to the exclusive jurisdiction of the competent courts of the United Arab Emirates.</p>

              <h2>13. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. The latest version will always be published on this Website, and continued use of the Website after changes constitutes acceptance of the updated Terms.</p>

              ${contactBlock('14. Contact Us')}`;

  return policyPage({
    title: 'Trade Terms & Conditions',
    eyebrow: 'Wholesale terms of trade',
    updated: true,
    description: `Trade Terms & Conditions governing wholesale supply by ${site.legalName}, including MOQ, quotation-based pricing and order policy, under the laws of the United Arab Emirates.`,
    canonical: '/trade-terms/',
    content,
  });
}

module.exports = { deliveryPaymentTerms, privacy, tradeTerms };

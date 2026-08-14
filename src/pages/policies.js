'use strict';

/**
 * Policy pages — Specification Sections 6.10 – 6.13.
 *
 * IMPORTANT: the copy in this file is the FINAL, APPROVED legal text from
 * Specification Sections 9.1 (Return & Refund), 9.2 (Privacy) and 9.3 (Terms &
 * Conditions), plus 6.10 (Shipping & Delivery), reproduced verbatim. Markdown
 * emphasis has been converted to markup and the bracketed Section 11
 * placeholders are rendered through ph() so they display as intended — the
 * wording itself is unchanged. Do not paraphrase, reorder, summarise or
 * "improve" any of it. If the client issues revised copy, replace the strings
 * here wholesale rather than editing them in place.
 */

const { site, esc, page, crumbs, ph, phoneLink } = require('../lib/layout');
const { icon } = require('../lib/icons');

const POLICY_PAGES = [
  { label: 'Shipping & Delivery Policy', href: '/shipping-policy/' },
  { label: 'Return & Refund Policy', href: '/returns-policy/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms & Conditions', href: '/terms-conditions/' },
];

/**
 * Contact sign-off block used verbatim at the end of each policy.
 * `lead` is the policy's own lead-in sentence, which the spec places directly
 * above the address block — keep that order.
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
                <li><a href="/contact/">Contact Us</a></li>
              </ul>
            </div>
          </aside>`;
}

/** Shared shell for all four policy pages. */
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
 * 6.10 Shipping & Delivery Policy — final copy
 * ================================================================== */
function shipping() {
  const content = `              <p><strong>Delivery Area:</strong> We currently deliver across the United Arab Emirates only.</p>

              <p><strong>Delivery Time:</strong> Standard delivery takes 4–5 working days from order confirmation.</p>

              <p><strong>Delivery Fee:</strong> AED 15.00 for orders under AED 150.00. Free delivery for orders of AED 150.00 or more.</p>

              <p><strong>Order Processing:</strong> Orders are confirmed by our team via WhatsApp or email after checkout. Processing begins once your order is confirmed.</p>

              <p><strong>Order Updates:</strong> As we grow, order tracking will be added. For now, our team will keep you updated on your delivery via WhatsApp or email.</p>

              <div class="form-note mt-6">
                ${icon('info')}
                <div>Questions about a delivery in progress? Email us at <a href="mailto:${esc(
                  site.email
                )}">${esc(site.email)}</a> or message us on Phone/WhatsApp: ${ph(
    site.phone,
    'light'
  )}.</div>
              </div>`;

  return policyPage({
    title: 'Shipping & Delivery Policy',
    eyebrow: 'Delivery information',
    intro: 'Delivery scope, timelines and fees for orders placed on hadafventureforclothing.com.',
    description:
      'Hadaf Venture delivers across the United Arab Emirates in 4–5 working days. AED 15.00 delivery under AED 150.00, free delivery on orders of AED 150.00 or more.',
    canonical: '/shipping-policy/',
    content,
  });
}

/* ================================================================== *
 * 9.1 Return & Refund Policy — VERBATIM
 * ================================================================== */
function returns() {
  const content = `              <p>At ${esc(
                site.legalName
              )} ("Hadaf Venture"), we want you to be satisfied with your purchase. If you need to return an eligible item, please review the following policy.</p>

              <h2>1. Return Period</h2>
              <p>Customers may request a return within 7 days of receiving their order. To be eligible for a return, the item must be:</p>
              <ul>
                <li>Unused and in its original condition.</li>
                <li>In its original packaging.</li>
                <li>Complete with all original tags, labels, and accessories where applicable.</li>
                <li>Free from damage, stains, marks, or signs of use.</li>
                <li>Accompanied by the order details or proof of purchase.</li>
              </ul>

              <h2>2. Fashion &amp; Garment Returns</h2>
              <p>Garments may be returned within the 7-day return period provided they are unused, unworn, unwashed, and returned with their original tags and packaging intact. For hygiene reasons, items that have been worn, washed, altered, damaged, or otherwise used may not be accepted for return.</p>

              <h2>3. Cosmetics &amp; Beauty Products</h2>
              <p>For hygiene and safety reasons, cosmetics, beauty, skincare, haircare, fragrances, and other personal-care products should be returned unopened, unused, and in their original sealed packaging. Once a cosmetic or personal-care product has been opened or used, it will generally not be eligible for return unless the product is defective, damaged, incorrect, or otherwise does not match the order.</p>

              <h2>4. Damaged, Defective, or Incorrect Items</h2>
              <p>If you receive an item that is damaged, defective, incomplete, incorrect, or materially different from its description, please contact us as soon as possible. Please provide: your order number; a description of the issue; clear photographs of the item and packaging; any other information reasonably required to assess the issue. We will review the issue and, where appropriate, arrange a replacement, return, or refund in accordance with applicable UAE consumer-protection requirements.</p>

              <h2>5. Items Not Eligible for Return</h2>
              <p>A return may not be accepted where:</p>
              <ul>
                <li>The item has been used, worn, washed, or altered.</li>
                <li>Original tags or packaging have been removed or damaged.</li>
                <li>The product has been opened where the product is subject to hygiene restrictions.</li>
                <li>The item has been damaged after delivery due to customer use or handling.</li>
                <li>The return request is made after the applicable return period, except where applicable law provides otherwise.</li>
              </ul>

              <h2>6. How to Request a Return</h2>
              <p>To request a return, contact us at:</p>
              <ul>
                <li>Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
                <li>WhatsApp/Phone: ${phoneLink('light')}</li>
              </ul>
              <p>Please include your order number, name, item(s) you wish to return, and reason for the return. Our customer service team will provide the next steps after reviewing your request.</p>

              <h2>7. Return Inspection</h2>
              <p>Returned items may be inspected before a refund or replacement is approved. If the returned item does not meet the applicable return conditions, we may contact you regarding the issue and the available options.</p>

              <h2>8. Refunds</h2>
              <p>Once an eligible return has been received and approved, the applicable refund will be processed using the appropriate payment method. For Cash on Delivery orders, we will contact the customer to confirm the appropriate refund arrangement. Any refund timing may depend on the payment provider or banking institution where applicable.</p>

              <h2>9. Delivery Charges</h2>
              <p>Any applicable delivery or return-collection charges will be communicated to the customer during the return process. Where an item is returned because it is defective, damaged, incorrect, or materially different from its description, Hadaf Venture will handle the matter in accordance with applicable UAE consumer-protection requirements.</p>

              <h2>10. Changes to This Policy</h2>
              <p>Hadaf Venture reserves the right to update this Return &amp; Refund Policy when necessary. The latest version will always be published on this website.</p>

              ${contactBlock(
                '11. Contact Us',
                'For questions regarding returns or refunds, please contact:'
              )}`;

  return policyPage({
    title: 'Return & Refund Policy',
    eyebrow: 'Returns & refunds',
    updated: true,
    description:
      'Hadaf Venture Return & Refund Policy — 7-day returns on unused items in original packaging. Cosmetics must be unopened and unused.',
    canonical: '/returns-policy/',
    content,
  });
}

/* ================================================================== *
 * 9.2 Privacy Policy — VERBATIM
 * ================================================================== */
function privacy() {
  const content = `              <p>${esc(
                site.legalName
              )} ("Hadaf Venture," "we," "us," "our") respects your privacy and is committed to protecting the personal data you share with us when you visit or shop on hadafventureforclothing.com (the "Website"). This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.</p>

              <h2>1. Information We Collect</h2>
              <ul>
                <li><strong>Information you provide directly:</strong> name, email address, phone/WhatsApp number, delivery address, and any details you include when placing an order, contacting us, or subscribing to our newsletter.</li>
                <li><strong>Order information:</strong> items purchased, order value, and order history.</li>
                <li><strong>Automatically collected information:</strong> basic technical data such as browser type, device type, and pages visited, collected via cookies and similar technologies to help us understand how the Website is used.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use your information to: process and fulfil orders; communicate with you about your order (including via WhatsApp, email, or phone); respond to enquiries and provide customer support; send marketing communications where you have opted in, which you may unsubscribe from at any time; improve and maintain the Website; and comply with applicable legal obligations.</p>

              <h2>3. Legal Basis for Processing</h2>
              <p>We process personal data on the basis of: performing a contract with you (fulfilling your order); your consent (e.g. marketing communications); and our legitimate business interests (e.g. improving our services), consistent with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and its implementing regulations.</p>

              <h2>4. How We Share Your Information</h2>
              <p>We do not sell your personal data. We may share information with: delivery/courier partners, solely to fulfil your order; payment service providers, once card payment is enabled, solely to process transactions; and service providers who support our operations (e.g. hosting, email delivery), under appropriate confidentiality obligations. We may also disclose information where required by applicable UAE law or a valid legal request.</p>

              <h2>5. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to keep your cart contents saved between visits, remember your preferences, and understand overall Website usage. You can control cookies through your browser settings; disabling cookies may affect some Website functionality (such as your cart).</p>

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
      'How Hadaf Venture collects, uses and protects your personal data, consistent with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021).',
    canonical: '/privacy-policy/',
    content,
  });
}

/* ================================================================== *
 * 9.3 Terms & Conditions — VERBATIM
 * ================================================================== */
function terms() {
  // Section 5 is the one clause the spec explicitly ties to whether a live
  // card gateway exists (Section 9.3 §5: "will be clearly indicated as
  // available on the Website once active") — kept in lockstep with the same
  // STRIPE_SECRET_KEY check that gates the checkout UI, so this text can
  // never say more than the site actually does.
  const cardEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
  const paymentClause = cardEnabled
    ? 'We accept Cash on Delivery and debit/credit card payments for all orders within the UAE. Card payments are processed securely by our payment provider, Stripe; we do not store or have access to your full card details.'
    : 'At present, we accept Cash on Delivery for all orders within the UAE. Card payment will be introduced in the future and will be clearly indicated as available on the Website once active. We do not currently store or process card payment details.';

  const content = `              <p>These Terms &amp; Conditions ("Terms") govern your use of hadafventureforclothing.com (the "Website") and any purchase made through it. By using the Website or placing an order, you agree to these Terms.</p>

              <h2>1. About Us</h2>
              <p>${esc(
                site.legalName
              )} ("Hadaf Venture") is an online fashion and beauty retailer based in Dubai, United Arab Emirates. Trade License No.: ${ph(
                site.tradeLicense,
                'light'
              )}.</p>

              <h2>2. Eligibility</h2>
              <p>By using the Website, you confirm that you are legally capable of entering into a binding contract and that any information you provide is accurate and complete.</p>

              <h2>3. Products and Pricing</h2>
              <p>All prices are displayed in UAE Dirhams (AED), inclusive of applicable taxes unless stated otherwise. We make every effort to display products and descriptions accurately, but we do not warrant that product descriptions, images, or other content are error-free. We reserve the right to correct pricing or product information errors and to update prices at any time without prior notice; changes will not affect orders already confirmed.</p>

              <h2>4. Orders</h2>
              <p>Placing an order through the Website constitutes an offer to purchase. All orders are subject to acceptance and confirmation by us, which we will communicate via WhatsApp or email. We reserve the right to refuse or cancel any order, including in cases of suspected fraud, pricing errors, or product unavailability.</p>

              <h2>5. Payment</h2>
              <p>${paymentClause}</p>

              <h2>6. Delivery</h2>
              <p>We currently deliver within the United Arab Emirates only. Delivery timelines and fees are set out in our <a href="/shipping-policy/">Shipping &amp; Delivery Policy</a>, which forms part of these Terms.</p>

              <h2>7. Returns and Refunds</h2>
              <p>Returns and refunds are governed by our <a href="/returns-policy/">Return &amp; Refund Policy</a>, which forms part of these Terms.</p>

              <h2>8. Intellectual Property</h2>
              <p>All content on the Website, including text, graphics, logos, and images, is the property of Hadaf Venture or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use this content without our prior written consent.</p>

              <h2>9. Acceptable Use</h2>
              <p>You agree not to misuse the Website, including by attempting to gain unauthorized access to it, interfering with its normal operation, or using it for any unlawful purpose.</p>

              <h2>10. Limitation of Liability</h2>
              <p>To the fullest extent permitted by applicable UAE law, Hadaf Venture shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Website or purchase of products, except where such liability cannot be excluded by law.</p>

              <h2>11. Governing Law</h2>
              <p>These Terms are governed by the laws of the United Arab Emirates. Any disputes arising from these Terms or your use of the Website shall be subject to the exclusive jurisdiction of the competent courts of the United Arab Emirates.</p>

              <h2>12. Changes to These Terms</h2>
              <p>We may update these Terms from time to time. The latest version will always be published on this Website, and continued use of the Website after changes constitutes acceptance of the updated Terms.</p>

              ${contactBlock('13. Contact Us')}`;

  return policyPage({
    title: 'Terms & Conditions',
    eyebrow: 'Terms of use and sale',
    updated: true,
    description:
      'Terms & Conditions governing use of hadafventureforclothing.com and any purchase made through it, under the laws of the United Arab Emirates.',
    canonical: '/terms-conditions/',
    content,
  });
}

module.exports = { shipping, returns, privacy, terms };

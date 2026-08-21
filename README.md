# Hadaf Venture Trading — Wholesale Garment Website

Production website for **Hadaf Venture Trading LLC**, a wholesale garment supplier based in
Dubai, UAE, serving retailers, distributors and boutiques across the UAE and GCC.

- **Domain:** hadafventureforclothing.com
- **Tagline:** Wholesale Garment Supplier in the UAE

This is a **B2B catalogue and lead-generation site, not a retail store.** There is no cart,
checkout or payment processing — pricing is quotation-based ("Price on Request"), and every
product page drives toward a **Request a Quote** form or a **WhatsApp enquiry**. See §6 for
why, and what a future e-commerce/buyer-portal layer would need.

The site is a **fully static build**: 11 page templates, 21 garment products, no server
runtime, no database, no external services. It deploys to any static host.

---

## 1. Running it locally

Requires **Node.js 16+** and nothing else — there are **zero npm dependencies**.

```bash
npm run build
```

That renders the whole site into `dist/`. To build and preview in one step:

```bash
npm start
```

Then open **http://localhost:4173**.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Clean rebuild into `dist/` |
| `npm start` | Build, then serve `dist/` at :4173 |
| `npm run serve` | Serve the existing `dist/` without rebuilding |
| `node serve.js 8080` | Serve on a specific port |

> `serve.js` is a local convenience only. Production needs no Node process —
> `dist/` is plain HTML, CSS, JS and SVG. There are no serverless functions in
> this build (an earlier Stripe checkout integration was removed as part of
> the wholesale pivot — see §6).

**Note on opening files directly:** pages reference assets from the site root
(`/assets/...`), so open the site through `npm start` rather than
double-clicking `dist/index.html`.

---

## 2. Deploying

**Deploy the `dist/` folder.** Nothing else needs to be uploaded.

### Netlify / Cloudflare Pages / Vercel

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish / output directory | `dist` |
| Node version | 16 or newer |

`dist/_redirects` is generated automatically, covering both the styled 404 page
and 301 redirects from the site's earlier retail-era URLs (`/shop/`, `/cart/`,
`/checkout/`, the old policy page names) to their nearest wholesale equivalent.

### Traditional / cPanel shared hosting

Run `npm run build` locally, then upload the **contents** of `dist/` into
`public_html/`. A `.htaccess` is generated with the same redirects, the 404
handler, pretty-URL redirects and gzip compression already configured.

### Pointing the domain

Add the DNS records your host specifies for `hadafventureforclothing.com`
(typically an `A` record for the apex and a `CNAME` for `www`). Enable the
host's free TLS certificate. The site is already canonical-tagged to
`https://hadafventureforclothing.com`.

---

## 3. Where to update business details and wholesale policy

**Everything lives in one file: [`src/data/site.json`](src/data/site.json).**
Edit the value, run `npm run build`, redeploy. Every page picks the change up —
nothing is hard-coded per page.

| Item | Key in `site.json` | Appears on |
|---|---|---|
| Phone / WhatsApp number | `phone`, `phoneIntl` | Footer, Contact, every product page, Enquiry page, Delivery & Payment Terms, WhatsApp deep links site-wide |
| Registered Dubai address | `address` | Footer, Contact (incl. the map embed), legal pages |
| Trade License number | `tradeLicense` | Footer, Trade Terms & Conditions §1 |
| Business hours | `businessHours` | Contact Us |
| Legal entity name | `legalName` | Footer, legal-document letterhead and self-identification sentences, structured data |
| Social media handles | `social[].href` | Footer, Contact Us (currently `#`) |
| **MOQ** | `wholesale.moq` | Every product page, catalogue, Wholesale Process, About, FAQ, Trade Terms |
| **Packaging** | `wholesale.packaging` | Every product page, Wholesale Process, Delivery & Payment Terms |
| **Lead time** | `wholesale.leadTime` | Homepage, every product page, Wholesale Process, FAQ, Delivery & Payment Terms |
| **Supply region (UAE/GCC)** | `wholesale.supplyRegion` | Homepage, every product page, Wholesale Process, FAQ, Delivery & Payment Terms |
| **Quote validity** | `wholesale.quoteValidity` | Enquiry page, Trade Terms & Conditions |
| **Sample availability note** | `wholesale.sampleNote` | Wholesale Process, FAQ, Trade Terms |
| WhatsApp message templates | `whatsappTemplates.general` / `.product` | Every WhatsApp CTA site-wide (the product one has `{name}`/`{sku}` placeholders) |

These `wholesale.*` values are **sensible starting defaults**, not fabricated
per-product figures — update them here once real MOQ, packaging and lead-time
policy is confirmed, and every page that mentions them updates automatically.

Values written in `[square brackets]` are **intentionally visible** on the live
site, styled in champagne so they read as deliberate rather than broken.
Replace the string with the real value; do not delete the key.

### Real product photography

21 of 21 products have real photography as of this build. To add or replace a
product's photos, drop the files into
[`src/data/product-photos/`](src/data/product-photos/) named
`{product-id}-1.jpg` (and `-2`, `-3` — jpg/jpeg/png/webp all work), matching
the **4:5** aspect ratio used for garments, then `npm run build`.
`src/lib/real-photos.js` detects the files automatically and every page, card
and JSON-LD block that references the product picks it up with no further
changes. A product with **any** real photo uses *only* its real photos, never
mixed with a generated placeholder within the same gallery.

Beauty product photos from before the pivot (`hv-be-*` files) are left in
`src/data/product-photos/` and `src/data/brand-photos/`, unreferenced — they
aren't deleted in case a beauty line returns later, but nothing on the live
site loads them today.

### Brand banners

Same swap-in mechanism, applied to `src/lib/banners.js`'s generated visuals.
Drop a file into [`src/data/brand-photos/`](src/data/brand-photos/) named
after the banner's logical key — `hero-home`, `banner-about`,
`banner-catalogue`, `banner-wholesale-process`, `cat-dresses`, `cat-coords`,
`cat-abayas`, `cat-tops`, `tile-fashion`, or `og-image` — and `npm run build`
picks it up via `src/lib/real-banners.js`. 6 of 10 banner slots have real
photography as of this build.

---

## 4. Project structure

```
build.js                  Static site generator (zero dependencies)
serve.js                  Local preview server
src/
  data/
    products.json         The 21-product garment catalogue — single source of truth
    site.json             Business details, Section-11 placeholders, wholesale policy
    product-photos/       Real product photography (+ dormant hv-be-* beauty photos)
    brand-photos/         Real banner photography
  lib/
    layout.js             Page shell: <head>, announcement bar, header, drawer, footer
    components.js         Product card, grids, rails, section headers, empty states
    products.js            Catalog data layer: slugs, image paths, feature + MOQ rows
    images.js             Generated placeholder visual system (used only if a product
                          has no real photo yet — none currently need it)
    banners.js            Hero, category tile and share-card visuals
    real-photos.js        Real-photo swap-in lookup for products
    real-banners.js       Real-photo swap-in lookup for banners
    icons.js              The single line-style icon set (1.5px stroke)
  pages/
    home.js  catalogue.js  product.js  enquiry.js  wholesale-process.js
    content.js (About/Contact/FAQ/404)  policies.js (legal pages)
  assets/
    css/main.css          The complete design system
    js/                   site.js, catalogue.js, product.js, enquiry.js, contact.js
dist/                     Build output — this is what you deploy
```

### The 11 pages

| Page | URL |
|---|---|
| Homepage | `/` |
| Wholesale Catalogue | `/catalogue/` |
| Product Detail (template → 21 pages) | `/product/{slug}/` |
| Request a Quote / Wholesale Enquiry | `/enquiry/` |
| Wholesale Process | `/wholesale-process/` |
| About Us | `/about/` |
| Contact Us | `/contact/` |
| FAQ | `/faq/` |
| Delivery & Payment Terms | `/delivery-payment-terms/` |
| Privacy Policy | `/privacy-policy/` |
| Trade Terms & Conditions | `/trade-terms/` |
| 404 Not Found | `/404.html` |

The Size Guide is a reusable modal component (not a route), triggered from any
product page and from the FAQ.

### Editing the catalog

Edit `src/data/products.json` and rebuild. Slugs, URLs, image paths, feature
bullets, filters, related products, the sitemap and all product pages are
derived automatically. **Never hand-write product markup.**

---

## 5. Product imagery

`src/lib/images.js` can still generate a consistent studio-style SVG visual
for any product that has no real photography yet (garments only, 4:5 canvas,
driven by `colorTheme`/`accentTheme`) — the same fallback system used during
the original build. All 21 current products already have real photography, so
this path isn't currently exercised, but it activates automatically the
moment a new product is added without photos.

---

## 6. Why there's no cart, accounts, or tiered pricing (and what a v2 would need)

This is a **deliberate, current-stage decision**, not a placeholder waiting on
a backend:

> "I do not want buyer accounts, automatic tiered pricing or a complex B2B
> ordering system at this stage. Orders and quotations can be handled
> manually through the website form, email and WhatsApp. We can add a full
> buyer portal later once the business has enough wholesale volume."

So today:

| Area | Now | Later (once volume justifies it) |
|---|---|---|
| **Pricing** | "Price on Request" everywhere; no published prices | A tiered/bulk pricing engine, possibly gated behind buyer login |
| **Ordering** | Request a Quote form (`/enquiry/`) → `mailto:` → handled manually by email/WhatsApp | A real quotation/PO system with buyer accounts and order history |
| **Buyers** | Anonymous — anyone can submit an enquiry | Registered/verified wholesale buyer accounts |
| **Contact form** | Validates, then opens the customer's email client pre-filled (`mailto:` approach) | Replace `buildMailto()` in `src/assets/js/enquiry.js` / `contact.js` with a `fetch()` POST to a real backend |
| **Newsletter** | Validates the address and confirms interest — never claims to have sent anything | POST to a real list provider in `src/assets/js/site.js` (`initNewsletter`) |

A previous iteration of this site included a full retail cart, checkout and a
working Stripe card-payment integration (test-mode verified end to end). Both
were **fully removed** as part of this pivot — a checkout doesn't fit a
quotation-based wholesale model, and keeping unused payment-processing code
live was an unnecessary surface area. That work is preserved in git history if
a future retail or D2C storefront is ever needed alongside the wholesale
catalogue.

---

## 7. Wholesale policy encoded in the build

Change these in `src/data/site.json`'s `wholesale` block; they are not
duplicated anywhere else (see §3 for the full list of keys and where each
appears).

| Rule | Current value |
|---|---|
| Minimum order quantity | 50 pieces per style (mixed sizes/colours accepted) |
| Packaging | Polybagged with barcode label, packed in bulk cartons |
| Lead time | Typically 2–4 weeks for bulk orders (indicative, confirmed per quotation) |
| Supply region | UAE-wide, GCC export on request |
| Quote validity | 7 days from date of issue |

These are **sensible starting defaults**, written to be genuinely useful on
day one without fabricating false precision — update them the moment real
policy is confirmed.

---

## 8. Design system

Defined once in [`src/assets/css/main.css`](src/assets/css/main.css) and applied
across all 11 pages: the Emerald & Champagne palette as CSS custom properties,
the type scale (Playfair Display headings / Poppins body), the 4→96px spacing
scale, radii (4px controls, 12px cards, full-round pills), one elevation style,
and one line-style icon set at 1.5px stroke.

**Responsive:** mobile-first, verified with no horizontal overflow and 44px
minimum touch targets at 320, 375, 414, 480, 640, 768, 900, 1024, 1280, 1440 and
1920px. Product grids run 1 column below 480px, 2 up to 1023px and 4 at 1024px
and above; the header collapses to a hamburger drawer below 1024px.

**Accessibility:** WCAG AA text contrast, a skip link, visible champagne focus
rings, labelled form fields with inline validation, `aria-current` on active
navigation, keyboard-dismissable drawer and modal, and `prefers-reduced-motion`
support.

---

## 9. Notes for the client

- **The legal pages are a draft, not lawyer-approved boilerplate.** Unlike the
  original consumer-retail legal copy (which was finalized, client-approved
  text), the Trade Terms & Conditions, Delivery & Payment Terms and Privacy
  Policy in [`src/pages/policies.js`](src/pages/policies.js) were drafted to
  reflect the wholesale pivot, following standard UAE trade-practice
  conventions (MOQ, quotation-based pricing, bank-transfer payment, a claims
  process). Payment percentages, deposit terms and dispute specifics should be
  reviewed by a UAE-qualified commercial lawyer against the business's actual
  negotiated practice before being treated as final.
- The bracketed `[To be added]` values are **intentional and styled** — they
  are not bugs. Fill them in via `src/data/site.json` (§3 above).
- Cosmetic-specific catalogue fields (shade, ingredients, etc.) no longer
  render anywhere, since the catalogue is garments-only — the Beauty products
  themselves are removed from `products.json`, not merely hidden.
- The Contact page shows a styled "Map available once our address is
  confirmed" block instead of a map pin, until a real address exists (it
  currently shows a real embed, since a real address has been provided).
- Every WhatsApp button site-wide opens a real chat with a pre-filled message
  — there is nothing to configure beyond keeping `phone`/`phoneIntl` in
  `site.json` current.

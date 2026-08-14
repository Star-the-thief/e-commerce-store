# Hadaf Venture — E-Commerce Website

Production website for **Hadaf Venture**, a fashion and beauty retailer based in Dubai, UAE.

- **Domain:** hadafventureforclothing.com
- **Tagline:** Everyday Style, Effortless Beauty.
- **Built from:** `Hadaf_Venture_Website_Specification.md` (Version 3 — Final, Implementation Ready)

The site is a **fully static build**: 16 page templates, 38 products, no server runtime, no
database, no external services. It deploys to any static host.

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
> `dist/` is plain HTML, CSS, JS and SVG.

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

`dist/_redirects` is generated automatically so unknown URLs serve the styled
404 page on Netlify and Cloudflare Pages.

### Traditional / cPanel shared hosting

Run `npm run build` locally, then upload the **contents** of `dist/` into
`public_html/`. A `.htaccess` is generated with the 404 handler, pretty-URL
redirects and gzip compression already configured.

### Pointing the domain

Add the DNS records your host specifies for `hadafventureforclothing.com`
(typically an `A` record for the apex and a `CNAME` for `www`). Enable the
host's free TLS certificate. The site is already canonical-tagged to
`https://hadafventureforclothing.com`.

---

## 3. Where to update the Section 11 placeholder items

**Everything outstanding lives in one file: [`src/data/site.json`](src/data/site.json).**
Edit the value, run `npm run build`, redeploy. Every page picks the change up —
nothing is hard-coded per page.

Values written in `[square brackets]` are **intentionally visible** on the live
site, styled in champagne so they read as deliberate rather than broken (per
Specification Section 1). Replace the string with the real value; do not delete
the key.

| Section 11 item | Key in `site.json` | Appears on |
|---|---|---|
| Phone / WhatsApp number | `phone` | Footer, Contact, Returns policy, Privacy policy, Terms, mobile drawer, Shipping policy |
| Registered Dubai address | `address` | Footer, Contact, Returns policy, Privacy policy, Terms |
| Trade License number | `tradeLicense` | Footer bottom bar, Terms & Conditions §1 |
| Business hours | `businessHours` | Contact Us |
| Social media handles | `social[].href` | Footer, Contact Us (currently `#`) |

### The remaining Section 11 items

**Real product photography.** In progress — 12 of 38 products (23 of the ~76
minimum images) have real photography as of this build; the rest still show
the generated placeholder visuals until more arrive.

To add or replace a product's photos, drop the files into
[`src/data/product-photos/`](src/data/product-photos/) named
`{product-id}-1.jpg` (and `-2`, `-3` — jpg/jpeg/png/webp all work), matching
the aspect ratio used elsewhere (**garments 4:5**, **cosmetics 1:1**), then
`npm run build`. That's the only step — `src/lib/real-photos.js` detects the
files automatically, `src/lib/products.js` swaps them into that product's
gallery, and every page, card and JSON-LD block that references the product
picks it up with no further changes.

A product with **any** real photo uses *only* its real photos (never mixed
with a generated one) — so a product with just 1 of its eventual 2–3 photos
will show a single-image gallery in the meantime, rather than pairing a real
photo with a cartoon one. That's intentional: an honest partial gallery beats
an inconsistent one (Spec 2).

**Live card payment gateway.** Integrated — see §10 below. It's off by default
(Card Payment shows disabled/"Coming Soon") until a Stripe secret key is added.

**Order tracking / backend.** See §6 below.

---

## 4. Project structure

```
build.js                  Static site generator (zero dependencies)
serve.js                  Local preview server
src/
  data/
    products.json         The 38-product catalog (Appendix A) — single source of truth
    site.json             Business details + all Section 11 placeholders
  lib/
    layout.js             Page shell: <head>, announcement bar, header, drawer, footer
    components.js         Product card, grids, rails, section headers, empty states
    products.js           Catalog data layer: slugs, image paths, feature bullets
    images.js             Product imagery system (Spec 3.5)
    banners.js            Hero, category tiles and share-card visuals
    icons.js              The single line-style icon set (1.5px stroke)
  pages/
    home.js  shop.js  product.js  commerce.js  content.js  policies.js
  assets/
    css/main.css          The complete design system (Spec 3)
    js/                   site.js, shop.js, product.js, cart.js, checkout.js,
                          confirmation.js, contact.js
dist/                     Build output — this is what you deploy
```

### The 16 pages

| # | Page | URL |
|---|---|---|
| 1 | Homepage | `/` |
| 2 | Shop — All Products | `/shop/` |
| 3 | Shop — Fashion | `/shop/fashion/` |
| 4 | Shop — Beauty | `/shop/beauty/` |
| 5 | Product Detail (template → 38 pages) | `/product/{slug}/` |
| 6 | Cart | `/cart/` |
| 7 | Checkout | `/checkout/` |
| 8 | Order Confirmation | `/order-confirmation/` |
| 9 | About Us | `/about/` |
| 10 | Contact Us | `/contact/` |
| 11 | FAQ | `/faq/` |
| 12 | Shipping & Delivery Policy | `/shipping-policy/` |
| 13 | Return & Refund Policy | `/returns-policy/` |
| 14 | Privacy Policy | `/privacy-policy/` |
| 15 | Terms & Conditions | `/terms-conditions/` |
| 16 | 404 Not Found | `/404.html` |

The Size Guide is a reusable modal component (not a route), triggered from any
garment product page and from the FAQ.

### Editing the catalog

Edit `src/data/products.json` and rebuild. Slugs, URLs, image paths, feature
bullets, filters, related products, the sitemap and all 38 product pages are
derived automatically. **Never hand-write product markup.**

---

## 5. Product imagery

There is no product photography yet, so `src/lib/images.js` generates a
consistent studio-style SVG visual for every product — 3 per product, 114 total —
driven by each item's `colorTheme` and `accentTheme` from the catalog.

Every image shares one backdrop treatment, one lighting model (light from the
upper-left), one champagne brand halo and one contact shadow, so the catalog
reads as a single commissioned set:

- **View 1** — front-facing product shot
- **View 2** — styled presentation with a companion element
- **View 3** — macro material / texture detail with colour swatches

Canvases follow the spec: garments **1000×1250** (4:5), cosmetics **1000×1000** (1:1).
These are vectors, so they stay crisp at any size and add very little page weight.

---

## 6. What is deferred to post-launch (no backend yet)

The front end is complete and behaves like a real store. These four points are
where a backend plugs in later — each is marked with a `TODO(backend)` comment in
the code:

| Area | Now | Later |
|---|---|---|
| **Cart** | Persisted in `localStorage` | Optional server-side cart. Replace the read/write in `HV.cart` (`src/assets/js/site.js`) |
| **Orders** | Order object written to a `localStorage` log; Order Confirmation reads the most recent one | `POST` the order to a real API in `src/assets/js/checkout.js`, and clear the cart only once the server confirms |
| **Contact form** | Validates, then opens the customer's email client pre-filled to info@hadafventureforclothing.com (`mailto:` approach, Spec 7.4a) | Replace `buildMailto()` in `src/assets/js/contact.js` with a `fetch()` POST to Formspree or a serverless function |
| **Newsletter** | Validates the address and confirms interest — it never claims to have sent anything | POST to a real list provider in `src/assets/js/site.js` (`initNewsletter`) |

Also deferred, by design:

- **Card payment** — integrated (Stripe, see §10), but off until a secret key is
  configured. Until then it shows exactly as originally spec'd: visible,
  disabled, marked "Coming Soon", and every order records `Cash on Delivery`.
- **Promo codes** — the input is present and tells the customer honestly that no
  codes are currently active. It never silently accepts an invalid code.
- **Order tracking** — the Shipping policy and FAQ both state that the team
  confirms and updates orders by WhatsApp or email for now.

---

## 7. Business rules encoded in the build

Change these in `src/data/site.json`; they are not duplicated anywhere.

| Rule | Value |
|---|---|
| Currency | AED, always displayed with 2 decimals (`149.00 AED`) |
| Delivery fee | AED 15.00 when the subtotal is under AED 150.00 |
| Free delivery | Subtotal of AED 150.00 **or above** (150.00 exactly qualifies) |
| Delivery scope | UAE only, 4–5 working days |
| Returns | 7 days, unused and unopened items only |
| Payment | Cash on Delivery always live; Card Payment live once Stripe is configured (§10), "Coming Soon" until then |

Price formatting flows through a single function in each layer — `money()` in
`src/lib/layout.js` at build time and `HV.money()` at runtime — so no page can
drift to a different format.

---

## 8. Design system

Defined once in [`src/assets/css/main.css`](src/assets/css/main.css) and applied
across all 16 pages: the Emerald & Champagne palette as CSS custom properties,
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

- The bracketed `[To be added]` values are **intentional and styled**, confirmed
  in Specification Section 1 — they are not bugs. Fill them in via
  `src/data/site.json` (§3 above).
- The Return & Refund Policy, Privacy Policy and Terms & Conditions contain the
  final approved copy from Specification Section 9, reproduced verbatim and
  verified against the source document. If the wording needs to change, replace
  the whole string in `src/pages/policies.js` rather than editing in place.
- Cosmetic products deliberately carry **no country-of-origin or manufacturer
  field**, per Specification Section 1.
- The Contact page shows a styled "Map available once our address is confirmed"
  block instead of a map pin, until a real address exists.

---

## 10. Card payments (Stripe)

Card Payment at checkout is fully built and gated behind one environment
variable. With it unset, the site behaves exactly as originally spec'd (Card
disabled, "Coming Soon"). Set it, redeploy, and Card Payment goes live —
nothing else to change.

### How it works

1. Customer selects Card Payment and submits the checkout form (same
   validation as Cash on Delivery).
2. The browser calls `/api/create-checkout-session` (a Vercel serverless
   function), which **re-derives every price and the delivery fee from the
   catalog itself** — nothing about cost is ever trusted from the browser —
   and asks Stripe to create a Checkout Session.
3. The browser is redirected to Stripe's own hosted payment page. Card
   details are entered there, on Stripe's domain — this codebase never
   receives, handles, or stores a card number, which is what keeps it out of
   PCI-DSS scope.
4. Stripe redirects back to `/order-confirmation/?session_id=...`. Before
   showing anything, the confirmation page calls
   `/api/verify-checkout-session`, which asks Stripe server-side whether that
   session actually completed payment. Only on a confirmed `paid` status is
   the order rendered and the cart cleared — a customer can't fabricate a
   success screen by editing the URL.
5. Order details (customer, delivery address, notes) travel as Checkout
   Session metadata, since this is a static site with no database — Stripe
   *is* the order record for a card payment, the same way `localStorage` is
   the order record for Cash on Delivery.

Relevant files: [`api/create-checkout-session.js`](api/create-checkout-session.js),
[`api/verify-checkout-session.js`](api/verify-checkout-session.js),
[`api/_stripe.js`](api/_stripe.js) (a ~50-line hand-rolled REST client — no
`stripe` npm package, keeping the zero-dependency approach used everywhere
else in this repo), and the `cardEnabled` / `CARD_ENABLED` checks in
[`src/pages/commerce.js`](src/pages/commerce.js),
[`src/pages/content.js`](src/pages/content.js) (FAQ),
[`src/pages/policies.js`](src/pages/policies.js) (Terms & Conditions §5), and
[`src/lib/layout.js`](src/lib/layout.js) (footer payment badge).

### Turning it on

1. In the Stripe Dashboard, get a **secret key** (`sk_test_...` for testing,
   `sk_live_...` for real charges).
2. In the Vercel project → **Settings → Environment Variables**, add
   `STRIPE_SECRET_KEY` with that value. Never put it in this repo, in
   `vercel.json`, or in chat — it's a live credential.
3. Redeploy (env var changes need a new build to take effect, since the
   enabled/disabled state is decided at build time).
4. Test with [Stripe's test card numbers](https://stripe.com/docs/testing)
   (e.g. `4242 4242 4242 4242`, any future expiry, any CVC) while using a
   `sk_test_...` key — these never touch real money. Switch to `sk_live_...`
   only once you've placed a full test order end to end.

### Not yet included (reasonable next steps, not required to go live)

- **Webhooks** — the confirmation page verifying the session on return covers
  the normal flow. A Stripe webhook (`checkout.session.completed`) would add
  resilience for the edge case of a customer closing the tab right after
  paying but before the redirect completes. Not required to accept payments
  correctly today.
- **Refunds** — issued from the Stripe Dashboard directly for now; the Return
  & Refund Policy already covers the process on the customer-facing side.

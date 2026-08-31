# Afkar Aldar — Implementation Plan

**Project:** Premium customized gift box platform (marketing site + order-request system + admin dashboard + unified checkout/payment + analytics/ads tracking)
**Positioning:** Gift discovery & customization experience — not a price-listed e-commerce store.
**Design approach:** Mobile-first (customer-facing site designed and built for small screens first, scaled up to desktop).
**Language:** English is the primary language for the customer-facing site. Architecture below still keeps content/copy separate from components so a second language (e.g. Arabic, RTL) can be added later without a rebuild — see Section 2.7.

---

## 1. Tech Stack (confirmed)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React / Next.js (App Router) | SSR/SEO for marketing pages, mobile-first build |
| Backend + Database | Supabase (Postgres, Auth, Storage, Edge Functions) | Single source of truth for data + auth; Prisma can sit on top of the same Postgres instance for type-safe schema/migrations, or backend logic can go straight through the Supabase client/Edge Functions — pick one path per feature rather than mixing both for the same table |
| Authentication | Google Sign-In + Apple Sign-In + Email/password | Via Supabase Auth, all three configured at launch |
| Payments | **Stripe (UAE account)** | Single gateway at launch — see Section 8; currency defaults to **AED** |
| Notifications | Firebase Cloud Messaging (FCM) | Admin-side push only, per spec |
| Admin Dashboard | Custom-built | Next.js protected route group (`/admin`), not a third-party dashboard product |
| Analytics/Tracking | GTM as the single loader; GA4, Meta Pixel, TikTok Pixel fired through it | One place to manage all tags without redeploying |
| Hosting | Vercel | Native Next.js support, edge-friendly for GTM/script loading |

This replaces the earlier draft's "Stripe + Paymob/Fawry" fallback — **Stripe UAE is the single confirmed payment gateway**, so Section 8's provider abstraction is still worth keeping (easy to add a second gateway later) but nothing else needs to be built against it now.

---

## 2. Design System (from brand spec)

**Visual reference:** see the attached `style-and-design-reference.png` — this is the source-of-truth mockup for layout, spacing, and the cream/black/gold balance described below. Every component built should be checked against it, not just the token list.

Implement the tokens as a single source of truth so every component pulls from it — no hard-coded hex values in components. This applies to the marketing site **and** the branded checkout page (Section 8), which must feel like the same product, not a bolted-on payment processor page.

```css
:root {
  /* Backgrounds */
  --bg-main: #FBF8F3;
  --bg-warm: #F6F0E7;
  --bg-soft: #F1E7D8;

  /* Gold */
  --gold: #AD7D39;
  --gold-light: #D4BA99;
  --gold-dark: #7D5121;
  --gold-hover: #C3944D;
  --champagne: #E9DBC6;

  /* Dark */
  --luxury-black: #191611;
  --black-soft: #29231C;

  /* Text */
  --text-primary: #292725;
  --text-secondary: #625D55;
  --text-muted: #8A8378;

  /* Borders / Shadows */
  --border: rgba(60, 45, 30, 0.10);
  --border-gold: rgba(173, 125, 57, 0.25);
  --shadow-sm: 0 8px 24px rgba(35, 25, 15, 0.06);
  --shadow-lg: 0 24px 70px rgba(35, 25, 15, 0.10);

  /* Radius */
  --radius-card: 16px;
  --radius-button: 8px;
  --radius-pill: 999px;
}
```

- Extend `tailwind.config.js` `theme.extend.colors` / `borderRadius` from these vars so `bg-bg-main`, `text-gold`, `rounded-button`, etc. are usable directly in JSX.
- Fonts: `Cormorant Garamond` (headings/serif) + `Manrope` (body/UI), loaded via `next/font/google` for zero layout shift.
- Color ratio target to enforce in review: **70% cream / 20% black / 10% gold** — treat gold as an accent, never a fill.
- The "A" monogram logo concept works cleanly for **Afkar Aldar** as well — large elegant gold serif "A", brand name in refined serif below/beside it.

### 2.6 Mobile-first build rules

The customer-facing site is designed at the smallest breakpoint first, then progressively enhanced — not the reverse.

- **Tailwind convention:** write unstyled/base classes for mobile, add `sm:` / `md:` / `lg:` overrides for larger screens. Never the other way around (no `lg:` base + mobile overrides).
- **Hero section:** stacks vertically on mobile — headline + copy + CTAs first, product photography below (full-width, not cropped awkwardly). The two-column `TEXT | PRODUCT PHOTO` layout in the spec only applies from `lg:` up.
- **Feature/benefits card:** horizontal 5-item row on desktop → becomes a 2-column grid or horizontal scroll-snap row on mobile, not a squeezed 5-across row.
- **Shop by Occasion:** horizontal scroll-snap carousel on mobile instead of a 6-across grid.
- **How It Works:** numbered steps stack vertically on mobile with a vertical connecting line instead of the horizontal dotted arrow.
- **Floating buttons (WhatsApp + Order/Request Now):** these matter most on mobile — fixed, thumb-reachable positions (bottom corners, safe-area-inset aware for iOS notch/home-indicator), never overlapping each other or a mobile browser's own UI chrome.
- **Checkout page (`/pay/[orderId]`):** the majority of customers will open this from a WhatsApp-shared link on their phone — this page must be flawless on mobile. Single-column layout, large tappable Pay Now button, no horizontal scrolling, order summary collapsible/expandable to keep the Pay button above the fold where possible.
- **Images:** use `next/image` everywhere with responsive `sizes`, serve smaller crops on mobile rather than shrinking desktop-sized images — critical for the warm editorial photography, which is otherwise heavy.
- **Admin dashboard** is the one area that can stay desktop-oriented first (tables, multi-field order detail views are genuinely easier to manage on a larger screen) — but should still be usable on a tablet for on-the-go order updates.
- **Performance budget:** mobile-first also means testing Lighthouse mobile scores (not just desktop) at the end of every phase, especially after Section 10's tracking scripts are added.

### 2.7 Language & localization

- All copy, CMS content, and UI strings are in **English** for launch — no bilingual UI is being built now.
- To keep a future language addition realistic without a rewrite:
  - No hard-coded English strings inside components — pull copy from a single content/config layer (simple JSON/TS dictionary is enough at this stage; adopting `next-intl` later is a drop-in upgrade, not a rewrite).
  - Layout components avoid assumptions that only hold for LTR text (e.g. hard-coded `left`/`right` margins where `ms-`/`me-` logical Tailwind utilities would work just as well) — small amount of extra discipline now, meaningful time saved if Arabic/RTL is ever added.
  - Currency/date formatting goes through a small `formatCurrency()` / `formatDate()` helper rather than being inlined, so a locale switch later is centralized.

---

## 3. Site Map & Pages

```
/                          Home (all sections in the visual spec)
/occasions                 Occasion grid (Birthday, Wedding, Graduation, New Baby, Corporate, Just Because)
/occasions/[slug]          Filtered gift boxes for one occasion
/box/[slug]                Single gift box detail + customization entry point
/customize/[slug]          Step-by-step customizer (box style, contents, card message)
/inspiration               Editorial/lookbook content
/about
/faq
/request/confirmation      Post-submit "we'll be in touch" screen (no price shown)
/pay/[orderId]             Private branded checkout page for one confirmed order (see Section 8)
/account                   Order history, saved details (auth required)
/admin                     Dashboard (protected)
/admin/orders/[id]         Single order management view, incl. payment controls
```

No `/cart` or generic `/checkout` — payment only exists per-order, after admin confirmation, at `/pay/[orderId]`.

---

## 4. Order Request Flow (No Public Pricing)

```
Browse Gift Boxes
      ↓
View Selected Box (images, materials, customization options — no price)
      ↓
Customize / Add Personal Details
      ↓
Click "Request This Gift" / "Customize & Request"  →  status: NEW_REQUEST
      ↓
Order appears in Admin Dashboard + FCM push to admins
      ↓
Business contacts customer (WhatsApp/phone/email)  →  status: CONTACTED
      ↓
Details agreed  →  status: DETAILS_CONFIRMED
      ↓
Admin enters final price  →  status: PRICE_CONFIRMED
      ↓
Admin activates the order's checkout page  →  status: AWAITING_PAYMENT
      ↓
Payment link (same checkout URL) shared via WhatsApp/email/dashboard
      ↓
Customer pays  →  status: PAID or DEPOSIT_PAID
      ↓
PREPARING → SHIPPED → DELIVERED   (CANCELLED possible at any stage before payment)
```

**Order status enum:**
`NEW_REQUEST, CONTACTED, DETAILS_CONFIRMED, PRICE_CONFIRMED, AWAITING_PAYMENT, DEPOSIT_PAID, PAID, PREPARING, SHIPPED, DELIVERED, CANCELLED`

Every CTA on the marketing site submits a **request**, never a payment — labels like *Request This Gift* / *Customize & Request*, never *Buy Now*.

---

## 5. Data Model (Prisma sketch)

```prisma
model Customer {
  id            String   @id @default(cuid())
  authUserId    String?  @unique   // Supabase auth uid, nullable for guest requests
  name          String
  email         String
  phone         String?
  createdAt     DateTime @default(now())
  orders        Order[]
}

model Occasion {
  id        String     @id @default(cuid())
  slug      String     @unique
  name      String
  giftBoxes GiftBox[]
}

model GiftBox {
  id            String     @id @default(cuid())
  slug          String     @unique
  name          String
  description   String
  images        String[]
  occasionId    String
  occasion      Occasion   @relation(fields: [occasionId], references: [id])
  customizable  Boolean    @default(true)
  orders        Order[]
}

model Order {
  id                String        @id @default(cuid())
  customerId        String
  customer          Customer      @relation(fields: [customerId], references: [id])
  giftBoxId         String
  giftBox           GiftBox       @relation(fields: [giftBoxId], references: [id])
  occasionSlug      String
  customization     Json          // box color, contents, card message, special requests, etc.
  deliveryInfo      Json          // address, delivery date
  status            OrderStatus   @default(NEW_REQUEST)

  // Pricing — set by admin only, after negotiation
  finalPrice        Decimal?
  currency          String?       @default("AED")
  paymentType        PaymentType? // FULL | DEPOSIT
  depositAmount     Decimal?      // populated when paymentType = DEPOSIT

  // Unified checkout
  checkoutSlug      String?       @unique   // powers /pay/[orderId] or a public-safe slug
  checkoutActive    Boolean       @default(false)

  notes             String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  statusHistory     OrderStatusEvent[]
  payment           Payment?
}

model OrderStatusEvent {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  status    OrderStatus
  note      String?
  createdAt DateTime @default(now())
}

model Payment {
  id            String        @id @default(cuid())
  orderId       String        @unique
  order         Order         @relation(fields: [orderId], references: [id])
  provider      String        // "stripe" — kept as a string (not an enum) so a second gateway can be added later without a migration
  providerRef   String?
  amountDue     Decimal       // full price or deposit amount, copied at activation time
  amountPaid    Decimal?
  type          PaymentType   // FULL | DEPOSIT
  status        PaymentStatus @default(UNPAID)
  linkSharedVia String[]      // ["whatsapp", "email", "dashboard_copy"] — for tracking/analytics
  createdAt     DateTime      @default(now())
  paidAt        DateTime?
}

model AdminUser {
  id         String   @id @default(cuid())
  authUserId String   @unique
  name       String
  role       String   @default("admin")
}

enum OrderStatus {
  NEW_REQUEST CONTACTED DETAILS_CONFIRMED PRICE_CONFIRMED AWAITING_PAYMENT DEPOSIT_PAID PAID PREPARING SHIPPED DELIVERED CANCELLED
}
enum PaymentStatus { UNPAID PENDING PAID PARTIALLY_PAID FAILED REFUNDED }
enum PaymentType { FULL DEPOSIT }
```

---

## 6. Admin Dashboard

- Route group `/admin`, guarded by `AdminUser` lookup (Supabase RLS policy: only rows where `auth.uid()` exists in `AdminUser`).
- **Orders table**: filter/sort by status, occasion, date; search by customer name/email.
- **Order detail view** includes:
  - Full customization JSON rendered readably (colors, contents, greeting message, special requests, delivery info).
  - Status changer (writes to `OrderStatusEvent`, triggers FCM + customer email where relevant).
  - **Payment section**:
    - Final Price + Currency inputs
    - Payment Type selector: **Full Payment** vs **Deposit / Partial Payment** (with computed deposit amount, e.g. 50%)
    - **Activate Checkout** button — creates the `Payment` row, sets `checkoutActive = true`, generates `/pay/[checkoutSlug]`
    - **Copy Payment Link** — copies the same `/pay/[checkoutSlug]` URL, no separate link generation
    - **Send via Email** — sends the branded email template with that same URL
    - **Share Payment Link** — WhatsApp share intent pre-filled with a message + the same URL
- **Basic KPIs**: new requests this week, conversion rate NEW_REQUEST → PAID, top occasions.

Every status change and payment action writes an `OrderStatusEvent` for a full audit trail on each order.

---

## 7. Notifications & Email

**FCM (admin-facing):**
- Admin web app registers an FCM token on login, stored on `AdminUser`.
- Triggers: new order request, payment completed, and any status change flagged as notification-worthy.
- Example: *"🎁 New Gift Box Order — Sarah requested a customized Birthday Gift Box."* Deep-links to `/admin/orders/[id]`.

**Transactional email (customer-facing)**, via Resend/Postmark + React Email, themed with the brand tokens:

| Trigger | Email |
|---|---|
| Order request submitted | "We've received your request" |
| Status → PRICE_CONFIRMED / checkout activated | "Your gift box is ready — review & pay" (contains the `/pay/[orderId]` link) |
| Payment succeeded (full or deposit) | "Payment received — thank you!" |
| Status → SHIPPED | "Your gift is on its way" |
| Status → DELIVERED | "Delivered — we hope they loved it" |

The "review & pay" email **is** the payment-link email — there is no separate "here's your payment link" template distinct from the checkout notification, matching the one-checkout-page architecture.

---

## 8. Unified Checkout & Payment System

**Core rule: one private checkout page per order, two ways to reach it.**

- `/pay/[orderId]` (using a non-guessable `checkoutSlug`, not the raw DB id) is generated once, when the admin clicks **Activate Checkout**.
- **"Create Checkout Page"** and **"Send Payment Link"** are two admin actions that both resolve to this same URL — there is no second, separate payment flow. Sending a link never creates a new page; it shares the existing one.

**Checkout page contents** (branded, matches the marketing site's design tokens):
- Gift box name + image
- Selected customization details (colors, contents, occasion)
- Customer's greeting card message
- Special requests
- Delivery information
- Order summary
- Final confirmed price
- Payment amount due (full price, or deposit amount with the remaining balance clearly noted)
- Available payment methods
- A single clear **Pay Now** button

**Flow:**

```
Admin confirms details & sets final price
        ↓
Admin selects Payment Type (Full / Deposit) and clicks Activate Checkout
        ↓
/pay/[checkoutSlug] is created — status: AWAITING_PAYMENT
        ↓
Admin copies the link, sends via WhatsApp, or sends via email
        ↓
Customer opens the link (also reachable from their account if logged in)
        ↓
Customer clicks Pay Now → Stripe (UAE) hosted flow (or embedded element)
        ↓
Webhook confirms payment
        ↓
Payment.status → PAID (or PARTIALLY_PAID for deposit)
Order.status → PAID or DEPOSIT_PAID
        ↓
Customer receives confirmation email; admin receives FCM push
```

- Deposit flow: `Payment.amountDue` = deposit amount at activation. On deposit payment, order moves to `DEPOSIT_PAID`; a second payment action (same checkout page, updated amount due = remaining balance) collects the rest before `PREPARING` begins, if that's the business rule you want — flag this as a decision point (Section 13).
- Provider abstraction: a single `createOrUpdateCheckout(order, { type, amount })` service call powers both **Activate Checkout** and any later "update amount" action. Only Stripe is wired up now, but keeping this one function as the only place that calls the payment provider means a second gateway later is a new implementation of the same interface, not a rewrite.
- Webhook handlers (`/api/webhooks/stripe`, `/api/webhooks/paymob`) are the single source of truth for marking payment complete — never trust a client-side redirect alone.

---

## 9. Authentication

- Supabase Auth with Google OAuth, Apple Sign-In, and email + password (with reset flow).
- Guest checkout allowed for the order **request** (no account needed to submit); account creation is prompted right after submission so the customer can track status and revisit their `/pay/[orderId]` link from `/account` later.

---

## 10. Analytics, Tracking & Marketing Pixels

### 10.1 Architecture principle

**Google Tag Manager is the single script loaded on the page.** GA4, Meta Pixel, and TikTok Pixel all fire *through* GTM (as GTM tags triggered by dataLayer events), not as separate hard-coded scripts.

- Only one script tag added to `<head>` (via `next/script`, `strategy="afterInteractive"`).
- New pixels (Pinterest, Snap, LinkedIn, etc.) are added later **entirely inside the GTM UI** — no code deploy needed.
- All IDs live in environment variables, never hard-coded:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXX
```

### 10.2 Centralized event helper

```ts
// lib/analytics/track.ts
type TrackParams = {
  occasion?: string;
  gift_box_name?: string;
  product_id?: string;
  value?: number;
  currency?: string;
  button_location?: string; // "hero" | "navbar" | "floating" | "bottom_cta" | "occasion_card"
  page_name?: string;
  [key: string]: unknown;
};

export function track(eventName: string, params: TrackParams = {}) {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({ event: eventName, ...params });
}
```

Every tracked action becomes one `track()` call. Inside GTM, each `dataLayer` event name is mapped to the matching GA4 event, Meta Pixel event, and TikTok event via tags/triggers — one push, several destinations, zero extra code per platform.

### 10.3 Event dictionary

| Internal event (`dataLayer`) | Fires on | Maps to (typical) | Key params |
|---|---|---|---|
| `page_view` | route change (auto via GTM) | GA4 `page_view`, Meta `PageView`, TikTok page view | `page_name` |
| `view_content` | Gift box detail page load | Meta `ViewContent`, GA4 `view_item`, TikTok `ViewContent` | `gift_box_name`, `product_id`, `occasion` |
| `select_occasion` | Clicking an occasion card | GA4 custom event | `occasion`, `button_location` |
| `cta_click` | "Design Your Box" / "Explore Designs" clicks | GA4 custom event | `button_location`, `page_name` |
| `request_now_click` | Any "Request This Gift" button (navbar, floating, hero, bottom CTA, occasion card) | GA4 `select_item`, Meta `Lead` (soft) | `button_location`, `gift_box_name`, `occasion` |
| `start_customization` | Entering `/customize/[slug]` | Meta `InitiateCheckout`, GA4 `begin_checkout`, TikTok `InitiateCheckout` | `gift_box_name`, `occasion` |
| `add_customization_option` | Selecting box color/contents/etc. | GA4 `add_to_cart` (repurposed) | `gift_box_name`, `product_id` |
| `submit_order_request` | Request form submit | Meta `Lead`, GA4 `generate_lead`, TikTok `SubmitForm`, Google Ads conversion | `gift_box_name`, `occasion`, `value` (est.), `currency` |
| `view_checkout` | Customer opens `/pay/[orderId]` | GA4 `view_cart`-equivalent | `gift_box_name`, `value`, `currency` |
| `pay_now_click` | Clicking "Pay Now" on checkout page | Meta `InitiateCheckout` (or `AddPaymentInfo`), GA4 custom | `value`, `currency`, `payment_type` |
| `purchase` | Server-side, on payment webhook success | Meta `Purchase`, GA4 `purchase`, TikTok `CompletePayment`, Google Ads conversion | `value`, `currency`, `product_id`, `gift_box_name`, `payment_type` |
| `whatsapp_click` | WhatsApp floating button, footer link, or admin-shared payment link click-through | Meta `Contact`, GA4 custom event | `button_location`, `page_name` |
| `contact_click` | Phone/email link click | GA4 custom event | `button_location` |
| `contact_form_submit` | Any contact/FAQ form | Meta `Lead`, GA4 `generate_lead` | `page_name` |

### 10.4 Server-side events (important for accuracy)

- Fire `purchase` from the **Stripe webhook handler**, not the client "thank you" redirect — avoids losing the conversion to ad blockers or a closed tab.
- Recommended upgrade path once traffic justifies it: Meta **Conversions API** and TikTok **Events API** in parallel with the pixels, deduplicated by `event_id`. The webhook handler should be structured now so this is a drop-in addition later (a `sendServerEvent()` function next to `track()`).

### 10.5 Performance safeguards

- Load GTM with `next/script strategy="afterInteractive"` — not blocking initial render.
- No inline pixel `<script>` tags anywhere else in the codebase; everything routes through `track()` + GTM.
- Defer non-critical GTM tags using GTM's own trigger delay rather than adding more `<Script>` tags to the app.
- Consent banner (for markets requiring it) gates GTM initialization, not individual pixels.

### 10.6 Button-location tracking convention

Any button appearing in multiple places (navbar, hero, floating button, bottom CTA, occasion card) always passes a `button_location` value so Ads reporting can tell which placement converts best — enforced by making `button_location` a required prop on a shared `<TrackedButton>` component rather than optional.

---

## 11. Suggested Build Phases

| Phase | Scope |
|---|---|
| 1 — Foundation | Design tokens in Tailwind, fonts, layout shell, Navbar/Footer, static Home page sections built mobile-first (no data yet) |
| 2 — Content data | Prisma schema, seed Occasions + GiftBoxes, dynamic `/occasions`, `/occasions/[slug]`, `/box/[slug]` |
| 3 — Request flow | Customizer UI, `submit_order_request` API route, request confirmation page, guest + authenticated submission |
| 4 — Admin dashboard | Auth-gated `/admin`, orders table, order detail, status changes, FCM push |
| 5 — Unified checkout & payments | `/pay/[orderId]` page, Activate Checkout / Copy Link / Send Email / Share WhatsApp actions, Stripe (UAE) integration, webhook → status update, React Email templates |
| 6 — Analytics | GTM install, `track()` helper, event wiring across every CTA and the checkout page, GA4/Meta/TikTok tag config inside GTM, Google Ads conversion linking |
| 7 — Polish & QA | Cross-browser/perf pass with mobile Lighthouse scores as the primary benchmark, real-device testing of the floating buttons and checkout page, tracking QA with GTM Preview mode + Meta/TikTok test events, full order-to-payment dry run on mobile |

---

## 12. Environment Variables (consolidated)

```env
# Database
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Firebase (FCM)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_CONFIG=

# Email
RESEND_API_KEY=

# Payments (Stripe UAE account)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Analytics / Tracking
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=
META_CONVERSIONS_API_TOKEN=      # for later server-side upgrade
TIKTOK_EVENTS_API_TOKEN=         # for later server-side upgrade
```

---

## 13. Notes / Open Decisions

- Decide whether guest order requests are allowed to skip account creation entirely, or if it's required before submission.
- Deposit flow: confirm whether the remaining balance after a deposit is collected via the **same** `/pay/[orderId]` page (amount due updated by admin) or requires a separate follow-up checkout activation.
- Confirm whether `/pay/[orderId]` should require login, or remain accessible via the private link alone (link-as-auth model) for customers who skipped account creation.
- Confirm whether Arabic/RTL support is a near-term roadmap item or purely future-proofing — affects how much effort goes into Section 2.7's content-layer abstraction now versus later.

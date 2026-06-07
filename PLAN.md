# RAW CUT — Implementation Plan

> **Status:** Build passing. Dev server running. Awaiting real API keys to go live.

**Tagline:** Uncut Talent. Curated Style.  
**Type:** Curated marketplace for independent fashion & product designers

---

## Business Rules

| Rule | Decision |
|------|----------|
| Designer signup | Open → Admin approval required before selling |
| Customer signup | Open, immediate access |
| Shipping | Designer ships directly. Customer selects carrier at checkout |
| Carriers | Georgian Post, DHL, FedEx (flat-rate MVP; real API later) |
| Commission | Platform takes fixed % per sale (default 15%, admin-configurable) |
| Market | Global |
| Products | Physical + Digital |
| Designer storefronts | `/designers/[username]` — public branded page |
| Language | English only |
| Payments | Stripe |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules + Tailwind + shadcn/ui |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js v5 (credentials) |
| File uploads | UploadThing |
| Payments | Stripe |
| AI | OpenAI GPT-4o-mini |
| Deployment | Vercel |

---

## User Roles

| Role | Status Flow | Capabilities |
|------|-------------|--------------|
| `customer` | immediate | Browse, buy, cart, order history |
| `designer` | `pending` → `approved` | Upload products, manage orders, view earnings |
| `admin` | always active | Approve designers, moderate products, analytics |

---

## Environment Variables — Fill Before Launch

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rawcut

# NextAuth
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_TOKEN=...

# OpenAI
OPENAI_API_KEY=sk-...

# Platform commission
PLATFORM_COMMISSION_RATE=15
```

---

## What's Built ✅

### Phase 1 — Foundation
- [x] Next.js 16 + TypeScript + Tailwind + shadcn/ui
- [x] Folder structure per PLAN
- [x] `lib/db.ts` — MongoDB singleton connection
- [x] `.env.local` — all env var keys (fill values)
- [x] Global layout, Navbar, Footer
- [x] `middleware.ts` — role-based route protection

### Phase 2 — Auth
- [x] `models/User.ts` — full schema (customer + designer fields)
- [x] `POST /api/auth/register` — customer (immediate) / designer (pending)
- [x] NextAuth v5 credentials provider + JWT session with role
- [x] `/login` page (`LoginForm` wrapped in Suspense)
- [x] `/register` page (`RegisterForm` wrapped in Suspense) — role toggle
- [x] `/pending-approval` page for designers awaiting review
- [x] Password hashing (bcryptjs, 12 rounds)

### Phase 3 — Catalog Frontend
- [x] `models/Category.ts`
- [x] `models/Product.ts` — full schema + text indexes
- [x] Homepage — hero, featured products, featured designers
- [x] `/products` — grid + filter sidebar (category, type, price, search)
- [x] `/products/[slug]` — images, description, variants, Add to Cart
- [x] `/designers` — approved designers grid
- [x] `/designers/[username]` — full designer storefront

### Phase 4 — Cart
- [x] `hooks/useCart.ts` — localStorage, cross-component sync
- [x] `/cart` page — items, quantity controls, summary

### Phase 5 — Backend API
- [x] `GET/POST /api/products`
- [x] `GET/PUT/DELETE /api/products/[slug]`
- [x] `GET /api/designers`, `GET/PUT /api/designers/[username]`
- [x] `POST/GET /api/orders`, `GET/PUT /api/orders/[id]`
- [x] `GET /api/categories`
- [x] `POST /api/payments/create-intent` — Stripe PaymentIntent
- [x] `POST /api/payments/webhook` — `payment_intent.succeeded` → order paid
- [x] `POST /api/shipping/rates` — carrier list + cost by country + weight

### Phase 5 — Payments
- [x] `lib/stripe.ts`
- [x] `models/Order.ts` — full schema (commission split, carrier, tracking)
- [x] Commission split: `designerEarnings = subtotal × (1 - commissionRate/100)`
- [x] `/checkout` — address form + `ShippingSelector` + Stripe payment

### Phase 6 — Shipping
- [x] `lib/shipping.ts` — flat-rate table (Georgian Post / DHL / FedEx × 4 zones)
- [x] `ShippingSelector` component — radio cards, carrier + cost + days
- [x] Carrier + cost stored in Order on creation

### Phase 7 — Designer Dashboard
- [x] `/dashboard/designer` — overview stats
- [x] `/dashboard/designer/products` — list with status badges
- [x] `/dashboard/designer/products/new` — upload form (type, category, price, weight, tags, AI)
- [x] `/dashboard/designer/orders` — incoming orders + carrier + tracking
- [x] `/dashboard/designer/earnings` — gross / fee / net breakdown

### Phase 8 — Admin Panel
- [x] `/dashboard/admin` — stats + action alerts
- [x] `/dashboard/admin/designers` — pending applications → approve / reject
- [x] `/dashboard/admin/products` — pending review → publish / reject
- [x] `PUT /api/admin/designers/[id]/approve`
- [x] `PUT /api/admin/designers/[id]/reject`

### Phase 9 — AI
- [x] `lib/ai.ts` — OpenAI GPT-4o-mini wrapper
- [x] `POST /api/ai/description` — generate from title + category + tags
- [x] `POST /api/ai/tags` — suggest 6–10 tags
- [x] "Generate with AI" + "Suggest tags" buttons on product upload form

### Infrastructure
- [x] `SessionProvider` wrapper in root layout
- [x] `dynamic = 'force-dynamic'` on all DB pages
- [x] Build passing (Next.js 16 Turbopack)
- [x] `scripts/seed-categories.ts` — seed 8 default categories

---

## Before Launch Checklist

```
[ ] Fill all values in .env.local
[ ] MongoDB Atlas: create cluster, get connection string
[ ] Stripe: create account, get test keys, set up webhook
      → Webhook URL: https://yourdomain.com/api/payments/webhook
      → Events: payment_intent.succeeded
[ ] UploadThing: create app, get token
[ ] OpenAI: get API key
[ ] Seed categories: npx tsx scripts/seed-categories.ts
[ ] Create admin user: set role:'admin' directly in MongoDB
[ ] Test full purchase flow with Stripe test card 4242 4242 4242 4242
[ ] Rename middleware.ts → proxy.ts (Next.js 16 deprecation)
[ ] Set NEXTAUTH_URL to production domain on Vercel
```

---

## Post-MVP Backlog

| Feature | Priority |
|---------|----------|
| Image upload (UploadThing) wired to product form | High |
| Email notifications (order placed, designer approved) | High |
| Digital product download after payment | High |
| Stripe Connect for direct designer payouts | Medium |
| Real carrier API (EasyPost / Shippo) | Medium |
| Tracking number entry by designer | Medium |
| Customer order history page | Medium |
| Wishlist | Low |
| Product reviews & ratings | Low |
| Designer analytics charts | Low |
| Multi-currency display | Low |
| Forgot password / email verification | Medium |
| Admin analytics page | Medium |

---

## Folder Structure (as built)

```
raw-cut/
├── app/
│   ├── (auth)/
│   │   ├── login/         LoginForm.tsx + page.tsx
│   │   ├── register/      RegisterForm.tsx + page.tsx
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── page.tsx                    ← Homepage
│   │   ├── products/
│   │   │   ├── page.tsx                ← Catalog + filters
│   │   │   └── [slug]/page.tsx         ← Product detail
│   │   ├── designers/
│   │   │   ├── page.tsx                ← All designers
│   │   │   └── [username]/page.tsx     ← Designer storefront
│   │   ├── cart/page.tsx
│   │   └── checkout/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                  ← Sidebar nav (designer | admin)
│   │   ├── designer/
│   │   │   ├── page.tsx                ← Overview
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx   ← Upload form + AI
│   │   │   ├── orders/page.tsx
│   │   │   └── earnings/page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── designers/              ← Approve / reject
│   │       └── products/               ← Publish / reject
│   ├── pending-approval/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/register/route.ts
│       ├── products/route.ts + [slug]/route.ts
│       ├── designers/route.ts + [username]/route.ts
│       ├── orders/route.ts + [id]/route.ts
│       ├── categories/route.ts
│       ├── payments/create-intent + webhook + refund
│       ├── shipping/rates/route.ts
│       ├── admin/designers/[id]/approve + reject
│       └── ai/description + tags
├── components/
│   ├── ui/                             ← shadcn
│   ├── layout/   Navbar.tsx Footer.tsx
│   ├── product/  ProductCard Grid Filters AddToCartButton
│   ├── designer/ DesignerCard
│   ├── cart/
│   ├── checkout/ ShippingSelector
│   └── Providers.tsx                  ← SessionProvider
├── lib/
│   ├── db.ts auth.ts stripe.ts shipping.ts ai.ts
├── models/
│   ├── User.ts Product.ts Order.ts Category.ts
├── hooks/
│   └── useCart.ts
├── types/
│   └── index.ts
└── scripts/
    └── seed-categories.ts
```

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| `localStorage` cart | Guest-safe, no auth required to shop |
| `force-dynamic` on DB pages | Pages fetch live data — no stale prerender |
| Flat-rate shipping table | Real carrier APIs need accounts; this ships MVP |
| Designer status `pending` on register | Admin curates who sells — core brand value |
| Commission stored per-order | Rate can change; historical orders stay correct |
| Products go to `pending_review` on submit | Admin reviews before going live |
| `Suspense` wrap on `useSearchParams` pages | Next.js 16 requirement for static pages |

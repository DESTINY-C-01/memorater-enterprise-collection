# Memorater Enterprise Collection

A premium product-ordering website (not e-commerce — no online payments). Customers
browse products, build a bag, and check out by sending a pre-filled order summary
straight to your WhatsApp.

**Stack:** Next.js 15.0.7 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Supabase (Postgres, Auth, Storage) · Zustand · Vercel

**Live site:** https://memoraterinterprise.com (once your custom domain is connected —
see section 7)

---

## 1. Setup

### a) Install dependencies
```bash
npm install
```

### b) Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project.
2. In the SQL Editor, run the migrations **in this exact order**:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed.sql` (optional demo data)
   - `supabase/migrations/0003_storage.sql`
   - `supabase/migrations/0004_fix_admin_rls_recursion.sql` (required — without this,
     logging into the admin panel fails with "infinite recursion detected in policy
     for relation admins")
   - `supabase/migrations/0005_manual_currency_pricing.sql`
3. Under **Authentication → Users**, create your admin user (email + password).
4. In the SQL Editor, insert that user into the `admins` table:
```sql
insert into admins (id, full_name, email, role)
values ('<paste-the-user-uuid-here>', 'Your Name', 'you@example.com', 'owner');
```

### c) Environment variables
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...          # Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # Project Settings → API → anon/publishable key
SUPABASE_SERVICE_ROLE_KEY=...         # Project Settings → API → service_role/secret key (keep secret!)
NEXT_PUBLIC_SITE_URL=https://memoraterinterprise.com
NEXT_PUBLIC_SITE_NAME="Memorater Enterprise Collection"
```

### d) Run locally
```bash
npm run dev
```
Visit `http://localhost:3000` for the storefront, `http://localhost:3000/admin/login`
for the admin panel. Visiting bare `/admin` automatically redirects to `/admin/login`.

---

## 2. Pricing — set manually per currency

Unlike a typical multi-currency setup, prices are **not** auto-converted from an
exchange rate. Each product has three separate price fields — `price_ngn`,
`price_ghs`, `price_xof` — that you set yourself in the admin (Add/Edit Product),
so you have full control over each market's pricing. A single "Discount %" field
applies the same percentage cut across all three currencies.

---

## 3. WhatsApp ordering flow

1. Customer adds items to their bag (`hooks/use-cart.ts`, persisted in `localStorage`,
   storing the already-set price in all three currencies per item).
2. On the cart page, they fill in name, phone, and delivery location.
3. `actions/create-order.ts` validates the input, saves the order + order items to
   Supabase, and builds the WhatsApp message with `services/whatsapp-order.ts`,
   using whichever currency the customer had selected.
4. The browser redirects to `https://wa.me/<your-number>?text=<order-summary>`.
5. You receive the message on WhatsApp, confirm stock, and share payment details.
6. Update the order's status from the admin dashboard as it progresses.

The primary ordering WhatsApp number is set in `lib/site-config.ts`
(`WHATSAPP_NUMBERS.primary`), not an environment variable.

---

## 4. Business info — one file to edit

`lib/site-config.ts` holds everything that appears across the About, Contact, Footer,
and checkout flow: the owner's photo/name/socials, the business Instagram/TikTok,
both WhatsApp numbers, and both support emails. Edit that one file to update any of
it site-wide.

---

## 5. Banners

The homepage hero automatically rotates through **active** banners from the database
(5-second rotation, dot navigation) — or falls back to a static hero if none are active.
Manage them at `/admin/dashboard/banners`: add with an image upload, activate/deactivate,
or delete.

---

## 6. Keeping Supabase from auto-pausing

Supabase's free tier pauses a project after 7 days with zero API activity. This project
pings the database automatically every 3 days via Vercel Cron:
- `app/api/keep-alive/route.ts` — a tiny route that runs one lightweight query
- `vercel.json` — schedules the cron (only takes effect once deployed on Vercel)

---

## 7. Deployment (Vercel) + custom domain

1. Push this project to GitHub, import it in [vercel.com](https://vercel.com/new).
2. Add the environment variables from `.env.local` in the Vercel project settings.
3. Deploy.
4. To connect the custom domain: Vercel project → **Settings → Domains** → add
   `memoraterinterprise.com` → follow Vercel's DNS instructions (usually an A record
   or CNAME at your domain registrar). SSL is provisioned automatically once DNS
   verifies.
5. Once the domain is live, make sure `NEXT_PUBLIC_SITE_URL` is set to
   `https://memoraterinterprise.com` in Vercel's environment variables, then redeploy.

**Important — security:** this project runs Next.js 15.0.7, which includes the fix for
a critical remote-code-execution vulnerability (CVE-2025-66478, and its follow-up
disclosed Dec 11 2025). Do not downgrade below 15.0.7.

---

## 8. Admin dashboard notes

- Mobile-responsive: the sidebar collapses into a hamburger menu below the `lg`
  breakpoint (`components/admin/admin-sidebar.tsx`).
- Product create/edit forms include full image management (upload, set primary,
  delete individual images) and soft-delete for products.
- Settings page (`/admin/dashboard/settings`) edits the `settings` table directly —
  note this is for your own reference only; live WhatsApp/site behavior is driven by
  `lib/site-config.ts`, not this table.

---

## 9. Suggested next steps

- Add category create/edit forms and drag-to-reorder banners
- Add inventory-level tracking to disable out-of-stock size/color combinations
- Add pagination controls to the products page (the query already supports it)
- Connect `reviews` submission to a public form on the product page
- Fill in real GHS/XOF prices for any product currently only priced in NGN (the
  migration only backfills NGN from the old single-price system)

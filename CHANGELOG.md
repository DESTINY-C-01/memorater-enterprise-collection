# Changelog — Everything Built & Fixed

A running record of every change made to this project, in order.

## Initial build
- Full Next.js 15 (App Router) + TypeScript + Tailwind + Supabase scaffold
- Database schema: admins, customers, products, product_images, categories, orders,
  order_items, inventory, banners, reviews, settings, currencies, activity_logs
- Row Level Security on every table
- Customer site: homepage, product listing/search, product detail, cart, about,
  contact, FAQ, wishlist placeholder
- WhatsApp ordering flow: cart → checkout → order saved to Supabase → redirect to
  `wa.me` with a formatted order summary
- Admin dashboard: login, overview stats, order management, product create with
  image upload
- SEO: sitemap.ts, robots.ts, Open Graph metadata

## Owner & business info
- Added `lib/site-config.ts` as a single source of truth for: owner name/photo/socials,
  business Instagram/TikTok, two WhatsApp numbers, two support emails
- Owner profile section added to the About page
- Contact page updated with both WhatsApp numbers and both emails
- Footer social icons wired to real links

## Database & auth debugging
- Diagnosed and fixed a partial/failed initial migration run (leftover test table
  collided with the real migration, aborting it partway)
- Diagnosed and fixed "infinite recursion detected in policy for relation admins" —
  the `admins` table's RLS policies queried `admins` internally, creating a loop.
  Fixed by setting `row_security = off` on `is_admin()`, adding an `is_owner()`
  helper function the same way, and rebuilding the one policy that queried
  `admins` inline. Captured as `0004_fix_admin_rls_recursion.sql`.

## Visitor analytics
- Built (page_views table, tracking route, dashboard stats) then intentionally
  removed per your request — not included in the current build.

## Banners
- Full CRUD: add banner (image upload), activate/deactivate, delete
- Homepage hero now pulls **active** banners from the database and rotates through
  them automatically; falls back to the original static hero when none are active

## Product editing
- Added full edit page (previously only "Add Product" existed): pre-filled form,
  image management (set primary / delete individual images), soft-delete product

## Settings page
- Converted from a read-only JSON dump into a real editable form (site name,
  tagline, reference WhatsApp number, base currency)

## Infrastructure
- Added a Vercel Cron job (`vercel.json` + `/api/keep-alive`) that pings Supabase
  every 3 days so the free-tier project never auto-pauses from inactivity

## Local environment fixes
- Diagnosed recurring `.next` build-cache corruption caused by the project living
  inside a OneDrive-synced folder (OneDrive actively locks files Next.js needs to
  write). Fixed by moving the project to `C:\Projects\...`, outside OneDrive's reach
- Fixed a broken git connection after the move (copy hadn't included the hidden
  `.git` folder); reconnected and force-pushed to restore sync with GitHub

## Security patch (critical)
- Identified and patched **CVE-2025-66478** — a maximum-severity (CVSS 10.0)
  remote-code-execution vulnerability in Next.js App Router, present in the
  originally-scaffolded version
- Upgraded Next.js 15.0.3 → 15.0.5 → **15.0.7** (the Dec 11 2025 advisory found the
  first fix incomplete; 15.0.7 covers the complete fix)
- Fixed resulting TypeScript build errors (`lib/supabase/server.ts` and
  `middleware.ts` needed an explicit `CookieOptions` type on the cookie-handling
  callback — a stricter type-check surfaced by the upgrade)
- Rotated the Supabase service role key as a precaution after the vulnerable
  version had been live

## Deployment fixes
- Fixed a build failure (`Invalid URL` on `/_not-found`) caused by
  `NEXT_PUBLIC_SITE_URL` being left blank in Vercel — an empty string doesn't
  trigger the `??` fallback in `metadataBase`, so `new URL('')` threw. Fixed by
  setting the env var explicitly
- Added `app/admin/page.tsx` — bare `/admin` previously 404'd since only
  `/admin/login` and `/admin/dashboard` existed as real routes; now redirects to
  `/admin/login`

## Mobile responsiveness (admin dashboard)
- Diagnosed horizontal-scroll bug: the sidebar was a fixed 256px column with no
  responsive breakpoint, forcing the whole layout wider than mobile screens
- Rebuilt as `components/admin/admin-sidebar.tsx` — collapses into a slim top bar
  with a hamburger icon on mobile (drawer slides in with a dark backdrop), stays
  a permanent static sidebar on desktop (`lg:` breakpoint and up)
- Fixed a separate overflow inside the "Recent Orders" table (wrapped in its own
  `overflow-x-auto` div so it scrolls instead of clipping)
- Added `overflow-x: hidden` site-wide in `globals.css` as a general safeguard
- Increased admin dashboard sizing (bigger stat numbers, more padding, a capped
  max-width container) so content doesn't feel lost on large monitors

## Manual per-currency pricing
- Replaced the original "one base price + auto currency conversion via exchange
  rate" system with three separate, manually-set price fields per product:
  `price_ngn`, `price_ghs`, `price_xof` — captured in
  `0005_manual_currency_pricing.sql`
- Updated every layer that touched pricing: types, product queries, product card,
  add-to-cart form, cart store/page, WhatsApp order message builder, order
  creation action, and both admin product forms (add + edit) — each currency now
  has its own labeled input field instead of one price being converted

## Domain
- Site's custom domain set to `memoraterinterprise.com` across `lib/site-config.ts`,
  `app/layout.tsx` metadata, `app/sitemap.ts`, `app/robots.ts`, and `.env.example`

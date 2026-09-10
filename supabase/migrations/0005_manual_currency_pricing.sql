-- ============================================================
-- Manual per-currency pricing — replaces auto-converted pricing
-- ============================================================
alter table products add column if not exists price_ngn numeric(12,2) not null default 0;
alter table products add column if not exists price_ghs numeric(12,2) not null default 0;
alter table products add column if not exists price_xof numeric(12,2) not null default 0;

-- One-time backfill: copy the old base_price into price_ngn as a
-- starting point. Go into the admin and set the correct GHS/XOF
-- amounts yourself afterward — they won't be auto-calculated anymore.
update products set price_ngn = base_price where price_ngn = 0;

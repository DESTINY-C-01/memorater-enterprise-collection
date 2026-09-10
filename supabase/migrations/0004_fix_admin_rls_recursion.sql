-- ============================================================
-- Fixes "infinite recursion detected in policy for relation admins"
--
-- The admins table's own RLS policies called is_admin(), which itself
-- queries the admins table — triggering the same policy again, forever.
-- Fix: let is_admin() (and a new is_owner()) bypass row-level security
-- when they run, and rebuild the one policy that queried admins inline.
-- ============================================================
alter function is_admin() set row_security = off;

create or replace function is_owner() returns boolean as $$
  select exists (
    select 1 from admins where id = auth.uid() and role = 'owner' and is_active = true
  );
$$ language sql security definer stable;

alter function is_owner() set row_security = off;

drop policy if exists "owner manage admins" on admins;

create policy "owner manage admins" on admins for all
  using (is_owner())
  with check (is_owner());

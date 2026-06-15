-- Privacy fix: the initial schema made public.profiles world-readable
-- (`profiles_select_all USING (true)`), which would expose email and NPI.
-- Restrict reads to the owner (and admins). When public author display is
-- needed later, expose only non-PII columns via a dedicated view.

drop policy if exists profiles_select_all on public.profiles;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

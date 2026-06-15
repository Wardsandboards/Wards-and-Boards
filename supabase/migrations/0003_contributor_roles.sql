-- Contributor roles, part 1: make the application + approval flow real in the DB.
--
-- Until now roles, the contributor application, and admin approval lived only in
-- each browser's localStorage. This migration lets a signed-in user APPLY to be a
-- contributor (set their own app_status to 'pending' plus their training details)
-- without being able to promote themselves, and keeps role changes admin-only.

-- ---------------------------------------------------------------------------
-- Relax guard_profile_role: a user may move their OWN application forward
-- (none/denied -> pending) and edit their training/institution/npi, but may
-- never change their role and may never self-approve. Admins may change anything.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Admins may change role and app_status freely (the approval queue).
  if public.is_admin() then
    return new;
  end if;

  -- Non-admins can never change their role.
  new.role := old.role;

  -- Non-admins may only move app_status to 'pending', and only when applying
  -- for the first time ('none') or re-applying after a denial ('denied').
  -- Any other transition (most importantly a self-approval) is reverted.
  if new.app_status is distinct from old.app_status then
    if new.app_status = 'pending' and old.app_status in ('none', 'denied') then
      null; -- allowed: applying / re-applying
    else
      new.app_status := old.app_status;
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Speed index for loading a user's attempts in created order (study data +
-- the planned gamification both read attempts by user, newest first).
-- ---------------------------------------------------------------------------
create index if not exists attempts_user_created_idx
  on public.attempts (user_id, created_at);

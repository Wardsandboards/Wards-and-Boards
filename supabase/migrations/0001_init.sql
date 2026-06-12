-- Wards & Boards — initial schema.
--
-- Design: the teaching CONTENT (cases, the board-question bank) stays as static
-- files in the app. The database holds only USER + CONTRIBUTION data: who someone
-- is, what they authored/reviewed, and their personal ratings/attempts/progress.
--
-- Security is enforced by row-level security (RLS). The anon key in the browser
-- can do nothing these policies do not allow.

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, created on first sign-in.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'learner' check (role in ('learner', 'contributor', 'admin')),
  app_status  text not null default 'none'    check (app_status in ('none', 'pending', 'approved', 'denied')),
  training    text,
  institution text,
  npi         text,
  created_at  timestamptz not null default now()
);

-- Helper: is the calling user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Helper: is the calling user an approved contributor (or admin)?
create or replace function public.is_contributor()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or (role = 'contributor' and app_status = 'approved'))
  );
$$;

-- Create a profile automatically when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block users from elevating their own role / approval; only admins may.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.app_status is distinct from old.app_status)
     and not public.is_admin() then
    new.role := old.role;
    new.app_status := old.app_status;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role_trg on public.profiles;
create trigger guard_profile_role_trg
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- contributions: board questions authored by users (the authoring pipeline).
-- ---------------------------------------------------------------------------
create table if not exists public.contributions (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles (id) on delete cascade,
  level        text,
  system       text,
  vignette     text,
  lead_in      text,
  options      jsonb not null default '[]'::jsonb,
  answer_index int  not null default 0,
  explanation  text,
  status       text not null default 'in_review' check (status in ('in_review', 'published', 'rejected')),
  citable_id   text,
  created_at   timestamptz not null default now()
);

create table if not exists public.contribution_reviews (
  id              uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions (id) on delete cascade,
  reviewer_id     uuid not null references public.profiles (id) on delete cascade,
  decision        text not null check (decision in ('approve', 'reject')),
  created_at      timestamptz not null default now(),
  unique (contribution_id, reviewer_id)
);

-- ---------------------------------------------------------------------------
-- Per-user study data, keyed to the static content by string ids.
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  question_key text not null,
  stars        int  not null check (stars between 1 and 5),
  updated_at   timestamptz not null default now(),
  primary key (user_id, question_key)
);

create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  question_key text not null,
  correct      boolean not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.progress (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  case_id   text not null,
  mode      text not null,
  completed boolean not null default true,
  primary key (user_id, case_id, mode)
);

-- ---------------------------------------------------------------------------
-- Row-level security.
-- ---------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.contributions        enable row level security;
alter table public.contribution_reviews enable row level security;
alter table public.ratings              enable row level security;
alter table public.attempts             enable row level security;
alter table public.progress             enable row level security;

-- profiles: public author info is readable; you may create and edit only your own.
create policy profiles_select_all on public.profiles for select using (true);
create policy profiles_insert_self on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update using (public.is_admin());

-- contributions: published items are public; authors see their own drafts;
-- approved contributors can author; authors edit their own drafts.
create policy contributions_select_public on public.contributions for select
  using (status = 'published' or author_id = auth.uid() or public.is_contributor());
create policy contributions_insert_contributor on public.contributions for insert
  with check (author_id = auth.uid() and public.is_contributor());
create policy contributions_update_owner on public.contributions for update
  using (author_id = auth.uid() or public.is_admin());

-- reviews: contributors review items they did not author; cannot review twice.
create policy reviews_select on public.contribution_reviews for select using (public.is_contributor());
create policy reviews_insert on public.contribution_reviews for insert
  with check (
    reviewer_id = auth.uid()
    and public.is_contributor()
    and not exists (select 1 from public.contributions c where c.id = contribution_id and c.author_id = auth.uid())
  );

-- ratings / attempts / progress: each user owns their own rows.
create policy ratings_own on public.ratings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy attempts_own on public.attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy progress_own on public.progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 0006: let signed-in users flag a question for review (wrong answer key, typo,
-- unclear wording, factual error, plus an optional comment). Flags surface to
-- the review board / admin so content problems get reported, not just stumbled on.

create table if not exists public.question_flags (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  question_key text not null,
  reason       text not null,
  comment      text,
  status       text not null default 'open' check (status in ('open', 'resolved')),
  created_at   timestamptz not null default now()
);

alter table public.question_flags enable row level security;

-- A signed-in user files their own flags and can see them; contributors + admins
-- read all; admins resolve them.
create policy flags_insert_own  on public.question_flags for insert with check (user_id = auth.uid());
create policy flags_select_own  on public.question_flags for select using (user_id = auth.uid());
create policy flags_select_staff on public.question_flags for select using (public.is_contributor());
create policy flags_update_admin on public.question_flags for update using (public.is_admin()) with check (public.is_admin());

create index if not exists question_flags_status_idx on public.question_flags (status, created_at);

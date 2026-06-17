-- 0008: instructor / cohort layer. A teacher creates a course (with a shareable
-- code), students join by entering that code (profiles.course_code), and the
-- course owner sees PRIVACY-SAFE cohort aggregates: no individual student rows
-- ever leave the database, only question-level counts the app maps to systems.

create table if not exists public.courses (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  code       text not null unique,
  created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy courses_owner_all on public.courses for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Owner-gated: cohort answer counts grouped by question (no user identity in the
-- result). SECURITY DEFINER so it can read across the cohort's attempts, but the
-- WHERE c.owner_id = auth.uid() ensures only the course owner gets anything.
create or replace function public.cohort_question_stats(p_course_id uuid)
returns table(question_key text, attempts bigint, correct bigint)
language sql security definer set search_path = public as $$
  select a.question_key, count(*)::bigint, count(*) filter (where a.correct)::bigint
  from public.attempts a
  join public.profiles p on p.id = a.user_id
  join public.courses c on c.code = p.course_code
  where c.id = p_course_id and c.owner_id = auth.uid()
  group by a.question_key;
$$;

-- Owner-gated count of students who joined with this course's code.
create or replace function public.cohort_size(p_course_id uuid)
returns bigint language sql security definer set search_path = public as $$
  select count(*)::bigint
  from public.profiles p
  join public.courses c on c.code = p.course_code
  where c.id = p_course_id and c.owner_id = auth.uid();
$$;

grant execute on function public.cohort_question_stats(uuid) to authenticated;
grant execute on function public.cohort_size(uuid) to authenticated;

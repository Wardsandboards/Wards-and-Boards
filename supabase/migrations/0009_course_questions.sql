-- 0009: faculty authoring. A course owner can write questions tied to their
-- course. By default these are PRIVATE to the class: only students enrolled with
-- the course's code can see them (delivered through a security-definer RPC so the
-- student never reads the courses/course_questions tables directly). The owner can
-- additionally OPT IN to submit a copy into the public peer-reviewed commons; that
-- copy enters the normal author -> 2-reviewer -> publish pipeline, so the public
-- bank's credibility is unchanged (publishing still requires the review board).

create table if not exists public.course_questions (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  level        text,
  system       text,
  vignette     text,
  lead_in      text,
  options      jsonb not null default '[]'::jsonb,
  answer_index int  not null default 0,
  explanation  text,
  video_url    text,
  -- Set when the owner submits this item to the public commons; lets the Faculty
  -- view show the live review status of the submitted copy.
  commons_contribution_id uuid references public.contributions (id) on delete set null,
  created_at   timestamptz not null default now()
);
alter table public.course_questions enable row level security;

-- The course owner has full control of their own course's questions. Students do
-- NOT read this table directly; they get questions via assigned_questions() below.
drop policy if exists course_questions_owner_all on public.course_questions;
create policy course_questions_owner_all on public.course_questions
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create index if not exists course_questions_course_idx on public.course_questions (course_id);

-- Helper: does the calling user own at least one course? Used to let faculty
-- (course owners) submit to the public commons even before they are approved
-- contributors. Publishing still requires two review-board approvals.
create or replace function public.is_course_owner()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.courses where owner_id = auth.uid());
$$;

-- Relax the contributions insert policy: approved contributors OR course owners
-- may author. The peer-review gate (2 approvals to publish) is unchanged, so who
-- can SUBMIT is widened without weakening what gets PUBLISHED.
drop policy if exists contributions_insert_contributor on public.contributions;
drop policy if exists contributions_insert_author on public.contributions;
create policy contributions_insert_author on public.contributions for insert
  with check (author_id = auth.uid() and (public.is_contributor() or public.is_course_owner()));

-- Owner-gated student read path: the questions assigned to the calling student,
-- resolved by matching their profile.course_code to a course's code. SECURITY
-- DEFINER so the student never needs read access to courses/course_questions.
-- Returns the instructor's display name so the byline can be honest ("Assigned by
-- your instructor: ..."), and never exposes the commons linkage.
create or replace function public.assigned_questions()
returns table (
  id uuid, course_id uuid, level text, system text, vignette text, lead_in text,
  options jsonb, answer_index int, explanation text, video_url text,
  author_name text, created_at timestamptz
)
language sql security definer set search_path = public as $$
  select cq.id, cq.course_id, cq.level, cq.system, cq.vignette, cq.lead_in,
         cq.options, cq.answer_index, cq.explanation, cq.video_url,
         coalesce(op.display_name, op.full_name, 'Your instructor') as author_name,
         cq.created_at
  from public.course_questions cq
  join public.courses c  on c.id = cq.course_id
  join public.profiles p on p.id = auth.uid()
  join public.profiles op on op.id = cq.owner_id
  where p.course_code is not null and c.code = p.course_code;
$$;

grant execute on function public.is_course_owner() to authenticated;
grant execute on function public.assigned_questions() to authenticated;

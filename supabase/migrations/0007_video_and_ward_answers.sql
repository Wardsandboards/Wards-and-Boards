-- 0007: an optional YouTube explainer link per authored question, and
-- cross-device storage of a user's free-text ward-moment answers.

-- Optional video link on authored questions; surfaced through published_questions.
alter table public.contributions add column if not exists video_url text;

drop view if exists public.published_questions;
create view public.published_questions as
  select
    c.id, c.citable_id, c.level, c.system, c.vignette, c.lead_in,
    c.options, c.answer_index, c.explanation, c.video_url, c.created_at, c.author_id,
    pa.full_name    as author_name,
    pa.display_name as author_display_name,
    pa.training     as author_creds,
    pa.institution  as author_institution,
    coalesce((
      select array_agg(rpa.full_name order by cr.created_at)
      from public.contribution_reviews cr
      join public.public_authors rpa on rpa.id = cr.reviewer_id
      where cr.contribution_id = c.id and cr.decision = 'approve'
    ), '{}'::text[]) as reviewer_names
  from public.contributions c
  left join public.public_authors pa on pa.id = c.author_id
  where c.status = 'published';
grant select on public.published_questions to anon, authenticated;

-- A user's free-text ward-moment answers, so they follow them across devices.
create table if not exists public.ward_answers (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  case_id    text not null,
  prompt_id  text not null,
  answer     text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, case_id, prompt_id)
);
alter table public.ward_answers enable row level security;
create policy ward_answers_own on public.ward_answers for all using (user_id = auth.uid()) with check (user_id = auth.uid());

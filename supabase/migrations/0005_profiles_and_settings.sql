-- 0005: self-managed profile fields (a chosen display name, an about-me bio, and
-- an optional course code), plus surfacing display name + bio on the public
-- author view so author pages can show them.
--
-- display_name / bio / course_code are freely self-editable through the existing
-- profiles_update_self policy. guard_profile_role only governs role + app_status,
-- so a user editing these never touches their role. No guard change needed.

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists course_code text;

-- Recreate the public author view to add display_name + bio (still PII-safe:
-- never email or npi). published_questions depends on it, so drop that first.
drop view if exists public.published_questions;
drop view if exists public.public_authors;

create view public.public_authors as
  select id, full_name, display_name, bio, role, institution, training
  from public.profiles
  where role in ('contributor', 'admin');
grant select on public.public_authors to anon, authenticated;

create view public.published_questions as
  select
    c.id, c.citable_id, c.level, c.system, c.vignette, c.lead_in,
    c.options, c.answer_index, c.explanation, c.created_at, c.author_id,
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

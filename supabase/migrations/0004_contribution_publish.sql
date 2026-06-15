-- Contributor roles, part 2: make the author -> 2-reviewer -> publish pipeline
-- real and server-side.
--
-- A reviewer cannot update the contributions row directly (RLS
-- contributions_update_owner only lets the author or an admin update it), so the
-- status transition has to happen in a SECURITY DEFINER trigger that fires when
-- a review is recorded: two approvals publish + mint a citable id; any rejection
-- rejects. Published-question credits (author + reviewer names + citable id) are
-- then exposed through public views so the whole site, including signed-out
-- visitors, can see the citable public record the credit model promises.

-- ---------------------------------------------------------------------------
-- Citable id minting. The static board bank uses WB-2026-0001..00xx, so community
-- ids start at 0101 to avoid collision (matches the old localStorage counter).
-- ---------------------------------------------------------------------------
create sequence if not exists public.citable_seq start with 101;

create or replace function public.next_citable_id()
returns text language sql security definer set search_path = public as $$
  select 'WB-2026-' || lpad(nextval('public.citable_seq')::text, 4, '0');
$$;

-- ---------------------------------------------------------------------------
-- On each review: recompute the contribution's status. One rejection rejects it;
-- the second approval publishes it and mints its citable id. The status guard
-- ('in_review') makes this idempotent, so later reviews never re-mint or reopen.
-- ---------------------------------------------------------------------------
create or replace function public.apply_contribution_review()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  approvals  int;
  rejections int;
begin
  select count(*) filter (where decision = 'approve'),
         count(*) filter (where decision = 'reject')
    into approvals, rejections
    from public.contribution_reviews
    where contribution_id = new.contribution_id;

  if rejections >= 1 then
    update public.contributions
      set status = 'rejected'
      where id = new.contribution_id and status = 'in_review';
  elsif approvals >= 2 then
    update public.contributions
      set status = 'published', citable_id = public.next_citable_id()
      where id = new.contribution_id and status = 'in_review';
  end if;

  return new;
end;
$$;

drop trigger if exists on_contribution_review on public.contribution_reviews;
create trigger on_contribution_review
  after insert on public.contribution_reviews
  for each row execute function public.apply_contribution_review();

-- ---------------------------------------------------------------------------
-- Public, PII-safe author view (name / role / institution / training only;
-- never email or npi). profiles itself is locked to owner + admin reads, so this
-- definer view is how non-PII author info reaches the rest of the app. The
-- Supabase linter flags it as a SECURITY DEFINER view; that is intentional here
-- because it deliberately exposes only the safe columns.
-- ---------------------------------------------------------------------------
create or replace view public.public_authors as
  select id, full_name, role, institution, training
  from public.profiles
  where role in ('contributor', 'admin');

grant select on public.public_authors to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Published community questions, with author + approving-reviewer credits, for
-- the Practice bank. Readable by everyone (the citable public record).
-- ---------------------------------------------------------------------------
create or replace view public.published_questions as
  select
    c.id, c.citable_id, c.level, c.system, c.vignette, c.lead_in,
    c.options, c.answer_index, c.explanation, c.created_at, c.author_id,
    pa.full_name   as author_name,
    pa.training    as author_creds,
    pa.institution as author_institution,
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

import { supabase } from './supabase'
import type { Draft } from '../types'

// Profile + contributor-application data backed by Supabase. As with db.ts,
// every function is a safe no-op when the backend isn't configured, so the app
// keeps running on its localStorage mock. Roles (learner / contributor / admin)
// and application status live in public.profiles and are governed by RLS plus
// the guard_profile_role trigger: a user can apply but never self-promote.

/** The authenticated user's profile row (the authoritative role + app status). */
export interface DbProfile {
  id: string
  email: string | null
  full_name: string | null
  display_name: string | null
  bio: string | null
  course_code: string | null
  role: string // 'learner' | 'contributor' | 'admin'
  app_status: string // 'none' | 'pending' | 'approved' | 'denied'
  training: string | null
  institution: string | null
  npi: string | null
}

const PROFILE_COLS = 'id, email, full_name, display_name, bio, course_code, role, app_status, training, institution, npi'

/** The display name to show for a user: their chosen name, else their Google name. */
export function profileName(p: { display_name?: string | null; full_name?: string | null; email?: string | null } | null): string {
  if (!p) return ''
  return p.display_name || p.full_name || p.email || ''
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

/** Load the signed-in user's own profile (role + application status). */
export async function loadMyProfile(): Promise<DbProfile | null> {
  if (!supabase) return null
  const uid = await currentUserId()
  if (!uid) return null
  try {
    const { data } = await supabase.from('profiles').select(PROFILE_COLS).eq('id', uid).maybeSingle()
    return (data as DbProfile) ?? null
  } catch {
    return null
  }
}

/**
 * Apply to become a contributor: set app_status to pending and record the
 * training details. The guard trigger allows none/denied -> pending only, so
 * this can never elevate role. Returns the updated profile for immediate UI.
 */
export async function applyForContributor(form: { training: string; institution: string; npi: string }): Promise<DbProfile | null> {
  if (!supabase) return null
  const uid = await currentUserId()
  if (!uid) return null
  try {
    const { data } = await supabase
      .from('profiles')
      .update({ app_status: 'pending', training: form.training, institution: form.institution, npi: form.npi })
      .eq('id', uid)
      .select(PROFILE_COLS)
      .maybeSingle()
    return (data as DbProfile) ?? null
  } catch {
    return null
  }
}

/** Save the signed-in user's editable profile settings. Returns the updated row. */
export async function updateProfileSettings(fields: { display_name: string; bio: string; course_code: string }): Promise<DbProfile | null> {
  if (!supabase) return null
  const uid = await currentUserId()
  if (!uid) return null
  try {
    const { data } = await supabase
      .from('profiles')
      .update({ display_name: fields.display_name || null, bio: fields.bio || null, course_code: fields.course_code || null })
      .eq('id', uid)
      .select(PROFILE_COLS)
      .maybeSingle()
    return (data as DbProfile) ?? null
  } catch {
    return null
  }
}

/** Admin-only: the pending contributor applications (RLS lets admins read all). */
export async function listPendingApplications(): Promise<DbProfile[]> {
  if (!supabase) return []
  try {
    const { data } = await supabase
      .from('profiles')
      .select(PROFILE_COLS)
      .eq('app_status', 'pending')
      .order('created_at', { ascending: true })
    return (data as DbProfile[]) ?? []
  } catch {
    return []
  }
}

/** Admin-only: approve (-> contributor) or deny a pending application. */
export async function decideApplication(userId: string, decision: 'approve' | 'deny'): Promise<void> {
  if (!supabase) return
  try {
    const patch = decision === 'approve' ? { role: 'contributor', app_status: 'approved' } : { app_status: 'denied' }
    await supabase.from('profiles').update(patch).eq('id', userId)
  } catch {
    /* best-effort */
  }
}

// ---------------------------------------------------------------------------
// Authoring pipeline: contributions + reviews. Publishing (2 approvals) and
// rejection (1 reject) are applied server-side by the apply_contribution_review
// trigger; the client only inserts rows and reloads.
// ---------------------------------------------------------------------------

/** A contribution as seen in the contributor workspace, with reviews stitched. */
export interface DbContribution {
  id: string
  author_id: string
  author_name: string
  level: string
  system: string
  vignette: string
  lead_in: string
  options: string[]
  answer_index: number
  explanation: string
  status: string
  citable_id: string | null
  reviews: { reviewer_id: string; reviewer_name: string; decision: string }[]
}

/** A published community question for the Practice bank (public credit record). */
export interface CommunityQuestion {
  id: string
  citable_id: string | null
  level: string
  system: string
  vignette: string
  lead_in: string
  options: string[]
  answer_index: number
  explanation: string
  author_id: string
  author_name: string
  author_creds: string
  author_institution: string
  reviewer_names: string[]
}

/** Author a new question (enters peer review). Status defaults to in_review. */
export async function submitContribution(draft: Draft): Promise<void> {
  if (!supabase) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    await supabase.from('contributions').insert({
      author_id: uid,
      level: draft.level,
      system: draft.system,
      vignette: draft.vignette,
      lead_in: draft.leadIn,
      options: draft.options,
      answer_index: draft.answerIndex,
      explanation: draft.explanation,
    })
  } catch {
    /* best-effort */
  }
}

/** Record a peer-review decision. The trigger publishes/rejects server-side. */
export async function submitReview(contributionId: string, decision: 'approve' | 'reject'): Promise<void> {
  if (!supabase) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    await supabase.from('contribution_reviews').insert({ contribution_id: contributionId, reviewer_id: uid, decision })
  } catch {
    /* best-effort */
  }
}

/** Load contributions visible to the signed-in user (RLS-scoped) for the workspace. */
export async function loadContributions(): Promise<DbContribution[]> {
  if (!supabase) return []
  try {
    const [cRes, rRes, aRes] = await Promise.all([
      supabase.from('contributions').select('id, author_id, level, system, vignette, lead_in, options, answer_index, explanation, status, citable_id, created_at').order('created_at', { ascending: true }),
      supabase.from('contribution_reviews').select('contribution_id, reviewer_id, decision'),
      supabase.from('public_authors').select('id, full_name'),
    ])
    const nameById = new Map<string, string>()
    ;((aRes.data ?? []) as { id: string; full_name: string | null }[]).forEach((a) => nameById.set(a.id, a.full_name || 'Contributor'))
    const reviewsBy = new Map<string, { reviewer_id: string; reviewer_name: string; decision: string }[]>()
    ;((rRes.data ?? []) as { contribution_id: string; reviewer_id: string; decision: string }[]).forEach((r) => {
      const list = reviewsBy.get(r.contribution_id) ?? []
      list.push({ reviewer_id: r.reviewer_id, reviewer_name: nameById.get(r.reviewer_id) || 'Reviewer', decision: r.decision })
      reviewsBy.set(r.contribution_id, list)
    })
    return ((cRes.data ?? []) as Record<string, unknown>[]).map((c) => ({
      id: c.id as string,
      author_id: c.author_id as string,
      author_name: nameById.get(c.author_id as string) || 'Contributor',
      level: (c.level as string) || 'step1',
      system: (c.system as string) || '',
      vignette: (c.vignette as string) || '',
      lead_in: (c.lead_in as string) || '',
      options: (c.options as string[]) || [],
      answer_index: (c.answer_index as number) ?? 0,
      explanation: (c.explanation as string) || '',
      status: (c.status as string) || 'in_review',
      citable_id: (c.citable_id as string) ?? null,
      reviews: reviewsBy.get(c.id as string) ?? [],
    }))
  } catch {
    return []
  }
}

/** Load published community questions (public) for the Practice bank. */
export async function loadCommunityQuestions(): Promise<CommunityQuestion[]> {
  if (!supabase) return []
  try {
    const { data } = await supabase
      .from('published_questions')
      .select('id, citable_id, level, system, vignette, lead_in, options, answer_index, explanation, author_id, author_name, author_creds, author_institution, reviewer_names')
      .order('created_at', { ascending: true })
    return ((data ?? []) as Record<string, unknown>[]).map((c) => ({
      id: c.id as string,
      citable_id: (c.citable_id as string) ?? null,
      level: (c.level as string) || 'step1',
      system: (c.system as string) || '',
      vignette: (c.vignette as string) || '',
      lead_in: (c.lead_in as string) || '',
      options: (c.options as string[]) || [],
      answer_index: (c.answer_index as number) ?? 0,
      explanation: (c.explanation as string) || '',
      author_id: (c.author_id as string) || '',
      author_name: (c.author_name as string) || 'Contributor',
      author_creds: (c.author_creds as string) || '',
      author_institution: (c.author_institution as string) || '',
      reviewer_names: ((c.reviewer_names as string[]) || []).filter(Boolean),
    }))
  } catch {
    return []
  }
}

import { supabase } from './supabase'

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
  role: string // 'learner' | 'contributor' | 'admin'
  app_status: string // 'none' | 'pending' | 'approved' | 'denied'
  training: string | null
  institution: string | null
  npi: string | null
}

const PROFILE_COLS = 'id, email, full_name, role, app_status, training, institution, npi'

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

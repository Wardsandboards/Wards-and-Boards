import { supabase } from './supabase'

// Instructor/cohort data. Courses live in the DB; cohort stats come from
// owner-gated RPCs that return only anonymous, question-level aggregates.

export interface Course {
  id: string
  name: string
  code: string
  created_at: string
}

export interface CohortStats {
  size: number
  byKey: Record<string, { attempts: number; correct: number }>
}

// Readable code, no ambiguous characters (no O/0/I/1).
function genCode(): string {
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alpha[Math.floor(Math.random() * alpha.length)]
  return s
}

async function uid(): Promise<string | null> {
  if (!supabase) return null
  try { const { data } = await supabase.auth.getUser(); return data.user?.id ?? null } catch { return null }
}

/** Create a course owned by the signed-in user, retrying on a rare code clash. */
export async function createCourse(name: string): Promise<Course | null> {
  if (!supabase) return null
  const owner = await uid()
  if (!owner) return null
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.from('courses').insert({ owner_id: owner, name, code: genCode() }).select('id, name, code, created_at').maybeSingle()
    if (!error && data) return data as Course
  }
  return null
}

/** The signed-in user's own courses (RLS-scoped to owner). */
export async function loadMyCourses(): Promise<Course[]> {
  if (!supabase) return []
  try {
    const { data } = await supabase.from('courses').select('id, name, code, created_at').order('created_at', { ascending: true })
    return (data as Course[]) ?? []
  } catch {
    return []
  }
}

/** Privacy-safe cohort aggregates for a course the caller owns. */
export async function loadCohort(courseId: string): Promise<CohortStats> {
  if (!supabase) return { size: 0, byKey: {} }
  try {
    const [sz, st] = await Promise.all([
      supabase.rpc('cohort_size', { p_course_id: courseId }),
      supabase.rpc('cohort_question_stats', { p_course_id: courseId }),
    ])
    const byKey: CohortStats['byKey'] = {}
    ;((st.data ?? []) as { question_key: string; attempts: number; correct: number }[]).forEach((r) => {
      byKey[r.question_key] = { attempts: Number(r.attempts), correct: Number(r.correct) }
    })
    return { size: Number(sz.data ?? 0), byKey }
  } catch {
    return { size: 0, byKey: {} }
  }
}

import { supabase } from './supabase'
import type { Draft } from '../types'

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

// A question a faculty member authored for one of their courses. Private to the
// class by default; commonsStatus is set once the owner submits it to the public
// peer-reviewed commons ('in_review' | 'published' | 'rejected').
export interface CourseQuestion {
  id: string
  courseId: string
  level: string
  system: string
  vignette: string
  leadIn: string
  options: string[]
  answerIndex: number
  explanation: string
  video: string
  commonsStatus: string | null
  // Set only on the student read path: the instructor's display name for the byline.
  authorName?: string
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

// ---------------------------------------------------------------------------
// Faculty authoring: questions a course owner writes for their own class. RLS
// scopes the table to the owner; students read via the assigned_questions RPC.
// ---------------------------------------------------------------------------

type CourseQuestionRow = {
  id: string; course_id: string; level: string | null; system: string | null
  vignette: string | null; lead_in: string | null; options: string[] | null
  answer_index: number | null; explanation: string | null; video_url: string | null
  commons_contribution_id?: string | null; author_name?: string | null
}

function rowToCourseQuestion(r: CourseQuestionRow, commonsStatus: string | null = null): CourseQuestion {
  return {
    id: r.id, courseId: r.course_id, level: r.level || 'step1', system: r.system || '',
    vignette: r.vignette || '', leadIn: r.lead_in || '', options: r.options || [],
    answerIndex: r.answer_index ?? 0, explanation: r.explanation || '', video: r.video_url || '',
    commonsStatus, authorName: r.author_name || undefined,
  }
}

/** Author a question for one of the caller's courses. Returns true on success. */
export async function createCourseQuestion(courseId: string, draft: Draft): Promise<boolean> {
  if (!supabase) return false
  const owner = await uid()
  if (!owner) return false
  try {
    const { error } = await supabase.from('course_questions').insert({
      course_id: courseId, owner_id: owner, level: draft.level, system: draft.system,
      vignette: draft.vignette, lead_in: draft.leadIn, options: draft.options,
      answer_index: draft.answerIndex, explanation: draft.explanation, video_url: draft.video || null,
    })
    return !error
  } catch {
    return false
  }
}

/** The owner's questions for one course, with the live commons status stitched in. */
export async function loadCourseQuestions(courseId: string): Promise<CourseQuestion[]> {
  if (!supabase) return []
  try {
    const { data } = await supabase
      .from('course_questions')
      .select('id, course_id, level, system, vignette, lead_in, options, answer_index, explanation, video_url, commons_contribution_id, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true })
    const rows = (data as (CourseQuestionRow & { created_at: string })[]) ?? []
    const ids = rows.map((r) => r.commons_contribution_id).filter(Boolean) as string[]
    const statusById = new Map<string, string>()
    if (ids.length) {
      const { data: cs } = await supabase.from('contributions').select('id, status').in('id', ids)
      ;((cs ?? []) as { id: string; status: string }[]).forEach((c) => statusById.set(c.id, c.status))
    }
    return rows.map((r) => rowToCourseQuestion(r, r.commons_contribution_id ? statusById.get(r.commons_contribution_id) ?? 'in_review' : null))
  } catch {
    return []
  }
}

/** Delete one of the caller's course questions. */
export async function deleteCourseQuestion(id: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('course_questions').delete().eq('id', id)
  } catch {
    /* best-effort */
  }
}

/**
 * Submit a copy of a course question into the public peer-reviewed commons. It
 * enters the normal author -> 2-reviewer -> publish pipeline; we link the new
 * contribution back so the Faculty view can show its review status.
 */
export async function submitCourseQuestionToCommons(q: CourseQuestion): Promise<boolean> {
  if (!supabase) return false
  const owner = await uid()
  if (!owner) return false
  try {
    const { data, error } = await supabase.from('contributions').insert({
      author_id: owner, level: q.level, system: q.system, vignette: q.vignette,
      lead_in: q.leadIn, options: q.options, answer_index: q.answerIndex,
      explanation: q.explanation, video_url: q.video || null,
    }).select('id').maybeSingle()
    if (error || !data) return false
    await supabase.from('course_questions').update({ commons_contribution_id: (data as { id: string }).id }).eq('id', q.id)
    return true
  } catch {
    return false
  }
}

/** The questions assigned to the signed-in student (their enrolled course). */
export async function loadAssignedQuestions(): Promise<CourseQuestion[]> {
  if (!supabase) return []
  try {
    const { data } = await supabase.rpc('assigned_questions')
    return ((data ?? []) as CourseQuestionRow[]).map((r) => rowToCourseQuestion(r))
  } catch {
    return []
  }
}

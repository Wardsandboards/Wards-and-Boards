import { supabase } from './supabase'
import { dateKey } from './gamify'

// Per-user study data backed by Supabase. When Supabase isn't configured or no
// one is signed in, every function is a safe no-op and the app keeps running on
// its localStorage state. Reads/writes are keyed by the question's `id` and the
// case id + mode, matching the shapes App already uses.

export const dbEnabled = (): boolean => !!supabase

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

export interface StudyData {
  att: Record<string, { correct: boolean }[]>
  rate: Record<string, number>
  progress: Record<string, Record<string, boolean>>
  dates: string[] // distinct YYYY-MM-DD days the user answered (for streaks)
}

/** Load all of the signed-in user's attempts, ratings, and progress. */
export async function loadStudyData(): Promise<StudyData | null> {
  if (!supabase) return null
  const uid = await currentUserId()
  if (!uid) return null
  try {
    const [a, r, p] = await Promise.all([
      supabase.from('attempts').select('question_key, correct, created_at').eq('user_id', uid).order('created_at', { ascending: true }),
      supabase.from('ratings').select('question_key, stars').eq('user_id', uid),
      supabase.from('progress').select('case_id, mode, completed').eq('user_id', uid),
    ])
    const att: StudyData['att'] = {}
    const dateSet = new Set<string>()
    ;((a.data ?? []) as { question_key: string; correct: boolean; created_at: string }[]).forEach((row) => {
      ;(att[row.question_key] ||= []).push({ correct: row.correct })
      if (row.created_at) dateSet.add(dateKey(new Date(row.created_at)))
    })
    const rate: StudyData['rate'] = {}
    ;((r.data ?? []) as { question_key: string; stars: number }[]).forEach((row) => {
      rate[row.question_key] = row.stars
    })
    const progress: StudyData['progress'] = {}
    ;((p.data ?? []) as { case_id: string; mode: string; completed: boolean }[]).forEach((row) => {
      ;(progress[row.case_id] ||= {})[row.mode] = !!row.completed
    })
    return { att, rate, progress, dates: Array.from(dateSet) }
  } catch {
    return null
  }
}

/** Record one answered question. */
export async function recordAttempt(questionKey: string, correct: boolean): Promise<void> {
  if (!supabase) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    await supabase.from('attempts').insert({ user_id: uid, question_key: questionKey, correct })
  } catch {
    /* best-effort; the local state already reflects the attempt */
  }
}

/** Upsert a star rating for a question. */
export async function saveRating(questionKey: string, stars: number): Promise<void> {
  if (!supabase) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    await supabase.from('ratings').upsert({ user_id: uid, question_key: questionKey, stars }, { onConflict: 'user_id,question_key' })
  } catch {
    /* best-effort */
  }
}

/** Mark a case tier as completed. */
export async function saveCaseProgress(caseId: string, mode: string): Promise<void> {
  if (!supabase) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    await supabase.from('progress').upsert({ user_id: uid, case_id: caseId, mode, completed: true }, { onConflict: 'user_id,case_id,mode' })
  } catch {
    /* best-effort */
  }
}

/** Save one free-text ward-moment answer (keyed by case + prompt). */
export async function saveWardAnswer(caseId: string, promptId: string, answer: string): Promise<void> {
  if (!supabase) return
  const uid = await currentUserId()
  if (!uid) return
  try {
    await supabase.from('ward_answers').upsert({ user_id: uid, case_id: caseId, prompt_id: promptId, answer }, { onConflict: 'user_id,case_id,prompt_id' })
  } catch {
    /* best-effort */
  }
}

/** Load all of the signed-in user's free-text ward answers, as answers[caseId][promptId]. */
export async function loadWardAnswers(): Promise<Record<string, Record<string, string>>> {
  if (!supabase) return {}
  const uid = await currentUserId()
  if (!uid) return {}
  try {
    const { data } = await supabase.from('ward_answers').select('case_id, prompt_id, answer').eq('user_id', uid)
    const out: Record<string, Record<string, string>> = {}
    ;((data ?? []) as { case_id: string; prompt_id: string; answer: string }[]).forEach((r) => {
      ;(out[r.case_id] ||= {})[r.prompt_id] = r.answer
    })
    return out
  } catch {
    return {}
  }
}

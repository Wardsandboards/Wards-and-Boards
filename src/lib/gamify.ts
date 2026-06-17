// Personal gamification, computed from data the app already stores (answered
// questions, completed cases, study days). No backend changes; pure + testable.

export interface GameStats {
  answers: number // total questions answered (Practice + Learn)
  correct: number
  seen: number // distinct questions answered
  casesDone: number // cases with any tier completed
  streak: number // consecutive study days
  systems: { system: string; correct: number; total: number }[]
}

// Named levels follow the training ladder, which fits the audience.
export const LEVELS: { name: string; min: number }[] = [
  { name: 'Pre-clinical', min: 0 },
  { name: 'Student', min: 50 },
  { name: 'Intern', min: 150 },
  { name: 'Resident', min: 350 },
  { name: 'Senior resident', min: 700 },
  { name: 'Chief resident', min: 1200 },
  { name: 'Fellow', min: 2000 },
  { name: 'Attending', min: 3200 },
]

/** XP rewards answering, with a bonus for getting it right. */
export function xpFor(stats: { answers: number; correct: number }): number {
  return stats.answers * 10 + stats.correct * 5
}

export interface LevelInfo { index: number; name: string; next: string | null; xp: number; toNext: number; pct: number }

export function levelFor(xp: number): LevelInfo {
  let i = 0
  for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].min) i = k
  const cur = LEVELS[i]
  const next = LEVELS[i + 1] || null
  const span = next ? next.min - cur.min : 1
  const pct = next ? Math.min(100, Math.round(((xp - cur.min) / span) * 100)) : 100
  return { index: i, name: cur.name, next: next ? next.name : null, xp, toNext: next ? next.min - xp : 0, pct }
}

export interface Badge { id: string; icon: string; name: string; desc: string; earned: boolean }

export function badgesFor(stats: GameStats): Badge[] {
  const mastered = stats.systems.filter((s) => s.total >= 3 && s.correct / s.total >= 0.8).length
  return [
    { id: 'first', icon: '🌱', name: 'First steps', desc: 'Answer your first question', earned: stats.answers >= 1 },
    { id: 'ten', icon: '✅', name: 'Getting going', desc: 'Answer 10 questions', earned: stats.answers >= 10 },
    { id: 'fifty', icon: '💪', name: 'Committed', desc: 'Answer 50 questions', earned: stats.answers >= 50 },
    { id: 'hundred', icon: '💯', name: 'Century', desc: 'Answer 100 questions', earned: stats.answers >= 100 },
    { id: 'case', icon: '📘', name: 'Case closed', desc: 'Complete your first case', earned: stats.casesDone >= 1 },
    { id: 'streak3', icon: '🔥', name: 'On a roll', desc: 'Three-day study streak', earned: stats.streak >= 3 },
    { id: 'streak7', icon: '⚡', name: 'Week strong', desc: 'Seven-day study streak', earned: stats.streak >= 7 },
    { id: 'mastery', icon: '🏅', name: 'System mastery', desc: '80% or better in a system (3+ questions)', earned: mastered >= 1 },
  ]
}

/** Local date key (YYYY-MM-DD) for streak tracking. */
export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return d.getFullYear() + '-' + m + '-' + day
}

export function todayKey(now: Date = new Date()): string {
  return dateKey(now)
}

/**
 * Consecutive study days ending today (or yesterday, so a streak stays "alive"
 * through the current day until midnight). `days` is a list of YYYY-MM-DD keys.
 */
export function streakFromDays(days: string[], now: Date = new Date()): number {
  if (!days.length) return 0
  const set = new Set(days)
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(dateKey(cursor))) return 0
  }
  let streak = 0
  while (set.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

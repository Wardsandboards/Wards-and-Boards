import { describe, it, expect } from 'vitest'
import { xpFor, levelFor, badgesFor, streakFromDays, dateKey } from '../src/lib/gamify'
import type { GameStats } from '../src/lib/gamify'

const base: GameStats = { answers: 0, correct: 0, seen: 0, casesDone: 0, streak: 0, systems: [] }

describe('xpFor', () => {
  it('rewards answering plus a bonus for correct', () => {
    expect(xpFor({ answers: 0, correct: 0 })).toBe(0)
    expect(xpFor({ answers: 10, correct: 6 })).toBe(130) // 100 + 30
  })
})

describe('levelFor', () => {
  it('maps XP to the right named level', () => {
    expect(levelFor(0).name).toBe('Pre-clinical')
    expect(levelFor(50).name).toBe('Student')
    expect(levelFor(160).name).toBe('Intern')
  })
  it('reports progress toward the next level', () => {
    const l = levelFor(50) // Student (50) -> Intern (150)
    expect(l.next).toBe('Intern')
    expect(l.toNext).toBe(100)
    expect(l.pct).toBe(0)
    expect(levelFor(100).pct).toBe(50)
  })
  it('caps at the top level', () => {
    const top = levelFor(99999)
    expect(top.next).toBeNull()
    expect(top.pct).toBe(100)
  })
})

describe('badgesFor', () => {
  it('earns milestones as the counts cross thresholds', () => {
    const b = badgesFor({ ...base, answers: 50, correct: 40, casesDone: 1, streak: 3, systems: [{ system: 'Cardiology', correct: 9, total: 10 }] })
    const earned = (id: string) => b.find((x) => x.id === id)!.earned
    expect(earned('first')).toBe(true)
    expect(earned('fifty')).toBe(true)
    expect(earned('hundred')).toBe(false)
    expect(earned('case')).toBe(true)
    expect(earned('streak3')).toBe(true)
    expect(earned('streak7')).toBe(false)
    expect(earned('mastery')).toBe(true)
  })
  it('does not award system mastery below 80% or with too few questions', () => {
    const b = badgesFor({ ...base, answers: 5, systems: [{ system: 'Cardiology', correct: 1, total: 2 }, { system: 'Pulmonology', correct: 5, total: 9 }] })
    expect(b.find((x) => x.id === 'mastery')!.earned).toBe(false)
  })
})

describe('streakFromDays', () => {
  const now = new Date(2026, 5, 16) // local midnight, tz-safe
  it('counts consecutive days ending today', () => {
    expect(streakFromDays(['2026-06-16', '2026-06-15', '2026-06-14'], now)).toBe(3)
  })
  it('keeps the streak alive if today is missing but yesterday is present', () => {
    expect(streakFromDays(['2026-06-15', '2026-06-14'], now)).toBe(2)
  })
  it('breaks on a gap and is zero with no recent day', () => {
    expect(streakFromDays(['2026-06-16', '2026-06-14'], now)).toBe(1)
    expect(streakFromDays(['2026-06-10'], now)).toBe(0)
    expect(streakFromDays([], now)).toBe(0)
  })
  it('formats date keys as YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

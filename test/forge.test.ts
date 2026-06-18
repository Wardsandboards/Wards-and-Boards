import { describe, it, expect } from 'vitest'
import { forgeAudit } from '../src/lib/forge'

const clean = {
  vignette: 'A 70 year old patient reports three days of chest pressure that comes on with exertion and resolves with rest.',
  leadIn: 'Which of the following is the most appropriate next step?',
  options: ['Aspirin', 'Warfarin', 'Clopidogrel', 'Heparin', 'Metoprolol'],
  answerIndex: 0,
  explanation: 'Aspirin reduces early mortality after an acute coronary syndrome, which the other agents do not.',
}

describe('forgeAudit', () => {
  it('passes a clean, complete board-style item with zero hard flaws', () => {
    const r = forgeAudit(clean)
    expect(r.ok).toBe(true)
    expect(r.hardFails).toHaveLength(0)
    expect(r.ready).toBe(true)
  })

  it('returns one rule per check, each with a severity', () => {
    const r = forgeAudit(clean)
    expect(r.rules.length).toBeGreaterThan(10)
    expect(r.rules.every((x) => x.severity === 'hard' || x.severity === 'soft')).toBe(true)
  })

  // The reported failure mode: a 5-word stub must NOT pass most checks. Flaw
  // checks should read N/A (not a false ✓) until the draft is actually complete.
  it('fails a barely-started stub and marks flaw checks N/A, not passing', () => {
    const r = forgeAudit({
      vignette: 'CHF hypervolemia with lower blood pressure',
      leadIn: 'What is the cause of the low blood pressure?',
      options: ['CO', 'SV', 'HR', '', ''],
      answerIndex: 0,
      explanation: '',
    })
    expect(r.ok).toBe(false)
    expect(r.ready).toBe(false)
    const failIds = r.hardFails.map((f) => f.id)
    expect(failIds).toEqual(expect.arrayContaining(['STEM_VIGNETTE', 'LEAD_CLOSED', 'OPT_FILLED', 'EXPLANATION']))
    // Option-level flaw checks cannot be judged yet, so they are N/A, not green.
    const byId = (id: string) => r.rules.find((x) => x.id === id)
    expect(byId('KEY_NOT_LONGEST')!.status).toBe('na')
    expect(byId('NONE_ABOVE')!.status).toBe('na')
    expect(byId('CONVERGENCE')!.status).toBe('na')
    expect(byId('CLANG')!.status).toBe('na')
  })

  it('requires a written explanation', () => {
    const r = forgeAudit({ ...clean, explanation: 'Too short.' })
    expect(r.hardFails.some((f) => f.id === 'EXPLANATION')).toBe(true)
  })

  it('requires four or five real (non-placeholder) options', () => {
    const r = forgeAudit({ ...clean, options: ['Aspirin', 'Warfarin', '', ''] })
    expect(r.hardFails.some((f) => f.id === 'OPT_FILLED')).toBe(true)
  })

  it('flags a thin vignette as a hard STEM_VIGNETTE failure', () => {
    const r = forgeAudit({ ...clean, vignette: 'Short.' })
    expect(r.ok).toBe(false)
    expect(r.hardFails.some((f) => f.id === 'STEM_VIGNETTE')).toBe(true)
  })

  it('flags none-of-the-above and a negative lead-in', () => {
    const r = forgeAudit({ ...clean, options: ['Aspirin', 'Warfarin', 'Heparin', 'None of the above'], leadIn: 'Which of the following is NOT indicated?' })
    expect(r.hardFails.some((f) => f.id === 'NONE_ABOVE')).toBe(true)
    expect(r.hardFails.some((f) => f.id === 'NEG_STEM')).toBe(true)
  })

  it('flags the key being uniquely the longest option', () => {
    const r = forgeAudit({ ...clean, options: ['Begin high dose aspirin therapy in the emergency department now', 'Warfarin', 'Heparin', 'Digoxin'], answerIndex: 0 })
    expect(r.hardFails.some((f) => f.id === 'KEY_NOT_LONGEST')).toBe(true)
  })

  it('catches an em-dash (Ward Moments house rule)', () => {
    const r = forgeAudit({ ...clean, vignette: clean.vignette + ' Vitals — stable.' })
    expect(r.hardFails.some((f) => f.id === 'NO_EMDASH')).toBe(true)
  })
})

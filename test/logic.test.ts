import { describe, it, expect } from 'vitest'
import { categoryOf } from '../src/constants'
import { attributionFor, boardBankFromJson } from '../src/lib/questions'
import { buildAnkiCard, ankiCard } from '../src/lib/anki'
import { gradeAnswer } from '../src/lib/grade'
import boardJson from '../src/data/questions.board.json'

describe('board bank data integrity', () => {
  it('every answerIndex is a real number within the options range', () => {
    // Catches the string-typed answerIndex bug ("1" vs 1), which silently
    // breaks correct-answer matching (1 === "1" is false).
    const bad = (boardJson as unknown as { options: string[]; answerIndex: unknown }[])
      .map((q, i) => ({ i, answerIndex: q.answerIndex, len: q.options.length }))
      .filter((q) => typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex >= q.len)
    expect(bad).toEqual([])
  })
})

describe('categoryOf', () => {
  it('maps systems to display categories', () => {
    expect(categoryOf('Cardiovascular')).toBe('Cardiology')
    expect(categoryOf('Hematology')).toBe('Hematology')
    expect(categoryOf('Respiratory')).toBe('Pulmonology')
    expect(categoryOf('Oxygen transport')).toBe('Pulmonology')
    expect(categoryOf('Renal')).toBe('Other')
  })
})

describe('attributionFor', () => {
  it('assigns an author and two distinct reviewers by system', () => {
    const att = attributionFor({ system: 'Cardiology' })
    expect(att.author.id).toBe('rivera')
    expect(att.reviewers).toHaveLength(2)
    expect(att.reviewers.map((r) => r.id)).not.toContain(att.author.id)
  })
  it('routes hematology and pulmonology to different authors', () => {
    expect(attributionFor({ system: 'Hematology' }).author.id).toBe('okafor')
    expect(attributionFor({ system: 'Pulmonology' }).author.id).toBe('chen')
  })
})

describe('boardBankFromJson', () => {
  const bank = boardBankFromJson()
  it('shapes every published question into a Practice item that passes the gate', () => {
    expect(bank.length).toBeGreaterThan(0)
    expect(bank.every((q) => q.source === 'Forge')).toBe(true)
    expect(bank.every((q) => q.id.endsWith('-b'))).toBe(true)
    expect(bank.every((q) => /^WB-2026-\d{4}$/.test(q.citableId || ''))).toBe(true)
    expect(bank.every((q) => q.lint.ok)).toBe(true)
  })
})

describe('anki cards', () => {
  it('builds a Front/Back card from a question', () => {
    const card = buildAnkiCard({ stem: 'Stem?', choices: ['a', 'b'], correct: 1, explanation: 'why' })
    expect(card.front).toContain('Stem?')
    expect(card.front).toContain('A. a')
    expect(card.back).toContain('Answer: B. b')
    expect(card.back).toContain('why')
  })
  it('falls back to a built card when no learning point exists', () => {
    const card = ankiCard('no-such-key:zz', { stem: 'S', choices: ['x', 'y'], correct: 0 })
    expect(card.back).toContain('Answer: A. x')
  })
})

describe('gradeAnswer', () => {
  it('marks a concept hit only when a keyword appears', () => {
    const rubric = [{ concept: 'Preload rises', keywords: ['preload', 'filling'] }, { concept: 'Output falls', keywords: ['stroke volume', 'output'] }]
    const out = gradeAnswer('the preload increases sharply', rubric)
    expect(out[0].hit).toBe(true)
    expect(out[1].hit).toBe(false)
  })
})

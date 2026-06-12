import { describe, it, expect } from 'vitest'
import { boardLint } from '../src/lib/boardLint'
import bank from '../src/data/questions.board.json'
import type { BoardQuestion } from '../src/types'

// A deliberately clean item: direct "which of the following ...?" lead-in,
// key is not the longest option, four options, no clueing.
const clean = {
  vignette: 'A 68-year-old patient reports fatigue and weight gain over several months.',
  leadIn: 'Which of the following is the most likely diagnosis?',
  options: [
    'Primary hypothyroidism',
    'Iron deficiency anemia of chronic disease',
    'Adrenal insufficiency from pituitary failure',
    'Chronic obstructive pulmonary disease exacerbation',
  ],
  answerIndex: 0,
}

describe('boardLint rules', () => {
  it('passes a well-formed item', () => {
    expect(boardLint(clean)).toEqual({ ok: true, fails: [] })
  })

  it('flags a lead-in that is not a "which of the following ...?" question', () => {
    expect(boardLint({ ...clean, leadIn: 'The mechanism is best described by' }).fails).toContain('lead-in form')
  })

  it('flags cover-the-options stems', () => {
    expect(boardLint({ ...clean, leadIn: 'Which of the following statements is correct?' }).fails).toContain(
      'cover-the-options',
    )
  })

  it('flags when the key is the longest option', () => {
    const item = {
      ...clean,
      answerIndex: 0,
      options: [
        'A markedly longer correct answer that simply runs on well past the others',
        'Short one',
        'Short two',
        'Short three',
      ],
    }
    expect(boardLint(item).fails).toContain('key is longest')
  })

  it('flags none/all of the above', () => {
    expect(boardLint({ ...clean, options: [...clean.options.slice(0, 3), 'All of the above'] }).fails).toContain(
      'none/all of above',
    )
  })

  it('flags negative lead-ins not written as EXCEPT', () => {
    expect(boardLint({ ...clean, leadIn: 'Which of the following is not associated with the condition?' }).fails).toContain(
      'negative lead-in',
    )
  })

  it('flags em/en dashes', () => {
    expect(boardLint({ ...clean, vignette: clean.vignette + ' Pain — sharp.' }).fails).toContain('em/en dash')
  })

  it('flags wrong option counts', () => {
    expect(boardLint({ ...clean, options: clean.options.slice(0, 3) }).fails).toContain('option count')
  })
})

describe('the published board bank', () => {
  const questions = bank as BoardQuestion[]

  it('loads every question', () => {
    expect(questions.length).toBeGreaterThan(0)
  })

  it('every shipped question passes the Forge gate', () => {
    const dirty = questions
      .map((q) => ({ id: q.origQuestionId, title: q.caseTitle, fails: boardLint(q).fails }))
      .filter((r) => r.fails.length > 0)
    expect(dirty).toEqual([])
  })
})

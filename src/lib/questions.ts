import { boardLint } from './boardLint'
import { CASES } from '../data/cases'
import { COMMUNITY_AUTHORS } from '../data/authors'
import boardJson from '../data/questions.board.json'
import type { Attribution, BoardQuestion, PracticeItem } from '../types'

/** Board items derived from each case's MS1 questions (Ward Moments source). */
export function buildQuestions(): PracticeItem[] {
  const out: PracticeItem[] = []
  CASES.filter((c) => c.active !== false && c.ms1 && c.ms1.questions).forEach((c) => {
    c.ms1.questions.forEach((q, i) => {
      if (!q.choices) return
      const it = {
        id: c.id + '-' + (q.id || i),
        caseId: c.id,
        qkey: c.id + ':' + (q.id || i),
        caseTitle: c.title,
        system: c.system,
        topic: c.topic,
        vignette: (c.vignette || '').replace(/\s+/g, ' ').trim(),
        leadIn: q.stem,
        options: q.choices,
        answerIndex: q.correct,
        explanation: q.feedback,
        source: 'Ward Moments',
      } as PracticeItem
      it.lint = boardLint(it)
      out.push(it)
    })
  })
  return out
}

/** The published board bank (questions.board.json), shaped for Practice. */
export function boardBankFromJson(): PracticeItem[] {
  const arr = boardJson as BoardQuestion[]
  return arr.map((q, i) => {
    const it = {
      id: q.caseId + '-' + q.origQuestionId + '-b',
      caseId: q.caseId,
      qkey: q.caseId + ':' + q.origQuestionId,
      caseTitle: q.caseTitle,
      system: q.system,
      topic: q.topic,
      vignette: q.vignette,
      leadIn: q.leadIn,
      options: q.options,
      answerIndex: q.answerIndex,
      explanation: q.explanation,
      source: 'Forge',
      citableId: 'WB-2026-' + String(i + 1).padStart(4, '0'),
    } as PracticeItem
    it.lint = boardLint(it)
    return it
  })
}

/** Deterministically assign an author + two reviewers to an item by system. */
export function attributionFor(q: { system?: string }): Attribution {
  const byId = (k: string) => COMMUNITY_AUTHORS.find((a) => a.id === k)
  const sys = (q && q.system) || ''
  let aid = 'patel'
  if (/cardi/i.test(sys)) aid = 'rivera'
  else if (/hema/i.test(sys)) aid = 'okafor'
  else if (/resp|pulm/i.test(sys)) aid = 'chen'
  const author = byId(aid) || COMMUNITY_AUTHORS[0]
  const others = COMMUNITY_AUTHORS.filter((a) => a.id !== author.id)
  return { author, reviewers: [others[0], others[1]] }
}

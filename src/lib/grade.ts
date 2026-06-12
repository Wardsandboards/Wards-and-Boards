import type { Rubric } from '../types'

/** Keyword-match a free-text answer against a rubric of key concepts. */
export function gradeAnswer(text: string, rubric: Rubric[]) {
  const lower = text.toLowerCase()
  return rubric.map((it) => ({
    concept: it.concept,
    hit: it.keywords.some((kw) => lower.includes(kw.toLowerCase())),
  }))
}

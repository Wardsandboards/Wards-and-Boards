import { LEARNING_POINTS } from '../data/learningPoints'
import type { LearningPoint } from '../types'

export const ankiLetter = (i: number) => String.fromCharCode(65 + i)

interface CardFallback {
  stem: string
  choices: string[]
  correct: number
  explanation?: string
}

/**
 * Distilled key-learning-point card for a question, keyed by "caseId:questionId".
 * Falls back to the question-and-answer card if no learning point is defined.
 */
export function lpFor(qkey: string): LearningPoint | null {
  const lp = LEARNING_POINTS[qkey]
  return lp ? { front: lp.front, back: lp.back } : null
}

export function buildAnkiCard({ stem, choices, correct, explanation }: CardFallback): LearningPoint {
  const front = stem + '<br><br>' + choices.map((o, i) => ankiLetter(i) + '. ' + o).join('<br>')
  const back = 'Answer: ' + ankiLetter(correct) + '. ' + choices[correct] + (explanation ? '<br><br>' + explanation : '')
  return { front, back }
}

export function ankiCard(qkey: string, fallback: CardFallback): LearningPoint {
  return lpFor(qkey) || buildAnkiCard(fallback)
}

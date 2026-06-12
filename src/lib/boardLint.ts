import type { LintInput, LintResult } from '../types'

// ============================================================
//  The Forge gate — a deterministic board item-writing linter.
//
//  Ported verbatim (behavior-for-behavior) from the original
//  single-file prototype. Each rule encodes one NBME-style
//  item-writing flaw. Pure and side-effect free, so it is the
//  natural first thing to unit-test.
// ============================================================

// Function words ignored when comparing the stem against the key for clueing.
const STOP = new Set(
  'the a an of to in is are was were with and or for on at by from as has have had patient who which following most likely best explains shows this that these those'.split(
    /\s+/,
  ),
)

/** Lowercased word tokens (letters and internal hyphens only). */
const words = (s: string | undefined): string[] =>
  (s || '').toLowerCase().match(/[a-z][a-z\-]{1,}/g) || []

/** Content words: long enough to matter and not a stop word. */
const content = (s: string | undefined): string[] =>
  words(s).filter((x) => x.length > 3 && !STOP.has(x))

/** Trimmed character length. */
const len = (s: string | undefined): number => (s || '').trim().length

/**
 * Run one item through the Forge gate.
 * Returns the violated rule keys; `ok` is true only when none fire.
 */
export function boardLint(it: LintInput): LintResult {
  const options = it.options || []
  const key = options[it.answerIndex ?? -1] || ''
  const distractors = options.filter((_, i) => i !== it.answerIndex)
  const lead = (it.leadIn || '').trim()
  const fails: string[] = []

  // Lead-in must be a direct "Which of the following ...?" question.
  if (!/which of the following/i.test(lead) || !lead.endsWith('?'))
    fails.push('lead-in form')

  // "Which of the following statements is true/correct" forces the reader to
  // cover the options instead of reasoning to a single best answer.
  if (/which of the following (statements?|is true|is correct)/i.test(lead))
    fails.push('cover-the-options')

  // The correct answer should not be conspicuously the longest option.
  if (len(key) > 0 && distractors.length > 0 && distractors.every((x) => len(x) < len(key)))
    fails.push('key is longest')

  if (options.some((x) => /\b(none|all|both) of the (above|following)\b/i.test(x)))
    fails.push('none/all of above')

  // Negative lead-ins are allowed only when EXCEPT is written in capitals.
  if (/\b(except|not|least)\b/i.test(lead) && !/\bEXCEPT\b/.test(lead))
    fails.push('negative lead-in')

  if (/[—–]/.test((it.vignette || '') + lead + options.join(' ')))
    fails.push('em/en dash')

  // Clang clue: a content word that appears in the stem and in the key but in
  // none of the distractors quietly points to the answer.
  {
    const stem = new Set(content((it.vignette || '') + ' ' + lead))
    const clang = content(key).filter(
      (x) => stem.has(x) && !distractors.some((y) => words(y).includes(x)),
    )
    if (clang.length) fails.push('clang')
  }

  if (options.length < 4 || options.length > 5) fails.push('option count')

  return { ok: fails.length === 0, fails }
}

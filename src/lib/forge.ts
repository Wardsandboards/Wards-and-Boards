import type { LintInput } from '../types'

// ============================================================
//  The Item Forge audit — the full deterministic board-exam +
//  Ward Moments lint engine, ported from the Item Forge prototype
//  (item-forge/index.html). It is a superset of boardLint: every
//  rule reports {pass, severity, detail} so the authoring UI can
//  show a per-rule ✓ / ✕ / ! checklist of exactly what to fix.
//
//  'hard' rules block submission; 'soft' rules are polish warnings.
//  Pure and side-effect free (no AI) — the AI parts of the Item
//  Forge are intentionally left out (no AI-assisted authoring).
// ============================================================

export type Severity = 'hard' | 'soft'

export interface ForgeRule {
  id: string
  label: string
  severity: Severity
  pass: boolean
  detail: string
}

export interface ForgeResult {
  rules: ForgeRule[]
  hardFails: ForgeRule[]
  ok: boolean
}

/** Items the audit inspects: a draft/board item plus its explanation. */
export type ForgeInput = LintInput & { explanation?: string }

const STOP = new Set(
  'the a an of to in is are was were with and or for on at by from as has have had patient who which following most likely best explains shows reveals presents history exam years old year man woman that this these those his her their would could should also after before during'.split(
    /\s+/,
  ),
)
const ABSOLUTE = /\b(always|never|all|none|only|every|must|cannot|entirely|exclusively)\b/i
const VAGUE = /\b(usually|frequently|often|sometimes|rarely|occasionally|may|might|can|could|generally|typically)\b/i
const EXAGGERATED = /\b(massive|severe(?:ly)?|extremely|huge|terrible|dramatic(?:ally)?|classic|textbook|obvious(?:ly)?|striking|profound)\b/i
const GENDERED = /\b(he|she|him|her|his|hers|male|female|man|woman|men|women|gentleman|lady|boy|girl|mother|father|mr|mrs|ms)\b/i
const KNOWN_ACRONYMS = ['COPD', 'JVP', 'MI', 'CHF', 'BP', 'HR', 'RR', 'CBC', 'BUN', 'LDH', 'ECG', 'EKG', 'CXR', 'ABG', 'DKA', 'PE', 'DVT', 'GERD', 'CKD', 'AKI', 'TIA', 'CVA', 'ARDS', 'SOB', 'LFT', 'TSH', 'INR', 'PFT', 'ICU', 'ED', 'IV', 'PO', 'CT', 'MRI', 'HFrEF', 'HFpEF', 'PaO2', 'PaCO2']

const words = (s: string | undefined): string[] => (s || '').toLowerCase().match(/[a-z][a-z\-]{1,}/g) || []
const content = (s: string | undefined): string[] => words(s).filter((w) => w.length > 3 && !STOP.has(w))
const chars = (s: string | undefined): number => (s || '').trim().length
const firstNum = (s: string | undefined): number | null => {
  const m = (s || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}

/** Run an item through the full Item Forge audit. */
export function forgeAudit(item: ForgeInput): ForgeResult {
  const opts = item.options || []
  const texts = opts.map((o) => (typeof o === 'string' ? o : ''))
  const idx = item.answerIndex ?? -1
  const key = texts[idx] || ''
  const distractors = texts.filter((_, i) => i !== idx)
  const lead = (item.leadIn || '').trim()
  const vig = (item.vignette || '').trim()
  const R: ForgeRule[] = []
  const add = (id: string, label: string, severity: Severity, pass: boolean, detail: string) => R.push({ id, label, severity, pass, detail })

  // ---- Structure ----
  add('STEM_VIGNETTE', 'Vignette has clinical detail', 'hard',
    chars(vig) >= 80 && /\b(\d+)\s*(?:-?\s*year|yo\b|month|week)/i.test(vig),
    'Needs patient age plus presentation, exam, and data (at least a couple of sentences).')
  add('LEAD_CLOSED', 'Closed, standardized lead-in', 'hard',
    /which of the following/i.test(lead) && lead.endsWith('?'),
    'Use a "Which of the following is the most likely…?" form ending in "?".')
  add('COVER_OPTIONS', 'Passes cover-the-options', 'hard',
    !/which of the following (statements?|is true|is correct|are true)/i.test(lead),
    'Open "which is true" stems fail the cover-the-options test; make the lead-in answerable without the options.')
  add('LEAD_FOCUSED', 'Lead-in is a single focused question', 'soft',
    (lead.match(/\?/g) || []).length <= 1 && !/;/.test(lead),
    'Ask one focused question only.')
  add('OPT_COUNT', 'Four or five options', 'hard',
    texts.length >= 4 && texts.length <= 5, 'Board items use 4 to 5 homogeneous options.')

  // ---- Testwiseness flaws ----
  add('KEY_NOT_LONGEST', 'Correct answer is not the longest', 'hard',
    !(chars(key) > 0 && distractors.length > 0 && distractors.every((d) => chars(d) < chars(key))),
    'The key must not be uniquely the longest option.')
  add('LEN_BALANCE', 'Options are similar length', 'soft',
    (() => { const L = texts.map(chars).filter((n) => n > 0); if (L.length < 2) return true; return Math.max(...L) / Math.max(1, Math.min(...L)) <= 2.2 })(),
    'Keep option lengths within about 2x of each other.')
  add('ABSOLUTE_TERMS', 'No absolute terms in options', 'soft',
    !texts.some((t) => ABSOLUTE.test(t)), 'Avoid always / never / all / none / only in options.')
  add('CLANG', 'No word repeated only in the key', 'hard',
    (() => { const stemSet = new Set(content(vig + ' ' + lead)); const keyOnly = content(key).filter((w) => stemSet.has(w) && !distractors.some((d) => words(d).includes(w))); return keyOnly.length === 0 })(),
    'A distinctive stem word echoed only by the key is a clang clue.')
  add('CONVERGENCE', 'Key is not the convergence option', 'hard',
    (() => {
      if (texts.length < 3) return true
      const overlap = (i: number) => texts.reduce((a, t, j) => (j === i ? a : a + content(texts[i]).filter((w) => words(t).includes(w)).length), 0)
      const scores = texts.map((_, i) => overlap(i)); const mx = Math.max(...scores)
      return !(scores[idx] === mx && scores.filter((s) => s === mx).length === 1)
    })(),
    'The key shares the most words with the other options (a convergence cue).')
  add('GRAMMAR_AAN', 'Article a / an agreement', 'soft',
    !texts.some((t) => /\ban?\b/i.test(t)) || texts.every((t) => { const m = t.match(/\b(a|an)\s+([a-z])/i); if (!m) return true; const vowel = /[aeiou]/i.test(m[2]); return (m[1].toLowerCase() === 'an') === vowel }),
    'Match "a" / "an" to the following sound.')

  // ---- Irrelevant difficulty ----
  add('NONE_ABOVE', 'No none / all of the above', 'hard',
    !texts.some((t) => /\b(none|all|both) of the (above|following)\b/i.test(t)),
    'Remove "none / all of the above".')
  add('NEG_STEM', 'No negative lead-in', 'hard',
    !/\b(except|not|least|never)\b/i.test(lead) || /\bEXCEPT\b/.test(lead),
    'Avoid negative stems; if unavoidable, capitalize EXCEPT.')
  add('NUM_ORDER', 'Numeric options ordered low to high', 'hard',
    (() => { const nums = texts.map(firstNum); if (nums.some((n) => n === null)) return true; for (let i = 1; i < nums.length; i++) if ((nums[i] as number) < (nums[i - 1] as number)) return false; return true })(),
    'All-numeric options must ascend.')
  add('VAGUE_FREQ', 'No vague frequency terms', 'soft',
    !texts.some((t) => VAGUE.test(t)), 'Avoid usually / often / may in options.')
  add('PARALLEL', 'Options grammatically parallel', 'soft',
    (() => { const caps = texts.map((t) => /^[A-Z]/.test(t.trim())); const dot = texts.map((t) => /[.]$/.test(t.trim())); return caps.every((c) => c === caps[0]) && dot.every((d) => d === dot[0]) })(),
    'Match capitalization and punctuation across options.')

  // ---- Ward Moments house rules ----
  add('NO_EMDASH', 'No em or en dashes', 'hard',
    !/[—–]/.test(vig + lead + texts.join(' ') + (item.explanation || '')),
    'Replace any — or – with commas or rephrase.')
  add('UNGENDERED', 'Ungendered patient', 'soft',
    !GENDERED.test(vig), 'Use "the patient" rather than gendered terms.')
  add('NO_EXAGGERATION', 'No exaggerated words', 'soft',
    !EXAGGERATED.test(vig + ' ' + lead), 'Avoid classic / textbook / severe / obvious.')
  add('ACRONYMS', 'Acronyms spelled out', 'soft',
    (() => { const used = KNOWN_ACRONYMS.filter((a) => new RegExp('\\b' + a + '\\b').test(vig + ' ' + texts.join(' '))); return used.every((a) => new RegExp('\\([^)]*' + a + '|' + a + '\\s*\\(').test(vig + ' ' + texts.join(' '))) })(),
    'Spell out each acronym on first use, e.g. jugular venous pressure (JVP).')

  const hardFails = R.filter((r) => r.severity === 'hard' && !r.pass)
  return { rules: R, hardFails, ok: hardFails.length === 0 }
}

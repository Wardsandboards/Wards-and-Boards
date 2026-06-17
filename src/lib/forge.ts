import type { LintInput } from '../types'

// ============================================================
//  The Item Forge audit — the deterministic board-exam + Ward
//  Moments item-writing engine, ported and extended from the
//  Item Forge prototype (item-forge/index.html).
//
//  KEY DESIGN (reassessed): a mechanical linter mostly checks for
//  the ABSENCE of a flaw, so a nearly-empty draft passes those
//  vacuously. To avoid green-checking a 5-word stub, the audit is
//  split into two sections:
//    1. COMPLETENESS — does the item actually exist? (vignette,
//       closed lead-in, 4–5 real options, a marked key, an
//       explanation). These always evaluate and fail when empty.
//    2. FLAWS — testwiseness / item-writing flaws. Each is N/A
//       ('na') until its inputs are present (e.g. option flaws
//       wait for 4 filled options), so they never show a false ✓
//       on an empty draft.
//
//  'hard' blocks submission; 'soft' is a polish warning; 'na' is
//  not-yet-applicable. Pure, no AI (the Item Forge's Claude parts
//  are intentionally excluded — no AI-assisted authoring).
// ============================================================

export type Severity = 'hard' | 'soft'
export type Status = 'pass' | 'fail' | 'na'
export type Section = 'complete' | 'flaws'

export interface ForgeRule {
  id: string
  label: string
  section: Section
  severity: Severity
  status: Status
  pass: boolean // convenience: status === 'pass'
  detail: string
}

export interface ForgeResult {
  rules: ForgeRule[]
  hardFails: ForgeRule[]
  softWarns: ForgeRule[]
  ok: boolean
  ready: boolean // enough content for the flaw checks to be meaningful
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
const KNOWN_ACRONYMS = ['COPD', 'JVP', 'MI', 'CHF', 'BP', 'HR', 'RR', 'CBC', 'BUN', 'LDH', 'ECG', 'EKG', 'CXR', 'ABG', 'DKA', 'PE', 'DVT', 'GERD', 'CKD', 'AKI', 'TIA', 'CVA', 'ARDS', 'SOB', 'LFT', 'TSH', 'INR', 'PFT', 'ICU', 'ED', 'IV', 'PO', 'CT', 'MRI', 'CO', 'SV', 'EF', 'SVR', 'PCWP', 'HFrEF', 'HFpEF', 'PaO2', 'PaCO2']

const words = (s: string | undefined): string[] => (s || '').toLowerCase().match(/[a-z][a-z\-]{1,}/g) || []
const content = (s: string | undefined): string[] => words(s).filter((w) => w.length > 3 && !STOP.has(w))
const chars = (s: string | undefined): number => (s || '').trim().length
const firstNum = (s: string | undefined): number | null => {
  const m = (s || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}
// A slot counts as a real option only if it has text and is not still a placeholder.
const isFilled = (t: string): boolean => t.trim() !== '' && !/^option\s+[a-e]$/i.test(t.trim())

/** Run an item through the full Item Forge audit (completeness + flaws). */
export function forgeAudit(item: ForgeInput): ForgeResult {
  const allOpts = (item.options || []).map((o) => (typeof o === 'string' ? o : '').trim())
  const filled = allOpts.filter(isFilled)
  const nFilled = filled.length
  const idx = item.answerIndex ?? -1
  const keyText = idx >= 0 ? (allOpts[idx] || '') : ''
  const keyFilled = isFilled(keyText)
  const distractors = filled.filter((t) => t !== keyText)
  const lead = (item.leadIn || '').trim()
  const vig = (item.vignette || '').trim()
  const expl = (item.explanation || '').trim()

  // Applicability gates — a flaw check is N/A until its inputs exist.
  const leadPresent = lead.length > 0
  const vignettePresent = chars(vig) >= 20
  const optionsReady = nFilled >= 4
  const anyText = chars(vig) > 0 || nFilled > 0 || chars(expl) > 0

  const R: ForgeRule[] = []
  const add = (id: string, label: string, section: Section, severity: Severity, applicable: boolean, pass: boolean, detail: string) => {
    const status: Status = !applicable ? 'na' : pass ? 'pass' : 'fail'
    R.push({ id, label, section, severity, status, pass: status === 'pass', detail })
  }

  // ---- 1. COMPLETENESS (always evaluated) ----
  add('STEM_VIGNETTE', 'Vignette has real clinical detail', 'complete', 'hard', true,
    chars(vig) >= 80 && /\b(\d+)\s*(?:-?\s*year|yo\b|month|week)/i.test(vig),
    'Write at least a couple of sentences: patient age, presentation, exam, and data.')
  add('LEAD_CLOSED', 'Closed, standardized lead-in', 'complete', 'hard', true,
    /which of the following/i.test(lead) && lead.endsWith('?'),
    'Use a "Which of the following is the most likely…?" form ending in "?".')
  add('LEAD_FOCUSED', 'Lead-in is one focused question', 'complete', 'soft', leadPresent,
    (lead.match(/\?/g) || []).length <= 1 && !/;/.test(lead), 'Ask a single focused question.')
  add('OPT_FILLED', 'Four or five real options written', 'complete', 'hard', true,
    nFilled >= 4 && nFilled <= 5, 'Write 4 to 5 real answer options (you have ' + nFilled + ').')
  add('ANSWER_MARKED', 'A correct answer is marked', 'complete', 'hard', true,
    keyFilled, 'Select the radio next to the option that is correct.')
  add('EXPLANATION', 'Explanation written', 'complete', 'hard', true,
    chars(expl) >= 40, 'Explain why the key is right and why each distractor is wrong.')

  // ---- 2. FLAWS (N/A until their inputs are present) ----
  add('COVER_OPTIONS', 'Answerable without the options', 'flaws', 'hard', leadPresent,
    !/which of the following (statements?|is true|is correct|are true)/i.test(lead),
    'Open "which is true" stems fail cover-the-options; make the stem answerable before the options.')
  add('NEG_STEM', 'No negative lead-in', 'flaws', 'hard', leadPresent,
    !/\b(except|not|least|never)\b/i.test(lead) || /\bEXCEPT\b/.test(lead),
    'Avoid negative stems; if unavoidable, capitalize EXCEPT.')
  add('OPT_SUBSTANTIVE', 'Options are real answers, not stubs', 'flaws', 'hard', optionsReady,
    filled.every((t) => t.length >= 3 && /[a-z]{3}/i.test(t)),
    'Each option should be a real answer phrase, not a one or two letter abbreviation.')
  add('OPT_DISTINCT', 'Options are all different', 'flaws', 'hard', optionsReady,
    new Set(filled.map((t) => t.toLowerCase())).size === filled.length, 'Two options are identical; make each distinct.')
  add('KEY_NOT_LONGEST', 'Key is not the longest option', 'flaws', 'hard', optionsReady && keyFilled,
    !(chars(keyText) > 0 && distractors.length > 0 && distractors.every((d) => chars(d) < chars(keyText))),
    'The key must not be uniquely the longest option.')
  add('LEN_BALANCE', 'Options are similar length', 'flaws', 'soft', optionsReady,
    (() => { const L = filled.map(chars); if (L.length < 2) return true; return Math.max(...L) / Math.max(1, Math.min(...L)) <= 2.2 })(),
    'Keep option lengths within about 2x of each other.')
  add('ABSOLUTE_TERMS', 'No absolute terms in options', 'flaws', 'soft', optionsReady,
    !filled.some((t) => ABSOLUTE.test(t)), 'Avoid always / never / all / none / only in options.')
  add('CLANG', 'No word repeated only in the key', 'flaws', 'hard', optionsReady && vignettePresent && keyFilled,
    (() => { const stemSet = new Set(content(vig + ' ' + lead)); const keyOnly = content(keyText).filter((w) => stemSet.has(w) && !distractors.some((d) => words(d).includes(w))); return keyOnly.length === 0 })(),
    'A distinctive stem word echoed only by the key is a clang clue.')
  add('CONVERGENCE', 'Key is not the convergence option', 'flaws', 'hard', optionsReady && keyFilled,
    (() => {
      if (filled.length < 3) return true
      const overlap = (i: number) => filled.reduce((a, t, j) => (j === i ? a : a + content(filled[i]).filter((w) => words(t).includes(w)).length), 0)
      const scores = filled.map((_, i) => overlap(i)); const mx = Math.max(...scores); const keyIdx = filled.indexOf(keyText)
      return !(keyIdx >= 0 && scores[keyIdx] === mx && scores.filter((s) => s === mx).length === 1)
    })(),
    'The key shares the most words with the other options (a convergence cue).')
  add('GRAMMAR_AAN', 'Article a / an agreement', 'flaws', 'soft', optionsReady,
    filled.every((t) => { const m = t.match(/\b(a|an)\s+([a-z])/i); if (!m) return true; const vowel = /[aeiou]/i.test(m[2]); return (m[1].toLowerCase() === 'an') === vowel }),
    'Match "a" / "an" to the following sound.')
  add('NONE_ABOVE', 'No none / all of the above', 'flaws', 'hard', optionsReady,
    !filled.some((t) => /\b(none|all|both) of the (above|following)\b/i.test(t)), 'Remove "none / all of the above".')
  add('NUM_ORDER', 'Numeric options ordered low to high', 'flaws', 'hard', optionsReady,
    (() => { const nums = filled.map(firstNum); if (nums.some((n) => n === null)) return true; for (let i = 1; i < nums.length; i++) if ((nums[i] as number) < (nums[i - 1] as number)) return false; return true })(),
    'All-numeric options must ascend.')
  add('VAGUE_FREQ', 'No vague frequency terms', 'flaws', 'soft', optionsReady,
    !filled.some((t) => VAGUE.test(t)), 'Avoid usually / often / may in options.')
  add('PARALLEL', 'Options grammatically parallel', 'flaws', 'soft', optionsReady,
    (() => { const caps = filled.map((t) => /^[A-Z]/.test(t)); const dot = filled.map((t) => /[.]$/.test(t)); return caps.every((c) => c === caps[0]) && dot.every((d) => d === dot[0]) })(),
    'Match capitalization and punctuation across options.')
  add('NO_EMDASH', 'No em or en dashes', 'flaws', 'hard', anyText,
    !/[—–]/.test(vig + lead + filled.join(' ') + expl), 'Replace any — or – with commas or rephrase.')
  add('UNGENDERED', 'Ungendered patient', 'flaws', 'soft', vignettePresent,
    !GENDERED.test(vig), 'Use "the patient" rather than gendered terms.')
  add('NO_EXAGGERATION', 'No exaggerated words', 'flaws', 'soft', vignettePresent,
    !EXAGGERATED.test(vig + ' ' + lead), 'Avoid classic / textbook / severe / obvious.')
  add('ACRONYMS', 'Acronyms spelled out', 'flaws', 'soft', vignettePresent || optionsReady,
    (() => { const hay = vig + ' ' + filled.join(' '); const used = KNOWN_ACRONYMS.filter((a) => new RegExp('\\b' + a + '\\b').test(hay)); return used.every((a) => new RegExp('\\([^)]*' + a + '|' + a + '\\s*\\(').test(hay)) })(),
    'Spell out each acronym on first use, e.g. jugular venous pressure (JVP).')

  const hardFails = R.filter((r) => r.severity === 'hard' && r.status === 'fail')
  const softWarns = R.filter((r) => r.severity === 'soft' && r.status === 'fail')
  return { rules: R, hardFails, softWarns, ok: hardFails.length === 0, ready: optionsReady && vignettePresent && leadPresent }
}

import { boardLint } from './boardLint'
import { CASES } from '../data/cases'
import { COMMUNITY_AUTHORS } from '../data/authors'
import boardJson from '../data/questions.board.json'
import type { Attribution, Author, BoardQuestion, PracticeItem } from '../types'

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
      answerIndex: Number(q.answerIndex), // guard: a string index would silently break correct-answer matching
      explanation: q.explanation,
      source: 'Forge',
      citableId: 'WB-2026-' + String(i + 1).padStart(4, '0'),
    } as PracticeItem
    it.lint = boardLint(it)
    return it
  })
}

// Palette for initials-avatars of real contributors (no mock photo/profile).
const STUB_COLORS = ['#2563eb', '#0891b2', '#7c3aed', '#c2410c', '#0f766e', '#be123c']

/** Build a minimal Author from real (DB) credit info: name + creds, no profile. */
export function authorStub(id: string, name: string, creds: string, institution: string): Author {
  const initials = (name || '?').replace(/^(dr\.?|prof\.?)\s+/i, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  let h = 0
  for (let i = 0; i < (id || name).length; i++) h = ((id || name).charCodeAt(i) + h * 31) >>> 0
  return {
    id: id || name, name: name || 'Contributor', creds: creds || 'Contributor', role: creds || 'Contributor',
    institution: institution || '', color: STUB_COLORS[h % STUB_COLORS.length], initials, photo: null,
    followers: 0, orcid: '', published: 0, reviews: 0, stars: 0, joined: '', badges: [], bio: '', qs: [],
  }
}

/**
 * Attribution for a published community question, from real author + reviewer
 * names. Reviewers fall back to placeholders so the byline always has two.
 */
export function communityAttribution(c: {
  author_id: string; author_name: string; author_creds: string; author_institution: string; reviewer_names: string[]
}): Attribution {
  const author = authorStub(c.author_id, c.author_name, c.author_creds, c.author_institution)
  const names = c.reviewer_names && c.reviewer_names.length ? c.reviewer_names : ['Peer reviewer', 'Peer reviewer']
  const reviewers = [0, 1].map((i) => authorStub('rev-' + c.author_id + '-' + i, names[i] || names[0] || 'Peer reviewer', 'Peer reviewer', ''))
  return { author, reviewers }
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

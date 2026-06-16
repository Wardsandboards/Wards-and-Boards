import { useState } from 'react'
import { AnkiButton, QByline } from './common'
import { ankiCard } from '../lib/anki'
import { attributionFor } from '../lib/questions'
import type { Author, PracticeItem } from '../types'

export function PracticeCard({ q, picked, onPick, rated, onRate, onGoCase, onOpenAuthor }: {
  q: PracticeItem
  picked?: number
  onPick: (i: number) => void
  rated: number
  onRate: (n: number) => void
  onGoCase: () => void
  onOpenAuthor?: (a: Author) => void
}) {
  const answered = picked !== undefined
  const correct = answered && picked === q.answerIndex
  const anki = ankiCard(q.qkey, { stem: q.vignette + '<br><br>' + q.leadIn, choices: q.options, correct: q.answerIndex, explanation: q.explanation })
  // Community questions carry their real author/reviewer credit; the static bank
  // falls back to the deterministic mock attribution. Real authors have no full
  // profile page yet, so their byline is not clickable.
  const att = q.attribution || attributionFor(q)
  const onAuthor = q.attribution ? undefined : onOpenAuthor
  return (
    <div className="qblock">
      <div className="qid"><span className="os-badge src">{q.source}</span>{' '}
        <span className={'os-badge ' + (q.lint.ok ? 'ready' : 'polish')}>{q.lint.ok ? 'board-ready' : 'needs polish'}</span>
        <span style={{ color: 'var(--mid)', fontWeight: 700, letterSpacing: 0, textTransform: 'none', marginLeft: 6 }}>{q.system} · {q.topic}</span>
        <AnkiButton front={anki.front} back={anki.back} style={{ float: 'right' }} /></div>
      <QByline att={att} onOpenAuthor={onAuthor} />
      <div className="vignette"><div className="vignette-label">Clinical Vignette</div>{q.vignette}</div>
      <p className="qstem">{q.leadIn}</p>
      <div className="choices">{q.options.map((o, i) => {
        let cls = 'choice'
        if (answered) { if (i === q.answerIndex) cls += ' correct'; else if (i === picked) cls += ' wrong' } else if (i === picked) cls += ' selected'
        return (
          <button key={i} className={cls} disabled={answered} onClick={() => !answered && onPick(i)}>
            <span className="choice-letter">{String.fromCharCode(65 + i)}</span><span>{o}</span></button>
        )
      })}</div>
      {answered && (
        <div className={'feedback ' + (correct ? '' : 'bad')}>
          <div className="fb-result" style={{ color: correct ? 'var(--good)' : 'var(--bad)' }}>{correct ? '✓ Correct' : '✗ Not quite'}</div>
          {q.explanation}
          <div className="qb-rev">Authored by <b>{att.author.name}</b>. Reviewed by the <b>Wards & Boards review board</b>.</div>
          <div className="case-actions">
            <span className="os-stars">{[1, 2, 3, 4, 5].map((n) => <span key={n} onClick={() => onRate(n)}>{n <= rated ? <b>★</b> : '☆'}</span>)}</span>
            {q.caseId && <button className="ghost-btn" onClick={onGoCase}>See the mechanism in Learn → {q.caseTitle}</button>}
          </div></div>
      )}
    </div>
  )
}

export function LandingPractice({ q }: { q?: PracticeItem }) {
  const [p, setP] = useState<number | undefined>(undefined)
  const [r, setR] = useState(0)
  if (!q) return null
  return <PracticeCard q={q} picked={p} onPick={(i) => setP(i)} rated={r} onRate={setR} onGoCase={() => {}} />
}

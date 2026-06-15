import { useState } from 'react'
import { AnkiButton, QByline } from './common'
import { ankiCard } from '../lib/anki'
import { attributionFor } from '../lib/questions'
import { youtubeEmbedUrl } from '../lib/video'
import { FLAG_REASONS } from '../constants'
import type { Author, PracticeItem } from '../types'

function ReportProblem({ onFlag }: { onFlag: (reason: string, comment: string) => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(FLAG_REASONS[0])
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  if (done) return <div className="flag-done">Thanks. The review board will take a look.</div>
  if (!open) return <button className="flag-link" onClick={() => setOpen(true)}>⚐ Report a problem</button>
  return (
    <div className="flag-form">
      <div className="prompt-q" style={{ marginBottom: 6 }}>What is wrong with this question?</div>
      <select className="os-input" value={reason} onChange={(e) => setReason(e.target.value)}>{FLAG_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
      <textarea className="answer-textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional: a few words on the problem." />
      <div className="case-actions">
        <button className="submit-btn" style={{ marginTop: 0 }} onClick={() => { onFlag(reason, comment.trim()); setDone(true) }}>Send report</button>
        <button className="ghost-btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  )
}

export function PracticeCard({ q, picked, onPick, rated, onRate, onGoCase, onOpenAuthor, onFlag }: {
  q: PracticeItem
  picked?: number
  onPick: (i: number) => void
  rated: number
  onRate: (n: number) => void
  onGoCase: () => void
  onOpenAuthor?: (a: Author) => void
  onFlag?: (reason: string, comment: string) => void
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
          {youtubeEmbedUrl(q.video) && (
            <div className="cc-video" style={{ marginTop: 12 }}><div className="cc-video-frame">
              <iframe src={youtubeEmbedUrl(q.video)!} title="Video explanation" loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div></div>
          )}
          <div className="qb-rev">Authored by <b>{att.author.name}</b>. Reviewed by the <b>Wards & Boards review board</b>.</div>
          <div className="case-actions">
            <span className="os-stars">{[1, 2, 3, 4, 5].map((n) => <span key={n} onClick={() => onRate(n)}>{n <= rated ? <b>★</b> : '☆'}</span>)}</span>
            {q.caseId && <button className="ghost-btn" onClick={onGoCase}>See the mechanism in Learn → {q.caseTitle}</button>}
          </div></div>
      )}
      {onFlag && <div className="flag-row"><ReportProblem onFlag={onFlag} /></div>}
    </div>
  )
}

export function LandingPractice({ q }: { q?: PracticeItem }) {
  const [p, setP] = useState<number | undefined>(undefined)
  const [r, setR] = useState(0)
  if (!q) return null
  return <PracticeCard q={q} picked={p} onPick={(i) => setP(i)} rated={r} onRate={setR} onGoCase={() => {}} />
}

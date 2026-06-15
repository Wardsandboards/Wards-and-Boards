import { Fragment, useEffect, useRef, useState } from 'react'
import { AnkiButton, QByline, StarlingCurve } from './common'
import { ankiCard, lpFor } from '../lib/anki'
import { gradeAnswer } from '../lib/grade'
import { attributionFor } from '../lib/questions'
import { CATEGORY_ORDER, MODES, categoryOf } from '../constants'
import type { Author, Case, MS1Question, Mechanism, WardMomentData, WardPrompt } from '../types'

type ProgressMap = Record<string, Record<string, boolean>>

function Prompt({ prompt, value, onChange, onSave, caseId }: {
  prompt: WardPrompt
  value: string
  onChange: (v: string) => void
  onSave?: () => void
  caseId?: string
}) {
  const [results, setResults] = useState<{ concept: string; hit: boolean }[] | null>(null)
  const grade = () => {
    if (!value.trim()) return
    setResults(gradeAnswer(value, prompt.rubric))
    onSave && onSave()
  }
  const lp = lpFor((caseId || '') + ':' + prompt.id)
  return (
    <div className="prompt-block">
      <div className="prompt-q">{prompt.question}</div>
      <textarea className="answer-textarea" placeholder={prompt.hint || 'Answer in your own words…'} value={value}
        onChange={(e) => { onChange(e.target.value); setResults(null) }} onBlur={() => value.trim() && onSave && onSave()} />
      <button className="grade-btn" disabled={!value.trim()} onClick={grade}>Submit</button>
      {results && (
        <div className="rubric"><div className="rubric-head">Key concepts</div>
          {results.map((r, i) => (
            <div key={i} className={'rubric-item ' + (r.hit ? 'rubric-hit' : 'rubric-miss')}>
              <span className="rubric-cdot" /><span>{r.concept}</span>
            </div>
          ))}
        </div>
      )}
      {results && lp && <div style={{ marginTop: 10 }}><AnkiButton front={lp.front} back={lp.back} /></div>}
    </div>
  )
}

function CaseVideo({ video }: { video?: string | null }) {
  if (video === undefined || video === null) return null
  if (video) {
    return (
      <div className="cc-video">
        <div className="cc-video-frame">
          <iframe src={'https://www.youtube.com/embed/' + video} title="Chalk talk" loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </div>
        <div className="cc-video-cap"><span className="cc-dot" /> Chalk talk · Clinician Creators</div>
      </div>
    )
  }
  return (
    <div className="cc-video cc-video-ph">
      <div className="cc-ph-ic"><svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" /></svg></div>
      <div className="cc-ph-txt">
        <h4>Chalk talk in production</h4>
        <p>A Clinician Creators video explanation of this topic is on the way. <a href="#" target="_blank" rel="noopener">Present this topic →</a></p>
      </div>
    </div>
  )
}

function WardMoment({ wm, answers, onChange, onSaveReason, caseId }: {
  wm: WardMomentData
  answers: Record<string, string>
  onChange: (pid: string, v: string) => void
  onSaveReason: (txt: string) => void
  caseId: string
}) {
  return (
    <div className="ward">
      <div className="ward-label"><span className="brand-dot" /> Ward Moment</div>
      <div className="ward-scn">{wm.scenario}</div>
      {wm.prompts.map((p) => (
        <Prompt key={p.id} prompt={p} caseId={caseId} value={answers[p.id] || ''} onChange={(v) => onChange(p.id, v)}
          onSave={() => { if (p.id === 'reason') onSaveReason(answers[p.id] || '') }} />
      ))}
      <div className="ward-why">💡 {wm.why}</div>
    </div>
  )
}

export function Quiz({ questions, intro, onComplete, caseId }: {
  questions: MS1Question[]
  intro?: string
  onComplete: () => void
  caseId: string
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const blockRef = useRef<HTMLDivElement>(null)
  const q = questions[current]
  const total = questions.length
  const pct = ((current + (submitted ? 1 : 0)) / total) * 100
  const reached = questions.slice(0, current + 1).filter((qq) => !qq.placeholder).length - (!q.placeholder && !submitted ? 1 : 0)
  const submit = () => { if (selected === null) return; setSubmitted(true); if (selected === q.correct) setScore((s) => s + 1) }
  const next = () => { if (current + 1 >= total) { onComplete(); return } setCurrent((c) => c + 1); setSelected(null); setSubmitted(false) }
  useEffect(() => { if (current > 0 && blockRef.current) blockRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [current])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return
      if (q.placeholder) { if (e.key === 'Enter') { next(); e.preventDefault() } return }
      if (!submitted) {
        const n = parseInt(e.key, 10)
        if (q.choices && n >= 1 && n <= q.choices.length) { setSelected(n - 1); e.preventDefault() }
        else if (e.key === 'Enter' && selected !== null) { submit(); e.preventDefault() }
      } else if (e.key === 'Enter') { next(); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, selected, submitted, q])
  return (
    <div>
      <div className="prow"><span className="pill">Q {current + 1} / {total}</span><span className="pill">Score {score} / {reached}</span>
        <div className="pbar"><div className="pfill" style={{ width: `${pct}%` }} /></div></div>
      {intro && <p className="mode-intro">{intro}</p>}
      <div className="qblock" ref={blockRef}>
        <div className="qid">Question {q.id}
          {submitted && !q.placeholder && <AnkiButton {...ankiCard(caseId + ':' + q.id, { stem: q.stem, choices: q.choices, correct: q.correct, explanation: q.feedback })} style={{ float: 'right' }} />}</div>
        {q.placeholder ? (
          <div className="placeholder-q"><span className="inprog-badge">Coming soon</span>
            <p style={{ margin: '12px 0', color: 'var(--mid)' }}>{q.topic}</p>
            <button className="next-btn" onClick={next}>{current + 1 >= total ? 'See the mechanism →' : 'Next →'}</button></div>
        ) : (
          <>
            <p className="qstem">{q.stem}</p>
            {q.curve && <StarlingCurve compact {...(submitted ? q.curve.post : q.curve.pre)} />}
            <div className="choices">{q.choices.map((c, i) => {
              let cls = 'choice'
              if (submitted) { if (i === q.correct) cls += ' correct'; else if (i === selected) cls += ' wrong' } else if (i === selected) cls += ' selected'
              return (
                <button key={i} className={cls} disabled={submitted} onClick={() => setSelected(i)}>
                  <span className="choice-letter">{String.fromCharCode(65 + i)}</span><span>{c}</span></button>
              )
            })}</div>
            {!submitted && (
              <><button className="submit-btn" disabled={selected === null} onClick={submit}>Submit Answer</button>
                <div className="kbd-hint">Tip: press {q.choices.length === 5 ? '1 to 5' : '1 to 4'} to choose, Enter to submit.</div></>
            )}
            {submitted && (
              <div className={'feedback ' + (selected !== q.correct ? 'bad' : '')}>
                <div className="fb-result" style={{ color: selected === q.correct ? 'var(--good)' : 'var(--bad)' }}>{selected === q.correct ? '✓ Correct' : '✗ Not quite'}</div>
                {q.feedback}<br /><button className="next-btn" onClick={next}>{current + 1 >= total ? 'See the mechanism →' : 'Next question →'}</button></div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MechanismReveal({ mechanism }: { mechanism: Mechanism }) {
  const flow = mechanism.quickFlow || []
  const chain = mechanism.chain
  const quickPts = mechanism.quickPts
  const [shownFlow, setShownFlow] = useState(1)
  const [shownChain, setShownChain] = useState(1)
  return (
    <div className="reveal">
      <div className="reveal-heading">Putting it all together</div>
      <div className="reveal-title">The quick version</div>
      {flow.length > 0 && (
        <>
          <div className="reveal-hint">(Click each box to reveal it.{mechanism.graphic ? ' The point on the curve moves with you.' : ''})</div>
          <div className="mech-cols"><div className="mech-steps"><div className="flow">
            {flow.map((n, i) => {
              const dim = i >= shownFlow
              const arrowDim = i + 1 >= shownFlow
              return (
                <Fragment key={i}>
                  <div className={'flow-node ' + (i === flow.length - 1 ? 'last ' : '') + (dim ? 'dim' : '')} onClick={() => dim && setShownFlow(i + 1)}>{n}</div>
                  {i < flow.length - 1 && <div className={'flow-arrow ' + (arrowDim ? 'dim' : '')}>→</div>}
                </Fragment>
              )
            })}</div>
            {shownFlow < flow.length && <button className="reveal-next" onClick={() => setShownFlow((c) => Math.min(c + 1, flow.length))}>Reveal next →</button>}</div>
            {mechanism.graphic && quickPts && (
              <div className="mech-curve">
                <StarlingCurve compact config={mechanism.graphic} point={quickPts[Math.min(shownFlow, quickPts.length) - 1]} /></div>
            )}
          </div>
        </>
      )}
      <div className="reveal-title" style={{ marginTop: 26 }}>Step by step</div>
      <div className="reveal-hint">(Click each step to reveal it.{mechanism.graphic ? ' The point on the curve moves with you.' : ''})</div>
      <div className="mech-cols"><div className="mech-steps"><div className="chain">
        {chain.map((step, i) => {
          const last = i === chain.length - 1
          const dim = i >= shownChain
          return (
            <div className={'chain-step ' + (dim ? 'dim' : '')} key={i} onClick={() => dim && setShownChain(i + 1)}>
              <div className="chain-left"><div className="chain-dot" />{!last && <div className="chain-line" />}</div>
              <div className="chain-content"><div className="chain-label">{step.label}</div><div className="chain-detail">{step.detail}</div></div></div>
          )
        })}</div>
        {shownChain < chain.length && <button className="reveal-next" onClick={() => setShownChain((c) => Math.min(c + 1, chain.length))}>Reveal next step →</button>}</div>
        {mechanism.graphic && chain[0].pt && (
          <div className="mech-curve">
            <StarlingCurve compact config={mechanism.graphic} point={chain[Math.min(shownChain, chain.length) - 1].pt} /></div>
        )}
      </div>
      {mechanism.starlingText && (
        <><hr className="div" /><div className="starling">
          <div className="starling-label">{mechanism.summaryLabel || 'Frank-Starling: what this means'}</div><p>{mechanism.starlingText}</p></div></>
      )}
      {mechanism.clinicalPearl && <div className="pearl"><div className="pearl-label">⚡ Clinical Pearl</div><p>{mechanism.clinicalPearl}</p></div>}
      {mechanism.source && <div className="mech-source">Reference: {mechanism.source}</div>}
    </div>
  )
}

export function CaseView({ caseData, onBack, setProgress, review, onToggleReview, answers, setAnswers, setReasonAnswer, onOpenAuthor, onComplete }: {
  caseData: Case
  onBack: () => void
  setProgress: (u: (prev: ProgressMap) => ProgressMap) => void
  review: string[]
  onToggleReview: (id: string) => void
  answers: Record<string, string>
  setAnswers: (id: string, pid: string, v: string) => void
  setReasonAnswer: (id: string, txt: string) => void
  onOpenAuthor: (a: Author) => void
  onComplete?: (caseId: string, mode: string) => void
}) {
  const [mode, setMode] = useState('ms1')
  const [showReveal, setShowReveal] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const revealRef = useRef<HTMLDivElement>(null)
  const modeMeta = MODES.find((m) => m.key === mode)!
  const isRev = review.includes(caseData.id)
  const switchMode = (m: string) => { if (m === mode) return; setMode(m); setShowReveal(false); setSessionKey((k) => k + 1) }
  const restart = () => { setShowReveal(false); setSessionKey((k) => k + 1) }
  const complete = () => { setShowReveal(true); setProgress((prev) => ({ ...prev, [caseData.id]: { ...(prev[caseData.id] || {}), [mode]: true } })); onComplete?.(caseData.id, mode) }
  useEffect(() => { if (showReveal && revealRef.current) revealRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [showReveal])
  return (
    <section className="section" style={{ paddingTop: 30 }}><div className="wrap">
      <button className="back-link" onClick={onBack}>← All cases</button>
      <div className="case-rot">{caseData.wardMoment.rotation}</div>
      <div className="case-title">{caseData.title}</div>
      <div className="case-sub">{caseData.system} · {caseData.topic}</div>
      <QByline att={attributionFor(caseData)} onOpenAuthor={onOpenAuthor} />
      <CaseVideo video={caseData.video} />
      <WardMoment wm={caseData.wardMoment} caseId={caseData.id} answers={answers} onChange={(pid, v) => setAnswers(caseData.id, pid, v)} onSaveReason={(txt) => setReasonAnswer(caseData.id, txt)} />
      <div className="vignette"><div className="vignette-label">Clinical Vignette</div>{caseData.vignette}</div>
      <div className="modes">{MODES.map((m) => (
        <button key={m.key} className={'mode-btn ' + (mode === m.key ? 'active ' : '') + (!m.live ? 'soon' : '')} onClick={() => switchMode(m.key)}>
          <span className="mlabel">{m.label}</span><span className="msub">{m.sub}</span></button>
      ))}</div>
      {modeMeta.live ? (
        <>
          <div key={sessionKey}>{!showReveal && caseData.ms1 && <Quiz questions={caseData.ms1.questions} intro={caseData.ms1.intro} onComplete={complete} caseId={caseData.id} />}</div>
          {showReveal && (
            <><div ref={revealRef} style={{ scrollMarginTop: 78 }}><MechanismReveal mechanism={caseData.mechanism} /></div>
              <div className="case-actions"><button className="ghost-btn" onClick={restart}>↺ Restart</button>
                <button className={'ghost-btn ' + (isRev ? 'on' : '')} onClick={() => onToggleReview(caseData.id)}>{isRev ? '★ Marked for review' : '☆ Mark for review'}</button>
                <button className="ghost-btn" onClick={onBack}>← All cases</button></div></>
          )}
        </>
      ) : (
        <div className="inprog"><div className="inprog-badge">In progress</div><h3>{modeMeta.label} · {modeMeta.sub}</h3>
          <p>This tier is still being built. For now, work through <strong>MS1 · Foundations</strong>.</p></div>
      )}
    </div></section>
  )
}

export function MiniQuestion({ q, caseId }: { q?: MS1Question; caseId: string }) {
  const [sel, setSel] = useState<number | null>(null)
  const [sub, setSub] = useState(false)
  if (!q) return null
  return (
    <div className="qblock">
      <p className="qstem">{q.stem}</p>
      <div className="choices">{q.choices.map((c, i) => {
        let cls = 'choice'
        if (sub) { if (i === q.correct) cls += ' correct'; else if (i === sel) cls += ' wrong' } else if (i === sel) cls += ' selected'
        return (
          <button key={i} className={cls} disabled={sub} onClick={() => setSel(i)}><span className="choice-letter">{String.fromCharCode(65 + i)}</span><span>{c}</span></button>
        )
      })}</div>
      {!sub && <button className="submit-btn" disabled={sel === null} onClick={() => setSub(true)}>Submit</button>}
      {sub && <div className={'feedback ' + (sel !== q.correct ? 'bad' : '')}><div className="fb-result" style={{ color: sel === q.correct ? 'var(--good)' : 'var(--bad)' }}>{sel === q.correct ? '✓ Correct' : '✗ Not quite'}</div>{q.feedback}</div>}
      {sub && <div style={{ marginTop: 10 }}><AnkiButton {...ankiCard(caseId + ':' + q.id, { stem: q.stem, choices: q.choices, correct: q.correct, explanation: q.feedback })} /></div>}
    </div>
  )
}

export function WardMomentIntro() {
  return (
    <div className="wmintro"><div className="kicker">Why "ward moments"</div>
      <h2 className="h2">Each case starts with a moment on the wards</h2>
      <p className="sec-lead">A "ward moment" is the kind of question an attending asks on rounds. These exact scenarios come up during
        your third- and fourth-year clerkships and throughout residency, depending on your specialty. Each case opens with that
        moment, asks you to commit to an answer, then works back to the physiology behind it.</p></div>
  )
}

export function LearnLibrary({ cases, onOpen, progress, review, onToggleReview }: {
  cases: Case[]
  onOpen: (id: string) => void
  progress: ProgressMap
  review: string[]
  onToggleReview: (id: string) => void
}) {
  const [cat, setCat] = useState('All')
  const present: string[] = []
  CATEGORY_ORDER.forEach((k) => { if (cases.some((c) => categoryOf(c.system) === k)) present.push(k) })
  cases.forEach((c) => { const k = categoryOf(c.system); if (!present.includes(k)) present.push(k) })
  const tabs = ['All', ...present]
  const shown = cat === 'All' ? cases : cases.filter((c) => categoryOf(c.system) === cat)
  return (
    <>
      <div className="cat-tabs">{tabs.map((t) => {
        const count = t === 'All' ? cases.length : cases.filter((c) => categoryOf(c.system) === t).length
        return (<button key={t} className={'cat-tab ' + (cat === t ? 'active' : '')} onClick={() => setCat(t)}>{t === 'All' ? 'All cases' : t}<span className="cat-count">{count}</span></button>)
      })}</div>
      <div className="lib-grid">{shown.map((c) => {
        const isRev = review.includes(c.id)
        return (
          <div key={c.id} className="lib-card" onClick={() => onOpen(c.id)}>
            <div className="lib-tag">{c.topic}</div><h3>{c.title}</h3><div className="lib-rot">{c.wardMoment.rotation}</div>
            <div className="lib-foot"><div className="prog-dots">{MODES.map((m) => <div key={m.key} className={'pdot ' + (progress[c.id] && progress[c.id][m.key] ? 'done' : '')} />)}</div>
              <span className="prog-text">{MODES.filter((m) => progress[c.id] && progress[c.id][m.key]).length} / 4 tiers</span>
              <button className={'star-btn ' + (isRev ? 'on' : '')} title="Mark for review" onClick={(e) => { e.stopPropagation(); onToggleReview(c.id) }}>{isRev ? '★' : '☆'}</button></div>
          </div>
        )
      })}</div>
    </>
  )
}

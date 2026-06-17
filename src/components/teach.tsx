import { useState } from 'react'
import type { Course, CohortStats, CourseQuestion } from '../lib/courses'
import { assignedKey } from '../lib/questions'
import { boardLint } from '../lib/boardLint'
import { blankDraft } from '../constants'
import type { Draft, LintResult } from '../types'

const commonsLabel = (s: string | null): string =>
  s === 'published' ? 'Published to the commons' : s === 'rejected' ? 'Returned by the review board' : s === 'in_review' ? 'In peer review' : ''

export function TeachView({ courses, onCreate, onLoadCohort, keySystem, onLoadQuestions, onCreateQuestion, onDeleteQuestion, onSubmitToCommons }: {
  courses: Course[]
  onCreate: (name: string) => void
  onLoadCohort: (courseId: string) => Promise<CohortStats>
  keySystem: Record<string, string>
  onLoadQuestions: (courseId: string) => Promise<CourseQuestion[]>
  onCreateQuestion: (courseId: string, draft: Draft) => Promise<boolean>
  onDeleteQuestion: (id: string) => Promise<void>
  onSubmitToCommons: (q: CourseQuestion) => Promise<boolean>
}) {
  const [name, setName] = useState('')
  const [sel, setSel] = useState<Course | null>(null)
  const [cohort, setCohort] = useState<CohortStats | null>(null)
  const [questions, setQuestions] = useState<CourseQuestion[]>([])
  const [ctab, setCtab] = useState<'cohort' | 'questions'>('cohort')
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const [audit, setAudit] = useState<LintResult | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshQuestions = (id: string) => onLoadQuestions(id).then(setQuestions)
  const open = (c: Course) => {
    setSel(c); setCohort(null); setQuestions([]); setCtab('cohort'); setDraft(blankDraft); setAudit(null)
    onLoadCohort(c.id).then(setCohort); refreshQuestions(c.id)
  }
  const submitQuestion = async () => {
    if (!sel) return
    const a = boardLint(draft); setAudit(a)
    if (!a.ok) return
    setBusy(true)
    const ok = await onCreateQuestion(sel.id, draft)
    setBusy(false)
    if (ok) { setDraft(blankDraft); setAudit(null); refreshQuestions(sel.id) }
  }
  const removeQuestion = async (id: string) => { await onDeleteQuestion(id); if (sel) refreshQuestions(sel.id) }
  const submitToCommons = async (q: CourseQuestion) => { const ok = await onSubmitToCommons(q); if (ok && sel) refreshQuestions(sel.id) }

  // Map cohort answer keys to systems, extended with this course's own questions
  // so assigned items roll up correctly rather than falling into "Other".
  const ext: Record<string, string> = { ...keySystem }
  questions.forEach((q) => { ext[assignedKey(q.id)] = q.system || 'Other' })
  const bySys: Record<string, { c: number; t: number }> = {}
  if (cohort) Object.entries(cohort.byKey).forEach(([k, v]) => { const s = ext[k] || 'Other'; (bySys[s] = bySys[s] || { c: 0, t: 0 }); bySys[s].t += v.attempts; bySys[s].c += v.correct })
  const totalAnswers = cohort ? Object.values(cohort.byKey).reduce((s, v) => s + v.attempts, 0) : 0
  // Per-question accuracy for the instructor's own assigned questions.
  const assignedStats = cohort ? questions.map((q) => ({ q, s: cohort.byKey[assignedKey(q.id)] })).filter((x) => x.s && x.s.attempts > 0) : []

  return (
    <section className="section" style={{ paddingTop: 34 }}><div className="wrap" style={{ maxWidth: 760 }}>
      <div className="sec-head"><div className="kicker">Faculty</div><h2 className="h2">Your courses</h2>
        <p className="sec-lead">Create a class, share its code with your students, write questions for them to practice, and see where the cohort is strong and weak. Student data stays private. You see only anonymous aggregates, never an individual student's answers.</p></div>

      <div className="qblock" style={{ marginBottom: 18 }}>
        <div className="prompt-q" style={{ marginBottom: 6 }}>Create a class</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="os-input" style={{ flex: 1, minWidth: 220 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MS3 internal medicine block, Fall 2026" maxLength={80} />
          <button className="btn btn-primary" disabled={!name.trim()} onClick={() => { onCreate(name.trim()); setName('') }}>Create</button>
        </div>
      </div>

      {courses.length === 0 ? <div className="inprog"><p>No classes yet. Create one above, then share its code with your students. They enter it under Settings to join.</p></div> :
        <div className="course-list" style={{ marginBottom: 18 }}>{courses.map((c) => (
          <button className={'course-row' + (sel?.id === c.id ? ' active' : '')} key={c.id} onClick={() => open(c)}>
            <span className="course-name">{c.name}<span className="course-code">Code: {c.code}</span></span>
            <span className="course-go">Open →</span>
          </button>
        ))}</div>}

      {sel && (
        <div className="qblock">
          <div className="reveal-title">{sel.name}</div>
          <div className="banner">Share this code with your students: <b>{sel.code}</b>. They enter it under Settings to join your class.</div>

          <div className="cat-tabs" style={{ marginTop: 12 }}>
            <button className={'cat-tab ' + (ctab === 'cohort' ? 'active' : '')} onClick={() => setCtab('cohort')}>Cohort progress</button>
            <button className={'cat-tab ' + (ctab === 'questions' ? 'active' : '')} onClick={() => setCtab('questions')}>Your questions<span className="cat-count">{questions.length}</span></button>
          </div>

          {ctab === 'cohort' && (!cohort ? <p style={{ color: 'var(--dim)' }}>Loading…</p> : (<>
            <div className="how-grid" style={{ margin: '12px 0' }}>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Students joined</div><div className="stat-num">{cohort.size}</div></div>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Questions answered</div><div className="stat-num">{totalAnswers}</div></div>
            </div>
            <div className="reveal-title">Cohort accuracy by system</div>
            {Object.keys(bySys).length === 0 ? <p style={{ color: 'var(--dim)', marginTop: 8 }}>No answers yet. Once your students start practicing, the cohort's accuracy by system shows here, so you can see what to spend class time on.</p> :
              Object.entries(bySys).map(([s, v]) => { const pc = Math.round((100 * v.c) / v.t); return (<div key={s} style={{ margin: '10px 0' }}><div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 5 }}>{s} — {v.c}/{v.t} ({pc}%)</div><div className="os-bar"><div style={{ width: pc + '%' }} /></div></div>) })}
            {assignedStats.length > 0 && (<>
              <div className="reveal-title" style={{ marginTop: 18 }}>How your class did on your questions</div>
              {assignedStats.map(({ q, s }) => { const pc = Math.round((100 * s!.correct) / s!.attempts); return (<div key={q.id} style={{ margin: '10px 0' }}><div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 5 }}>{q.leadIn || q.system || 'Question'} — {s!.correct}/{s!.attempts} ({pc}%)</div><div className="os-bar"><div style={{ width: pc + '%' }} /></div></div>) })}
            </>)}
          </>))}

          {ctab === 'questions' && (<>
            <p className="sec-lead" style={{ marginTop: 12 }}>Questions you write here go straight to your enrolled students to practice, labeled as yours. They are private to your class and not peer-reviewed. If you want one to join the public peer-reviewed commons, submit it and the review board takes it through the normal two-reviewer check.</p>

            {questions.length > 0 && <div className="course-list" style={{ margin: '12px 0' }}>{questions.map((q) => (
              <div className="qblock" key={q.id} style={{ marginBottom: 10 }}>
                <div className="qid"><span className="os-badge src">{q.level === 'step1' ? 'Step 1' : 'Shelf'}</span> <span style={{ color: 'var(--mid)', textTransform: 'none', letterSpacing: 0, fontWeight: 700, marginLeft: 6 }}>{q.system || 'untagged'}</span></div>
                <p className="qstem" style={{ marginTop: 6 }}>{q.leadIn || '(no lead-in)'}</p>
                <div className="case-actions" style={{ alignItems: 'center' }}>
                  {q.commonsStatus
                    ? <span className={'os-badge ' + (q.commonsStatus === 'published' ? 'ready' : 'polish')}>{commonsLabel(q.commonsStatus)}</span>
                    : <button className="ghost-btn" onClick={() => submitToCommons(q)}>Submit to the public commons</button>}
                  <button className="os-link" onClick={() => removeQuestion(q.id)} style={{ color: 'var(--bad)' }}>Delete</button>
                </div>
              </div>
            ))}</div>}

            <div className="qblock" style={{ marginTop: 12 }}>
              <div className="prompt-q" style={{ marginBottom: 10 }}>Write a question for your class</div>
              <div className="os-grid" style={{ marginBottom: 12 }}>
                <div><div className="prompt-q" style={{ marginBottom: 6 }}>Exam level</div>
                  <select className="os-input" value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })}><option value="step1">Step 1 (mechanism)</option><option value="shelf">Shelf / Step 2 (clinical)</option></select></div>
                <div><div className="prompt-q" style={{ marginBottom: 6 }}>System / topic</div>
                  <input className="os-input" value={draft.system} onChange={(e) => setDraft({ ...draft, system: e.target.value })} placeholder="e.g. Cardiology" /></div>
              </div>
              <div className="prompt-q" style={{ marginBottom: 6 }}>Clinical vignette</div>
              <textarea className="answer-textarea" value={draft.vignette} onChange={(e) => setDraft({ ...draft, vignette: e.target.value })} placeholder="A 68-year-old patient comes to..." />
              <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Lead-in</div>
              <input className="os-input" value={draft.leadIn} onChange={(e) => setDraft({ ...draft, leadIn: e.target.value })} placeholder="Which of the following is the most likely diagnosis?" />
              <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Options (select the correct one)</div>
              {draft.options.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}>
                  <input type="radio" checked={draft.answerIndex === i} onChange={() => setDraft({ ...draft, answerIndex: i })} />
                  <input className="os-input" value={o} onChange={(e) => { const op = [...draft.options]; op[i] = e.target.value; setDraft({ ...draft, options: op }) }} placeholder={'Option ' + String.fromCharCode(65 + i)} /></div>
              ))}
              <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Explanation</div>
              <textarea className="answer-textarea" value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} placeholder="Why the key is right and each distractor is wrong." />
              <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Video explanation (optional)</div>
              <input className="os-input" value={draft.video} onChange={(e) => setDraft({ ...draft, video: e.target.value })} placeholder="Paste a YouTube link to embed a short explainer with this question" />
              <div style={{ marginTop: 14 }}><button className="submit-btn" style={{ marginTop: 0 }} disabled={busy} onClick={submitQuestion}>{busy ? 'Saving…' : 'Run Forge gate & assign to my class'}</button></div>
              {audit && (
                <div className="feedback" style={{ borderLeftColor: audit.ok ? 'var(--good)' : 'var(--bad)' }}>
                  <div className="fb-result" style={{ color: audit.ok ? 'var(--good)' : 'var(--bad)' }}>{audit.ok ? '✓ Passed the Forge gate, assigned to your class' : '✗ Fix these before assigning:'}</div>
                  {audit.fails.map((f, i) => <div key={i} style={{ color: 'var(--warn)', fontSize: '0.85rem' }}>• {f}</div>)}</div>
              )}
            </div>
          </>)}
        </div>
      )}
    </div></section>
  )
}

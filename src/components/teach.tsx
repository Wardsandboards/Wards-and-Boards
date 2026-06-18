import { useEffect, useState } from 'react'
import type { Course, CohortStats, CourseQuestion } from '../lib/courses'
import { assignedKey } from '../lib/questions'
import { forgeAudit } from '../lib/forge'
import { ForgeChecklist } from './forge'
import { blankDraft } from '../constants'
import type { Draft } from '../types'

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
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)

  const refreshQuestions = (id: string) => onLoadQuestions(id).then(setQuestions)
  const open = (c: Course) => {
    setSel(c); setCohort(null); setQuestions([]); setCtab('cohort'); setDraft(blankDraft); setTried(false)
    onLoadCohort(c.id).then(setCohort); refreshQuestions(c.id)
  }
  // Open the first class automatically so the Cohort / Write-questions tabs are
  // visible right away (the authoring entry point was hard to find otherwise).
  useEffect(() => { if (!sel && courses.length) open(courses[0]) }, [courses])
  const setField = (patch: Partial<Draft>) => { setDraft((d) => ({ ...d, ...patch })); setTried(false) }
  const submitQuestion = async () => {
    if (!sel) return
    if (!forgeAudit(draft).ok) { setTried(true); return }
    setBusy(true)
    const ok = await onCreateQuestion(sel.id, draft)
    setBusy(false)
    if (ok) { setDraft(blankDraft); setTried(false); refreshQuestions(sel.id); setCtab('questions') }
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
  const draftOk = forgeAudit(draft).ok

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
            <button className={'cat-tab ' + (ctab === 'questions' ? 'active' : '')} onClick={() => setCtab('questions')}>Write questions<span className="cat-count">{questions.length}</span></button>
          </div>

          {ctab === 'cohort' && <button className="ghost-btn" style={{ margin: '12px 0 4px' }} onClick={() => setCtab('questions')}>✏️ Write questions for this class →</button>}
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
              <div className="prompt-q" style={{ marginBottom: 4 }}>Write a question for your class</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--mid)', margin: '0 0 12px' }}>As you fill this in, the Item Forge checklist beside it checks the question against board exam item-writing rules and shows a ✓, ✕, or — for each, so you can see what to work on. The hard checks (✕) must pass before you can assign it.</p>
              <div className="author-cols">
                <div>
                  <div className="os-grid" style={{ marginBottom: 12 }}>
                    <div><div className="prompt-q" style={{ marginBottom: 6 }}>Exam level</div>
                      <select className="os-input" value={draft.level} onChange={(e) => setField({ level: e.target.value })}><option value="step1">Step 1 (mechanism)</option><option value="shelf">Shelf / Step 2 (clinical)</option></select></div>
                    <div><div className="prompt-q" style={{ marginBottom: 6 }}>System / topic</div>
                      <input className="os-input" value={draft.system} onChange={(e) => setField({ system: e.target.value })} placeholder="e.g. Cardiology" /></div>
                  </div>
                  <div className="prompt-q" style={{ marginBottom: 6 }}>Clinical vignette</div>
                  <textarea className="answer-textarea" value={draft.vignette} onChange={(e) => setField({ vignette: e.target.value })} placeholder="A 68-year-old patient comes to..." />
                  <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Lead-in</div>
                  <input className="os-input" value={draft.leadIn} onChange={(e) => setField({ leadIn: e.target.value })} placeholder="Which of the following is the most likely diagnosis?" />
                  <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Options (select the correct one)</div>
                  {draft.options.map((o, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}>
                      <input type="radio" checked={draft.answerIndex === i} onChange={() => setField({ answerIndex: i })} />
                      <input className="os-input" value={o} onChange={(e) => { const op = [...draft.options]; op[i] = e.target.value; setField({ options: op }) }} placeholder={'Option ' + String.fromCharCode(65 + i)} /></div>
                  ))}
                  <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Explanation</div>
                  <textarea className="answer-textarea" value={draft.explanation} onChange={(e) => setField({ explanation: e.target.value })} placeholder="Why the key is right and each distractor is wrong." />
                  <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Video explanation (optional)</div>
                  <input className="os-input" value={draft.video} onChange={(e) => setField({ video: e.target.value })} placeholder="Paste a YouTube link to embed a short explainer with this question" />
                  <div style={{ marginTop: 14 }}><button className="submit-btn" style={{ marginTop: 0 }} disabled={busy} onClick={submitQuestion}>{busy ? 'Saving…' : 'Assign to my class'}</button></div>
                  {tried && !draftOk && <div className="feedback" style={{ borderLeftColor: 'var(--bad)' }}><div className="fb-result" style={{ color: 'var(--bad)' }}>Fix the hard flaws marked ✕ in the checklist before assigning.</div></div>}
                </div>
                <div className="author-side">
                  <ForgeChecklist item={draft} />
                </div>
              </div>
            </div>
          </>)}
        </div>
      )}
    </div></section>
  )
}

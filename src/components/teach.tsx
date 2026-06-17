import { useState } from 'react'
import type { Course, CohortStats } from '../lib/courses'

export function TeachView({ courses, onCreate, onLoadCohort, keySystem }: {
  courses: Course[]
  onCreate: (name: string) => void
  onLoadCohort: (courseId: string) => Promise<CohortStats>
  keySystem: Record<string, string>
}) {
  const [name, setName] = useState('')
  const [sel, setSel] = useState<Course | null>(null)
  const [cohort, setCohort] = useState<CohortStats | null>(null)
  const open = (c: Course) => { setSel(c); setCohort(null); onLoadCohort(c.id).then(setCohort) }

  const bySys: Record<string, { c: number; t: number }> = {}
  if (cohort) Object.entries(cohort.byKey).forEach(([k, v]) => { const s = keySystem[k] || 'Other'; (bySys[s] = bySys[s] || { c: 0, t: 0 }); bySys[s].t += v.attempts; bySys[s].c += v.correct })
  const totalAnswers = cohort ? Object.values(cohort.byKey).reduce((s, v) => s + v.attempts, 0) : 0

  return (
    <section className="section" style={{ paddingTop: 34 }}><div className="wrap" style={{ maxWidth: 760 }}>
      <div className="sec-head"><div className="kicker">Faculty</div><h2 className="h2">Your courses</h2>
        <p className="sec-lead">Create a class, share its code with your students, and see where the cohort is strong and weak. Student data stays private. You see only anonymous aggregates, never an individual student's answers.</p></div>

      <div className="qblock" style={{ marginBottom: 18 }}>
        <div className="prompt-q" style={{ marginBottom: 6 }}>Create a class</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="os-input" style={{ flex: 1, minWidth: 220 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MS3 internal medicine block, Fall 2026" maxLength={80} />
          <button className="btn btn-primary" disabled={!name.trim()} onClick={() => { onCreate(name.trim()); setName('') }}>Create</button>
        </div>
      </div>

      {courses.length === 0 ? <div className="inprog"><p>No classes yet. Create one above, then share its code with your students. They enter it under Settings to join.</p></div> :
        <div className="lb" style={{ marginBottom: 18 }}>{courses.map((c) => (
          <button className="lb-row" key={c.id} onClick={() => open(c)}>
            <span className="lb-name">{c.name}<br /><span className="lb-sub">Code: {c.code}</span></span>
            <span className="lb-stat"><b>View</b><span>cohort</span></span>
          </button>
        ))}</div>}

      {sel && (
        <div className="qblock">
          <div className="reveal-title">{sel.name}</div>
          <div className="banner">Share this code with your students: <b>{sel.code}</b>. They enter it under Settings to join your class.</div>
          {!cohort ? <p style={{ color: 'var(--dim)' }}>Loading…</p> : (<>
            <div className="how-grid" style={{ margin: '12px 0' }}>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Students joined</div><div className="stat-num">{cohort.size}</div></div>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Questions answered</div><div className="stat-num">{totalAnswers}</div></div>
            </div>
            <div className="reveal-title">Cohort accuracy by system</div>
            {Object.keys(bySys).length === 0 ? <p style={{ color: 'var(--dim)', marginTop: 8 }}>No answers yet. Once your students start practicing, the cohort's accuracy by system shows here, so you can see what to spend class time on.</p> :
              Object.entries(bySys).map(([s, v]) => { const pc = Math.round((100 * v.c) / v.t); return (<div key={s} style={{ margin: '10px 0' }}><div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 5 }}>{s} — {v.c}/{v.t} ({pc}%)</div><div className="os-bar"><div style={{ width: pc + '%' }} /></div></div>) })}
          </>)}
        </div>
      )}
    </div></section>
  )
}

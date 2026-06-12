import { useState } from 'react'
import { ADMIN_EMAILS, TRAINING_LEVELS } from '../constants'
import type { User } from '../types'

export function SignIn({ intent, users, onSignIn, onGoogle, googleLive }: {
  intent?: string
  users: Record<string, User>
  onSignIn: (email: string, name: string) => void
  onGoogle?: () => void
  googleLive?: boolean
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <section className="section"><div className="wrap" style={{ maxWidth: 560 }}>
      <div className="signin-card">
        <div className="kicker">{intent ? 'Sign in to ' + intent : 'Welcome'}</div>
        <h2 className="h2" style={{ marginBottom: 8 }}>Sign in to Wards & Boards</h2>
        <p className="sec-lead" style={{ marginTop: 0 }}>Learners get in instantly. To author or review questions, you apply to become a contributor after signing in.</p>
        <button className="btn btn-primary g-btn" style={{ marginTop: 8 }} onClick={() => (onGoogle ? onGoogle() : onSignIn('you@med.school', 'You'))}>Continue with Google {!googleLive && <span className="g-note">demo</span>}</button>
        <div className="or">or use your name and email</div>
        <input className="os-input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="os-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginTop: 8 }} />
        <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={!email.trim()} onClick={() => onSignIn(email.trim().toLowerCase(), name.trim() || email.trim())}>Continue →</button>
        <div className="demo-accts"><div className="cite-h">Demo accounts (one click, to try every role)</div>
          {Object.values(users).map((u) => {
            const role = ADMIN_EMAILS.includes(u.email) ? 'admin' : u.role === 'contributor' && u.app && u.app.status === 'approved' ? 'contributor' : 'learner'
            return (<button key={u.email} className="ghost-btn demo-pick" onClick={() => onSignIn(u.email, u.name)}><span>{u.name}</span><span className={'rolebadge ' + role}>{role}</span></button>)
          })}
        </div>
      </div>
    </div></section>
  )
}

export function ContributorApplication({ me, onApply }: { me: User; onApply: (form: { training: string; institution: string; npi: string }) => void }) {
  const [f, setF] = useState({ training: 'Resident', institution: '', npi: '' })
  if (me.app && me.app.status === 'pending')
    return (
      <div className="notice pending"><div className="kicker">Application received</div>
        <h2 className="h2">Thanks, {me.name}</h2>
        <p className="sec-lead">Your contributor application is pending review. An editor will confirm your training level manually, usually within a day or two. You will get contributor access once approved.</p></div>
    )
  return (
    <div className="qblock" style={{ maxWidth: 640 }}>
      <div className="kicker">Become a contributor</div>
      <h2 className="h2" style={{ marginBottom: 6 }}>Apply to author and review questions</h2>
      <p className="sec-lead" style={{ marginTop: 0 }}>Contributors are residents or above. Share a few details so an editor can confirm, then you can write and peer-review questions for citable credit.</p>
      {me.app && me.app.status === 'denied' && <div className="feedback bad" style={{ marginBottom: 12 }}>A previous application was not approved. You can update your details and resubmit.</div>}
      <div className="prompt-q" style={{ margin: '10px 0 6px' }}>Training level</div>
      <select className="os-input" value={f.training} onChange={(e) => setF({ ...f, training: e.target.value })}>{TRAINING_LEVELS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
      <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Institution</div>
      <input className="os-input" value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} placeholder="e.g. Stanford Medicine" />
      <div className="prompt-q" style={{ margin: '12px 0 6px' }}>NPI number or a profile link (for verification)</div>
      <input className="os-input" value={f.npi} onChange={(e) => setF({ ...f, npi: e.target.value })} placeholder="NPI #, or an institutional / Doximity / LinkedIn URL" />
      <p style={{ fontSize: '0.8rem', color: 'var(--dim)', marginTop: 8 }}>Used only to confirm you are a resident or above. An editor reviews it manually for now.</p>
      <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={!f.institution.trim() || !f.npi.trim()} onClick={() => onApply(f)}>Submit application</button>
    </div>
  )
}

export function AdminQueue({ users, onDecide }: { users: Record<string, User>; onDecide: (email: string, decision: string) => void }) {
  const pending = Object.values(users).filter((u) => u.app && u.app.status === 'pending')
  return (
    <div>
      <div className="banner">Manual confirmation for now: approve applicants who are residents or above. Check the training level, institution, and the NPI or profile link.</div>
      {pending.length === 0 ? <div className="inprog"><p>No pending applications. (Sign in as a new learner, apply from the Contribute tab, then come back here as admin to approve.)</p></div> :
        pending.map((u) => (
          <div className="appq" key={u.email}>
            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{u.name} <span className="userchip">· {u.email}</span></div>
            <div style={{ fontSize: '0.88rem', color: 'var(--mid)', margin: '6px 0' }}>{u.app.training} · {u.app.institution} · verify: {u.app.npi}</div>
            <div className="case-actions"><button className="submit-btn" style={{ marginTop: 0, background: 'var(--good)' }} onClick={() => onDecide(u.email, 'approve')}>Approve</button>
              <button className="ghost-btn" onClick={() => onDecide(u.email, 'deny')}>Deny</button></div>
          </div>
        ))}
    </div>
  )
}

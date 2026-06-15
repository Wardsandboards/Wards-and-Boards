import { useState } from 'react'
import { AuAvatar } from './common'
import { authorStub } from '../lib/questions'

// Lets a signed-in user set how they appear: a chosen display name, a short
// about-me, and an optional course code. Photos are initials avatars for now.
export function SettingsView({ fallbackName, email, displayName, bio, courseCode, onSave }: {
  fallbackName: string
  email: string
  displayName: string
  bio: string
  courseCode: string
  onSave: (f: { display_name: string; bio: string; course_code: string }) => void
}) {
  const [dn, setDn] = useState(displayName)
  const [b, setB] = useState(bio)
  const [cc, setCc] = useState(courseCode)
  const [saved, setSaved] = useState(false)
  const shown = dn.trim() || fallbackName || email
  const avatar = authorStub('me', shown, '', '')
  const save = () => { onSave({ display_name: dn.trim(), bio: b.trim(), course_code: cc.trim() }); setSaved(true); setTimeout(() => setSaved(false), 4000) }
  return (
    <section className="section" style={{ paddingTop: 34 }}><div className="wrap" style={{ maxWidth: 640 }}>
      <div className="sec-head"><div className="kicker">Your profile</div><h2 className="h2">Profile settings</h2>
        <p className="sec-lead">Set how you appear on Wards & Boards. Your name and a short note are shown on the questions you author and review.</p></div>
      <div className="qblock">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
          <AuAvatar a={avatar} size={56} />
          <div><div style={{ fontWeight: 800, color: 'var(--ink)' }}>{shown}</div><div style={{ fontSize: '0.85rem', color: 'var(--mid)' }}>{email}</div></div>
        </div>
        <div className="prompt-q" style={{ marginBottom: 6 }}>Display name</div>
        <input className="os-input" value={dn} onChange={(e) => setDn(e.target.value)} placeholder={fallbackName || 'How your name appears'} maxLength={60} />
        <div className="prompt-q" style={{ margin: '14px 0 6px' }}>About you</div>
        <textarea className="answer-textarea" value={b} onChange={(e) => setB(e.target.value)} placeholder="A sentence or two for other students: your school, year, and what you are into." maxLength={280} />
        <div style={{ fontSize: '0.78rem', color: 'var(--dim)', textAlign: 'right' }}>{b.length}/280</div>
        <div className="prompt-q" style={{ margin: '8px 0 6px' }}>Course code (optional)</div>
        <input className="os-input" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="If an instructor gave you one (for example, an MS3 internal medicine block code)" maxLength={40} />
        <div style={{ marginTop: 18 }}>
          <button className="btn btn-primary" onClick={save}>Save profile</button>
          {saved && <span style={{ marginLeft: 12, color: 'var(--good)', fontSize: '0.9rem' }}>Saved ✓</span>}
        </div>
      </div>
    </div></section>
  )
}

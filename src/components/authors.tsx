import { useEffect, useState } from 'react'
import { AuAvatar, AuBadge, QByline } from './common'
import { BADGE_CATALOG, COMMUNITY_AUTHORS } from '../data/authors'
import type { Author } from '../types'

function AuQuestion({ author, onOpenAuthor }: { author: Author; onOpenAuthor?: (a: Author) => void }) {
  return (
    <div className="aq-card">
      <QByline att={{ author }} onOpenAuthor={onOpenAuthor} cite={author.qs[0][3]} />
      <div className="vignette"><div className="vignette-label">Clinical Vignette</div>A 68-year-old patient with ischemic cardiomyopathy is admitted with worsening dyspnea on exertion. Examination shows distended neck veins, bibasilar crackles, and 2+ pitting edema. The left ventricular ejection fraction is 30 percent (reduced), and the patient is given furosemide.</div>
      <p className="qstem">Which of the following best explains the change in stroke volume after furosemide is given?</p>
      <div className="choices">
        <button className="choice" disabled><span className="choice-letter">A</span><span>Stroke volume rises. Lower filling moves the ventricle onto the ascending portion of the curve.</span></button>
        <button className="choice" disabled><span className="choice-letter">B</span><span>Stroke volume rises. The diuretic raises contractility and lifts the entire curve.</span></button>
        <button className="choice" disabled><span className="choice-letter">C</span><span>Stroke volume falls. Reducing preload lowers output even on a depressed curve.</span></button>
      </div>
      <div className="aq-foot">
        <span>Reviewed by the <b>Wards & Boards review board</b></span>
      </div>
    </div>
  )
}

function AuthorProfile({ a, onBack }: { a: Author; onBack: () => void }) {
  const [following, setFollowing] = useState(false)
  return (
    <div>
      <button className="ghost-btn" onClick={onBack} style={{ marginBottom: 14 }}>← All authors</button>
      <div className="profile-head">
        <AuAvatar a={a} size={96} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 className="h2" style={{ margin: 0 }}>{a.name} <span className="ab-cred" style={{ fontSize: '1rem' }}>{a.creds}</span></h2>
          <div className="profile-role">{a.role} · {a.institution}</div>
          <div className="badge-row">{a.badges.map((b, i) => <AuBadge key={i} icon={b[0]} label={b[1]} />)}</div>
          <p style={{ color: 'var(--mid)', fontSize: '0.9rem', margin: '4px 0 10px' }}>{a.bio}</p>
          <div className="link-row">
            <span className="link-chip">🏛 {a.institution}</span>
            <span className="link-chip">ORCID {a.orcid}</span>
            <span className="link-chip">Doximity</span>
          </div>
          <div className="follow-row">
            <button className={'btn ' + (following ? 'ghost-btn' : 'btn-primary')} onClick={() => setFollowing((f) => !f)}>{following ? '✓ Following' : '＋ Follow'}</button>
            <span className="follow-count"><b>{a.followers + (following ? 1 : 0)}</b> followers</span>
          </div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-box"><div className="sb-n">{a.published}</div><div className="sb-l">Questions published</div></div>
        <div className="stat-box"><div className="sb-n">{a.reviews}</div><div className="sb-l">Peer reviews given</div></div>
        <div className="stat-box"><div className="sb-n">{a.joined}</div><div className="sb-l">Contributing since</div></div>
      </div>
      <div className="sec-head" style={{ textAlign: 'left', marginBottom: 10 }}><h3 className="h2" style={{ fontSize: '1.1rem', margin: 0 }}>Latest published questions</h3></div>
      {a.qs.map((q, i) => (
        <div className="aqlist-row" key={i}>
          <div><div className="aqlist-title">{q[0]}</div><div className="aqlist-meta">{q[1]} · {q[3]} · <span className="verify-mini">✓ peer-reviewed</span></div></div></div>
      ))}
    </div>
  )
}

export function AuthorsView({ sel, setSel }: { sel: Author | null; setSel: (a: Author | null) => void }) {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [sel])
  const sorted = [...COMMUNITY_AUTHORS].sort((x, y) => y.published - x.published)
  if (sel) return (<section className="section" style={{ paddingTop: 34 }}><div className="wrap" style={{ maxWidth: 760 }}><AuthorProfile a={sel} onBack={() => setSel(null)} /></div></section>)
  return (
    <section className="section" style={{ paddingTop: 34 }}><div className="wrap" style={{ maxWidth: 820 }}>
      <div className="sec-head"><div className="kicker">Authors</div><h2 className="h2">Credit where it is due</h2>
        <p className="sec-lead">Every question carries its author and is reviewed by the Wards & Boards review board. The contributors are residents and junior faculty, and each published item is a citable line on a CV with your name on it for good.</p></div>
      <div className="author-hero">
        <div className="kicker" style={{ marginBottom: 10 }}>What a published question looks like</div>
        <AuQuestion author={COMMUNITY_AUTHORS[0]} onOpenAuthor={setSel} />
      </div>
      <div className="sec-head"><div className="kicker">Leaderboard</div><h2 className="h2">Top authors</h2>
        <p className="sec-lead">Ranked by questions published and peer reviews. Open an author to see their page and follow them, so a new question from a writer you trust finds you.</p></div>
      <div className="lb">{sorted.map((a, i) => (
        <button className="lb-row" key={a.id} onClick={() => setSel(a)}>
          <span className="lb-rank">{i + 1}</span><AuAvatar a={a} size={40} />
          <span className="lb-name">{a.name} <span className="ab-cred">{a.creds}</span><br /><span className="lb-sub">{a.role} · {a.institution}</span></span>
          <span className="lb-stat"><b>{a.published}</b><span>published</span></span>
          <span className="lb-stat"><b>{a.reviews}</b><span>reviews</span></span>
        </button>
      ))}</div>
      <div className="sec-head" style={{ marginTop: 38 }}><div className="kicker">How you earn credit</div><h2 className="h2">Badges</h2>
        <p className="sec-lead">Recognition for writing and reviewing. Badges show on your profile and next to your name across the site.</p></div>
      <div className="badge-grid">{BADGE_CATALOG.map((b, i) => (
        <div className="badge-card" key={i}>
          <span className="badge-card-ic">{b[0]}</span>
          <div><div className="badge-card-name">{b[1]}</div><div className="badge-card-desc">{b[2]}</div></div></div>
      ))}</div>
    </div></section>
  )
}

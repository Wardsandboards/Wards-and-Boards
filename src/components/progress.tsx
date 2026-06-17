import { badgesFor, levelFor, xpFor } from '../lib/gamify'
import type { GameStats } from '../lib/gamify'

export function ProgressDashboard({ stats, due }: { stats: GameStats; due: number }) {
  const xp = xpFor(stats)
  const lvl = levelFor(xp)
  const badges = badgesFor(stats)
  const acc = stats.answers ? Math.round((100 * stats.correct) / stats.answers) : 0
  const earned = badges.filter((b) => b.earned).length
  return (
    <div>
      <div className="game-hero">
        <div className="game-level">
          <div className="game-lvl-kicker">Level {lvl.index + 1}</div>
          <div className="game-lvl-name">{lvl.name}</div>
          <div className="game-bar"><div style={{ width: lvl.pct + '%' }} /></div>
          <div className="game-xp">{xp.toLocaleString()} XP{lvl.next ? ' · ' + lvl.toNext.toLocaleString() + ' XP to ' + lvl.next : ' · top level reached'}</div>
        </div>
        <div className="game-streak">
          <div className="game-streak-flame">🔥</div>
          <div className="game-streak-n">{stats.streak}</div>
          <div className="game-streak-l">{stats.streak === 1 ? 'day streak' : 'day streak'}</div>
        </div>
      </div>

      <div className="how-grid" style={{ marginBottom: 18 }}>
        <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Questions seen</div><div className="stat-num">{stats.seen}</div></div>
        <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Total answers</div><div className="stat-num">{stats.answers}</div></div>
        <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Accuracy</div><div className={'stat-num ' + (acc >= 70 ? 'good' : 'warn')}>{acc}%</div></div>
        <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Due for review</div><div className={'stat-num ' + (due ? 'warn' : 'good')}>{due}</div></div>
      </div>

      <div className="qblock"><div className="reveal-title">Badges <span style={{ color: 'var(--dim)', fontWeight: 700 }}>· {earned}/{badges.length}</span></div>
        <div className="badge-grid" style={{ marginTop: 10 }}>{badges.map((b) => (
          <div key={b.id} className={'badge-card' + (b.earned ? '' : ' badge-locked')}>
            <span className="badge-card-ic">{b.icon}</span>
            <div><div className="badge-card-name">{b.name}</div><div className="badge-card-desc">{b.desc}</div></div>
          </div>
        ))}</div>
      </div>

      <div className="qblock"><div className="reveal-title">Accuracy by system</div>
        {stats.systems.length === 0 ? <p style={{ color: 'var(--dim)', marginTop: 8 }}>Answer some questions to see your breakdown.</p> :
          stats.systems.map((s) => { const pc = Math.round((100 * s.correct) / s.total); return (<div key={s.system} style={{ margin: '10px 0' }}><div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 5 }}>{s.system} — {s.correct}/{s.total} ({pc}%)</div><div className="os-bar"><div style={{ width: pc + '%' }} /></div></div>) })}</div>
    </div>
  )
}

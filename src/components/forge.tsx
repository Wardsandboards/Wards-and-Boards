import { forgeAudit } from '../lib/forge'
import type { ForgeInput, ForgeRule } from '../lib/forge'

// A live, honest checklist of the Item Forge rules for the item being written.
// Two sections: COMPLETENESS (does the item exist yet?) and FLAWS (item-writing
// problems). Flaw checks read "—" (not yet) until there is enough content to
// judge, so a near-empty draft never shows a wall of false ✓. Hard ✕ block
// assigning; soft ! are polish; ✓ pass.
function mark(r: ForgeRule): { sym: string; color: string } {
  if (r.status === 'na') return { sym: '—', color: 'var(--dim)' }
  if (r.status === 'pass') return { sym: '✓', color: 'var(--good)' }
  return r.severity === 'hard' ? { sym: '✕', color: 'var(--bad)' } : { sym: '!', color: 'var(--warn)' }
}

function Row({ r }: { r: ForgeRule }) {
  const m = mark(r)
  const muted = r.status === 'na'
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: '0.82rem', padding: '4px 0', borderBottom: '1px solid var(--border)', alignItems: 'baseline' }}>
      <span style={{ width: 14, flex: '0 0 14px', textAlign: 'center', fontWeight: 800, color: m.color }}>{m.sym}</span>
      <span style={{ flex: 1, color: muted || r.status === 'pass' ? 'var(--dim)' : 'inherit' }}>
        {r.label}{r.status === 'fail' && <span style={{ color: 'var(--dim)' }}> — {r.detail}</span>}
      </span>
    </div>
  )
}

export function ForgeChecklist({ item }: { item: ForgeInput }) {
  const res = forgeAudit(item)
  const hard = res.hardFails.length
  const complete = res.rules.filter((r) => r.section === 'complete')
  const flaws = res.rules.filter((r) => r.section === 'flaws')
  return (
    <div className="forge-audit">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className={'os-badge ' + (res.ok ? 'ready' : 'polish')}>{res.ok ? '✓ Passes the board exam gate' : '✕ ' + hard + ' to finish or fix'}</span>
        {res.ok && res.softWarns.length > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--warn)' }}>{res.softWarns.length} optional polish {res.softWarns.length === 1 ? 'note' : 'notes'}</span>}
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--mid)', margin: '4px 0 2px' }}>Is the question complete?</div>
      {complete.map((r) => <Row key={r.id} r={r} />)}

      <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--mid)', margin: '12px 0 2px' }}>Board item-writing checks</div>
      {!res.ready && <p style={{ fontSize: '0.78rem', color: 'var(--dim)', margin: '2px 0 6px' }}>These run once the draft is complete: a full vignette, a closed lead-in, and at least four real options. Until then they read "—".</p>}
      {flaws.map((r) => <Row key={r.id} r={r} />)}
    </div>
  )
}

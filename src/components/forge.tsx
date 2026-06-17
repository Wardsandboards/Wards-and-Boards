import { forgeAudit } from '../lib/forge'
import type { ForgeInput } from '../lib/forge'

// A live ✓ / ✕ / ! checklist of the Item Forge board-exam rules for the item
// being written. Hard flaws (✕) block submission; soft notes (!) are polish.
// Shown live as the author types so they see exactly what to work on.
export function ForgeChecklist({ item }: { item: ForgeInput }) {
  const res = forgeAudit(item)
  const hard = res.hardFails.length
  const softWarn = res.rules.filter((r) => r.severity === 'soft' && !r.pass).length
  return (
    <div className="forge-audit" style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className={'os-badge ' + (res.ok ? 'ready' : 'polish')}>{res.ok ? '✓ Passes the board exam gate' : '✕ ' + hard + ' hard ' + (hard === 1 ? 'flaw' : 'flaws') + ' to fix'}</span>
        {res.ok && softWarn > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--warn)' }}>{softWarn} optional polish {softWarn === 1 ? 'note' : 'notes'}</span>}
      </div>
      <div>
        {res.rules.map((r) => (
          <div key={r.id} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', padding: '4px 0', borderBottom: '1px solid var(--border)', alignItems: 'baseline' }}>
            <span style={{ width: 14, flex: '0 0 14px', textAlign: 'center', fontWeight: 800, color: r.pass ? 'var(--good)' : (r.severity === 'hard' ? 'var(--bad)' : 'var(--warn)') }}>{r.pass ? '✓' : (r.severity === 'hard' ? '✕' : '!')}</span>
            <span style={{ flex: 1, color: r.pass ? 'var(--mid)' : 'inherit' }}>{r.label}{!r.pass && <span style={{ color: 'var(--dim)' }}> — {r.detail}</span>}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

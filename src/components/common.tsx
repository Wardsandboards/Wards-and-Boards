import { Fragment, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { DEFAULT_FS } from '../constants'
import type { Author, GraphicConfig, LearningPoint } from '../types'

export function WMLogo() {
  return (
    <svg className="wm-logo" viewBox="0 0 32 28" width="28" height="24" role="img" aria-label="Wards & Boards">
      <polygon points="16,3 23,15 9,15" fill="currentColor" opacity="0.5" />
      <polygon points="9,15 23,15 28,25 4,25" fill="currentColor" />
    </svg>
  )
}

export function Pyramid() {
  return (
    <div className="pyr-card">
      <svg viewBox="0 0 400 300" className="pyr-svg" role="img" aria-label="Learning pyramid from foundations to the wards and the boards">
        <polygon className="pyr-tier pyr1" points="40,270 260,270 232.5,214 67.5,214" />
        <polygon className="pyr-tier pyr2" points="67.5,214 232.5,214 205,158 95,158" />
        <polygon className="pyr-tier pyr3" points="95,158 205,158 177.5,102 122.5,102" />
        <polygon className="pyr-tier pyr4" points="122.5,102 177.5,102 150,46" />
        <line x1="150" y1="46" x2="150" y2="30" className="pyr-mk-s" strokeWidth="2" />
        <path d="M150,30 L168,35 L150,40 Z" className="pyr-mk" />
        <line x1="247" y1="242" x2="272" y2="242" className="pyr-tick" /><text x="278" y="246" className="pyr-label" textAnchor="start">Foundations</text>
        <line x1="220" y1="186" x2="272" y2="186" className="pyr-tick" /><text x="278" y="190" className="pyr-label" textAnchor="start">Mechanisms</text>
        <line x1="193" y1="130" x2="272" y2="130" className="pyr-tick" /><text x="278" y="134" className="pyr-label" textAnchor="start">Clinical reasoning</text>
        <line x1="165" y1="74" x2="272" y2="74" className="pyr-tick" /><text x="278" y="78" className="pyr-label" textAnchor="start">Wards &amp; boards</text>
      </svg>
      <div className="pyr-cap">Start at the base in Learn, then climb to wards and boards before exam day.</div>
    </div>
  )
}

export function AnkiButton({ front, back, style }: LearningPoint & { style?: CSSProperties }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const clean = (s: string) => String(s).replace(/[\t\r\n]+/g, ' ')
    navigator.clipboard.writeText(clean(front) + '\t' + clean(back))
    setCopied(true)
    setTimeout(() => setCopied(false), 9000)
  }
  return (
    <span className="anki-wrap" style={style}>
      <button className="anki-btn" onClick={copy} title="Copies the key learning point for this question as one Anki card: a recall cue is the Front, the learning point is the Back, separated by a Tab.">
        {copied ? 'Copied for Anki ✓' : '⎘ Anki card'}
      </button>
      {copied && (
        <span className="anki-help">
          Copied the <b>key learning point</b> as <b>Front&nbsp;⇥&nbsp;Back</b>. To add it in Anki: paste into a blank text file and save it, then in Anki choose <b>File ▸ Import</b>, set note type to <b>Basic</b> and <b>Fields separated by: Tab</b>.
        </span>
      )}
    </span>
  )
}

interface ReadoutPoint {
  x: number
  y: number
  edv?: string
  sv?: string
  cong?: string
}

interface StarlingCurveProps {
  compact?: boolean
  phase?: string
  curves?: string
  point?: [number, number] | null
  config?: GraphicConfig | null
}

export function StarlingCurve({ compact = false, phase = 'interactive', curves = 'both', point = null, config = null }: StarlingCurveProps) {
  const cfg = config || DEFAULT_FS
  const interactive = phase === 'interactive'
  const [sel, setSel] = useState<'before' | 'after'>('before')
  const [anim, setAnim] = useState<'before' | 'after'>('before')
  useEffect(() => {
    if (phase === 'animate') {
      setAnim('before')
      const t = setTimeout(() => setAnim('after'), 450)
      return () => clearTimeout(t)
    }
  }, [phase])
  const cur = phase === 'none' ? null : phase === 'interactive' ? sel : phase === 'animate' ? anim : phase
  const pts: Record<string, ReadoutPoint> = {
    before: { x: 320, y: 138, edv: 'very high', sv: 'low', cong: 'present' },
    after: { x: 150, y: 121, edv: 'reduced', sv: 'improved', cong: 'relieved' },
  }
  const p: ReadoutPoint | null = point ? { x: point[0], y: point[1] } : cur ? pts[cur] || null : null
  const paths = curves === 'normal' ? cfg.paths.filter((pp) => pp.muted) : cfg.paths
  return (
    <div className={'curve-wrap ' + (compact ? 'compact' : '')}>
      {compact && <div className="curve-mini-label">{cfg.title}</div>}
      {interactive && !point && (
        <div className="curve-toggle">
          <button className={'curve-btn ' + (sel === 'before' ? 'on' : '')} onClick={() => setSel('before')}>Before diuresis</button>
          <button className={'curve-btn ' + (sel === 'after' ? 'on' : '')} onClick={() => setSel('after')}>After furosemide</button>
        </div>
      )}
      <svg viewBox="0 0 380 250" className="curve-svg" role="img" aria-label={cfg.title}>
        <line x1="50" y1="200" x2="352" y2="200" className="curve-axis" />
        <line x1="50" y1="200" x2="50" y2="26" className="curve-axis" />
        <text x="205" y="240" className="curve-axislabel" textAnchor="middle">{cfg.xLabel}</text>
        <text x="16" y="118" className="curve-axislabel" textAnchor="middle" transform="rotate(-90 16 118)">{cfg.yLabel}</text>
        {paths.map((pp, i) => (
          <Fragment key={i}>
            <path d={pp.d} className={pp.muted ? 'curve-normal' : 'curve-failing'} fill="none" />
            <text x={pp.lx} y={pp.ly} className={pp.muted ? 'curve-label-normal' : 'curve-label-failing'}>{pp.label}</text>
          </Fragment>
        ))}
        {p && <line x1={p.x} y1={p.y} x2={p.x} y2="200" className="curve-guide" />}
        {p && <line x1={p.x} y1={p.y} x2="50" y2={p.y} className="curve-guide" />}
        {p && (
          <g style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform .55s cubic-bezier(.4,0,.2,1)' }}>
            <circle r="7" className="curve-dot" />
          </g>
        )}
      </svg>
      {p && !point && (
        <div className="curve-readout">
          <span><b>Preload:</b> {p.edv}</span>
          <span><b>Stroke volume:</b> {p.sv}</span>
          <span><b>Congestion:</b> {p.cong}</span>
        </div>
      )}
    </div>
  )
}

export function AuAvatar({ a, size = 44 }: { a: Author; size?: number }) {
  const [err, setErr] = useState(false)
  if (a.photo && !err)
    return <img className="avatar" src={a.photo} alt={a.name} onError={() => setErr(true)} style={{ width: size, height: size, minWidth: size, objectFit: 'cover', background: a.color }} />
  return (
    <span className="avatar" style={{ width: size, height: size, minWidth: size, background: a.color, fontSize: Math.round(size * 0.38) }}>{a.initials}</span>
  )
}

export function AuBadge({ icon, label }: { icon: string; label: string }) {
  return (<span className="badge-chip"><span className="bc-ic">{icon}</span>{label}</span>)
}

export function AuVerify() {
  return (<span className="verify-badge"><span className="vb-check">✓</span>Peer-reviewed</span>)
}

export function QByline({ att, onOpenAuthor, cite }: { att: { author: Author }; onOpenAuthor?: (a: Author) => void; cite?: string }) {
  const a = att.author
  const inner = (
    <>
      <AuAvatar a={a} size={26} />
      <span className="qb-name"><span className="qb-label">Question author: </span>{a.name}, {a.creds}</span>
    </>
  )
  return (
    <div className="q-byline">
      {onOpenAuthor ? <button className="qb-link" onClick={() => onOpenAuthor(a)}>{inner}</button> : <span className="qb-link">{inner}</span>}
      <AuVerify />
      {cite && <span className="aq-cite">{cite}</span>}
    </div>
  )
}

export function AuByline({ a, onOpen, size = 46 }: { a: Author; onOpen: () => void; size?: number }) {
  return (
    <button className="author-byline" onClick={onOpen}>
      <AuAvatar a={a} size={size} />
      <span className="ab-text">
        <span className="ab-name">{a.name} <span className="ab-cred">{a.creds}</span></span>
        <span className="ab-role">{a.role} · {a.institution}</span>
      </span>
    </button>
  )
}
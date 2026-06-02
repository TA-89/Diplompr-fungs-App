import { useState } from 'react'
import meta from '../data/meta.json'
import { scoreLabel } from '../lib/srs.js'

const AREA_NAME = Object.fromEntries(meta.areas.map((a) => [a.id, a.name]))
export function areaName(id) { return AREA_NAME[id] || id }

// Farbe und Icon je Lernbereich (fuer farbcodierte Uebersicht)
export const AREA_META = {
  forschungsfrage: { color: '#6c5ce7', soft: '#efecfe', icon: '🎯' },
  vorgehen:        { color: '#14b8b8', soft: '#ddf6f6', icon: '🧪' },
  theorie:         { color: '#2f9bff', soft: '#e4f1ff', icon: '📐' },
  ki:              { color: '#5b6cff', soft: '#e8eaff', icon: '🤖' },
  synthese:        { color: '#ff6b8b', soft: '#ffe9ef', icon: '🧩' },
  kriterien:       { color: '#18b56a', soft: '#e3f7ec', icon: '✅' },
  leitfaden:       { color: '#f0a52a', soft: '#fdf1da', icon: '🧭' },
  quellen:         { color: '#ff8a3d', soft: '#ffe9d8', icon: '📚' },
  grenzen:         { color: '#ef5a5a', soft: '#fde4e4', icon: '🛡️' },
}
export function areaMeta(id) { return AREA_META[id] || { color: '#6c5ce7', soft: '#efecfe', icon: '•' } }

// Bereichs-Label mit Farbpunkt
export function AreaBadge({ id }) {
  const m = areaMeta(id)
  return (
    <span className="tag" style={{ background: m.soft, color: '#2c2f48', borderColor: 'transparent' }}>
      <span className="dot" style={{ background: m.color }} />
      {areaName(id)}
    </span>
  )
}

// Fortschrittsring (SVG)
export function ProgressRing({ value = 0, size = 104, stroke = 10, color = '#fff', track = 'rgba(255,255,255,.3)', labelColor = '#fff' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s' }}
        />
      </svg>
      <div className="ring-label" style={{ color: labelColor }}>
        <b style={{ color: labelColor }}>{Math.round(value)}%</b>
        <span style={{ color: labelColor, opacity: .85 }}>gesamt</span>
      </div>
    </div>
  )
}

// Fortschrittsbalken 0..100
export function ProgressBar({ value, green }) {
  return (
    <div className={'bar' + (green ? ' green' : '')}>
      <i style={{ width: Math.max(0, Math.min(100, value)) + '%' }} />
    </div>
  )
}

// Schwierigkeits-Tag
export function DifficultyTag({ value }) {
  const cls = value === 'einfach' ? 'green' : value === 'mittel' ? 'amber' : 'red'
  return <span className={'tag ' + cls}>{value}</span>
}

// Relevanz-Tag (Quellen)
export function RelevanceTag({ value }) {
  const cls = value === 'hoch' ? 'red' : value === 'mittel' ? 'amber' : ''
  return <span className={'tag ' + cls}>Relevanz: {value}</span>
}

// Bewertungsleiste 0..3 mit Selbstbewertung
export function RatingBar({ current, onRate }) {
  return (
    <div>
      <div className="tiny faint" style={{ marginBottom: '.3rem' }}>Selbstbewertung</div>
      <div className="rating">
        {[0, 1, 2, 3].map((s) => (
          <button
            key={s}
            className={`s${s}` + (current === s ? ' sel' : '')}
            onClick={() => onRate(s)}
          >
            <b>{s}</b><br />{scoreLabel(s)}
          </button>
        ))}
      </div>
    </div>
  )
}

// Aufklappbarer Bereich (Musterantwort einblenden)
export function Reveal({ label = 'Musterantwort einblenden', hideLabel = 'Ausblenden', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button className="btn primary" onClick={() => setOpen((o) => !o)}>
        {open ? hideLabel : label}
      </button>
      {open && <div className="stack" style={{ marginTop: '.9rem' }}>{children}</div>}
    </div>
  )
}

// Bloecke mit Titel
export function Block({ title, children }) {
  return (
    <div>
      <div className="tiny faint" style={{ textTransform: 'uppercase', letterSpacing: '.05em' }}>{title}</div>
      <div>{children}</div>
    </div>
  )
}

// Liste von Quellen-Kurznamen
export function SourceRefs({ ids, sources }) {
  if (!ids || !ids.length) return null
  const map = Object.fromEntries(sources.map((s) => [s.id, s.shortName]))
  return (
    <div className="row">
      {ids.map((id) => (
        <span key={id} className="tag blue">{map[id] || id}</span>
      ))}
    </div>
  )
}

export function ChapterRefs({ ids }) {
  if (!ids || !ids.length) return null
  return (
    <div className="row">
      {ids.map((c) => <span key={c} className="tag">Kap. {c}</span>)}
    </div>
  )
}

export function PageTitle({ title, intro }) {
  return (
    <div>
      <h1>{title}</h1>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  )
}

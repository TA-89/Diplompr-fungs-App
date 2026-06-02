import { useState } from 'react'
import meta from '../data/meta.json'
import { scoreLabel } from '../lib/srs.js'

const AREA_NAME = Object.fromEntries(meta.areas.map((a) => [a.id, a.name]))
export function areaName(id) { return AREA_NAME[id] || id }

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

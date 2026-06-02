import { useEffect, useRef, useState } from 'react'
import pt from '../data/presentationTrainer.json'
import { useStore, ratePresentation, setLastActivity } from '../lib/storage.js'
import { PageTitle, Block } from '../components/ui.jsx'
import { scoreLabel } from '../lib/srs.js'

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PresentationTrainer() {
  const [view, setView] = useState('plan')
  return (
    <div className="stack">
      <PageTitle
        title="Präsentationstrainer"
        intro={pt.intro}
      />
      <div className="note"><b>Überladung vermeiden:</b> {pt.overloadWarning}</div>
      <div className="row">
        <button className={'btn' + (view === 'plan' ? ' primary' : '')} onClick={() => setView('plan')}>Struktur & Timer</button>
        <button className={'btn' + (view === 'practice' ? ' primary' : '')} onClick={() => setView('practice')}>Abschnitte üben</button>
        <button className={'btn' + (view === 'check' ? ' primary' : '')} onClick={() => setView('check')}>Checkliste & Kürzungen</button>
      </div>
      {view === 'plan' && <Plan />}
      {view === 'practice' && <Practice />}
      {view === 'check' && <Checklist />}
    </div>
  )
}

function Timer() {
  const [sec, setSec] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSec((s) => s + 1), 1000)
      return () => clearInterval(ref.current)
    }
  }, [running])

  const total = pt.totalMinutes * 60
  const cls = sec > total ? 'timer over' : sec > total * 0.85 ? 'timer warn' : 'timer'

  return (
    <div className="card center">
      <div className={cls}>{fmt(sec)}</div>
      <div className="tiny faint">Ziel: {pt.totalMinutes}:00 Minuten</div>
      <div className="row" style={{ justifyContent: 'center', marginTop: '.6rem' }}>
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
        <button className="btn" onClick={() => { setRunning(false); setSec(0) }}>Zurücksetzen</button>
      </div>
    </div>
  )
}

function Plan() {
  const cum = []
  let acc = 0
  pt.sections.forEach((s) => { acc += s.minutes; cum.push(acc) })
  return (
    <div className="stack">
      <Timer />
      {pt.sections.map((s, i) => (
        <div className="card stack" key={s.id}>
          <div className="spread">
            <h3 style={{ margin: 0 }}>{i + 1}. {s.title}</h3>
            <span className="tag blue">{s.minutes} min · bis {Math.round(cum[i])}'</span>
          </div>
          <p className="small muted" style={{ margin: 0 }}>{s.goal}</p>
          <Block title="Stichwortkarte">
            <ul className="clean">{s.cueCard.map((c, j) => <li key={j}>{c}</li>)}</ul>
          </Block>
          <div className="note blue tiny"><b>Übergang:</b> „{s.transitionOut}“</div>
        </div>
      ))}
    </div>
  )
}

function Practice() {
  const store = useStore()
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const s = pt.sections[i]
  const saved = store.presentation[s.id]

  const handleRate = (score) => {
    ratePresentation(s.id, score)
    setLastActivity('presentation', `Präsentationsabschnitt geübt: ${s.title}`)
  }

  return (
    <div className="stack">
      <div className="stage stack">
        <div className="spread">
          <span className="tag blue">Abschnitt {i + 1} / {pt.sections.length} · {s.minutes} min</span>
          {saved != null && <span className="tag green">zuletzt: {scoreLabel(saved)}</span>}
        </div>
        <h2 style={{ margin: '.2rem 0' }}>{s.title}</h2>
        <p className="muted small">{s.goal}</p>
        <p className="reveal-hint">Erkläre diesen Abschnitt jetzt laut, frei und in der Zielzeit. Danach Stichworte aufdecken und bewerten.</p>
        {!show ? (
          <button className="btn primary" onClick={() => setShow(true)}>Stichworte zeigen</button>
        ) : (
          <Block title="Stichwortkarte">
            <ul className="clean">{s.cueCard.map((c, j) => <li key={j}>{c}</li>)}</ul>
            <div className="note blue tiny"><b>Übergang:</b> „{s.transitionOut}“</div>
          </Block>
        )}
      </div>

      <div className="card tight">
        <div className="tiny faint" style={{ marginBottom: '.3rem' }}>Wie sicher war dieser Abschnitt?</div>
        <div className="rating">
          {[0, 1, 2, 3].map((sc) => (
            <button key={sc} className={`s${sc}` + (saved === sc ? ' sel' : '')} onClick={() => handleRate(sc)}>
              <b>{sc}</b><br />{scoreLabel(sc)}
            </button>
          ))}
        </div>
      </div>

      <div className="spread">
        <button className="btn" onClick={() => { setShow(false); setI((x) => (x - 1 + pt.sections.length) % pt.sections.length) }}>← Vorheriger</button>
        <button className="btn primary" onClick={() => { setShow(false); setI((x) => (x + 1) % pt.sections.length) }}>Nächster →</button>
      </div>
    </div>
  )
}

function Checklist() {
  const [checked, setChecked] = useState({})
  const toggle = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }))
  const done = Object.values(checked).filter(Boolean).length
  return (
    <div className="stack">
      <div className="card">
        <div className="spread">
          <h3 style={{ margin: 0 }}>Checkliste</h3>
          <span className="tag">{done} / {pt.checklist.length}</span>
        </div>
        <div className="stack" style={{ marginTop: '.5rem' }}>
          {pt.checklist.map((c, i) => (
            <label key={i} className="row" style={{ cursor: 'pointer', gap: '.5rem' }}>
              <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)} />
              <span className={checked[i] ? 'muted' : ''}>{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Wenn die Zeit knapp wird (Kürzungen)</h3>
        <ul className="clean">{pt.cuts.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>

      <div className="card">
        <h3>Typische Fehler</h3>
        <ul className="clean">{pt.commonMistakes.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>

      <div className="card">
        <h3>Übergangssätze</h3>
        <ul className="clean small">{pt.transitions.map((c, i) => <li key={i}>„{c}“</li>)}</ul>
      </div>
    </div>
  )
}

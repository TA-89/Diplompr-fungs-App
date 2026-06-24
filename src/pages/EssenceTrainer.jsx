import { useEffect, useRef, useState } from 'react'
import essenz from '../data/essenz.json'
import { rate, getRating, setLastActivity } from '../lib/storage.js'
import { PageTitle, RatingBar, Reveal, Block } from '../components/ui.jsx'

export default function EssenceTrainer() {
  const [sessionId, setSessionId] = useState(essenz.sessions[0].id)
  const session = essenz.sessions.find((s) => s.id === sessionId)

  return (
    <div className="stack">
      <PageTitle
        title="Essenz-Trainer für volle Punktzahl"
        intro="Die Fragen, die mit hoher Wahrscheinlichkeit kommen – mit kurzen Antworten, die das Maximum holen. Zwei Blöcke à ca. 30 Minuten: einmal jetzt, einmal kurz vor der Prüfung, dann bist du sicher."
      />

      {/* Antwort-DNA */}
      <div className="card stack">
        <h2 style={{ margin: 0 }}>🎯 So holst du die volle Punktzahl</h2>
        <div className="note amber"><b>Regel:</b> {essenz.fullPointsRule}</div>
        <Block title="Antwortformel"><p style={{ margin: 0 }}>{essenz.formula}</p></Block>
        <Block title="Kernbotschaft in 30 Sekunden (auswendig können)">
          <p style={{ margin: 0, fontWeight: 600 }}>{essenz.elevator}</p>
        </Block>
      </div>

      {/* Block-Auswahl */}
      <div className="row">
        {essenz.sessions.map((s) => (
          <button
            key={s.id}
            className={'btn' + (s.id === sessionId ? ' primary' : '')}
            onClick={() => setSessionId(s.id)}
          >
            {s.title.split('—')[0].trim()}
          </button>
        ))}
      </div>

      <SessionView session={session} key={session.id} />
    </div>
  )
}

function SessionView({ session }) {
  return (
    <div className="stack">
      <div className="card stack">
        <div className="spread">
          <h2 style={{ margin: 0 }}>{session.title}</h2>
          <Timer minutes={session.minutes} />
        </div>
        <p className="small muted" style={{ margin: 0 }}>{session.focus}</p>
        <p className="tiny faint" style={{ margin: 0 }}>{session.items.length} Fragen · Richtzeit {session.minutes} Min · jede Frage zuerst laut und kurz beantworten, dann aufdecken.</p>
      </div>

      {session.items.map((it, i) => <EssenceCard key={it.id} it={it} nr={i + 1} total={session.items.length} />)}
    </div>
  )
}

function EssenceCard({ it, nr, total }) {
  const rating = getRating(it.id)
  const [score, setScore] = useState(rating?.score ?? null)
  const onRate = (v) => {
    setScore(v)
    rate(it.id, v, { type: 'essenz', area: 'essenz' })
    setLastActivity('essenz', `Essenz-Frage geübt: ${it.q}`)
  }
  return (
    <div className="card stack">
      <div className="tiny faint">Frage {nr} von {total}</div>
      <h3 style={{ margin: '.1rem 0' }}>{it.q}</h3>
      <p className="reveal-hint small">Erst den Kernsatz laut sagen, dann kurz ausführen. Dann aufdecken.</p>
      <Reveal label="Voll-Punkte-Antwort einblenden">
        <Block title="Kernsatz (so beginnst du)"><p style={{ fontWeight: 600 }}>{it.kern}</p></Block>
        <Block title="Kurze Vollantwort am Stück"><p>{it.full}</p></Block>
        <div className="note blue"><b>Punktet, weil:</b> {it.why}</div>
        <div className="note red"><b>Punktefalle:</b> {it.trap}</div>
      </Reveal>
      <hr className="divider" />
      <RatingBar current={score} onRate={onRate} />
    </div>
  )
}

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function Timer({ minutes }) {
  const [left, setLeft] = useState(minutes * 60)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { setRunning(false); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [running])

  const reset = () => { setRunning(false); setLeft(minutes * 60) }

  return (
    <div className="row" style={{ alignItems: 'center', gap: '.5rem' }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '1.2rem', color: left === 0 ? 'var(--red)' : 'inherit' }}>
        {fmt(left)}
      </span>
      <button className="btn small" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
      <button className="btn small ghost" onClick={reset}>Reset</button>
    </div>
  )
}

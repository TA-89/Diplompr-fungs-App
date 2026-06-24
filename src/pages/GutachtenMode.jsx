import { useState } from 'react'
import gutachten from '../data/gutachten.json'
import { rate, getRating, setLastActivity } from '../lib/storage.js'
import { PageTitle, RatingBar, Reveal, Block } from '../components/ui.jsx'

export default function GutachtenMode() {
  const { result, strengths, critiques } = gutachten
  return (
    <div className="stack">
      <PageTitle
        title="Gutachten-Rückmeldungen"
        intro="Die Rückmeldungen aus dem Gutachten zur schriftlichen Arbeit – und wie du sie im Fachgespräch souverän aufnimmst. Das ist der Stoff für Kriterium 9 (Reflexion). Jeden Punkt zuerst laut beantworten, dann aufdecken."
      />

      {/* Ergebnis */}
      <div className="card stack">
        <div className="row">
          <span className="tag green">bestanden</span>
          <span className="tag blue">Note {result.note}</span>
          <span className="tag">{result.points}/{result.maxPoints} Punkte</span>
        </div>
        <p className="small" style={{ margin: 0 }}>{result.scale}</p>
        <div className="note blue"><b>Was das für die mündliche Prüfung heisst:</b> {result.meaning}</div>
        <div className="note amber"><b>Strategie:</b> {result.strategy}</div>
        <p className="tiny faint" style={{ margin: 0 }}>Gutachten von {result.reviewer}, {result.date}.</p>
      </div>

      {/* Stärken */}
      <div className="card stack">
        <h2 style={{ margin: 0 }}>✅ Gelobte Stärken – aktiv aufgreifen</h2>
        <p className="small muted" style={{ margin: 0 }}>Diese Punkte hat das Gutachten ausdrücklich gelobt. Bring sie von dir aus ins Gespräch.</p>
        {strengths.map((s) => (
          <div key={s.id}>
            <p style={{ margin: '.2rem 0', fontStyle: 'italic' }}>„{s.quote}"</p>
            <p className="small" style={{ margin: 0 }}>{s.useIt}</p>
          </div>
        ))}
      </div>

      {/* Kritikpunkte */}
      <div className="spread">
        <h2>Kritikpunkte & souveräne Antworten</h2>
        <span className="tiny faint">Dreischritt: anerkennen → einordnen → Konsequenz</span>
      </div>
      {critiques.map((c) => <CritiqueCard key={c.id} c={c} />)}
    </div>
  )
}

function CritiqueCard({ c }) {
  const rating = getRating(c.id)
  const [score, setScore] = useState(rating?.score ?? null)
  const onRate = (v) => {
    setScore(v)
    rate(c.id, v, { type: 'gutachten', area: 'gutachten' })
    setLastActivity('gutachten', `Gutachten-Punkt geübt: ${c.title}`)
  }
  return (
    <div className="card stack">
      <div className="row">
        <span className="tag red">Kritikpunkt</span>
        <span className="tag">{c.criterion}</span>
        <span className="tag amber">{c.points}</span>
      </div>
      <h3 style={{ margin: '.2rem 0' }}>{c.title}</h3>
      <div className="note">
        <span className="tiny faint" style={{ textTransform: 'uppercase', letterSpacing: '.05em' }}>Wortlaut im Gutachten</span>
        <p style={{ margin: '.2rem 0 0', fontStyle: 'italic' }}>„{c.quote}"</p>
      </div>
      <p className="reveal-hint small">Erst laut und ruhig im Dreischritt antworten. Dann aufdecken.</p>
      <Reveal label="Antwortstrategie einblenden">
        <Block title="1. Anerkennen"><p>{c.acknowledge}</p></Block>
        <Block title="2. Einordnen"><p>{c.classify}</p></Block>
        <Block title="3. Konsequenz"><p>{c.consequence}</p></Block>
        <hr className="divider" />
        <Block title="Gute mündliche Antwort am Stück"><p style={{ fontWeight: 600 }}>{c.spokenAnswer}</p></Block>
        <div className="note blue"><b>Wahrscheinliche Anschlussfrage:</b> {c.anticipates}</div>
      </Reveal>
      <hr className="divider" />
      <RatingBar current={score} onRate={onRate} />
    </div>
  )
}

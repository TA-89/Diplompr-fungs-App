import { useState } from 'react'
import pressureSets from '../data/pressureSets.json'
import sources from '../data/sourceMap.json'
import { markPressureDone, setLastActivity, useStore } from '../lib/storage.js'
import { PageTitle, Block, SourceRefs, ChapterRefs, areaName } from '../components/ui.jsx'

export default function PressureMode() {
  const store = useStore()
  const [activeId, setActiveId] = useState(null)
  const active = pressureSets.find((s) => s.id === activeId)

  if (!active) {
    return (
      <div className="stack">
        <PageTitle
          title="Prüfungsdruck"
          intro="Drei Anschlussfragen hintereinander, wie im echten Fachgespräch. Du beantwortest alle drei laut, bevor die Musterantworten erscheinen. So übst du, unter Nachfragen ruhig zu bleiben."
        />
        <div className="card-grid">
          {pressureSets.map((s) => (
            <div key={s.id} className="card">
              <div className="row">
                <span className="tag blue">{areaName(s.area)}</span>
                {store.pressure[s.id]?.done && <span className="tag green">geübt</span>}
              </div>
              <h3 style={{ marginTop: '.4rem' }}>{s.title}</h3>
              <p className="small muted">{s.questions.length} Anschlussfragen</p>
              <button className="btn primary" onClick={() => setActiveId(s.id)}>Starten</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <PressureRun set={active} onExit={() => setActiveId(null)} key={active.id} />
}

function PressureRun({ set, onExit }) {
  const [step, setStep] = useState(0) // 0..n-1 Fragen nacheinander
  const [revealed, setRevealed] = useState(false)
  const total = set.questions.length
  const lastQuestion = step >= total - 1

  const showNext = () => setStep((s) => Math.min(total - 1, s + 1))
  const reveal = () => {
    setRevealed(true)
    markPressureDone(set.id)
    setLastActivity('pressure', `Prüfungsdruck geübt: ${set.title}`)
  }

  return (
    <div className="stack">
      <div className="spread">
        <h1>{set.title}</h1>
        <button className="btn ghost" onClick={onExit}>← Übersicht</button>
      </div>
      <p className="section-intro">{set.intro}</p>

      <div className="card stack">
        {set.questions.slice(0, step + 1).map((qq, i) => (
          <div key={i}>
            <div className="tiny faint">Frage {i + 1} von {total}</div>
            <h3 style={{ margin: '.15rem 0' }}>{qq}</h3>
            {i < step && <hr className="divider" />}
          </div>
        ))}

        {!revealed && (
          <div className="row" style={{ marginTop: '.4rem' }}>
            {!lastQuestion && (
              <button className="btn primary" onClick={showNext}>Nächste Anschlussfrage →</button>
            )}
            {lastQuestion && (
              <button className="btn primary" onClick={reveal}>Alle beantwortet – Musterantworten zeigen</button>
            )}
            <span className="tiny faint">Erst laut antworten, dann weiter.</span>
          </div>
        )}
      </div>

      {revealed && (
        <div className="card stack">
          <h2>Musterantworten</h2>
          {set.questions.map((qq, i) => (
            <div key={i}>
              <Block title={`Antwort auf Frage ${i + 1}`}>
                <p className="small" style={{ fontWeight: 600 }}>{qq}</p>
                <p>{set.modelAnswers[i]}</p>
              </Block>
              {i < set.questions.length - 1 && <hr className="divider" />}
            </div>
          ))}
          <div className="row">
            <ChapterRefs ids={set.relatedChapters} />
            <SourceRefs ids={set.relatedSources} sources={sources} />
          </div>
          <div className="row">
            <button className="btn" onClick={() => { setStep(0); setRevealed(false) }}>Nochmals</button>
            <button className="btn primary" onClick={onExit}>Fertig</button>
          </div>
        </div>
      )}
    </div>
  )
}

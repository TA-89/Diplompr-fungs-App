import meta from '../data/meta.json'
import questions from '../data/examQuestions.json'
import flashcards from '../data/flashcards.json'
import quiz from '../data/quizQuestions.json'
import sources from '../data/sourceMap.json'
import { useStore } from '../lib/storage.js'
import { dueToday, untouchedIds, progressPercent, weakIds } from '../lib/srs.js'
import { ProgressBar } from '../components/ui.jsx'

// ids je Bereich aus Fragen + Lernkarten
function areaIds(areaId) {
  const q = questions.filter((x) => x.area === areaId).map((x) => x.id)
  const f = flashcards.filter((x) => x.area === areaId).map((x) => x.id)
  const z = quiz.filter((x) => x.area === areaId).map((x) => x.id)
  return [...q, ...f, ...z]
}

export default function Dashboard({ go }) {
  const store = useStore()
  const { ratings } = store

  const due = dueToday(flashcards, store)
  const open = untouchedIds(flashcards.map((c) => c.id), ratings)
  const cardIds = flashcards.map((c) => c.id)

  // Fortschritt pro Bereich
  const areas = meta.areas.map((a) => {
    const ids = areaIds(a.id)
    return { ...a, ids, percent: progressPercent(ids, ratings), count: ids.length }
  })

  // Schwache Themen: Bereiche mit schwachen (0/1) Eintraegen
  const weakAreas = areas
    .map((a) => ({ ...a, weak: weakIds(a.ids, ratings).length }))
    .filter((a) => a.weak > 0)
    .sort((x, y) => y.weak - x.weak)

  // zuletzt geuebte Quellen
  const recentSources = Object.entries(ratings)
    .filter(([, r]) => r.type === 'source')
    .sort((a, b) => b[1].last - a[1].last)
    .slice(0, 4)
    .map(([id]) => sources.find((s) => s.id === id))
    .filter(Boolean)

  const overall = progressPercent(
    [...questions.map((q) => q.id), ...cardIds, ...quiz.map((q) => q.id)],
    ratings
  )

  return (
    <div className="stack">
      <h1>Dashboard</h1>
      <p className="section-intro">{meta.coreMessage}</p>

      <div className="tiles">
        <div className="tile">
          <div className="num">{due.length}</div>
          <div className="lbl">heutige Wiederholungen</div>
        </div>
        <div className="tile">
          <div className="num">{open.length}</div>
          <div className="lbl">offene Lernkarten</div>
        </div>
        <div className="tile">
          <div className="num">{weakAreas.reduce((s, a) => s + a.weak, 0)}</div>
          <div className="lbl">schwache Punkte</div>
        </div>
        <div className="tile">
          <div className="num">{overall}%</div>
          <div className="lbl">Gesamtfortschritt</div>
        </div>
      </div>

      <div className="row">
        <button className="btn primary" onClick={() => go('flashcards')}>Wiederholung starten</button>
        <button className="btn" onClick={() => go('exam')}>Prüfungsmodus</button>
        <button className="btn" onClick={() => go('weaknesses')}>Meine Baustellen</button>
      </div>

      <div className="card">
        <h2>Fortschritt nach Bereichen</h2>
        <div className="stack">
          {areas.map((a) => (
            <div key={a.id}>
              <div className="spread small">
                <span>{a.name}</span>
                <span className="faint">{a.percent}%</span>
              </div>
              <ProgressBar value={a.percent} green={a.percent >= 67} />
            </div>
          ))}
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Schwache Themen</h3>
          {weakAreas.length === 0 ? (
            <p className="muted small">Noch keine schwachen Punkte markiert. Starte im Prüfungsmodus oder mit den Lernkarten.</p>
          ) : (
            <ul className="clean small">
              {weakAreas.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <button className="btn ghost tiny" style={{ padding: '.1rem .3rem' }} onClick={() => go('weaknesses')}>
                    {a.name} <span className="faint">({a.weak})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Zuletzt geübte Quellen</h3>
          {recentSources.length === 0 ? (
            <p className="muted small">Noch keine Quelle geübt. Zum Quellen-Trainer wechseln.</p>
          ) : (
            <ul className="clean small">
              {recentSources.map((s) => (
                <li key={s.id}>{s.shortName} <span className="faint">– {s.type}</span></li>
              ))}
            </ul>
          )}
          <button className="btn small" style={{ marginTop: '.5rem' }} onClick={() => go('sources')}>Quellen-Trainer</button>
        </div>
      </div>

      {store.lastActivity && (
        <p className="tiny faint center">
          Zuletzt: {store.lastActivity.label}
        </p>
      )}
    </div>
  )
}

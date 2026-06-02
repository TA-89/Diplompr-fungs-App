import meta from '../data/meta.json'
import questions from '../data/examQuestions.json'
import flashcards from '../data/flashcards.json'
import quiz from '../data/quizQuestions.json'
import authorQuiz from '../data/authorQuiz.json'
import reflection from '../data/reflection.json'
import sources from '../data/sourceMap.json'
import { useStore } from '../lib/storage.js'
import { dueToday, untouchedIds, progressPercent, weakIds } from '../lib/srs.js'
import { ProgressBar, ProgressRing, areaMeta } from '../components/ui.jsx'

function areaIds(areaId) {
  const q = questions.filter((x) => x.area === areaId).map((x) => x.id)
  const f = flashcards.filter((x) => x.area === areaId).map((x) => x.id)
  const z = quiz.filter((x) => x.area === areaId).map((x) => x.id)
  const aq = areaId === 'quellen' ? authorQuiz.map((x) => x.id) : []
  const rf = areaId === 'grenzen' ? reflection.map((x) => x.id) : []
  return [...q, ...f, ...z, ...aq, ...rf]
}

// Sinnvolles Ziel je Bereich
const AREA_TARGET = {
  forschungsfrage: 'exam', vorgehen: 'exam', theorie: 'exam', ki: 'exam',
  synthese: 'theses', kriterien: 'theses', leitfaden: 'presentation',
  quellen: 'sources', grenzen: 'reflection',
}

export default function Dashboard({ go }) {
  const store = useStore()
  const { ratings } = store

  const due = dueToday(flashcards, store)
  const open = untouchedIds(flashcards.map((c) => c.id), ratings)
  const cardIds = flashcards.map((c) => c.id)

  const areas = meta.areas.map((a) => {
    const ids = areaIds(a.id)
    return { ...a, ids, percent: progressPercent(ids, ratings), weak: weakIds(ids, ratings).length, ...areaMeta(a.id) }
  })

  const weakCount = areas.reduce((s, a) => s + a.weak, 0)
  const overall = progressPercent(
    [...questions.map((q) => q.id), ...cardIds, ...quiz.map((q) => q.id), ...authorQuiz.map((q) => q.id), ...reflection.map((r) => r.id)],
    ratings
  )

  const recentSources = Object.entries(ratings)
    .filter(([, r]) => r.type === 'source')
    .sort((a, b) => b[1].last - a[1].last)
    .slice(0, 4)
    .map(([id]) => sources.find((s) => s.id === id))
    .filter(Boolean)

  return (
    <div className="stack">
      {/* Hero */}
      <div className="hero">
        <div className="spread" style={{ alignItems: 'center' }}>
          <div style={{ maxWidth: '60%' }}>
            <h1 style={{ marginBottom: '.3rem' }}>Bereit für die Prüfung?</h1>
            <p className="small" style={{ margin: 0 }}>{meta.coreMessage}</p>
          </div>
          <ProgressRing value={overall} />
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><b>{due.length}</b><span>heute fällig</span></div>
          <div className="hero-stat"><b>{open.length}</b><span>offene Karten</span></div>
          <div className="hero-stat"><b>{weakCount}</b><span>schwache Punkte</span></div>
        </div>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <button className="btn primary" onClick={() => go('quiz')}>🎲 Quiz starten</button>
          <button className="btn" onClick={() => go('exam')}>🎓 Prüfungsmodus</button>
          <button className="btn" onClick={() => go('weaknesses')}>🛠️ Meine Baustellen</button>
        </div>
      </div>

      {/* Lernbereiche */}
      <div className="spread">
        <h2>Lernbereiche</h2>
        <span className="tiny faint">Tippen zum Üben</span>
      </div>
      <div className="area-grid">
        {areas.map((a) => (
          <button
            key={a.id}
            className="area-card"
            style={{ '--ac': a.color, '--ac-soft': a.soft }}
            onClick={() => go(AREA_TARGET[a.id] || 'quiz')}
          >
            <div className="ac-head">
              <span className="ac-ic" style={{ background: a.soft }} aria-hidden="true">{a.icon}</span>
              <span className="ac-name">{a.name}</span>
            </div>
            <ProgressBar value={a.percent} />
            <div className="ac-foot">
              <span>{a.percent}% sicher</span>
              {a.weak > 0 ? <span style={{ color: 'var(--red)' }}>{a.weak} schwach</span> : <span>👍</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Zuletzt geübte Quellen */}
      {recentSources.length > 0 && (
        <div className="card">
          <div className="spread">
            <h3 style={{ margin: 0 }}>Zuletzt geübte Quellen</h3>
            <button className="btn ghost small" onClick={() => go('sources')}>alle →</button>
          </div>
          <ul className="clean small" style={{ marginTop: '.5rem' }}>
            {recentSources.map((s) => (
              <li key={s.id}>{s.shortName} <span className="faint">– {s.type}</span></li>
            ))}
          </ul>
        </div>
      )}

      {store.lastActivity && (
        <p className="tiny faint center">Zuletzt: {store.lastActivity.label}</p>
      )}
    </div>
  )
}

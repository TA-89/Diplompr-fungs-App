import meta from '../data/meta.json'
import questions from '../data/examQuestions.json'
import flashcards from '../data/flashcards.json'
import quiz from '../data/quizQuestions.json'
import authorQuiz from '../data/authorQuiz.json'
import reflection from '../data/reflection.json'
import gutachten from '../data/gutachten.json'
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
  const gt = areaId === 'gutachten' ? gutachten.critiques.map((x) => x.id) : []
  return [...q, ...f, ...z, ...aq, ...rf, ...gt]
}

// Sinnvolles Ziel je Bereich
const AREA_TARGET = {
  forschungsfrage: 'exam', vorgehen: 'exam', theorie: 'exam', ki: 'exam',
  synthese: 'theses', kriterien: 'theses', leitfaden: 'presentation',
  quellen: 'sources', grenzen: 'reflection', gutachten: 'gutachten',
}

function daysUntilExam() {
  if (!meta.exam.dateISO) return null
  const exam = new Date(meta.exam.dateISO + 'T08:00:00')
  const diff = Math.ceil((exam.getTime() - Date.now()) / 86400000)
  return diff
}

export default function Dashboard({ go }) {
  const store = useStore()
  const { ratings } = store
  const daysLeft = daysUntilExam()

  const due = dueToday(flashcards, store)
  const open = untouchedIds(flashcards.map((c) => c.id), ratings)
  const cardIds = flashcards.map((c) => c.id)

  const areas = meta.areas.map((a) => {
    const ids = areaIds(a.id)
    return { ...a, ids, percent: progressPercent(ids, ratings), weak: weakIds(ids, ratings).length, ...areaMeta(a.id) }
  })

  const weakCount = areas.reduce((s, a) => s + a.weak, 0)
  const overall = progressPercent(
    [...questions.map((q) => q.id), ...cardIds, ...quiz.map((q) => q.id), ...authorQuiz.map((q) => q.id), ...reflection.map((r) => r.id), ...gutachten.critiques.map((c) => c.id)],
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
          {daysLeft !== null && daysLeft >= 0 && (
            <div className="hero-stat accent">
              <b>{daysLeft === 0 ? 'Heute!' : daysLeft}</b>
              <span>{daysLeft === 0 ? 'ist Prüfung 🍀' : daysLeft === 1 ? 'Tag bis zur Prüfung' : 'Tage bis zur Prüfung'}</span>
            </div>
          )}
          <div className="hero-stat"><b>{due.length}</b><span>heute fällig</span></div>
          <div className="hero-stat"><b>{open.length}</b><span>offene Karten</span></div>
          <div className="hero-stat"><b>{weakCount}</b><span>schwache Punkte</span></div>
        </div>
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <button className="btn primary" onClick={() => go('quiz')}>🎲 Quiz starten</button>
          <button className="btn" onClick={() => go('exam')}>🎓 Prüfungsmodus</button>
          <button className="btn" onClick={() => go('gutachten')}>📋 Gutachten-Punkte</button>
          <button className="btn" onClick={() => go('weaknesses')}>🛠️ Meine Baustellen</button>
        </div>
      </div>

      {/* Gutachten-Ergebnis */}
      <button className="card rubric-card" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => go('gutachten')}>
        <div className="spread">
          <h3 style={{ margin: 0 }}>📋 Gutachten: Note {gutachten.result.note}</h3>
          <span className="tiny faint">{gutachten.result.points}/{gutachten.result.maxPoints} Punkte · bestanden</span>
        </div>
        <p className="small" style={{ margin: '.5rem 0 0' }}>
          Schriftliche Arbeit bewertet. Jetzt zählt die mündliche Reflexion: {gutachten.critiques.length} Kritikpunkte mit souveränen Antworten üben (Kriterium 9). →
        </p>
      </button>

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

      {/* Bewertungsraster der Prüfung */}
      {meta.exam.rubric && (
        <div className="card rubric-card">
          <div className="spread">
            <h3 style={{ margin: 0 }}>🎯 So holst du die 6</h3>
            <span className="tiny faint">{meta.exam.date}</span>
          </div>
          <p className="small" style={{ margin: '.5rem 0 0' }}>{meta.exam.rubric.goalNote6}</p>
          <details className="rubric-details">
            <summary>Bewertungsraster ansehen (9 Bereiche, {meta.exam.rubric.maxPoints} Punkte)</summary>
            <div className="rubric-list">
              {meta.exam.rubric.areas.map((a) => (
                <div className="rubric-row" key={a.nr}>
                  <span className="rubric-nr">{a.nr}</span>
                  <div className="rubric-body">
                    <b>{a.name}</b> <span className="tiny faint">({a.points} P.)</span>
                    <div className="tiny faint">{a.focus}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rubric-scale">
              {meta.exam.rubric.noteScale.map((s) => (
                <span key={s.note} className={`scale-chip${s.note === '6' ? ' best' : ''}`}>
                  Note {s.note}: {s.points}
                </span>
              ))}
            </div>
            <p className="tiny" style={{ marginTop: '.6rem' }}>
              <b>Antwortformel:</b> {meta.exam.rubric.answerFormula}
            </p>
          </details>
        </div>
      )}

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

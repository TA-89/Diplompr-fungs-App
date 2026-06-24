import questions from '../data/examQuestions.json'
import flashcards from '../data/flashcards.json'
import quiz from '../data/quizQuestions.json'
import authorQuiz from '../data/authorQuiz.json'
import reflection from '../data/reflection.json'
import gutachten from '../data/gutachten.json'
import sources from '../data/sourceMap.json'
import theses from '../data/theses.json'
import criteria from '../data/criteria.json'
import meta from '../data/meta.json'
import { useStore, resetAll } from '../lib/storage.js'
import { PageTitle, areaName } from '../components/ui.jsx'
import { progressPercent } from '../lib/srs.js'

// id -> {label, page}
function buildIndex() {
  const idx = {}
  questions.forEach((q) => (idx[q.id] = { label: q.question, page: 'exam', kind: 'Frage', area: q.area }))
  flashcards.forEach((c) => (idx[c.id] = { label: c.front, page: 'flashcards', kind: 'Lernkarte', area: c.area }))
  quiz.forEach((q) => (idx[q.id] = { label: q.question, page: 'quiz', kind: 'Quizfrage', area: q.area }))
  authorQuiz.forEach((q) => (idx[q.id] = { label: q.question, page: 'quiz', kind: 'Quizfrage', area: 'quellen' }))
  reflection.forEach((r) => (idx[r.id] = { label: r.question, page: 'reflection', kind: 'Verteidigungsfrage', area: 'grenzen' }))
  gutachten.critiques.forEach((c) => (idx[c.id] = { label: c.title, page: 'gutachten', kind: 'Gutachten-Punkt', area: 'gutachten' }))
  sources.forEach((s) => (idx[s.id] = { label: s.shortName, page: 'sources', kind: 'Quelle', area: 'quellen' }))
  theses.forEach((t) => (idx[t.id] = { label: t.title, page: 'theses', kind: 'These', area: 'synthese' }))
  criteria.items.forEach((c) => (idx[c.id] = { label: c.name, page: 'theses', kind: 'Kriterium', area: 'kriterien' }))
  return idx
}
const INDEX = buildIndex()

export default function Weaknesses({ go }) {
  const store = useStore()
  const { ratings } = store

  const weak = Object.entries(ratings)
    .filter(([id, r]) => r.score <= 1 && INDEX[id])
    .map(([id, r]) => ({ id, ...INDEX[id], score: r.score, last: r.last }))
    .sort((a, b) => a.score - b.score || b.last - a.last)

  const byKind = (k) => weak.filter((w) => w.kind === k)

  // Empfehlung: schwächster Bereich nach Gesamtfortschritt
  const areaProgress = meta.areas.map((a) => {
    const ids = [
      ...questions.filter((q) => q.area === a.id).map((q) => q.id),
      ...flashcards.filter((c) => c.area === a.id).map((c) => c.id),
    ]
    return { ...a, percent: progressPercent(ids, ratings), touched: ids.some((id) => ratings[id]) }
  })
  const recommend = areaProgress
    .filter((a) => a.touched)
    .sort((x, y) => x.percent - y.percent)[0]

  const groups = [
    { kind: 'Frage', page: 'exam', title: 'Unsichere Prüfungsfragen' },
    { kind: 'Quizfrage', page: 'quiz', title: 'Falsch beantwortete Quizfragen' },
    { kind: 'Verteidigungsfrage', page: 'reflection', title: 'Unsichere Verteidigungsfragen' },
    { kind: 'Gutachten-Punkt', page: 'gutachten', title: 'Unsichere Gutachten-Punkte' },
    { kind: 'These', page: 'theses', title: 'Unsichere Thesen' },
    { kind: 'Kriterium', page: 'theses', title: 'Unsichere Kriterien' },
    { kind: 'Quelle', page: 'sources', title: 'Unsichere Quellen' },
    { kind: 'Lernkarte', page: 'flashcards', title: 'Unsichere Lernkarten' },
  ]

  return (
    <div className="stack">
      <PageTitle
        title="Meine Baustellen"
        intro="Alles, was du zuletzt mit 0 (nicht gekonnt) oder 1 (teilweise) bewertet hast. Hier siehst du, was als Nächstes dran ist."
      />

      {weak.length === 0 ? (
        <div className="card">
          <p className="muted">Noch keine Baustellen markiert. Sobald du im Prüfungsmodus, bei den Lernkarten, Thesen, Kriterien oder Quellen mit 0 oder 1 bewertest, erscheinen sie hier.</p>
          <button className="btn primary" onClick={() => go('exam')}>Im Prüfungsmodus starten</button>
        </div>
      ) : (
        <>
          <div className="note blue">
            <b>Empfehlung für heute:</b>{' '}
            {recommend
              ? <>Der schwächste geübte Bereich ist <b>{recommend.name}</b> ({recommend.percent}%). Nimm dir zuerst die {byKind('Frage').filter(w => w.area === recommend.id).length || ''} offenen Punkte dort vor.</>
              : 'Wiederhole zuerst die unten gelisteten Punkte.'}
          </div>

          {groups.map((g) => {
            const items = byKind(g.kind)
            if (!items.length) return null
            return (
              <div className="card" key={g.kind}>
                <div className="spread">
                  <h3 style={{ margin: 0 }}>{g.title} <span className="faint">({items.length})</span></h3>
                  <button className="btn small" onClick={() => go(g.page)}>üben →</button>
                </div>
                <ul className="clean small" style={{ marginTop: '.5rem' }}>
                  {items.slice(0, 8).map((w) => (
                    <li key={w.id}>
                      <span className={'tag ' + (w.score === 0 ? 'red' : 'amber')}>{w.score}</span>{' '}
                      {w.label} <span className="faint tiny">· {areaName(w.area)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </>
      )}

      <div className="card">
        <h3>Fortschritt zurücksetzen</h3>
        <p className="small muted">Löscht alle lokal gespeicherten Bewertungen und beginnt von vorne. Kann nicht rückgängig gemacht werden.</p>
        <button
          className="btn"
          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
          onClick={() => { if (confirm('Wirklich allen Lernfortschritt löschen?')) resetAll() }}
        >
          Allen Fortschritt löschen
        </button>
      </div>
    </div>
  )
}

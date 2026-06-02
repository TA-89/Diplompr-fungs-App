import { useEffect, useState } from 'react'
import meta from './data/meta.json'

import Dashboard from './pages/Dashboard.jsx'
import ExamMode from './pages/ExamMode.jsx'
import PressureMode from './pages/PressureMode.jsx'
import Flashcards from './pages/Flashcards.jsx'
import Quiz from './pages/Quiz.jsx'
import SourceTrainer from './pages/SourceTrainer.jsx'
import ThesesCriteria from './pages/ThesesCriteria.jsx'
import PresentationTrainer from './pages/PresentationTrainer.jsx'
import Weaknesses from './pages/Weaknesses.jsx'
import ReflectionMode from './pages/ReflectionMode.jsx'

const ROUTES = [
  { id: 'dashboard', label: 'Dashboard', el: Dashboard },
  { id: 'exam', label: 'Prüfungsmodus', el: ExamMode },
  { id: 'pressure', label: 'Prüfungsdruck', el: PressureMode },
  { id: 'flashcards', label: 'Lernkarten', el: Flashcards },
  { id: 'quiz', label: 'Quiz', el: Quiz },
  { id: 'sources', label: 'Quellen-Trainer', el: SourceTrainer },
  { id: 'theses', label: 'Thesen & Kriterien', el: ThesesCriteria },
  { id: 'presentation', label: 'Präsentationstrainer', el: PresentationTrainer },
  { id: 'weaknesses', label: 'Meine Baustellen', el: Weaknesses },
  { id: 'reflection', label: 'Reflexion & Verteidigung', el: ReflectionMode },
]

function currentRoute() {
  const h = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.find((r) => r.id === h)?.id || 'dashboard'
}

export default function App() {
  const [route, setRoute] = useState(currentRoute())

  useEffect(() => {
    const onHash = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (id) => {
    window.location.hash = '/' + id
    window.scrollTo({ top: 0 })
  }

  const Current = ROUTES.find((r) => r.id === route)?.el || Dashboard

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand" onClick={() => go('dashboard')}>
            <b>{meta.title}</b>
            <span>{meta.subtitle}</span>
          </div>
          <div className="brand-spacer" />
          <span className="exam-chip">Mündliche Prüfung: {meta.exam.date}</span>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-inner">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              className={route === r.id ? 'active' : ''}
              onClick={() => go(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main">
        <Current go={go} />
      </main>

      <footer className="footer">
        Persönliche Lern- und Prüfungsvorbereitung · läuft vollständig lokal im Browser · kein Backend, keine Daten verlassen dein Gerät
      </footer>
    </div>
  )
}

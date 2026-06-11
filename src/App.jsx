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
import CheatSheet from './pages/CheatSheet.jsx'

const ROUTES = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', el: Dashboard },
  { id: 'quiz', label: 'Quiz', icon: '🎲', el: Quiz },
  { id: 'exam', label: 'Prüfungsmodus', icon: '🎓', el: ExamMode },
  { id: 'pressure', label: 'Prüfungsdruck', icon: '🔥', el: PressureMode },
  { id: 'flashcards', label: 'Lernkarten', icon: '🃏', el: Flashcards },
  { id: 'sources', label: 'Quellen-Trainer', icon: '📚', el: SourceTrainer },
  { id: 'cheatsheet', label: 'Spickzettel', icon: '📄', el: CheatSheet },
  { id: 'theses', label: 'Thesen & Kriterien', icon: '🧩', el: ThesesCriteria },
  { id: 'presentation', label: 'Präsentationstrainer', icon: '🖥️', el: PresentationTrainer },
  { id: 'weaknesses', label: 'Meine Baustellen', icon: '🛠️', el: Weaknesses },
  { id: 'reflection', label: 'Reflexion & Verteidigung', icon: '🛡️', el: ReflectionMode },
]

function currentRoute() {
  const h = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.find((r) => r.id === h)?.id || 'dashboard'
}

export default function App() {
  const [route, setRoute] = useState(currentRoute())
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onHash = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (id) => {
    window.location.hash = '/' + id
    window.scrollTo({ top: 0 })
    setMenuOpen(false)
  }

  const Current = ROUTES.find((r) => r.id === route)?.el || Dashboard
  const currentLabel = ROUTES.find((r) => r.id === route)?.label || 'Menü'

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand" onClick={() => go('dashboard')}>
            <span className="brand-logo" aria-hidden="true">🎓</span>
            <span className="brand-text">
              <b>{meta.title}</b>
              <span>{meta.subtitle}</span>
            </span>
          </div>
          <div className="brand-spacer" />
          <span className="exam-chip">Mündliche Prüfung: {meta.exam.date}</span>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-inner">
          <button
            className="nav-toggle"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="burger" aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
            <span>{currentLabel}</span>
          </button>
          <div className={'nav-list' + (menuOpen ? ' open' : '')}>
            {ROUTES.map((r) => (
              <button
                key={r.id}
                className={route === r.id ? 'active' : ''}
                onClick={() => go(r.id)}
              >
                <span className="nic" aria-hidden="true">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
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

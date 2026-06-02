// Vereinheitlicht alle Fragen aus den verschiedenen Datenquellen zu einer
// gemeinsamen Liste. So kann der Quiz-Hub sie mischen und filtern.
//
// kind:  'single' | 'multiple' (Auswahlfragen)  oder  'open' (mündlich)
// category: 'pruefer' | 'quellen' | 'inhalt'

import examQuestions from '../data/examQuestions.json'
import reflection from '../data/reflection.json'
import quizQuestions from '../data/quizQuestions.json'
import authorQuiz from '../data/authorQuiz.json'

export const CATEGORIES = [
  {
    id: 'pruefer',
    name: 'Fragen der Prüfer',
    short: 'Prüfer-Fragen',
    desc: 'Mündliche Fragen, wie sie Expertin und Co-Experte stellen – inkl. kritischer Nachfragen.',
    icon: '🎓',
  },
  {
    id: 'quellen',
    name: 'Quellen & Autoren',
    short: 'Quellen & Autoren',
    desc: 'Wer hat was geschrieben – und was bedeutet die Quelle für deine Arbeit.',
    icon: '📚',
  },
  {
    id: 'inhalt',
    name: 'Inhalt der Diplomarbeit',
    short: 'Inhalt der DA',
    desc: 'Forschungsfrage, Thesen, Kriterien und die zentralen Modelle.',
    icon: '🧭',
  },
]

function fromExam(q) {
  return {
    id: q.id,
    category: 'pruefer',
    kind: 'open',
    badge: q.questionType,
    difficulty: q.difficulty,
    area: q.area,
    question: q.question,
    open: {
      core: q.expectedCoreAnswer,
      must: q.mustMention,
      excellent: q.excellentAnswer,
      mistakes: q.commonMistakes,
      followups: q.followUpQuestions,
    },
    relatedChapters: q.relatedChapters,
    relatedSources: q.relatedSources,
  }
}

function fromReflection(r) {
  return {
    id: r.id,
    category: 'pruefer',
    kind: 'open',
    badge: 'Verteidigen',
    difficulty: 'anspruchsvoll',
    area: 'grenzen',
    question: r.question,
    open: {
      core: r.coreAnswer,
      excellent: r.goodSpokenAnswer,
      followups: [r.criticalFollowUp],
      tip: r.howToStaySovereign,
    },
    relatedChapters: [],
    relatedSources: [],
  }
}

function fromChoice(q, category) {
  return {
    id: q.id,
    category,
    kind: q.type, // single | multiple
    badge: q.type === 'multiple' ? 'Multiple Choice' : 'Single Choice',
    area: q.area || category,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    relatedChapters: q.relatedChapters,
    relatedSources: q.relatedSources,
  }
}

export const ALL_ITEMS = [
  ...examQuestions.map(fromExam),
  ...reflection.map(fromReflection),
  ...quizQuestions.map((q) => fromChoice(q, 'inhalt')),
  ...authorQuiz.map((q) => fromChoice(q, 'quellen')),
]

export function countsByCategory() {
  const c = {}
  CATEGORIES.forEach((cat) => (c[cat.id] = ALL_ITEMS.filter((i) => i.category === cat.id).length))
  return c
}

// Fisher-Yates-Mischen (Math.random ist im Browser erlaubt)
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Reihenfolge: schwache/ungeübte zuerst (nach gespeicherter Bewertung)
export function weakFirst(items, ratings) {
  const score = (id) => {
    const r = ratings[id]
    if (!r) return -1 // ungeübt zuerst
    return r.score // 0..3
  }
  return [...items].sort((x, y) => score(x.id) - score(y.id))
}

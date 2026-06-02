import { useState } from 'react'
import reflection from '../data/reflection.json'
import { rate, getRating, setLastActivity } from '../lib/storage.js'
import { PageTitle, RatingBar, Reveal, Block } from '../components/ui.jsx'

export default function ReflectionMode() {
  return (
    <div className="stack">
      <PageTitle
        title="Reflexion & Verteidigung"
        intro="Die kritischen Fragen, die deine Arbeit auf die Probe stellen. Ziel ist nicht, defensiv zu werden, sondern souverän einzuordnen. Antworte laut, dann aufdecken."
      />
      {reflection.map((r) => <ReflCard key={r.id} r={r} />)}
    </div>
  )
}

function ReflCard({ r }) {
  const rating = getRating(r.id)
  const [score, setScore] = useState(rating?.score ?? null)
  const onRate = (v) => { setScore(v); rate(r.id, v, { type: 'reflection', area: 'grenzen' }); setLastActivity('reflection', 'Verteidigungsfrage geübt') }
  return (
    <div className="card stack">
      <div className="row"><span className="tag red">kritische Frage</span></div>
      <h3 style={{ margin: '.2rem 0' }}>{r.question}</h3>
      <p className="reveal-hint small">Erst laut und ruhig beantworten. Dann aufdecken.</p>
      <Reveal label="Kernantwort & souveräne Reaktion einblenden">
        <Block title="Kernantwort"><p style={{ fontWeight: 600 }}>{r.coreAnswer}</p></Block>
        <Block title="Gute mündliche Antwort"><p>{r.goodSpokenAnswer}</p></Block>
        <Block title="Kritische Anschlussfrage"><p>{r.criticalFollowUp}</p></Block>
        <div className="note blue"><b>So bleibst du souverän:</b> {r.howToStaySovereign}</div>
      </Reveal>
      <hr className="divider" />
      <RatingBar current={score} onRate={onRate} />
    </div>
  )
}

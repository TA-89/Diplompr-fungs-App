import { useMemo, useState } from 'react'
import meta from '../data/meta.json'
import quiz from '../data/quizQuestions.json'
import sources from '../data/sourceMap.json'
import { rate, setLastActivity } from '../lib/storage.js'
import { PageTitle, Block, SourceRefs, ChapterRefs, areaName } from '../components/ui.jsx'

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

export default function Quiz() {
  const [area, setArea] = useState('alle')
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const list = useMemo(
    () => quiz.filter((q) => area === 'alle' || q.area === area),
    [area]
  )
  const q = list[idx]

  const onResult = (correct) => setScore((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }))

  const next = () => setIdx((i) => (i + 1) % list.length)
  const reset = (fn) => { fn(); setIdx(0); setScore({ right: 0, total: 0 }) }

  return (
    <div className="stack">
      <PageTitle
        title="Quiz"
        intro="Single-Choice (eine richtige Antwort) und Multiple-Choice (mehrere richtige) mit sofortiger Auswertung. Zum schnellen Selbsttest deines Wissens."
      />

      <div className="card tight spread">
        <label className="field">Bereich
          <select value={area} onChange={(e) => reset(() => setArea(e.target.value))}>
            <option value="alle">alle</option>
            {meta.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <span className="tag blue">Richtig: {score.right} / {score.total}</span>
      </div>

      {!q ? (
        <div className="card"><p className="muted">Keine Quizfragen in diesem Bereich.</p></div>
      ) : (
        <QuizCard q={q} idx={idx} total={list.length} onResult={onResult} key={q.id} />
      )}

      <div className="spread">
        <span className="tiny faint">{list.length ? idx + 1 : 0} / {list.length}</span>
        <button className="btn primary" onClick={next} disabled={list.length < 2}>Nächste Frage →</button>
      </div>
    </div>
  )
}

function QuizCard({ q, idx, total, onResult }) {
  const isMulti = q.type === 'multiple'
  const [sel, setSel] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const toggle = (key) => {
    if (submitted) return
    if (isMulti) {
      setSel((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]))
    } else {
      setSel([key])
    }
  }

  const correct = submitted && arraysEqual(sel, q.correct)

  const submit = () => {
    if (!sel.length || submitted) return
    const ok = arraysEqual(sel, q.correct)
    setSubmitted(true)
    onResult(ok)
    rate(q.id, ok ? 3 : 0, { type: 'quiz', area: q.area })
    setLastActivity('quiz', `Quizfrage beantwortet (${areaName(q.area)})`)
  }

  return (
    <div className="card stack">
      <div className="row">
        <span className="tag blue">{areaName(q.area)}</span>
        <span className="tag">{isMulti ? 'Multiple Choice' : 'Single Choice'}</span>
      </div>
      <h3 style={{ margin: '.2rem 0' }}>{q.question}</h3>

      <div className="stack">
        {q.options.map((opt) => {
          const chosen = sel.includes(opt.key)
          const isRight = q.correct.includes(opt.key)
          let style = { textAlign: 'left', display: 'flex', gap: '.55rem', alignItems: 'flex-start' }
          let cls = 'btn'
          if (submitted) {
            if (isRight) { cls = 'btn primary' }
            else if (chosen && !isRight) { style = { ...style, borderColor: 'var(--red)', color: 'var(--red)' } }
          } else if (chosen) {
            cls = 'btn primary'
          }
          return (
            <button key={opt.key} className={cls} style={style} onClick={() => toggle(opt.key)} disabled={submitted}>
              <span aria-hidden="true">{isMulti ? (chosen ? '☑' : '☐') : (chosen ? '◉' : '○')}</span>
              <span>{opt.text}{submitted && isRight ? '  ✓' : ''}{submitted && chosen && !isRight ? '  ✗' : ''}</span>
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <div className="row">
          <button className="btn primary" onClick={submit} disabled={!sel.length}>Antwort prüfen</button>
          {isMulti && <span className="tiny faint" style={{ alignSelf: 'center' }}>Mehrfachauswahl möglich</span>}
        </div>
      ) : (
        <>
          <div className={'note' + (correct ? ' blue' : '')}>
            <b>{correct ? 'Richtig.' : 'Leider falsch.'}</b> {q.explanation}
          </div>
          <div className="row">
            <ChapterRefs ids={q.relatedChapters} />
            <SourceRefs ids={q.relatedSources} sources={sources} />
          </div>
        </>
      )}
    </div>
  )
}

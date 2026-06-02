import { useState } from 'react'
import sources from '../data/sourceMap.json'
import { ALL_ITEMS, CATEGORIES, countsByCategory, shuffle, weakFirst } from '../lib/questionBank.js'
import { useStore, rate, getRating, setLastActivity } from '../lib/storage.js'
import { PageTitle, Block, SourceRefs, ChapterRefs, areaName, RatingBar } from '../components/ui.jsx'

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

export default function Quiz() {
  const store = useStore()
  const [session, setSession] = useState(null) // { title, items }

  const start = (title, items) => {
    if (!items.length) return
    setSession({ title, items })
    setLastActivity('quiz', 'Quiz gestartet: ' + title)
    window.scrollTo({ top: 0 })
  }

  if (session) {
    return <Session title={session.title} items={session.items} onExit={() => setSession(null)} />
  }
  return <Hub store={store} start={start} />
}

/* --------------------------------- Hub --------------------------------- */
function Hub({ store, start }) {
  const counts = countsByCategory()
  const total = ALL_ITEMS.length
  const mastered = ALL_ITEMS.filter((i) => (store.ratings[i.id]?.score ?? -1) >= 2).length
  const pct = Math.round((mastered / total) * 100)

  const mixed = (weak) => {
    const base = weak ? weakFirst(ALL_ITEMS, store.ratings) : shuffle(ALL_ITEMS)
    start(weak ? 'Schwierige zuerst' : 'Gemischtes Quiz', base)
  }
  const byCat = (cat) => start(cat.name, shuffle(ALL_ITEMS.filter((i) => i.category === cat.id)))
  const byKind = (label, fn) => start(label, shuffle(ALL_ITEMS.filter(fn)))

  return (
    <div className="stack">
      <PageTitle title="Quiz" intro="Dein Übungszentrum. Starte mit dem gemischten Quiz oder wähle einen Bereich." />

      <div className="hero">
        <div className="hero-top">
          <span className="hero-ic" aria-hidden="true">🎲</span>
          <div>
            <h2>Gemischtes Quiz</h2>
            <p className="muted small">Alle {total} Fragen wild gemischt: mündliche Fragen, Single- und Multiple-Choice. Dein Fortschritt wird gespeichert.</p>
          </div>
        </div>
        <div className="hero-bar">
          <div className="bar green"><i style={{ width: pct + '%' }} /></div>
          <span className="tiny faint">{mastered} von {total} sicher ({pct}%)</span>
        </div>
        <div className="btn-row">
          <button className="btn primary" onClick={() => mixed(false)}>▶ Quiz starten</button>
          <button className="btn" onClick={() => mixed(true)}>Schwierige zuerst</button>
        </div>
      </div>

      <h3 style={{ marginTop: '.4rem' }}>Bereiche</h3>
      <div className="quiz-tiles">
        {CATEGORIES.map((c) => (
          <button key={c.id} className="qtile" onClick={() => byCat(c)}>
            <span className="ic" aria-hidden="true">{c.icon}</span>
            <b>{c.name}</b>
            <span className="tiny faint">{c.desc}</span>
            <span className="tag blue" style={{ marginTop: '.4rem' }}>{counts[c.id]} Fragen</span>
          </button>
        ))}
      </div>

      <h3 style={{ marginTop: '.4rem' }}>Nach Fragetyp</h3>
      <div className="quiz-tiles">
        <button className="qtile" onClick={() => byKind('Nur mündliche Fragen', (i) => i.kind === 'open')}>
          <span className="ic" aria-hidden="true">🗣️</span>
          <b>Mündlich</b>
          <span className="tiny faint">Frei laut beantworten, Musterantwort aufdecken, selbst bewerten.</span>
        </button>
        <button className="qtile" onClick={() => byKind('Nur Single-Choice', (i) => i.kind === 'single')}>
          <span className="ic" aria-hidden="true">⭕</span>
          <b>Single-Choice</b>
          <span className="tiny faint">Genau eine richtige Antwort.</span>
        </button>
        <button className="qtile" onClick={() => byKind('Nur Multiple-Choice', (i) => i.kind === 'multiple')}>
          <span className="ic" aria-hidden="true">☑️</span>
          <b>Multiple-Choice</b>
          <span className="tiny faint">Mehrere richtige Antworten.</span>
        </button>
      </div>
    </div>
  )
}

/* ------------------------------- Session ------------------------------- */
function Session({ title, items: initialItems, onExit }) {
  const [queue, setQueue] = useState(initialItems)
  const [i, setI] = useState(0)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState({}) // index -> { id, kind, correct | score }

  const item = queue[i]
  const answered = results[i] !== undefined
  const record = (res) => setResults((r) => ({ ...r, [i]: res }))

  const next = () => {
    if (i + 1 >= queue.length) setDone(true)
    else {
      setI(i + 1)
      window.scrollTo({ top: 0 })
    }
  }
  const restart = (newItems) => {
    setQueue(newItems)
    setI(0)
    setResults({})
    setDone(false)
    window.scrollTo({ top: 0 })
  }

  if (done) {
    return (
      <Result
        title={title}
        items={queue}
        results={results}
        onExit={onExit}
        onRestart={() => restart(shuffle(queue))}
        onRetryWeak={(w) => restart(shuffle(w))}
      />
    )
  }

  const choiceVals = Object.values(results).filter((r) => r.kind !== 'open')
  const choiceRight = choiceVals.filter((r) => r.correct).length
  const pct = ((i + (answered ? 1 : 0)) / queue.length) * 100

  return (
    <div className="stack">
      <div className="quiz-head">
        <button className="btn ghost" onClick={onExit} aria-label="Beenden">✕</button>
        <div className="bar" style={{ flex: 1 }}><i style={{ width: pct + '%' }} /></div>
        <span className="tiny faint">{i + 1}/{queue.length}</span>
      </div>
      <div className="spread tiny faint" style={{ marginTop: '-0.4rem' }}>
        <span>{title}</span>
        {choiceVals.length > 0 ? <span>✓ {choiceRight}/{choiceVals.length} richtig</span> : null}
      </div>

      {item.kind === 'open' ? (
        <OpenBody key={item.id} item={item} onAnswered={(score) => record({ id: item.id, kind: 'open', score })} />
      ) : (
        <ChoiceBody key={item.id} item={item} onAnswered={(correct) => record({ id: item.id, kind: item.kind, correct })} />
      )}

      {answered ? (
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn primary" onClick={next}>{i + 1 >= queue.length ? 'Auswerten' : 'Weiter'}</button>
        </div>
      ) : null}
    </div>
  )
}

/* --------------------------- Auswahlfrage ------------------------------ */
function ChoiceBody({ item, onAnswered }) {
  const isMulti = item.kind === 'multiple'
  const [sel, setSel] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const toggle = (key) => {
    if (submitted) return
    if (isMulti) setSel((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]))
    else setSel([key])
  }
  const correct = arraysEqual(sel, item.correct)
  const submit = () => {
    if (!sel.length || submitted) return
    setSubmitted(true)
    const ok = arraysEqual(sel, item.correct)
    rate(item.id, ok ? 3 : 0, { type: 'quiz', area: item.area })
    onAnswered(ok)
  }

  return (
    <div className="card stack">
      <div className="row">
        <span className="tag blue">{areaName(item.area)}</span>
        <span className="tag">{item.badge}</span>
      </div>
      <h2 style={{ margin: '.2rem 0', fontSize: '1.12rem' }}>{item.question}</h2>

      <div className="stack">
        {item.options.map((opt) => {
          const chosen = sel.includes(opt.key)
          const isRight = item.correct.includes(opt.key)
          let cls = 'qopt'
          if (submitted && isRight) cls += ' correct'
          else if (submitted && chosen && !isRight) cls += ' wrong'
          else if (chosen) cls += ' chosen'
          const mark = isMulti ? (chosen ? '☑' : '☐') : (chosen ? '◉' : '○')
          const end = submitted && isRight ? '✓' : (submitted && chosen && !isRight ? '✗' : '')
          return (
            <button key={opt.key} className={cls} onClick={() => toggle(opt.key)} disabled={submitted}>
              <span className="mark" aria-hidden="true">{mark}</span>
              <span className="txt">{opt.text}</span>
              {end ? <span className="end">{end}</span> : null}
            </button>
          )
        })}
      </div>

      {submitted ? (
        <div className="stack">
          <div className={correct ? 'note blue' : 'note'}>
            <b>{correct ? 'Richtig.' : 'Leider falsch.'}</b> {item.explanation}
          </div>
          <div className="row">
            <ChapterRefs ids={item.relatedChapters} />
            <SourceRefs ids={item.relatedSources} sources={sources} />
          </div>
        </div>
      ) : (
        <div className="row">
          <button className="btn primary" onClick={submit} disabled={!sel.length}>Antwort prüfen</button>
          {isMulti ? <span className="tiny faint" style={{ alignSelf: 'center' }}>Mehrfachauswahl möglich</span> : null}
        </div>
      )}
    </div>
  )
}

/* --------------------------- Muendliche Frage -------------------------- */
function OpenBody({ item, onAnswered }) {
  const [shown, setShown] = useState(false)
  const [score, setScore] = useState(getRating(item.id)?.score ?? null)
  const o = item.open

  const handleRate = (s) => {
    setScore(s)
    rate(item.id, s, { type: 'quiz', area: item.area })
    onAnswered(s)
  }
  const list = (arr) => arr.map((m, k) => <li key={k}>{m}</li>)

  return (
    <div className="card stack">
      <div className="row">
        <span className="tag blue">{areaName(item.area)}</span>
        <span className="tag amber">mündlich</span>
        <span className="tag">{item.badge}</span>
      </div>
      <h2 style={{ margin: '.2rem 0', fontSize: '1.12rem' }}>{item.question}</h2>
      <p className="reveal-hint small">Beantworte die Frage zuerst laut und vollständig. Dann aufdecken und ehrlich bewerten.</p>

      {shown ? (
        <div className="stack">
          <Block title="Kernantwort"><p style={{ fontWeight: 600 }}>{o.core}</p></Block>
          {o.must ? <Block title="Das sollte vorkommen"><ul className="clean">{list(o.must)}</ul></Block> : null}
          {o.excellent ? <Block title="Sehr gute Antwort"><p>{o.excellent}</p></Block> : null}
          {o.mistakes ? <Block title="Typische Fehler"><ul className="clean">{list(o.mistakes)}</ul></Block> : null}
          {o.followups && o.followups.length ? <Block title="Mögliche Anschlussfragen"><ul className="clean">{list(o.followups)}</ul></Block> : null}
          {o.tip ? <div className="note blue"><b>So bleibst du souverän:</b> {o.tip}</div> : null}
          <div className="row">
            <ChapterRefs ids={item.relatedChapters} />
            <SourceRefs ids={item.relatedSources} sources={sources} />
          </div>
          <hr className="divider" />
          <RatingBar current={score} onRate={handleRate} />
        </div>
      ) : (
        <button className="btn primary" onClick={() => setShown(true)}>Musterantwort zeigen</button>
      )}
    </div>
  )
}

/* ------------------------------ Auswertung ----------------------------- */
function Result({ title, items, results, onExit, onRestart, onRetryWeak }) {
  const vals = Object.entries(results).map(([idx, r]) => ({ idx: Number(idx), ...r }))
  const choice = vals.filter((r) => r.kind !== 'open')
  const open = vals.filter((r) => r.kind === 'open')
  const right = choice.filter((r) => r.correct).length
  const openGood = open.filter((r) => r.score >= 2).length
  const answeredCount = vals.length

  const weakItems = items.filter((it, idx) => {
    const r = results[idx]
    if (!r) return false
    return r.kind === 'open' ? r.score <= 1 : !r.correct
  })

  return (
    <div className="stack">
      <div className="hero center">
        <span className="hero-ic" aria-hidden="true">🏁</span>
        <h2>Quiz beendet</h2>
        <p className="muted small">{title} · {answeredCount} von {items.length} beantwortet</p>
        <div className="tiles" style={{ marginTop: '.6rem' }}>
          {choice.length > 0 ? (
            <div className="tile"><div className="num">{right}/{choice.length}</div><div className="lbl">Choice richtig</div></div>
          ) : null}
          {open.length > 0 ? (
            <div className="tile"><div className="num">{openGood}/{open.length}</div><div className="lbl">mündlich gut/sicher</div></div>
          ) : null}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn primary" onClick={onRestart}>Nochmals</button>
        {weakItems.length > 0 ? (
          <button className="btn" onClick={() => onRetryWeak(weakItems)}>Schwierige wiederholen ({weakItems.length})</button>
        ) : null}
        <button className="btn ghost" onClick={onExit}>Zur Übersicht</button>
      </div>

      {weakItems.length > 0 ? (
        <div className="card">
          <h3>Diese solltest du nochmals anschauen</h3>
          <ul className="clean small">
            {weakItems.slice(0, 10).map((it) => (
              <li key={it.id}>{it.question} <span className="faint tiny">· {areaName(it.area)}</span></li>
            ))}
          </ul>
          <p className="tiny faint">Sie erscheinen auch unter „Meine Baustellen".</p>
        </div>
      ) : null}
    </div>
  )
}

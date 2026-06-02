import { useMemo, useState } from 'react'
import meta from '../data/meta.json'
import questions from '../data/examQuestions.json'
import sources from '../data/sourceMap.json'
import { useStore, rate, getRating, setLastActivity } from '../lib/storage.js'
import {
  PageTitle, DifficultyTag, RatingBar, Reveal, Block,
  SourceRefs, ChapterRefs, areaName,
} from '../components/ui.jsx'

const TYPES = [...new Set(questions.map((q) => q.questionType))]

export default function ExamMode() {
  const store = useStore()
  const [area, setArea] = useState('alle')
  const [type, setType] = useState('alle')
  const [diff, setDiff] = useState('alle')
  const [idx, setIdx] = useState(0)

  const list = useMemo(() => {
    return questions.filter(
      (q) =>
        (area === 'alle' || q.area === area) &&
        (type === 'alle' || q.questionType === type) &&
        (diff === 'alle' || q.difficulty === diff)
    )
  }, [area, type, diff])

  const q = list[idx]

  const next = () => setIdx((i) => (i + 1) % list.length)
  const prev = () => setIdx((i) => (i - 1 + list.length) % list.length)

  const onRate = (s) => {
    rate(q.id, s, { type: 'question', area: q.area })
    setLastActivity('exam', `Prüfungsfrage bewertet (${areaName(q.area)})`)
  }

  const resetIdx = (fn) => { fn(); setIdx(0) }

  return (
    <div className="stack">
      <PageTitle
        title="Prüfungsmodus"
        intro="Lies die Frage, beantworte sie laut und vollständig, und blende erst dann die Musterantwort ein. Bewerte dich danach ehrlich."
      />

      <div className="card tight">
        <div className="row">
          <label className="field">Bereich
            <select value={area} onChange={(e) => resetIdx(() => setArea(e.target.value))}>
              <option value="alle">alle</option>
              {meta.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="field">Fragetyp
            <select value={type} onChange={(e) => resetIdx(() => setType(e.target.value))}>
              <option value="alle">alle</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">Schwierigkeit
            <select value={diff} onChange={(e) => resetIdx(() => setDiff(e.target.value))}>
              <option value="alle">alle</option>
              <option value="einfach">einfach</option>
              <option value="mittel">mittel</option>
              <option value="anspruchsvoll">anspruchsvoll</option>
            </select>
          </label>
        </div>
      </div>

      {!q ? (
        <div className="card"><p className="muted">Keine Frage für diese Auswahl. Filter anpassen.</p></div>
      ) : (
        <ExamCard q={q} idx={idx} total={list.length} onRate={onRate} rating={getRating(q.id)} key={q.id} />
      )}

      <div className="spread">
        <button className="btn" onClick={prev} disabled={list.length < 2}>← Zurück</button>
        <span className="tiny faint">{list.length ? idx + 1 : 0} / {list.length}</span>
        <button className="btn primary" onClick={next} disabled={list.length < 2}>Nächste Frage →</button>
      </div>
    </div>
  )
}

function ExamCard({ q, idx, total, onRate, rating }) {
  const [local, setLocal] = useState(rating?.score ?? null)
  const handle = (s) => { setLocal(s); onRate(s) }
  return (
    <div className="card stack">
      <div className="row">
        <span className="tag blue">{areaName(q.area)}</span>
        <span className="tag">{q.questionType}</span>
        <DifficultyTag value={q.difficulty} />
        <span className="tag">{q.competence}</span>
      </div>

      <h2 style={{ marginTop: '.3rem' }}>{q.question}</h2>

      <p className="reveal-hint small">Zuerst selbst laut beantworten. Dann aufdecken.</p>

      <Reveal>
        <Block title="Erwartete Kernantwort">
          <p>{q.expectedCoreAnswer}</p>
        </Block>

        <Block title="Das sollte vorkommen">
          <ul className="clean">
            {q.mustMention.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </Block>

        <Block title="Mögliche sehr gute Antwort">
          <p>{q.excellentAnswer}</p>
        </Block>

        <Block title="Typische Fehler / Ausweichantworten">
          <ul className="clean">
            {q.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </Block>

        <Block title="Mögliche Anschlussfragen">
          <ul className="clean">
            {q.followUpQuestions.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </Block>

        <div className="row">
          <ChapterRefs ids={q.relatedChapters} />
          <SourceRefs ids={q.relatedSources} sources={sources} />
        </div>
      </Reveal>

      <hr className="divider" />
      <RatingBar current={local} onRate={handle} />
    </div>
  )
}

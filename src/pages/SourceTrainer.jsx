import { useMemo, useState } from 'react'
import sources from '../data/sourceMap.json'
import { useStore, rate, getRating, setLastActivity } from '../lib/storage.js'
import { PageTitle, RelevanceTag, RatingBar, Reveal, Block, Authors } from '../components/ui.jsx'
import { scoreLabel } from '../lib/srs.js'

const TYPES = [...new Set(sources.map((s) => s.type))]
// Grundlagenliteratur (traegt Argumentation) vs. Kontext
const GRUNDLAGE_TYPES = ['Grundlagenwerk', 'peer-reviewed Studie']

export default function SourceTrainer() {
  const [view, setView] = useState('cards')
  return (
    <div className="stack">
      <PageTitle
        title="Quellen-Trainer"
        intro="Kenne deine Quellen: ihre Hauptaussage, ihre Funktion in deiner Arbeit und ihre Grenzen. Übe in den Quellenkarten und prüfe dich in den Übungen."
      />
      <div className="row">
        <button className={'btn' + (view === 'cards' ? ' primary' : '')} onClick={() => setView('cards')}>Quellenkarten</button>
        <button className={'btn' + (view === 'quiz' ? ' primary' : '')} onClick={() => setView('quiz')}>Übungen</button>
      </div>
      {view === 'cards' ? <Cards /> : <Quiz />}
    </div>
  )
}

/* ---------------------------- Quellenkarten ---------------------------- */
function Cards() {
  const store = useStore()
  const [rel, setRel] = useState('alle')
  const [type, setType] = useState('alle')

  const list = useMemo(
    () =>
      sources.filter(
        (s) =>
          (rel === 'alle' || s.examRelevance === rel) &&
          (type === 'alle' || s.type === type)
      ),
    [rel, type]
  )

  return (
    <div className="stack">
      <div className="card tight row">
        <label className="field">Prüfungsrelevanz
          <select value={rel} onChange={(e) => setRel(e.target.value)}>
            <option value="alle">alle</option>
            <option value="hoch">hoch</option>
            <option value="mittel">mittel</option>
            <option value="gering">gering</option>
          </select>
        </label>
        <label className="field">Quellentyp
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="alle">alle</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <span className="tiny faint" style={{ alignSelf: 'flex-end' }}>{list.length} Quellen</span>
      </div>

      {list.map((s) => <SourceCard key={s.id} s={s} rating={getRating(s.id)} />)}
    </div>
  )
}

function SourceCard({ s, rating }) {
  const [score, setScore] = useState(rating?.score ?? null)
  const onRate = (v) => {
    setScore(v)
    rate(s.id, v, { type: 'source', area: 'quellen' })
    setLastActivity('sources', `Quelle geübt: ${s.shortName}`)
  }
  const connNames = s.connections
    .map((id) => sources.find((x) => x.id === id)?.shortName)
    .filter(Boolean)

  return (
    <div className="card stack">
      <div className="spread">
        <h3 style={{ margin: 0 }}>{s.shortName}</h3>
        <div className="row">
          <span className="tag">{s.type}</span>
          <RelevanceTag value={s.examRelevance} />
        </div>
      </div>
      <p className="tiny faint" style={{ margin: 0 }}>{s.fullReference}</p>

      <Block title="Wer dahintersteht">
        <Authors authors={s.authors} note={s.authorsNote} />
      </Block>

      <Block title="Hauptaussage"><p>{s.mainStatement}</p></Block>

      <Reveal label="Funktion in der Arbeit & Prüfungsantwort einblenden">
        <Block title="Funktion in meiner Arbeit">
          <ul className="clean">{s.usedFor.map((u, i) => <li key={i}>{u}</li>)}</ul>
        </Block>
        <Block title="Verwendet in Kapitel">
          <div className="row">{s.chapters.map((c) => <span key={c} className="tag">Kap. {c}</span>)}</div>
        </Block>
        <Block title="Mögliche Prüfungsfrage"><p style={{ fontWeight: 600 }}>{s.possibleExamQuestion}</p></Block>
        <Block title="Mögliche Antwort"><p>{s.coreAnswer}</p></Block>
        <Block title="Was die Quelle nicht leisten kann"><p>{s.limitations}</p></Block>
        {connNames.length > 0 && (
          <Block title="Verbindung zu anderen Quellen">
            <div className="row">{connNames.map((n) => <span key={n} className="tag blue">{n}</span>)}</div>
          </Block>
        )}
      </Reveal>

      <hr className="divider" />
      <RatingBar current={score} onRate={onRate} />
    </div>
  )
}

/* -------------------------------- Übungen ------------------------------- */
const PROMPTS = [
  'Welche Quelle passt zu dieser Aussage?',
  'Was leistet diese Quelle in deiner Arbeit?',
  'Welche Quelle würdest du in der Prüfung nennen?',
  'Ist diese Quelle Grundlagenliteratur oder nur Kontext?',
  'Welche Quelle wäre kritisch zu betrachten und warum?',
  'Welche Quellen stützen zusammen ein Kriterium?',
  'Welche Quelle ist für die zentrale Argumentation besonders wichtig?',
]

function pick(arr, n, exclude) {
  const pool = arr.filter((x) => x.id !== exclude)
  const out = []
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length)
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

function Quiz() {
  const [round, setRound] = useState(() => makeRound())
  const [mode, setMode] = useState('statement') // statement | classify
  const [answer, setAnswer] = useState(null)
  const [streak, setStreak] = useState(0)

  function newRound(m = mode) {
    setAnswer(null)
    setRound(m === 'classify' ? makeClassifyRound() : makeRound())
  }
  function switchMode(m) {
    setMode(m)
    setStreak(0)
    newRound(m)
  }

  const choose = (val) => {
    if (answer !== null) return
    setAnswer(val)
    const correct = val === round.correct
    setStreak((s) => (correct ? s + 1 : 0))
    setLastActivity('sources', 'Quellen-Übung gemacht')
  }

  return (
    <div className="stack">
      <div className="card tight row">
        <button className={'btn' + (mode === 'statement' ? ' primary' : '')} onClick={() => switchMode('statement')}>Aussage → Quelle</button>
        <button className={'btn' + (mode === 'classify' ? ' primary' : '')} onClick={() => switchMode('classify')}>Grundlage oder Kontext?</button>
        <span className="tiny faint" style={{ alignSelf: 'center' }}>Serie: {streak}</span>
      </div>

      <div className="card stack">
        <div className="tiny faint">{round.prompt}</div>
        <h3 style={{ marginTop: 0 }}>{round.question}</h3>

        <div className="stack">
          {round.options.map((opt) => {
            const isCorrect = opt.value === round.correct
            const chosen = answer === opt.value
            let cls = 'btn'
            if (answer !== null && isCorrect) cls += ' primary'
            if (answer !== null && chosen && !isCorrect) cls = 'btn'
            return (
              <button
                key={opt.value}
                className={cls}
                style={{
                  textAlign: 'left',
                  ...(answer !== null && chosen && !isCorrect ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}),
                }}
                onClick={() => choose(opt.value)}
                disabled={answer !== null}
              >
                {opt.label}{answer !== null && isCorrect ? '  ✓' : ''}{answer !== null && chosen && !isCorrect ? '  ✗' : ''}
              </button>
            )
          })}
        </div>

        {answer !== null && (
          <div className={'note' + (answer === round.correct ? ' blue' : '')}>
            {answer === round.correct ? 'Richtig. ' : 'Nicht ganz. '}{round.explain}
          </div>
        )}

        <div className="row">
          <button className="btn primary" onClick={() => newRound()}>Nächste Übung →</button>
        </div>
      </div>

      <div className="card">
        <h3>Weitere Übungsfragen zum laut Beantworten</h3>
        <p className="small muted">Diese Fragen beantwortest du frei und prüfst dich selbst. Sie kommen so oder ähnlich im Fachgespräch.</p>
        <ul className="clean small">{PROMPTS.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
    </div>
  )
}

function makeRound() {
  const target = sources[Math.floor(Math.random() * sources.length)]
  const distractors = pick(sources, 3, target.id)
  const options = [...distractors, target]
    .sort(() => Math.random() - 0.5)
    .map((s) => ({ value: s.id, label: s.shortName }))
  return {
    prompt: 'Welche Quelle passt zu dieser Hauptaussage?',
    question: `„${target.mainStatement}“`,
    options,
    correct: target.id,
    explain: `${target.shortName}: ${target.coreAnswer}`,
  }
}

function makeClassifyRound() {
  const target = sources[Math.floor(Math.random() * sources.length)]
  const isGrundlage = GRUNDLAGE_TYPES.includes(target.type)
  return {
    prompt: 'Trägt diese Quelle die Argumentation (Grundlage) oder liefert sie nur Kontext?',
    question: `${target.shortName} — ${target.type}`,
    options: [
      { value: 'grundlage', label: 'Grundlagenliteratur (trägt die Argumentation)' },
      { value: 'kontext', label: 'Kontext / kein Wirksamkeitsbeleg' },
    ],
    correct: isGrundlage ? 'grundlage' : 'kontext',
    explain: isGrundlage
      ? `${target.shortName} ist ${target.type} und trägt die didaktische Argumentation. ${target.limitations}`
      : `${target.shortName} (${target.type}) liefert Kontext, aber keinen Wirksamkeitsbeleg. ${target.limitations}`,
  }
}

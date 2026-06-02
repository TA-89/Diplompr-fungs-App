import { useMemo, useState } from 'react'
import meta from '../data/meta.json'
import flashcards from '../data/flashcards.json'
import sources from '../data/sourceMap.json'
import { useStore, rateCard, getBox, setLastActivity } from '../lib/storage.js'
import { leitnerOrder, boxDistribution, scoreLabel } from '../lib/srs.js'
import { PageTitle, Block, SourceRefs, ChapterRefs, areaName } from '../components/ui.jsx'

const BOX_LABEL = { 1: 'neu / unsicher', 2: 'teilweise sicher', 3: 'sicher', 4: 'prüfungssicher' }

export default function Flashcards() {
  const store = useStore()
  const [area, setArea] = useState('alle')
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const pool = useMemo(
    () => flashcards.filter((c) => area === 'alle' || c.area === area),
    [area]
  )
  const ordered = useMemo(() => leitnerOrder(pool, store.leitner), [pool, store.leitner])
  const dist = boxDistribution(flashcards, store.leitner)

  const card = ordered[pos % (ordered.length || 1)]

  const handleRate = (s) => {
    rateCard(card.id, s, card.area)
    setLastActivity('flashcards', `Lernkarte bewertet (${areaName(card.area)})`)
    setFlipped(false)
    setPos((p) => p + 1)
  }

  const reset = (fn) => { fn(); setPos(0); setFlipped(false) }

  return (
    <div className="stack">
      <PageTitle
        title="Lernkarten"
        intro="Karteikarten mit Leitner-System: Karten in tiefen Boxen erscheinen häufiger. Vorderseite lesen, Antwort überlegen, umdrehen, dann ehrlich bewerten."
      />

      <div className="card tight spread">
        <label className="field">Bereich
          <select value={area} onChange={(e) => reset(() => setArea(e.target.value))}>
            <option value="alle">alle</option>
            {meta.areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <div className="row tiny">
          {[1, 2, 3, 4].map((b) => (
            <span key={b} className="tag">Box {b}: {dist[b]}</span>
          ))}
        </div>
      </div>

      {!card ? (
        <div className="card"><p className="muted">Keine Karten in diesem Bereich.</p></div>
      ) : (
        <>
          <div className="flashcard" onClick={() => setFlipped((f) => !f)} style={{ cursor: 'pointer' }} key={card.id + String(flipped)}>
            {!flipped ? (
              <div>
                <div className="side-label">Vorderseite · Box {getBox(card.id)} ({BOX_LABEL[getBox(card.id)]})</div>
                <div className="front-text">{card.front}</div>
                <p className="reveal-hint small" style={{ marginTop: '1rem' }}>Zum Umdrehen tippen</p>
              </div>
            ) : (
              <div className="stack" style={{ textAlign: 'left' }}>
                <div className="side-label">Rückseite</div>
                <Block title="Kernantwort"><p style={{ fontWeight: 600 }}>{card.backShort}</p></Block>
                <Block title="Erklärung"><p>{card.backLong}</p></Block>
                {card.memorySentence && (
                  <div className="note blue"><b>Merksatz:</b> {card.memorySentence}</div>
                )}
                <div className="row">
                  <span className="tag blue">{areaName(card.area)}</span>
                  <ChapterRefs ids={card.relatedChapters} />
                  <SourceRefs ids={card.relatedSources} sources={sources} />
                </div>
              </div>
            )}
          </div>

          {flipped ? (
            <div className="card tight">
              <div className="tiny faint" style={{ marginBottom: '.3rem' }}>Wie sicher war diese Karte?</div>
              <div className="rating">
                {[0, 1, 2, 3].map((s) => (
                  <button key={s} className={`s${s}`} onClick={() => handleRate(s)}>
                    <b>{s}</b><br />{scoreLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="spread">
              <span className="tiny faint">{(pos % ordered.length) + 1} / {ordered.length}</span>
              <button className="btn" onClick={() => setFlipped(true)}>Umdrehen</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

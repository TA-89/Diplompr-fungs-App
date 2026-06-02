import { useState } from 'react'
import theses from '../data/theses.json'
import criteria from '../data/criteria.json'
import sources from '../data/sourceMap.json'
import { useStore, rate, getRating, setLastActivity } from '../lib/storage.js'
import { PageTitle, RatingBar, Reveal, Block, SourceRefs } from '../components/ui.jsx'

export default function ThesesCriteria() {
  const [view, setView] = useState('theses')
  return (
    <div className="stack">
      <PageTitle
        title="Thesen & Kriterien"
        intro="Das Herzstück deiner Synthese: fünf Thesen und daraus sechzehn Kriterien in fünf Bündeln. Jede Gruppe lässt sich einzeln trainieren."
      />
      <div className="row">
        <button className={'btn' + (view === 'theses' ? ' primary' : '')} onClick={() => setView('theses')}>5 Thesen</button>
        <button className={'btn' + (view === 'criteria' ? ' primary' : '')} onClick={() => setView('criteria')}>16 Kriterien</button>
      </div>
      {view === 'theses' ? <Theses /> : <Criteria />}
    </div>
  )
}

function Theses() {
  return (
    <div className="stack">
      {theses.map((t) => <ThesisCard key={t.id} t={t} />)}
    </div>
  )
}

function ThesisCard({ t }) {
  const rating = getRating(t.id)
  const [score, setScore] = useState(rating?.score ?? null)
  const onRate = (v) => { setScore(v); rate(t.id, v, { type: 'thesis', area: 'synthese' }); setLastActivity('theses', `These geübt: ${t.number}`) }
  return (
    <div className="card stack">
      <div className="row">
        <span className="tag blue">{t.number}</span>
        <span className="tag">Kap. {t.chapter}</span>
      </div>
      <h3 style={{ margin: '.2rem 0' }}>{t.title}</h3>
      <p>{t.explanation}</p>
      {t.note && <div className="note"><b>Selbstkontrolle:</b> {t.note}</div>}
      <Reveal label="Herleitung, Prüfungsfrage & gute Antwort">
        <Block title="Verbindung zur Forschungsfrage"><p>{t.connectionToResearchQuestion}</p></Block>
        <Block title="Mögliche Prüfungsfrage"><p style={{ fontWeight: 600 }}>{t.possibleExamQuestion}</p></Block>
        <Block title="Mögliche sehr gute Antwort"><p>{t.excellentAnswer}</p></Block>
        <Block title="Kritische Anschlussfrage"><p>{t.criticalFollowUp}</p></Block>
        <Block title="Typischer Fehler"><p>{t.commonMistake}</p></Block>
        <Block title="Literaturbasis"><SourceRefs ids={t.literatureBasis} sources={sources} /></Block>
      </Reveal>
      <hr className="divider" />
      <RatingBar current={score} onRate={onRate} />
    </div>
  )
}

function Criteria() {
  const [group, setGroup] = useState('alle')
  const items = criteria.items.filter((c) => group === 'alle' || c.group === group)
  const groupInfo = Object.fromEntries(criteria.groups.map((g) => [g.id, g]))
  return (
    <div className="stack">
      <div className="card tight row">
        <label className="field">Kriteriengruppe
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="alle">alle Gruppen</option>
            {criteria.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
        <span className="tiny faint" style={{ alignSelf: 'flex-end' }}>{items.length} Kriterien</span>
      </div>

      {group !== 'alle' && (
        <div className="note blue"><b>{groupInfo[group].name}</b> (Kap. {groupInfo[group].chapter}): {groupInfo[group].intro}</div>
      )}

      {items.map((c) => <CriterionCard key={c.id} c={c} groupName={groupInfo[c.group].name} />)}
    </div>
  )
}

function CriterionCard({ c, groupName }) {
  const rating = getRating(c.id)
  const [score, setScore] = useState(rating?.score ?? null)
  const onRate = (v) => { setScore(v); rate(c.id, v, { type: 'criterion', area: 'kriterien' }); setLastActivity('theses', `Kriterium geübt: ${c.name}`) }
  return (
    <div className="card stack">
      <div className="row">
        <span className="tag blue">{groupName}</span>
      </div>
      <h3 style={{ margin: '.2rem 0' }}>{c.name}</h3>
      <p>{c.meaning}</p>
      <Reveal label="Beispiel, Schwäche, Prüfungsfrage & Antwort">
        <Block title="Beispiel (Berufsbildung)"><p>{c.example}</p></Block>
        <Block title="Prüffrage (Leitfaden)"><p style={{ fontWeight: 600 }}>{c.checkQuestion}</p></Block>
        <Block title="Mögliche Schwäche / Grenze"><p>{c.possibleWeakness}</p></Block>
        <Block title="Mögliche Prüfungsfrage"><p style={{ fontWeight: 600 }}>{c.possibleExamQuestion}</p></Block>
        <Block title="Mögliche sehr gute Antwort"><p>{c.excellentAnswer}</p></Block>
        <Block title="Relevante Quelle(n)"><SourceRefs ids={c.literatureBasis} sources={sources} /></Block>
      </Reveal>
      <hr className="divider" />
      <RatingBar current={score} onRate={onRate} />
    </div>
  )
}

import sources from '../data/sourceMap.json'
import titles from '../data/sourceTitles.json'
import { PageTitle } from '../components/ui.jsx'

// Thematische Bündel passend zum Aufbau der Arbeit
const GROUPS = [
  { title: 'Didaktische Grundlagen', icon: '📐', ids: ['kerres-2018', 'sweller-2020', 'mayer-2021', 'chi-wylie-2014', 'deci-ryan-1993'] },
  { title: 'Berufsbildung', icon: '🛠️', ids: ['dehnbostel-2022', 'seufert-2023'] },
  { title: 'KI & Wirkung auf das Lernen', icon: '🤖', ids: ['bauer-2025', 'tasdelen-bodemer-2025'] },
  { title: 'Verantwortung', icon: '🛡️', ids: ['unesco-2023', 'nazaretsky-2025', 'xiong-li-2026'] },
  { title: 'Schweizer Kontext', icon: '🇨🇭', ids: ['latzer-festic-2024', 'caneva-2024', 'meier-2024'] },
  { title: 'Überblick, Beispiel & Formales', icon: '📎', ids: ['tan-2025', 'wang-2024', 'morita-2025', 'hilbe-2025'] },
]

const byId = Object.fromEntries(sources.map((s) => [s.id, s]))

// Kapitel-Hauptthemen der Arbeit → Verortung in Stichworten
const CHAP = { 1: 'Kontext', 2: 'Vorgehen', 3: 'Grundlagen', 4: 'Digital & KI', 5: 'Synthese/Thesen', 6: 'Kriterien', 7: 'Leitfaden', 8: 'Fazit' }

function shortCity(based) {
  if (!based) return ''
  return based.replace('Sitz: ', '').split(/[;,(]/)[0].trim()
}
function yearOf(s) {
  const m = (s.id || '').match(/\d{4}/)
  return m ? m[0] : ''
}
function authorFull(s) {
  const keys = (s.authors || []).filter((a) => a.key !== false)
  const yr = yearOf(s) ? ` (${yearOf(s)})` : ''
  if (!keys.length) return s.shortName
  const full = (a) => [a.first, a.last].filter(Boolean).join(' ')
  if (keys.length === 1) return full(keys[0]) + yr
  if (keys.length === 2) return full(keys[0]) + ' & ' + full(keys[1]) + yr
  return full(keys[0]) + ' et al.' + yr
}
function topics(s) {
  const majors = [...new Set((s.chapters || []).map((c) => parseInt(c, 10)))].sort((a, b) => a - b)
  const words = majors.map((m) => CHAP[m]).filter(Boolean).join(' · ')
  const kap = (s.chapters || []).length ? ` (Kap. ${s.chapters.join(', ')})` : ''
  return words + kap
}

function SourceCard({ s }) {
  const keys = (s.authors || []).filter((a) => a.key !== false)
  const city = shortCity(keys[0]?.based)
  return (
    <div className="cs-source">
      <div className="cs-title">{titles[s.id] || s.shortName}</div>
      <div className="cs-by">{authorFull(s)}{city ? ' · ' + city : ''} · {s.type}</div>
      <div className="cs-field"><span className="cs-lbl">Kernaussage:</span> {s.mainStatement}</div>
      <div className="cs-field"><span className="cs-lbl">Verortung:</span> <span className="cs-kap">{topics(s)}</span></div>
      <div className="cs-field"><span className="cs-lbl">Meine Aussage damit:</span> {s.coreAnswer}</div>
    </div>
  )
}

export default function CheatSheet() {
  return (
    <div className="stack">
      <div className="cs-toolbar no-print">
        <PageTitle
          title="Quellen-Spickzettel"
          intro="Pro Quelle: Titel, wer & wo – was zitiert wird, wo es in der Arbeit steht und was du damit aussagst. Gruppiert nach dem Aufbau der Arbeit."
        />
        <button className="btn primary" onClick={() => window.print()}>🖨️ Drucken / als PDF speichern</button>
      </div>

      <div className="cs-print-title only-print">
        <b>Quellen-Spickzettel</b> — Vom Schulbuch zur Lernumgebung · Tobias Arnold
      </div>

      <div className="cs-grid">
        {GROUPS.map((g) => (
          <div className="cs-group" key={g.title}>
            <h3 className="cs-group-title"><span aria-hidden="true">{g.icon}</span> {g.title}</h3>
            {g.ids.map((id) => (byId[id] ? <SourceCard key={id} s={byId[id]} /> : null))}
          </div>
        ))}
      </div>
    </div>
  )
}

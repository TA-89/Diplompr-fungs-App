// Erzeugt einen druckbaren A4-"Quellen-Spickzettel" (ca. 2 Seiten) aus
// src/data/sourceMap.json + sourceTitles.json:
//   Titel des Werks - Autor (Jahr) - Kernaussage - Verortung in der Arbeit - meine Aussage.
// Lauf:  node scripts/make-spickzettel-pdf.mjs   (oder: npm run pdf [dateiname.pdf])
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const sources = JSON.parse(readFileSync(join(root, 'src/data/sourceMap.json'), 'utf8'))
const titles = JSON.parse(readFileSync(join(root, 'src/data/sourceTitles.json'), 'utf8'))
const byId = Object.fromEntries(sources.map((s) => [s.id, s]))

const GROUPS = [
  { title: 'Didaktische Grundlagen', ids: ['kerres-2018', 'sweller-2020', 'mayer-2021', 'chi-wylie-2014', 'deci-ryan-1993'] },
  { title: 'Berufsbildung', ids: ['dehnbostel-2022', 'seufert-2023'] },
  { title: 'KI & Wirkung auf das Lernen', ids: ['bauer-2025', 'tasdelen-bodemer-2025'] },
  { title: 'Verantwortung', ids: ['unesco-2023', 'nazaretsky-2025', 'xiong-li-2026'] },
  { title: 'Schweizer Kontext', ids: ['latzer-festic-2024', 'caneva-2024', 'meier-2024'] },
  { title: 'Ueberblick, Beispiel & Formales', ids: ['tan-2025', 'wang-2024', 'morita-2025', 'hilbe-2025'] },
]

const CHAP = { 1: 'Kontext', 2: 'Vorgehen', 3: 'Grundlagen', 4: 'Digital & KI', 5: 'Synthese/Thesen', 6: 'Kriterien', 7: 'Leitfaden', 8: 'Fazit' }
const INK = rgb(0.11, 0.122, 0.2)
const SOFT = rgb(0.337, 0.357, 0.471)
const FAINT = rgb(0.569, 0.592, 0.706)
const PRIMARY = rgb(0.333, 0.275, 0.831)
const LINE = rgb(0.86, 0.87, 0.93)

function clean(str) {
  return String(str)
    .replace(/[–—]/g, '-').replace(/[„“”]/g, '"').replace(/[‘’]/g, "'").replace(/‑/g, '-')
    .split('').filter((c) => c.charCodeAt(0) <= 0xff).join('')
}
function shortCity(based) { return based ? based.replace('Sitz: ', '').split(/[;,(]/)[0].trim() : '' }
function yearOf(s) { const m = (s.id || '').match(/\d{4}/); return m ? m[0] : '' }
function authorFull(s) {
  const keys = (s.authors || []).filter((a) => a.key !== false)
  const yr = yearOf(s) ? ' (' + yearOf(s) + ')' : ''
  if (!keys.length) return s.shortName
  const full = (a) => [a.first, a.last].filter(Boolean).join(' ')
  if (keys.length === 1) return full(keys[0]) + yr
  if (keys.length === 2) return full(keys[0]) + ' & ' + full(keys[1]) + yr
  return full(keys[0]) + ' et al.' + yr
}
function topics(s) {
  const majors = [...new Set((s.chapters || []).map((c) => parseInt(c, 10)))].sort((a, b) => a - b)
  const words = majors.map((m) => CHAP[m]).filter(Boolean).join(' · ')
  const kap = (s.chapters || []).length ? ' (Kap. ' + s.chapters.join(', ') + ')' : ''
  return words + kap
}

const doc = await PDFDocument.create()
const font = await doc.embedFont(StandardFonts.Helvetica)
const fontB = await doc.embedFont(StandardFonts.HelveticaBold)

const A4 = [595.28, 841.89]
const M = 40
const GAP = 24
const colW = (A4[0] - 2 * M - GAP) / 2

let page, col, y, pageTop
function header() {
  page.drawText(clean('Quellen-Spickzettel'), { x: M, y: A4[1] - M - 15, size: 17, font: fontB, color: INK })
  page.drawText(clean('Vom Schulbuch zur Lernumgebung - Tobias Arnold - Diplompruefung Juni 2026'), { x: M, y: A4[1] - M - 30, size: 8.5, font, color: SOFT })
  page.drawLine({ start: { x: M, y: A4[1] - M - 39 }, end: { x: A4[0] - M, y: A4[1] - M - 39 }, thickness: 0.8, color: PRIMARY })
}
function startPage(first) {
  page = doc.addPage(A4); col = 0
  pageTop = first ? A4[1] - M - 52 : A4[1] - M - 6
  if (first) header()
  y = pageTop
}
const colX = () => M + col * (colW + GAP)
function feed(h) { if (y - h < M) { if (col === 0) { col = 1; y = pageTop } else { startPage(false) } } }

function wrapAt(text, f, size, maxW) {
  const words = clean(text).split(/\s+/)
  const lines = []; let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (f.widthOfTextAtSize(test, size) > maxW && line) { lines.push(line); line = w } else line = test
  }
  if (line) lines.push(line)
  return lines
}
function drawWrapped(text, f, size, color, lh) {
  for (const ln of wrapAt(text, f, size, colW)) { feed(lh); page.drawText(ln, { x: colX(), y: y - size, size, font: f, color }); y -= lh }
}
// Beschrifteter Absatz: fettes Label, dann Fliesstext (erste Zeile nach dem Label)
function labeled(label, text, size, valColor = SOFT, lh = size + 2.6) {
  const lbl = clean(label + ' ')
  const lblW = fontB.widthOfTextAtSize(lbl, size)
  const words = clean(text).split(/\s+/)
  const lines = []; let line = ''; let budget = colW - lblW
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (font.widthOfTextAtSize(test, size) > budget && line) { lines.push(line); line = w; budget = colW } else line = test
  }
  if (line) lines.push(line)
  feed(lh)
  page.drawText(lbl, { x: colX(), y: y - size, size, font: fontB, color: INK })
  page.drawText(lines[0] || '', { x: colX() + lblW, y: y - size, size, font, color: valColor })
  y -= lh
  for (let i = 1; i < lines.length; i++) { feed(lh); page.drawText(lines[i], { x: colX(), y: y - size, size, font, color: valColor }); y -= lh }
}

startPage(true)

for (const g of GROUPS) {
  feed(34)
  page.drawText(clean(g.title.toUpperCase()), { x: colX(), y: y - 8, size: 8.5, font: fontB, color: PRIMARY })
  y -= 11
  page.drawLine({ start: { x: colX(), y: y + 2 }, end: { x: colX() + colW, y: y + 2 }, thickness: 0.6, color: PRIMARY })
  y -= 6

  for (const id of g.ids) {
    const s = byId[id]
    if (!s) continue
    const keys = (s.authors || []).filter((a) => a.key !== false)
    const city = shortCity(keys[0]?.based)
    feed(40) // Block möglichst zusammenhalten
    // Titel des Werks
    drawWrapped(titles[id] || s.shortName, fontB, 9, INK, 11)
    // Autor (Jahr) · Ort · Typ
    drawWrapped(authorFull(s) + (city ? ' · ' + city : '') + ' · ' + s.type, font, 7.2, FAINT, 9.5)
    y -= 1
    labeled('Kernaussage:', s.mainStatement, 7.6)
    labeled('Verortung:', topics(s), 7.6, PRIMARY)
    labeled('Meine Aussage damit:', s.coreAnswer, 7.6)
    y -= 4
    page.drawLine({ start: { x: colX(), y: y + 2 }, end: { x: colX() + colW, y: y + 2 }, thickness: 0.3, color: LINE })
    y -= 6
  }
  y -= 4
}

const bytes = await doc.save()
const out = join(root, process.argv[2] || 'Quellen-Spickzettel.pdf')
try {
  writeFileSync(out, bytes)
  console.log('PDF erstellt:', out, '(' + doc.getPageCount() + ' Seite(n))')
} catch (e) {
  if (e.code === 'EBUSY' || e.code === 'EPERM') {
    console.error('Datei ist gerade geöffnet/gesperrt:', out)
    console.error('Bitte die PDF schließen und erneut ausführen – oder einen anderen Namen angeben: npm run pdf -- mein-name.pdf')
    process.exit(1)
  }
  throw e
}

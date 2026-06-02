// Reine Hilfsfunktionen fuer Auswahl, Wiederholung und Fortschritt.
// Sie bekommen den Store-Snapshot uebergeben und veraendern nichts.

// Mittlere Beherrschung (0..3) ueber eine Liste von ids. Unbewertet zaehlt als 0.
export function masteryFor(ids, ratings) {
  if (!ids.length) return { avg: 0, rated: 0, total: 0, mastered: 0 }
  let sum = 0
  let rated = 0
  let mastered = 0
  ids.forEach((id) => {
    const r = ratings[id]
    if (r) {
      sum += r.score
      rated += 1
      if (r.score >= 2) mastered += 1
    }
  })
  return { avg: rated ? sum / rated : 0, rated, total: ids.length, mastered }
}

// Fortschritt in Prozent (0..100): bewertete Punkte gewichtet nach Score.
export function progressPercent(ids, ratings) {
  if (!ids.length) return 0
  let sum = 0
  ids.forEach((id) => {
    const r = ratings[id]
    if (r) sum += r.score // 0..3
  })
  return Math.round((sum / (ids.length * 3)) * 100)
}

// Schwache Eintraege: zuletzt mit 0 oder 1 bewertet.
export function weakIds(ids, ratings) {
  return ids.filter((id) => {
    const r = ratings[id]
    return r && r.score <= 1
  })
}

// Noch nicht bewertete Eintraege.
export function untouchedIds(ids, ratings) {
  return ids.filter((id) => !ratings[id])
}

// Leitner-Reihenfolge: niedrige Box (unsicher) zuerst und haeufiger.
export function leitnerOrder(cards, leitner) {
  return [...cards].sort((a, b) => {
    const ba = leitner[a.id] || 1
    const bb = leitner[b.id] || 1
    if (ba !== bb) return ba - bb
    return 0
  })
}

// Verteilung ueber die vier Boxen.
export function boxDistribution(cards, leitner) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0 }
  cards.forEach((c) => {
    const box = leitner[c.id] || 1
    dist[box] += 1
  })
  return dist
}

// Heute faellige Wiederholungen: alles in Box 1 und 2 plus laenger nicht Geuebtes.
export function dueToday(cards, store) {
  const { leitner, ratings } = store
  const DAY = 24 * 60 * 60 * 1000
  return cards.filter((c) => {
    const box = leitner[c.id] || 1
    if (box <= 2) return true
    const r = ratings[c.id]
    if (!r) return true
    const interval = box === 3 ? 2 * DAY : 5 * DAY
    return Date.now() - r.last > interval
  })
}

const LABEL = ['nicht gekonnt', 'teilweise', 'gut', 'prüfungssicher']
export function scoreLabel(score) {
  return LABEL[score] ?? '–'
}

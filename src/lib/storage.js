// Zentraler localStorage-Speicher fuer den Lernfortschritt.
// Alles bleibt lokal im Browser. Kein Backend, keine API.

import { useSyncExternalStore } from 'react'

const KEY = 'diplom_lern_app_v1'

const emptyState = () => ({
  ratings: {},      // { [id]: { score, count, last, type, area } }
  leitner: {},      // { [cardId]: box }  (1..4)
  pressure: {},     // { [setId]: { done, last } }
  presentation: {}, // { [sectionId]: score }
  lastActivity: null // { page, label, ts }
})

let state = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    return { ...emptyState(), ...JSON.parse(raw) }
  } catch {
    return emptyState()
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Speicher voll oder gesperrt: bewusst still, App laeuft weiter.
  }
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

function setState(updater) {
  state = updater(state)
  emit()
}

// --- React-Anbindung -------------------------------------------------------
function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function getSnapshot() {
  return state
}
export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

// --- Bewertungen (Fragen, Quellen, generisch) ------------------------------
// score: 0 = nicht gekonnt, 1 = teilweise, 2 = gut, 3 = pruefungssicher
export function rate(id, score, { type = 'question', area = null } = {}) {
  setState((s) => {
    const prev = s.ratings[id] || { count: 0 }
    return {
      ...s,
      ratings: {
        ...s.ratings,
        [id]: {
          score,
          count: (prev.count || 0) + 1,
          last: Date.now(),
          type,
          area,
        },
      },
    }
  })
}

export function getRating(id) {
  return state.ratings[id] || null
}

// --- Leitner-System fuer Lernkarten (Box 1..4) -----------------------------
// Box 1 neu/unsicher, 2 teilweise, 3 sicher, 4 pruefungssicher.
export function getBox(cardId) {
  return state.leitner[cardId] || 1
}

// Bewertung 0..3 verschiebt die Karte: hoch bei gut, zurueck zu Box 1 bei 0.
export function rateCard(cardId, score, area = null) {
  setState((s) => {
    const current = s.leitner[cardId] || 1
    let next
    if (score === 0) next = 1
    else if (score === 1) next = Math.max(1, current) // bleibt
    else if (score === 2) next = Math.min(4, current + 1)
    else next = Math.min(4, current + 1)
    if (score === 3) next = Math.min(4, Math.max(current + 1, 3))
    const prev = s.ratings[cardId] || { count: 0 }
    return {
      ...s,
      leitner: { ...s.leitner, [cardId]: next },
      ratings: {
        ...s.ratings,
        [cardId]: { score, count: (prev.count || 0) + 1, last: Date.now(), type: 'card', area },
      },
    }
  })
}

// --- Pruefungsdruck --------------------------------------------------------
export function markPressureDone(setId) {
  setState((s) => ({
    ...s,
    pressure: { ...s.pressure, [setId]: { done: true, last: Date.now() } },
  }))
}

// --- Praesentationstrainer -------------------------------------------------
export function ratePresentation(sectionId, score) {
  setState((s) => ({
    ...s,
    presentation: { ...s.presentation, [sectionId]: score },
  }))
}

// --- Letzte Aktivitaet -----------------------------------------------------
export function setLastActivity(page, label) {
  setState((s) => ({ ...s, lastActivity: { page, label, ts: Date.now() } }))
}

// --- Zuruecksetzen ---------------------------------------------------------
export function resetAll() {
  setState(() => emptyState())
}

export function resetArea(area) {
  setState((s) => {
    const ratings = { ...s.ratings }
    Object.keys(ratings).forEach((id) => {
      if (ratings[id].area === area) delete ratings[id]
    })
    return { ...s, ratings }
  })
}

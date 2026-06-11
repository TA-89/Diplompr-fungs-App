import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// ---------------------------------------------------------------------------
// Selbst-Aktualisierung
//
// GitHub Pages liefert Dateien mit "Cache-Control: max-age=600". Browser und
// Service Worker duerfen die Seite also bis zu 10 Minuten aus dem Cache
// zeigen. Damit immer die neuste Version laeuft, prueft die App eine kleine
// version.json (immer am Cache vorbei). Ist online eine neue Version da,
// werden alle Caches geleert und die Seite laedt sich einmal selbst neu.
// Der Lernfortschritt bleibt erhalten (localStorage wird nicht angetastet).
// ---------------------------------------------------------------------------
if (import.meta.env.PROD) {
  const CURRENT = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : ''
  const RELOADED_KEY = 'app_reloaded_for_version'

  async function checkForUpdate() {
    if (!navigator.onLine) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) return
      const { version } = await res.json()
      if (!version || version === CURRENT) return

      // Schutz vor Reload-Schleifen: pro neuer Version nur einmal neu laden.
      if (sessionStorage.getItem(RELOADED_KEY) === version) return
      sessionStorage.setItem(RELOADED_KEY, version)

      // Alle Caches des Service Workers leeren und den Worker aktualisieren.
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration()
        await reg?.update()
      }
      window.location.reload()
    } catch {
      // Offline oder Netzfehler: still bleiben, naechster Versuch kommt.
    }
  }

  window.addEventListener('load', () => {
    // Service Worker registrieren (fuer Offline-Betrieb)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
    }
    setTimeout(checkForUpdate, 3000)
    setInterval(checkForUpdate, 5 * 60 * 1000)
  })

  // Beim Zurueckwechseln in den Tab bzw. beim Oeffnen der installierten App
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
}

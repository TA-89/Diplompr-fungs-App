// Einfacher Service Worker: macht die App offline-fähig.
// Strategie:
//  - Seitenaufrufe (HTML): zuerst Netz (am HTTP-Cache vorbei), bei Offline aus dem Cache.
//  - version.json: nie cachen, immer frisch aus dem Netz (Basis der Selbst-Aktualisierung).
//  - Übrige Dateien (JS/CSS/Icons): aus dem Cache, im Hintergrund aktualisieren.
// Die Dateinamen der Build-Dateien enthalten einen Hash, daher gibt es keine
// veralteten Inhalte: ein neuer Build erzeugt neue Namen.

const CACHE = 'diplom-app-v2'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg']).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // version.json: nie abfangen oder cachen – die App prüft damit auf Updates.
  if (url.pathname.endsWith('/version.json')) return

  // Navigationen: Netz zuerst und am HTTP-Cache vorbei (GitHub Pages liefert
  // max-age=600). So zeigt jeder Aufruf mit Internet sofort die neuste
  // Version; offline kommt die Seite aus dem Cache.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    )
    return
  }

  // Übrige Dateien: Cache zuerst, im Hintergrund auffrischen
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})

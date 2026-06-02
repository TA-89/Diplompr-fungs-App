# Diplomprüfung – Lernumgebung

Eine kleine, lokal laufende Web-App zur Vorbereitung auf die mündliche
Diplomprüfung zur Diplomarbeit **„Vom Schulbuch zur Lernumgebung. Kriterien für
wirksame digitale Lehrmittel in der Berufsbildung."**

Die App hilft, die Arbeit nicht nur auswendig zu lernen, sondern fachlich zu
verstehen, frei zu erklären und kritisch zu verteidigen. Sie simuliert die
10-Minuten-Präsentation und das 20-Minuten-Fachgespräch.

## Hauptbereiche

- **Dashboard** – Fortschritt nach neun Bereichen, fällige Wiederholungen, schwache Punkte.
- **Prüfungsmodus** – prüfungsnahe Fragen mit Musterantwort, Stichpunkten, typischen Fehlern, Anschlussfragen und Selbstbewertung (0–3).
- **Prüfungsdruck** – drei Anschlussfragen hintereinander, Lösung erst nach der dritten.
- **Lernkarten** – Karteikarten mit Leitner-System (Box 1–4).
- **Quellen-Trainer** – Quellenkarten mit Funktion und Grenzen, dazu interaktive Übungen.
- **Thesen & Kriterien** – fünf Thesen und sechzehn Kriterien in fünf Bündeln, einzeln trainierbar.
- **Präsentationstrainer** – 10-Minuten-Struktur, Timer, Stichwortkarten, Checkliste, Kürzungen.
- **Meine Baustellen** – alles, was mit 0 oder 1 bewertet wurde, samt Lernempfehlung.
- **Reflexion & Verteidigung** – kritische Fragen mit souveränen Antwortstrategien.

## Lokaler Start

Voraussetzung: Node.js (Version 18 oder neuer).

```bash
npm install
npm run dev
```

Danach die angezeigte Adresse (in der Regel `http://localhost:5173`) im Browser
öffnen.

## Build

```bash
npm run build      # erzeugt den Ordner dist/
npm run preview    # baut und zeigt das Ergebnis lokal an
```

## Veröffentlichung auf GitHub Pages

Das **privat geführte** Repository ist nur für den persönlichen Gebrauch
bestimmt. So wird die App auf GitHub Pages bereitgestellt:

**Variante A – manuell:**
1. `npm run build` ausführen.
2. Den Inhalt von `dist/` in den Branch `gh-pages` legen (z. B. mit dem Paket
   `gh-pages`) oder in GitHub Pages den Ordner als Quelle wählen.
3. In den Repository-Einstellungen unter *Pages* den Branch `gh-pages`
   auswählen.

**Variante B – GitHub Actions:** Eine Action, die bei jedem Push auf `main`
baut und `dist/` nach Pages veröffentlicht.

Die `vite.config.js` verwendet `base: './'`. Dadurch läuft die App sowohl lokal
als auch unter einem Pages-Unterpfad (`https://<user>.github.io/<repo>/`) ohne
weitere Anpassung.

## Datenschutz und Trennung von Roh- und Lernmaterial

Die App trennt sauber zwei Ebenen:

1. **Rohmaterial** liegt im Ordner `_private_sources/` (Diplomarbeit, Leitfaden,
   Literatur-PDFs, Notizen). Dieser Ordner steht in `.gitignore` und gelangt
   **nie** ins Repository.
2. **Lernmaterial** liegt als gekürzte, sinngemässe JSON-Dateien in `src/data/`.

In `src/data/` stehen **keine** vollständigen PDFs, keine vollständigen Kapitel,
keine langen wörtlichen Zitate, keine urheberrechtlich geschützten Volltexte und
nicht die Diplomarbeit als Rohtext. Nur eigene Zusammenfassungen, Prüfungsfragen,
Lernkarten, Quellenkarten, Thesen und Kriterien.

- **Kein Backend, keine Datenbank, kein Login, keine API-Keys.**
- Der Lernfortschritt wird ausschliesslich lokal im Browser (`localStorage`)
  gespeichert. Es verlassen keine Daten das Gerät.

## Datenstruktur (`src/data/`)

| Datei | Inhalt |
| --- | --- |
| `meta.json` | Forschungsfrage, roter Faden, Bereiche, Grundsätze, zentrale Modelle (ICAP, ISAR, CLT, SDT, Lernumgebung) |
| `theses.json` | die fünf Thesen mit Herleitung, Prüfungsfrage und Musterantwort |
| `criteria.json` | die sechzehn Kriterien in fünf Gruppen, mit Beispiel, Schwäche und Antwort |
| `sourceMap.json` | Quellenkarten: Funktion in der Arbeit, Kapitel, Relevanz, Grenzen, Verbindungen |
| `examQuestions.json` | Prüfungsfragen mit Kernantwort, Stichpunkten, Musterantwort, Fehlern, Anschlussfragen |
| `flashcards.json` | Lernkarten (Vorderseite / Rückseite / Merksatz) |
| `pressureSets.json` | Sequenzen aus drei Anschlussfragen für den Prüfungsdruck-Modus |
| `presentationTrainer.json` | 10-Minuten-Struktur, Zeiten, Stichwortkarten, Übergänge, Checkliste, Kürzungen |
| `reflection.json` | kritische Verteidigungsfragen mit souveränen Antwortstrategien |

### localStorage

Gespeichert werden unter dem Schlüssel `diplom_lern_app_v1`:
Bewertungen pro Frage / Lernkarte / Quelle / These / Kriterium, die Leitner-Box
pro Lernkarte, der Status der Prüfungsdruck-Sequenzen, die
Präsentationsbewertungen und die letzte Aktivität.

## Hinweis zur fünften These

Abstract und Kapitel 6 der Arbeit sprechen von **fünf Thesen**, während Kapitel 5
nur vier Thesen mit eigener Überschrift ausformuliert. Die fünfte These zu
**Qualität, Datenschutz und Verantwortung** ist inhaltlich vorhanden (Kapitel
6.5), aber nicht als eigene Überschrift gesetzt. Die App bildet sie als `t-005`
ab und markiert dies als Punkt zur Selbstkontrolle vor der Abgabe.

## Sprache

Hochdeutsch mit Schweizer Schreibweise (ss statt ß).

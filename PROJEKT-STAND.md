# Projekt-Stand & Übergabe — Diplomprüfungs-Lernapp

> **Zweck dieser Datei:** Aktueller Stand zum Weiterarbeiten von einem zweiten Gerät.
> Diese Datei in Claude Code öffnen / als Kontext geben, dann kann nahtlos weitergearbeitet werden.
> **Letzte Aktualisierung:** 24. Juni 2026

---

## 1. Worum geht es

Lern- und Prüfungsvorbereitungs-App (React/Vite-PWA) für die **mündliche Diplomprüfung**
von **Tobias Arnold** (PHSG, DSG BKU) zur Diplomarbeit
**„Vom Schulbuch zur Lernumgebung. Kriterien für wirksame digitale Lehrmittel in der Berufsbildung."**

- **Prüfung:** Freitag, **26. Juni 2026** (30 Min: 10 Min Präsentation + 20 Min Fachgespräch)
- **Ziel:** Note 6 (PHSG-Raster: 9 Kompetenzbereiche, max. 68 Punkte; Note 6 ab 65 Punkten)
- **Abgabe der schriftlichen Arbeit war:** 12. Juni 2026, 16.00 Uhr

---

## 2. Wo liegt was

| Sache | Ort |
| --- | --- |
| **Projektordner (lokal)** | `…\09_IBB-DB24-QV Qualifikationsverfahren\Diplomarbeit\Übung für Diplomprüfung\pruefungs-app` |
| **GitHub-Repo (privat)** | https://github.com/TA-89/Diplompr-fungs-App |
| **Live-App (GitHub Pages)** | https://ta-89.github.io/Diplompr-fungs-App/ |
| **Finale Diplomarbeit (PDF)** | `…\pruefungs-app\2026_DA_Arnold_Tobias_D.pdf` |
| **PHSG-Leitfaden (PDF)** | `…\pruefungs-app\DSG_BKU_24-26_Leitfaden_Diplomarbeit-Diplomprüfung_final.pdf` |
| **Mock-Prüfungsgespräch** | `…\Übung für Diplomprüfung\Mock-Pruefungsgespraech_Arnold.pdf` |
| **Fragen & Antworten** | `…\Übung für Diplomprüfung\Diplompruefung_Fragen_Antworten_Tobias_Arnold.pdf` |

> Hinweis: PDFs/DOCX sind via `.gitignore` vom Repo ausgeschlossen (Urheberrecht), liegen aber lokal im Ordner.

---

## 3. Auf zweitem Gerät einrichten

**Voraussetzung:** Node.js 18+ (getestet mit Node 24 LTS).
Falls Node fehlt (Windows): `winget install OpenJS.NodeJS.LTS`

```bash
# 1. Repo klonen
git clone https://github.com/TA-89/Diplompr-fungs-App.git
cd Diplompr-fungs-App

# 2. Abhängigkeiten installieren
npm install

# 3. Lokal entwickeln (mit Hot-Reload)
npm run dev          # → http://localhost:5173

# 4. Produktions-Build testen
npm run build
npm run preview      # → http://localhost:4173

# 5. Quellen-Spickzettel als PDF erzeugen (optional)
npm run pdf
```

**Veröffentlichen:** Einfach committen und auf `main` pushen — eine GitHub Action
(`.github/workflows/deploy.yml`) baut und deployt automatisch auf GitHub Pages.

> **Wichtig bei Problemen mit `npm ci` im CI:** `package.json` und `package-lock.json`
> müssen synchron sein. Nach dem Hinzufügen einer Abhängigkeit lokal `npm install`
> laufen lassen und das aktualisierte `package-lock.json` mitcommitten.

---

## 4. Was die App kann (Module)

Navigation/Bereiche (in `src/App.jsx` registriert, je eine Seite unter `src/pages/`):

- **Dashboard** — Prüfungs-Countdown im Hero, Fortschrittsring, 9 Lernbereiche mit Balken, Karte „🎯 So holst du die 6" (PHSG-Bewertungsraster mit Notenskala + Antwortformel).
- **Quiz** — gemischtes Single-/Multiple-Choice-Quiz aus allen Fragen, mit Auswertung.
- **Prüfungsmodus** — prüfungsnahe Fragen mit Kernantwort, Stichpunkten, Musterantwort, typischen Fehlern, Anschlussfragen, Selbstbewertung (0–3).
- **Prüfungsdruck** — drei Anschlussfragen hintereinander, Lösung erst nach der dritten (inkl. der kritischen Ketten aus dem Mock-Gespräch).
- **Lernkarten** — Karteikarten mit Leitner-System (Box 1–4).
- **Quellen-Trainer** — Quellenkarten mit Funktion, Grenzen und Autoren-Porträts.
- **Spickzettel** — kompakte Quellenübersicht, als PDF exportierbar.
- **Thesen & Kriterien** — 5 Thesen + 16 Kriterien in 5 Bündeln, einzeln trainierbar.
- **Präsentationstrainer** — 10-Minuten-Struktur, Timer, Stichwortkarten, Checkliste, Kürzungen.
- **Meine Baustellen** — alles mit 0/1 bewertete Inhalte + Lernempfehlung.
- **Reflexion & Verteidigung** — kritische Fragen mit souveränen Antwortstrategien.
- **Gutachten-Rückmeldungen** — die 6 Kritikpunkte aus dem PHSG-Gutachten (Note 5.5) mit Dreischritt-Antworten (anerkennen → einordnen → Konsequenz) + die gelobten Stärken zum aktiven Aufgreifen. Zahlt direkt auf Bewertungskriterium 9 (Reflexion) ein.

Technik: PWA (installierbar, offline), Lernfortschritt nur im `localStorage` des Geräts
(Schlüssel `diplom_lern_app_v1`). **Selbst-Aktualisierung aktiv:** Die App prüft eine
`version.json` am Cache vorbei und lädt sich bei einem neuen Deploy automatisch einmal neu.

---

## 5. Inhaltlicher Stand der Daten (`src/data/`)

| Datei | Inhalt | Anzahl |
| --- | --- | --- |
| `examQuestions.json` | Prüfungsfragen (Kernantwort, Stichpunkte, Musterantwort, Fehler, Anschlussfragen) | **41** |
| `quizQuestions.json` | Quizfragen (Single-/Multiple-Choice) | 20 |
| `flashcards.json` | Lernkarten | 24 |
| `pressureSets.json` | Prüfungsdruck-Sequenzen (je 3 Fragen) | **6** |
| `reflection.json` | Kritische Verteidigungsfragen mit Strategien | **19** |
| `authorQuiz.json` | Autoren-Quiz „Wer steht dahinter?" | 34 |
| `theses.json` | 5 Thesen | 5 |
| `criteria.json` | 16 Kriterien in 5 Bündeln | 16 |
| `gutachten.json` | Gutachten-Kritikpunkte (Dreischritt-Antworten) + gelobte Stärken | **6** + 3 |
| `sourceMap.json` | Quellenkarten inkl. Autoren-Infos | — |
| `meta.json` | Forschungsfrage, roter Faden, Modelle, **Termine + PHSG-Bewertungsraster** | — |

### Wichtige inhaltliche Korrektur (bereits erledigt)
Die **finale Arbeit hat fünf Thesen als eigene Unterkapitel (5.1–5.5)**, Zwischenfazit ist 5.6.
Frühere App-Versionen hatten noch den Hinweis „Kapitel 5 zeigt nur vier Überschriften" —
das ist behoben. These 5 heisst: **„Verantwortung entscheidet darüber, ob eine Erweiterung
überhaupt wirkt"** (Kap. 5.5).

### Die 5 Thesen (finaler Wortlaut)
1. Digitale Lehrmittel müssen mehr leisten als Informationen bereitstellen (5.1)
2. Lernwirksamkeit entsteht durch Struktur, Aktivierung und Rückmeldung (5.2)
3. Digitale Erweiterungen können Lernen unterstützen, aber auch verflachen (5.3)
4. Berufsbildung braucht verständliche, handlungsnahe und anschlussfähige Lehrmittel (5.4)
5. Verantwortung entscheidet darüber, ob eine Erweiterung überhaupt wirkt (5.5)

### Die 16 Kriterien in 5 Bündeln
- **Didaktisch (6.1):** Eigene didaktische Konzeption · Aktivierung · Motivation und Rückmeldung · Schutz der Denkarbeit
- **Strukturell (6.2):** Orientierung und Modularität · Verknüpfung · Format folgt der Konzeption
- **Gestalterisch (6.3):** Bild-Text-Kohärenz · Reduktion · Gestaltung als didaktische Arbeit
- **Digitale Anschlussfähigkeit (6.4):** Offenheit für Erweiterungen · KI nach Wirkung beurteilen · Lernortbezug
- **Verantwortung (6.5):** Datenschutz · Fairness und Validität · Transparenz und reflektierte Nutzung

### Schlüsselmodelle (Wortlaut wie in der Arbeit)
- **ICAP** (Chi & Wylie, 2014): passiv → aktiv → konstruktiv → interaktiv
- **ISAR** (Bauer et al., 2025, baut auf SAMR auf): Ersatz, Erweiterung, Neubestimmung + **Umkehrung (Inversion)**
- **Cognitive Load** (Sweller, 2020) · **Multimedia** (Mayer, 2021) · **SDT** (Deci & Ryan, 1993)
- **Lernumgebung** (Kerres, 2018) · **Berufsbildung** (Dehnbostel, 2022; Seufert, 2023)

### Zentrale Botschaft
„Die Wirkung auf das Lernen hängt von der didaktischen Gestaltung ab, nicht vom Träger.
KI stützt das Lernen nur, wenn sie die **Denkarbeit bei den Lernenden** lässt." → **„Didaktik schlägt Technik."**

---

## 6. PHSG-Bewertungsraster der Diplomprüfung (Ziel: Note 6)

Max. 68 Punkte; Note 6 = 65–68 (nur 3 Punkte Spielraum). 5er-Skala je Kriterium (0–4).

| Nr | Bereich | Punkte |
| --- | --- | --- |
| 1 | Struktur und Aufbau der Präsentation (roter Faden) | 8 |
| 2 | Vollständigkeit der Präsentation | 4 |
| 3 | Schwerpunktsetzung | 8 |
| 4 | Inhalte der Präsentation (Fachtermini, wissenschaftsorientiert) | 8 |
| 5 | **Beantwortung der Fragen** (konkret, zielführend, fundiert) | 8 |
| 6 | **Qualität der Argumentation** (überzeugend, stichhaltige Belege) | 8 |
| 7 | Medien und Materialien | 8 |
| 8 | Verbale/nonverbale Kommunikation | 8 |
| 9 | **Reflexion** (Gutachten-Rückmeldungen aufnehmen, Stärken/Schwächen) | 8 |

**Antwortformel (aus Mock):** 1. Direkte Antwort in 1 Satz → 2. Begründung mit Beleg (Autor, Jahr)
→ 3. Beispiel/Bezug zur Arbeit → 4. Stopp. Richtwert 1–2 Min.
**Bei Kritik:** zuerst das berechtigte Korn anerkennen, dann einordnen, dann Konsequenz.

---

## 7. Kritische Punkte aus dem Gutachten — ERLEDIGT (24.06.2026)

**Status: eingearbeitet.** Gutachten lag vor (Note **5.5**, 106/116 Punkte, Betreuerin
Katharina Hilty, 22.06.2026). Die schriftliche Note ist fixiert; die mündliche Prüfung
wird separat nach dem 68-Punkte-Raster benotet (6 ab 65) — dort zahlt **Kriterium 9
(Reflexion)** darauf ein, dass die Gutachten-Rückmeldungen souverän aufgenommen werden.

**Was umgesetzt wurde:**
1. Neuer Bereich **„Gutachten-Rückmeldungen"** (`src/pages/GutachtenMode.jsx`, Route `#/gutachten`)
   mit Ergebnis-Banner, den 3 gelobten Stärken und 6 Kritikpunkten je im Dreischritt
   **anerkennen → einordnen → Konsequenz** + zusammenhängender Mustertantwort + wahrscheinlicher Anschlussfrage.
2. Inhalte in `src/data/gutachten.json` (6 Kritikpunkte mit wörtlichem Gutachten-Zitat).
3. 2 neue Verteidigungsfragen in `reflection.json` (r-020 Berufsbildungsbezug, r-021 Umfang) für die echten Lücken.
4. Neue Druck-Kette `ps-007` „Das Gutachten-Trio" in `pressureSets.json` (allgemein → Berufsbildungsbezug → KI-Lehrmittel konkret bauen).
5. Integration in Dashboard (Ergebnis-Karte + Button + Fortschritt), „Meine Baustellen" und neuer Lernbereich `gutachten`. Note 5.5 in `meta.json` hinterlegt.

**Die 6 Kritikpunkte (Kurzform):** (1) inhaltlich stellenweise zu allgemein · (2) Berufsbildungsbezug
zu wenig konkret · (3) Kriterienraster nicht an realem Lehrmittel erprobt · (4) Literaturkritik
teils oberflächlich (Aneinanderreihung statt Abwägen) · (5) **KI-Bezug zu grundsätzlich** —
wie müsste ein KI-Lehrmittel gebaut sein, wo verläuft die Grenze Unterstützung/Auslagerung
(wichtigster Punkt) · (6) Umfang knapp.

**Build geprüft:** `npm run build` läuft fehlerfrei (60 Module). Noch nicht committet/gepusht —
nächster Schritt: committen und auf `main` pushen, damit die Live-App sich aktualisiert.

---

## 8. Git-Stand (zum Abgleich)

Letzter Commit auf `main`: `Selbst-Aktualisierung: App prueft version.json …` (Hash beginnt mit `1187fff`).
Working Tree war beim Erstellen dieser Datei sauber (alles committet & gepusht).

Zum Prüfen auf dem zweiten Gerät:
```bash
git log --oneline -5
git status
```

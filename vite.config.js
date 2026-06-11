import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Eindeutige Versionsnummer pro Build. Sie steht der App als __APP_VERSION__
// zur Verfuegung und wird zusaetzlich als version.json mitveroeffentlicht.
// Die App vergleicht beides regelmaessig und laedt sich bei einer neuen
// Version selbststaendig neu (siehe src/main.jsx).
const buildVersion = String(Date.now())

function emitVersionJson() {
  return {
    name: 'emit-version-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: buildVersion }),
      })
    },
  }
}

// base: './' sorgt dafuer, dass die App sowohl lokal als auch unter einem
// GitHub-Pages-Unterpfad (https://user.github.io/repo/) korrekt laedt.
export default defineConfig({
  plugins: [react(), emitVersionJson()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
})

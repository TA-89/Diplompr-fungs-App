import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' sorgt dafuer, dass die App sowohl lokal als auch unter einem
// GitHub-Pages-Unterpfad (https://user.github.io/repo/) korrekt laedt.
export default defineConfig({
  plugins: [react()],
  base: './',
})

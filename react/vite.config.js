import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves the site at https://frostflour.github.io/Frost-Flour/,
// so the production build needs that base path. Dev server stays at "/".
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Frost-Flour/' : '/',
}))

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages: https://soyee-1469.github.io/tomatok_service/
export default defineConfig({
  base: '/tomatok_service/',
  plugins: [react()],
})

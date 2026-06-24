import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base: './'` keeps all asset URLs relative, so the build works under a
// GitHub Pages project subpath (https://<user>.github.io/<repo>/) without
// hardcoding the repo name.
export default defineConfig({
  base: './',
  plugins: [react()],
  // A fresh build id per build. Appended to the players_data.json request so a
  // new deploy fetches the data bypassing the browser's cached 5MB copy
  // (GitHub Pages serves it with Cache-Control: max-age=600).
  define: {
    __DATA_VERSION__: JSON.stringify(Date.now().toString()),
  },
})

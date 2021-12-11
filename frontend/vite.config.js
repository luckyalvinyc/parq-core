import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import Unocss from 'unocss/vite'
import presetUno from '@unocss/preset-uno'

const BACKEND_URL = 'http://localhost:3000'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Unocss({
      presets: [presetUno()],
      theme: {
        colors: {
          yellow: {
            light: '#fed280',
            DEFAULT: '#fdc04e'
          },
          gray: {
            DEFAULT: '#babebf',
            dark: '#4b5051'
          }
        }
      }
    }),
    svelte()
  ],

  server: {
    port: 8080,
    proxy: {
      '/api': BACKEND_URL
    }
  }
})

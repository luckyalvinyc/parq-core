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
          white: '#f2f0eb ',
          green: {
            light: '#90a68e',
            DEFAULT: '#879f84',
            dark: '#6d8769'
          },
          yellow: {
            light: '#fed280',
            DEFAULT: '#fdc04e'
          },
          magenta: '#6667AB',
          gray: {
            light: '#cccfcf',
            DEFAULT: '#babebf',
            dark: '#4b5051'
          }
        }
      },
      shortcuts: {
        adder: 'border-2px border-dashed color-green bg-white text-1.7rem',
        slot: 'w-85px h-45px rounded-10px m-r-10px m-b-10px bg-magenta flex justify-center items-center'
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

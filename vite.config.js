import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.png', '**/*.svg', '**/*.mp4'],
  plugins: [react(), svgr()],
  server: {
    hmr: {
      overlay: false,  
    }
  },
  build: {
    rollupOptions: {
      input: 'index.html', 
    },
  },
  define: {
    // eslint-disable-next-line no-undef
    'process.env': process.env
  }, 
  publicDir: 'public',
})
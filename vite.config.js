import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // Fallback environment variables for development
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://api.relab.co.nz'),
    'import.meta.env.VITE_CMA_REPORT_BASE_URL': JSON.stringify(process.env.VITE_CMA_REPORT_BASE_URL || 'https://relabdevstore.blob.core.windows.net/documents/CMAReport')
  },
  // Ensure public assets are properly handled
  publicDir: 'public',
  base: '/'
})

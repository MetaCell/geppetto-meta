import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@metacell/geppetto-meta-core', '@metacell/geppetto-meta-client', '@metacell/geppetto-meta-ui']
  },
  assetsInclude: ['**/*.nii.gz']
})

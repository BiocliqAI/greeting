import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5174,
    },
    define: {
      // Expose VITE_BACKEND_BASE_URL to your client-side code
      'process.env.VITE_BACKEND_BASE_URL': JSON.stringify(env.VITE_BACKEND_BASE_URL)
    }
  }
})

import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())
  const appEnv = JSON.stringify(env.APP_ENV)
  const port = env.APP_PORT ? Number(env.APP_PORT) : 5173
  console.log('app env', appEnv)
  console.log('app port', port)
  console.log('backend URL', env.VITE_BACKEND_URL)
  return defineConfig({
    define: {__APP_ENV__: appEnv},
    plugins: [react()],
    server: {port},
  })
})

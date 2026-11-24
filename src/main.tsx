import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { getBrowserStorage } from './lib/storage.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App storage={getBrowserStorage()} />
  </StrictMode>,
)

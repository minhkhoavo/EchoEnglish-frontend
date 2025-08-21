import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import global Tailwind & design tokens first so every component has styles.
import './index.css'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { TermsView } from './components/legal'

// Standalone /terms.html page — a real, crawlable URL for the terms.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TermsView />
  </StrictMode>,
)

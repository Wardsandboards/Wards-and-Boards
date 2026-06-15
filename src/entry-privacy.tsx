import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { PrivacyView } from './components/legal'

// Standalone /privacy.html page — a real, crawlable URL for the policy
// (used by the footer link target and Google OAuth verification).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivacyView />
  </StrictMode>,
)

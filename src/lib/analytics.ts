// Privacy-respecting analytics via Plausible (no cookies, no personal data).
// Off until VITE_PLAUSIBLE_DOMAIN is set (a build env var / GitHub secret), so
// local and unconfigured builds load nothing. Plausible's script tracks SPA
// navigations through the History API on its own.
const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined

export function initAnalytics(): void {
  if (!DOMAIN || typeof document === 'undefined') return
  if (document.querySelector('script[data-domain]')) return
  const s = document.createElement('script')
  s.defer = true
  s.setAttribute('data-domain', DOMAIN)
  s.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(s)
}

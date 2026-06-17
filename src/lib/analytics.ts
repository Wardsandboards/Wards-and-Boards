// Privacy-respecting analytics via Cloudflare Web Analytics (free, no cookies,
// no personal data). Off until VITE_CF_BEACON_TOKEN is set (a build env var /
// GitHub secret), so local and unconfigured builds load nothing. The beacon's
// SPA flag tracks in-app navigations through the History API.
const TOKEN = import.meta.env.VITE_CF_BEACON_TOKEN as string | undefined

export function initAnalytics(): void {
  if (!TOKEN || typeof document === 'undefined') return
  if (document.querySelector('script[data-cf-beacon]')) return
  const s = document.createElement('script')
  s.defer = true
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN, spa: true }))
  document.head.appendChild(s)
}

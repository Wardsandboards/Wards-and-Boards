// Tiny path<->state router for the single-page app. The app is driven by a
// `mode` plus an optional case id (Learn) or author id (Authors); these pure
// functions map that to/from a clean URL path so tabs and cases are shareable,
// bookmarkable, and work with the browser back button. No router dependency.
//
// On GitHub Pages this relies on a 404.html copy of index.html (see the build
// script) so a deep link like /learn/aortic-stenosis serves the app shell.

export interface Route {
  mode: string
  caseId: string | null
  authorId: string | null
}

// Top-level views that map 1:1 to /<mode>. (learn + authors also take a sub-id.)
const VIEW_MODES = new Set(['home', 'learn', 'practice', 'contribute', 'authors', 'about', 'admin', 'signin', 'privacy', 'terms', 'settings'])

/** Parse a pathname into app state. Unknown paths fall back to home. */
export function parseRoute(pathname: string): Route {
  const segs = (pathname || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (segs.length === 0) return { mode: 'home', caseId: null, authorId: null }
  const [first, second] = segs
  if (first === 'learn') return { mode: 'learn', caseId: second ? decodeURIComponent(second) : null, authorId: null }
  if (first === 'authors') return { mode: 'authors', caseId: null, authorId: second ? decodeURIComponent(second) : null }
  if (VIEW_MODES.has(first)) return { mode: first, caseId: null, authorId: null }
  return { mode: 'home', caseId: null, authorId: null }
}

/** Build the canonical pathname for a piece of app state. */
export function buildRoute(r: { mode: string; caseId?: string | null; authorId?: string | null }): string {
  if (r.mode === 'home') return '/'
  if (r.mode === 'learn' && r.caseId) return '/learn/' + encodeURIComponent(r.caseId)
  if (r.mode === 'authors' && r.authorId) return '/authors/' + encodeURIComponent(r.authorId)
  return '/' + r.mode
}

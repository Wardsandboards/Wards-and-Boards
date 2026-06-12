// Backend configuration, read from Vite env vars at build time.
// When these are absent the app runs fully on the localStorage mock,
// so it works with zero setup; adding the two vars activates Supabase.

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const SUPABASE_URL = url || ''
export const SUPABASE_ANON_KEY = anon || ''

/** True only when both Supabase env vars are present. */
export const isSupabaseConfigured = !!(url && anon)

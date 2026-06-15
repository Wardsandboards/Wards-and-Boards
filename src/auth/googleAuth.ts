import { supabase } from '../lib/supabase'

/** True when a real Supabase backend is configured (so Google sign-in is live). */
export const googleEnabled = !!supabase

export interface SessionUser {
  email: string
  name: string
}

/** Start the real Google OAuth redirect flow. No-op on the mock. */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    // Land back on the app root (now that routes have real paths); the session
    // is restored from the URL and the user starts signed in on Home.
    options: { redirectTo: window.location.origin + '/' },
  })
}

/** End the Supabase session. No-op on the mock. */
export async function signOutGoogle(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

function toUser(u: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): SessionUser | null {
  if (!u) return null
  const name = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || u.email || ''
  return { email: u.email || '', name }
}

/**
 * Subscribe to the Supabase session: fires once with the current user (or null)
 * and again on every sign-in / sign-out. Returns an unsubscribe function.
 * On the mock it does nothing and returns a no-op.
 */
export function onGoogleSession(cb: (u: SessionUser | null) => void): () => void {
  if (!supabase) return () => {}
  const client = supabase
  client.auth.getSession().then(({ data }) => cb(toUser(data.session?.user)))
  const { data: sub } = client.auth.onAuthStateChange((_event, session) => cb(toUser(session?.user)))
  return () => sub.subscription.unsubscribe()
}

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import App from '../src/App'

// jsdom shares one window across tests, so reset URL + storage each time.
describe('routing', () => {
  beforeEach(() => { localStorage.clear(); window.history.pushState(null, '', '/') })

  const navButton = (name: string) => within(screen.getByRole('navigation')).getByRole('button', { name })

  it('updates the URL when navigating, and shows the matching view', () => {
    render(<App />)
    expect(window.location.pathname).toBe('/')
    fireEvent.click(navButton('Practice'))
    expect(window.location.pathname).toBe('/practice')
    // Practice is gated, so the sign-in-to-Practice view renders at that URL.
    expect(screen.getByText('Sign in to Practice')).toBeTruthy()
  })

  it('renders the deep-linked view on first load', () => {
    window.history.pushState(null, '', '/practice')
    render(<App />)
    expect(screen.getByText('Sign in to Practice')).toBeTruthy()
  })

  it('responds to the browser back button (popstate)', () => {
    render(<App />)
    fireEvent.click(navButton('Practice'))
    expect(window.location.pathname).toBe('/practice')
    // Simulate pressing Back to the previous (home) entry.
    act(() => {
      window.history.pushState(null, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(window.location.pathname).toBe('/')
    expect(screen.queryByText('Sign in to Practice')).toBeNull()
  })
})

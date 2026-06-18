import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../src/App'

describe('Faculty tab + demo instructor', () => {
  beforeEach(() => { localStorage.clear(); window.history.pushState(null, '', '/') })

  it('shows the Faculty tab even when signed out', () => {
    render(<App />)
    expect(within(screen.getByRole('navigation')).getByRole('button', { name: 'Faculty' })).toBeTruthy()
  })

  it('previews as a sample instructor into a populated Faculty view', async () => {
    render(<App />)
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Faculty' }))
    // Gated view offers an instructor demo.
    fireEvent.click(screen.getByText(/Preview as a sample instructor/))
    // The demo banner names the instructor role (not "sample student").
    expect(screen.getByText(/exploring as a sample instructor/)).toBeTruthy()
    // Sample class auto-opens; the course row is the button carrying its name.
    fireEvent.click(screen.getByRole('button', { name: /MS3 internal medicine block/ }))
    expect(await screen.findByText('26')).toBeTruthy() // students joined (sample cohort)
  })
})

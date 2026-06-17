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
    expect(screen.getByText(/Demo mode/)).toBeTruthy()
    // Sample class is shown so the instructor view is demonstrable.
    fireEvent.click(screen.getByText(/MS3 internal medicine block \(sample\)/))
    expect(await screen.findByText('26')).toBeTruthy() // students joined (sample cohort)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../src/App'

describe('question bank search', () => {
  beforeEach(() => { localStorage.clear(); window.history.pushState(null, '', '/') })

  it('filters the bank and shows an empty state when nothing matches', () => {
    render(<App />)
    // Demo sign-in (no backend) puts us in the app, then go to Practice.
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Sign in' }))
    fireEvent.click(screen.getByText(/Preview as a sample student/))
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Practice' }))

    const search = screen.getByPlaceholderText(/Search questions/)
    expect(screen.queryByText('No questions match your search.')).toBeNull()
    fireEvent.change(search, { target: { value: 'zzqqnomatchxx' } })
    expect(screen.getByText('No questions match your search.')).toBeTruthy()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressDashboard } from '../src/components/progress'
import type { GameStats } from '../src/lib/gamify'

describe('ProgressDashboard', () => {
  it('renders the level, streak, and badges from the stats', () => {
    const stats: GameStats = { answers: 60, correct: 40, seen: 30, casesDone: 1, streak: 4, systems: [{ system: 'Cardiology', correct: 8, total: 10 }] }
    render(<ProgressDashboard stats={stats} due={2} />)
    expect(screen.getByText('Senior resident')).toBeTruthy() // xp = 800
    expect(screen.getByText(/day streak/)).toBeTruthy()
    expect(screen.getByText('System mastery')).toBeTruthy()
    expect(screen.getByText('Cardiology — 8/10 (80%)')).toBeTruthy()
  })
})

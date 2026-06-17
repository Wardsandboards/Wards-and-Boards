import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameChip, ProgressDashboard } from '../src/components/progress'
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

describe('GameChip', () => {
  it('shows the level + streak compactly and is clickable', () => {
    const onClick = vi.fn()
    const stats: GameStats = { answers: 60, correct: 40, seen: 30, casesDone: 1, streak: 4, systems: [] }
    render(<GameChip stats={stats} onClick={onClick} />)
    expect(screen.getByText('Lv5')).toBeTruthy() // 800 XP -> level index 4
    expect(screen.getByText('🔥4')).toBeTruthy()
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('hides the streak flame when there is no streak', () => {
    render(<GameChip stats={{ answers: 0, correct: 0, seen: 0, casesDone: 0, streak: 0, systems: [] }} onClick={() => {}} />)
    expect(screen.queryByText(/🔥/)).toBeNull()
    expect(screen.getByText('Lv1')).toBeTruthy()
  })
})

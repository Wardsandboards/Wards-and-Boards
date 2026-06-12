import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from '../src/components/practice'
import type { PracticeItem } from '../src/types'

const q: PracticeItem = {
  id: 'x', caseId: 'c1', qkey: 'c1:1A', caseTitle: 'Case One', system: 'Cardiology', topic: 'Topic',
  vignette: 'A clinical vignette.', leadIn: 'Which of the following is correct?',
  options: ['alpha', 'bravo', 'charlie', 'delta'], answerIndex: 2, explanation: 'charlie is the key',
  source: 'Forge', lint: { ok: true, fails: [] },
}

const noop = () => {}

describe('PracticeCard', () => {
  it('reports the picked index while still unanswered', () => {
    const onPick = vi.fn()
    render(<PracticeCard q={q} onPick={onPick} rated={0} onRate={noop} onGoCase={noop} />)
    fireEvent.click(screen.getByText('charlie'))
    expect(onPick).toHaveBeenCalledWith(2)
  })

  it('shows correct feedback when the picked index is the key', () => {
    render(<PracticeCard q={q} picked={2} onPick={noop} rated={0} onRate={noop} onGoCase={noop} />)
    expect(screen.getByText('✓ Correct')).toBeTruthy()
    expect(screen.getByText('charlie is the key')).toBeTruthy()
  })

  it('shows not-quite feedback when the picked index is wrong', () => {
    render(<PracticeCard q={q} picked={0} onPick={noop} rated={0} onRate={noop} onGoCase={noop} />)
    expect(screen.getByText('✗ Not quite')).toBeTruthy()
  })
})

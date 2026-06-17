import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnkiButton } from '../src/components/common'

describe('AnkiButton (editable before copy)', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true })
  })

  it('opens an editor showing the front and back, and does not copy on open', () => {
    render(<AnkiButton front="Recall cue" back="The learning point" />)
    expect(screen.queryByDisplayValue('Recall cue')).toBeNull()
    fireEvent.click(screen.getByText('⎘ Anki card'))
    expect(screen.getByDisplayValue('Recall cue')).toBeTruthy()
    expect(screen.getByDisplayValue('The learning point')).toBeTruthy()
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('copies the edited front/back as Front<tab>Back', () => {
    render(<AnkiButton front="Recall cue" back="The learning point" />)
    fireEvent.click(screen.getByText('⎘ Anki card'))
    fireEvent.change(screen.getByDisplayValue('The learning point'), { target: { value: 'Edited back' } })
    fireEvent.click(screen.getByText('Copy for Anki'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Recall cue\tEdited back')
    expect(screen.getByText('Copied ✓')).toBeTruthy()
  })
})

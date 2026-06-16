import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from '../src/components/practice'
import { communityAttribution } from '../src/lib/questions'
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

  it('uses the real attribution for a community question and does not make it clickable', () => {
    const onOpenAuthor = vi.fn()
    const community: PracticeItem = {
      ...q, id: 'community-1', source: 'Community',
      attribution: communityAttribution({ author_id: 'a1', author_name: 'Dr. Lee', author_creds: 'Cardiology fellow', author_institution: 'Stanford', reviewer_names: ['Dr. Chen', 'Dr. Okafor'] }),
    }
    const { container } = render(<PracticeCard q={community} picked={2} onPick={noop} rated={0} onRate={noop} onGoCase={noop} onOpenAuthor={onOpenAuthor} />)
    const byline = container.querySelector('.q-byline') as HTMLElement
    expect(byline.textContent).toContain('Dr. Lee')
    expect(screen.getByText(/review board/)).toBeTruthy()
    // The byline is a plain span (no profile page for real authors yet), not a button.
    expect(byline.querySelector('button')).toBeNull()
    expect(onOpenAuthor).not.toHaveBeenCalled()
  })
})

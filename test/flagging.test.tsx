import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from '../src/components/practice'
import { FlagQueue } from '../src/components/auth'
import type { PracticeItem } from '../src/types'

const q: PracticeItem = {
  id: 'x', caseId: 'c1', qkey: 'c1:1A', caseTitle: 'Case One', system: 'Cardiology', topic: 'Topic',
  vignette: 'A clinical vignette.', leadIn: 'Which of the following is correct?',
  options: ['alpha', 'bravo', 'charlie', 'delta'], answerIndex: 2, explanation: 'charlie is the key',
  source: 'Forge', lint: { ok: true, fails: [] },
}
const noop = () => {}

describe('report a problem (flagging)', () => {
  it('opens the form, sends a reason + comment, and confirms', () => {
    const onFlag = vi.fn()
    render(<PracticeCard q={q} onPick={noop} rated={0} onRate={noop} onGoCase={noop} onFlag={onFlag} />)
    fireEvent.click(screen.getByText('⚐ Report a problem'))
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Wrong answer key' } })
    fireEvent.change(screen.getByPlaceholderText(/few words/), { target: { value: 'B looks right too.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send report' }))
    expect(onFlag).toHaveBeenCalledWith('Wrong answer key', 'B looks right too.')
    expect(screen.getByText(/review board will take a look/)).toBeTruthy()
  })

  it('does not show the report link when no handler is given (e.g. landing demo)', () => {
    render(<PracticeCard q={q} onPick={noop} rated={0} onRate={noop} onGoCase={noop} />)
    expect(screen.queryByText('⚐ Report a problem')).toBeNull()
  })
})

describe('FlagQueue (admin)', () => {
  const flags = [{ id: 'f1', question_key: 'c1:1A', reason: 'Typo or wording', comment: 'missing word' }]

  it('lists open flags and resolves by id', () => {
    const onResolve = vi.fn()
    render(<FlagQueue flags={flags} onResolve={onResolve} />)
    expect(screen.getByText(/Typo or wording/)).toBeTruthy()
    expect(screen.getByText('missing word')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Resolve' }))
    expect(onResolve).toHaveBeenCalledWith('f1')
  })

  it('shows an empty state with no flags', () => {
    render(<FlagQueue flags={[]} onResolve={noop} />)
    expect(screen.getByText(/No open flags/)).toBeTruthy()
  })
})

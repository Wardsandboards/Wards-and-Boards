import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from '../src/components/learn'
import type { MS1Question } from '../src/types'

const questions: MS1Question[] = [
  { id: '1A', stem: 'First question stem', choices: ['alpha', 'bravo', 'charlie', 'delta'], correct: 1, feedback: 'bravo is right' },
  { id: '1B', stem: 'Second question stem', choices: ['wing', 'xray', 'yak', 'zulu'], correct: 0, feedback: 'wing is right' },
]

describe('Quiz', () => {
  it('runs the full answer flow and calls onComplete at the end', () => {
    const onComplete = vi.fn()
    render(<Quiz questions={questions} onComplete={onComplete} caseId="t" />)

    // Q1: pick the correct option, submit, see correct feedback
    fireEvent.click(screen.getByText('bravo'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(screen.getByText('✓ Correct')).toBeTruthy()
    expect(screen.getByText('bravo is right')).toBeTruthy()

    // advance
    fireEvent.click(screen.getByText('Next question →'))

    // Q2: pick a wrong option, submit, see not-quite feedback
    fireEvent.click(screen.getByText('xray'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(screen.getByText('✗ Not quite')).toBeTruthy()

    // last question: finishing calls onComplete
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('See the mechanism →'))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('disables submit until an option is selected', () => {
    render(<Quiz questions={questions} onComplete={() => {}} caseId="t" />)
    const submit = screen.getByText('Submit Answer') as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    fireEvent.click(screen.getByText('alpha'))
    expect(submit.disabled).toBe(false)
  })

  it('reports each answer via onAnswer keyed by case:question', () => {
    const onAnswer = vi.fn()
    render(<Quiz questions={questions} onComplete={() => {}} caseId="chf" onAnswer={onAnswer} />)
    fireEvent.click(screen.getByText('charlie'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(onAnswer).toHaveBeenCalledWith('chf:1A', false) // correct is 'bravo' (index 1)
  })
})

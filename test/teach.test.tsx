import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TeachView } from '../src/components/teach'
import type { Course, CohortStats } from '../src/lib/courses'

const courses: Course[] = [{ id: 'c1', name: 'MS3 IM block', code: 'ABC234', created_at: '' }]
const cohort: CohortStats = { size: 5, byKey: { 'chf:1A': { attempts: 10, correct: 8 }, 'iron:1A': { attempts: 4, correct: 1 } } }
const keySystem = { 'chf:1A': 'Cardiovascular', 'iron:1A': 'Hematology' }

describe('TeachView', () => {
  it('creates a class with the typed name', () => {
    const onCreate = vi.fn()
    render(<TeachView courses={courses} onCreate={onCreate} onLoadCohort={() => Promise.resolve(cohort)} keySystem={keySystem} />)
    fireEvent.change(screen.getByPlaceholderText(/internal medicine block/i), { target: { value: 'New class' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith('New class')
  })

  it('opens a course and shows privacy-safe cohort accuracy by system', async () => {
    render(<TeachView courses={courses} onCreate={() => {}} onLoadCohort={() => Promise.resolve(cohort)} keySystem={keySystem} />)
    fireEvent.click(screen.getByText('MS3 IM block'))
    expect(await screen.findByText('Cardiovascular — 8/10 (80%)')).toBeTruthy()
    expect(screen.getByText('Hematology — 1/4 (25%)')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy() // students joined
  })

  it('shows the empty state with no classes', () => {
    render(<TeachView courses={[]} onCreate={() => {}} onLoadCohort={() => Promise.resolve(cohort)} keySystem={keySystem} />)
    expect(screen.getByText(/No classes yet/)).toBeTruthy()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TeachView } from '../src/components/teach'
import type { Course, CohortStats, CourseQuestion } from '../src/lib/courses'

const courses: Course[] = [{ id: 'c1', name: 'MS3 IM block', code: 'ABC234', created_at: '' }]
const cohort: CohortStats = { size: 5, byKey: { 'chf:1A': { attempts: 10, correct: 8 }, 'iron:1A': { attempts: 4, correct: 1 } } }
const keySystem = { 'chf:1A': 'Cardiovascular', 'iron:1A': 'Hematology' }

// Default stub props; tests override what they exercise.
const base = () => ({
  courses, onCreate: () => {}, onLoadCohort: () => Promise.resolve(cohort), keySystem,
  onLoadQuestions: () => Promise.resolve([] as CourseQuestion[]),
  onCreateQuestion: () => Promise.resolve(true), onDeleteQuestion: () => Promise.resolve(),
  onSubmitToCommons: () => Promise.resolve(true),
})

// The course row is the only <button> carrying the class name (the detail heading
// is a plain div), so role+name opens it unambiguously even after auto-open.
const openCourse = () => fireEvent.click(screen.getByRole('button', { name: /MS3 IM block/ }))
// The cohort-tab callout has unique copy ("…for this class") and also switches to
// the questions tab, so it disambiguates from the shorter "Write questions" tab.
const goWrite = async () => fireEvent.click(await screen.findByRole('button', { name: /Write questions for this class/ }))

describe('TeachView', () => {
  it('creates a class with the typed name', () => {
    const onCreate = vi.fn()
    render(<TeachView {...base()} onCreate={onCreate} />)
    fireEvent.change(screen.getByPlaceholderText(/internal medicine block/i), { target: { value: 'New class' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onCreate).toHaveBeenCalledWith('New class')
  })

  it('opens a course and shows privacy-safe cohort accuracy by system', async () => {
    render(<TeachView {...base()} />)
    openCourse()
    expect(await screen.findByText('Cardiovascular — 8/10 (80%)')).toBeTruthy()
    expect(screen.getByText('Hematology — 1/4 (25%)')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy() // students joined
  })

  it('shows the empty state with no classes', () => {
    render(<TeachView {...base()} courses={[]} />)
    expect(screen.getByText(/No classes yet/)).toBeTruthy()
  })

  it('rejects an empty question at the Forge gate without calling onCreateQuestion', async () => {
    const onCreateQuestion = vi.fn(() => Promise.resolve(true))
    render(<TeachView {...base()} onCreateQuestion={onCreateQuestion} />)
    openCourse()
    await goWrite()
    fireEvent.click(screen.getByRole('button', { name: /Assign to my class/ }))
    expect(await screen.findByText(/Fix the hard flaws/)).toBeTruthy()
    expect(onCreateQuestion).not.toHaveBeenCalled()
  })

  it('authors a board-valid question and assigns it to the class', async () => {
    const onCreateQuestion = vi.fn(() => Promise.resolve(true))
    render(<TeachView {...base()} onCreateQuestion={onCreateQuestion} />)
    openCourse()
    await goWrite()
    fireEvent.change(screen.getByPlaceholderText('e.g. Cardiology'), { target: { value: 'Cardiology' } })
    fireEvent.change(screen.getByPlaceholderText(/A 68-year-old patient comes to/), { target: { value: 'A 70 year old patient reports three days of chest pressure that comes on with exertion and resolves with rest.' } })
    fireEvent.change(screen.getByPlaceholderText(/Which of the following is the most likely diagnosis/), { target: { value: 'Which of the following is the most appropriate next step?' } })
    const opts = ['Aspirin', 'Warfarin', 'Clopidogrel', 'Heparin', 'Metoprolol']
    opts.forEach((o, i) => fireEvent.change(screen.getByPlaceholderText('Option ' + String.fromCharCode(65 + i)), { target: { value: o } }))
    fireEvent.change(screen.getByPlaceholderText(/Why the key is right/), { target: { value: 'Aspirin is the right first step here.' } })
    fireEvent.click(screen.getByRole('button', { name: /Assign to my class/ }))
    await waitFor(() => expect(onCreateQuestion).toHaveBeenCalledWith('c1', expect.objectContaining({ leadIn: 'Which of the following is the most appropriate next step?', system: 'Cardiology' })))
  })

  it('submits an existing class question to the public commons', async () => {
    const q: CourseQuestion = { id: 'q1', courseId: 'c1', level: 'step1', system: 'Cardiology', vignette: 'v', leadIn: 'Which of the following is best?', options: ['a', 'b', 'c', 'd'], answerIndex: 0, explanation: 'e', video: '', commonsStatus: null }
    const onSubmitToCommons = vi.fn(() => Promise.resolve(true))
    render(<TeachView {...base()} onLoadQuestions={() => Promise.resolve([q])} onSubmitToCommons={onSubmitToCommons} />)
    openCourse()
    await goWrite()
    fireEvent.click(await screen.findByRole('button', { name: /Submit to the public commons/ }))
    expect(onSubmitToCommons).toHaveBeenCalledWith(q)
  })

  it('shows live commons status instead of a submit button once submitted', async () => {
    const q: CourseQuestion = { id: 'q1', courseId: 'c1', level: 'step1', system: 'Cardiology', vignette: 'v', leadIn: 'Which of the following is best?', options: ['a', 'b', 'c', 'd'], answerIndex: 0, explanation: 'e', video: '', commonsStatus: 'in_review' }
    render(<TeachView {...base()} onLoadQuestions={() => Promise.resolve([q])} />)
    openCourse()
    await goWrite()
    expect(await screen.findByText('In peer review')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Submit to the public commons/ })).toBeNull()
  })

  it('shows per-question cohort accuracy for the instructors own questions', async () => {
    const q: CourseQuestion = { id: 'q1', courseId: 'c1', level: 'step1', system: 'Cardiology', vignette: 'v', leadIn: 'Which murmur is expected?', options: ['a', 'b', 'c', 'd'], answerIndex: 0, explanation: 'e', video: '', commonsStatus: null }
    const cohortWithAssigned: CohortStats = { size: 5, byKey: { 'course:q1': { attempts: 8, correct: 6 } } }
    render(<TeachView {...base()} onLoadQuestions={() => Promise.resolve([q])} onLoadCohort={() => Promise.resolve(cohortWithAssigned)} />)
    openCourse()
    expect(await screen.findByText(/How your class did on your questions/)).toBeTruthy()
    expect(screen.getByText('Which murmur is expected? — 6/8 (75%)')).toBeTruthy()
  })
})

import { describe, it, expect } from 'vitest'
import { assignedKey, assignedToPracticeItem } from '../src/lib/questions'
import type { CourseQuestion } from '../src/lib/courses'

const q: CourseQuestion = {
  id: 'abc', courseId: 'c1', level: 'step1', system: 'Cardiology',
  vignette: 'A clinical vignette.', leadIn: 'Which of the following is the most likely diagnosis?',
  options: ['alpha', 'bravo', 'charlie', 'delta'], answerIndex: 1, explanation: 'bravo is the key',
  video: '', commonsStatus: null, authorName: 'Dr. Frank',
}

describe('assignedKey', () => {
  it('namespaces a course-question id under course:', () => {
    expect(assignedKey('abc')).toBe('course:abc')
  })
})

describe('assignedToPracticeItem', () => {
  it('keys the item so a student attempt matches the instructor cohort lookup', () => {
    const it = assignedToPracticeItem(q)
    expect(it.id).toBe('course:abc')
    expect(it.qkey).toBe('course:abc')
    expect(it.id).toBe(it.qkey)
  })

  it('marks the item as Assigned with the instructor as the byline', () => {
    const it = assignedToPracticeItem(q)
    expect(it.source).toBe('Assigned')
    expect(it.assignedBy).toBe('Dr. Frank')
    expect(it.caseId).toBeNull()
    expect(it.answerIndex).toBe(1)
    expect(it.lint).toBeDefined()
  })

  it('falls back to a generic instructor label when no name is provided', () => {
    const it = assignedToPracticeItem({ ...q, authorName: undefined })
    expect(it.assignedBy).toBe('Your instructor')
  })
})

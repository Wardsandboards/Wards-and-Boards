import { describe, it, expect } from 'vitest'
import { applyReview, enqueueDraft } from '../src/lib/contribute'
import { blankDraft } from '../src/constants'
import type { ContribState } from '../src/types'

const base: ContribState = { qs: [], counter: 100 }

describe('enqueueDraft', () => {
  it('adds the draft as an in_review item attributed to the author, immutably', () => {
    const next = enqueueDraft(base, { ...blankDraft, system: 'Cardiology', leadIn: 'Which of the following?' }, 'me@x.edu')
    expect(next.qs).toHaveLength(1)
    expect(next.qs[0].status).toBe('in_review')
    expect(next.qs[0].authorId).toBe('me@x.edu')
    expect(base.qs).toHaveLength(0) // original state untouched
  })
})

describe('applyReview', () => {
  it('publishes after two approvals and mints a citable id', () => {
    let s = enqueueDraft(base, blankDraft, 'author@x.edu')
    const qid = s.qs[0].id
    s = applyReview(s, qid, 'rev1@x.edu', 'approve')
    expect(s.qs[0].status).toBe('in_review')
    s = applyReview(s, qid, 'rev2@x.edu', 'approve')
    expect(s.qs[0].status).toBe('published')
    expect(s.qs[0].citableId).toBe('WB-2026-0101')
    expect(s.counter).toBe(101)
  })

  it('rejects on a single reject decision', () => {
    let s = enqueueDraft(base, blankDraft, 'author@x.edu')
    s = applyReview(s, s.qs[0].id, 'rev1@x.edu', 'reject')
    expect(s.qs[0].status).toBe('rejected')
  })
})

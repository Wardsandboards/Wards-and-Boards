import type { ContribState, Draft } from '../types'

// Pure state transitions for the authoring pipeline. Kept out of the UI so the
// rules (two approvals publish, one rejection rejects) are testable in isolation
// and will map cleanly onto a real backend later.

/** Add a passing draft to the queue as an in-review item by this author. */
export function enqueueDraft(state: ContribState, draft: Draft, authorId: string): ContribState {
  const next: ContribState = JSON.parse(JSON.stringify(state))
  next.qs.push({
    id: 'c' + Date.now(),
    citableId: null,
    status: 'in_review',
    caseId: null,
    caseTitle: null,
    ...JSON.parse(JSON.stringify(draft)),
    authorId,
    reviews: [],
  })
  return next
}

/**
 * Record a review decision. A single reject rejects the item; the second
 * approval publishes it and mints its citable id.
 */
export function applyReview(state: ContribState, qid: string, reviewerId: string, decision: string): ContribState {
  const next: ContribState = JSON.parse(JSON.stringify(state))
  const q = next.qs.find((x) => x.id === qid)
  if (!q) return next
  q.reviews.push({ reviewerId, decision })
  const approvals = q.reviews.filter((r) => r.decision === 'approve').length
  if (decision === 'reject') q.status = 'rejected'
  else if (approvals >= 2) {
    q.status = 'published'
    next.counter += 1
    q.citableId = 'WB-2026-' + String(next.counter).padStart(4, '0')
  }
  return next
}

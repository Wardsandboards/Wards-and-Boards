import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../src/App'
import { AdminQueue, ContributorApplication } from '../src/components/auth'
import type { PendingApp } from '../src/types'

const noop = () => {}

describe('AdminQueue', () => {
  const pending: PendingApp[] = [
    { id: 'u-123', name: 'Dr. Lee', email: 'lee@hosp.org', training: 'Resident', institution: 'County', npi: '1234567890' },
  ]

  it('renders each pending applicant with their verification details', () => {
    render(<AdminQueue pending={pending} onDecide={noop} />)
    expect(screen.getByText('Dr. Lee')).toBeTruthy()
    expect(screen.getByText(/Resident · County · verify: 1234567890/)).toBeTruthy()
  })

  it('decides by the applicant id, not their email', () => {
    const onDecide = vi.fn()
    render(<AdminQueue pending={pending} onDecide={onDecide} />)
    fireEvent.click(screen.getByText('Approve'))
    expect(onDecide).toHaveBeenCalledWith('u-123', 'approve')
  })

  it('shows the empty state with no applications', () => {
    render(<AdminQueue pending={[]} onDecide={noop} />)
    expect(screen.getByText(/No pending applications/)).toBeTruthy()
  })
})

describe('ContributorApplication', () => {
  it('shows the pending notice when the application is under review', () => {
    render(<ContributorApplication name="Dr. Lee" appStatus="pending" onApply={noop} />)
    expect(screen.getByText('Application received')).toBeTruthy()
    expect(screen.queryByText('Submit application')).toBeNull()
  })

  it('shows the apply form (with a resubmit notice) after a denial', () => {
    render(<ContributorApplication name="Dr. Lee" appStatus="denied" onApply={noop} />)
    expect(screen.getByText(/previous application was not approved/)).toBeTruthy()
    expect(screen.getByText('Submit application')).toBeTruthy()
  })
})

describe('demo mode', () => {
  beforeEach(() => { localStorage.clear(); window.history.pushState(null, '', '/') })

  it('previews as a sample student without signing in, and exits cleanly', () => {
    render(<App />)
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Sign in' }))
    fireEvent.click(screen.getByText(/Preview as a sample student/))
    expect(screen.getByText(/Demo mode/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Exit demo' }))
    expect(screen.queryByText(/Demo mode/)).toBeNull()
  })
})

// End-to-end of the localStorage (no backend) path: a learner applies, then an
// admin approves them. This exercises the App-level wiring (pendingApps,
// decideApp, the admin gate) that the DB path mirrors.
describe('contributor flow (mock backend)', () => {
  beforeEach(() => localStorage.clear())

  const navClick = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

  it('lets a learner apply and an admin approve them', () => {
    render(<App />)

    // Sign in as the student demo account.
    navClick('Sign in')
    fireEvent.click(screen.getByText('Sam (student)'))

    // As a learner, Contribute shows the application form (not the workspace).
    navClick('Contribute')
    fireEvent.change(screen.getByPlaceholderText(/Stanford Medicine/), { target: { value: 'County Hospital' } })
    fireEvent.change(screen.getByPlaceholderText(/Doximity/), { target: { value: '1234567890' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(screen.getByText('Application received')).toBeTruthy()

    // Switch to the seeded admin and approve from the queue.
    navClick('Sign out')
    navClick('Sign in')
    fireEvent.click(screen.getByText('Aaron Frank, MD'))
    navClick('Admin')
    const queue = screen.getByText('Sam (student)').closest('.appq') as HTMLElement
    fireEvent.click(within(queue).getByRole('button', { name: 'Approve' }))

    // Queue is now empty (the only applicant was approved).
    expect(screen.getByText(/No pending applications/)).toBeTruthy()
  })

  it('publishes a question on the second approval and surfaces it in Practice', () => {
    // Seed an in-review item that already has one approval (by Dr. Chen).
    localStorage.setItem('os_contrib', JSON.stringify({
      counter: 100,
      qs: [{
        id: 'c1', citableId: null, status: 'in_review', caseId: null, caseTitle: null,
        level: 'step1', system: 'Cardiology', vignette: 'A 60-year-old patient with exertional dyspnea.',
        leadIn: 'Which mechanism best explains the finding?', options: ['Alpha', 'Bravo', 'Charlie', 'Delta'],
        answerIndex: 1, explanation: 'Bravo is correct because of preload.',
        authorId: 'rivera@stanford.edu', reviews: [{ reviewerId: 'chen@stanford.edu', decision: 'approve' }],
      }],
    }))
    render(<App />)

    // A third contributor (not author, not prior reviewer) casts the 2nd approval.
    navClick('Sign in')
    fireEvent.click(screen.getByText('Dr. Okafor'))
    navClick('Contribute')
    fireEvent.click(screen.getByRole('button', { name: /Review queue/ }))
    expect(screen.getByText(/1 approved/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    // It leaves the review queue and appears in the Practice bank as Community.
    expect(screen.getByText(/Review queue is empty/)).toBeTruthy()
    navClick('Practice')
    expect(screen.getByText('A 60-year-old patient with exertional dyspnea.')).toBeTruthy()
    expect(screen.getByText('Community')).toBeTruthy()
  })
})

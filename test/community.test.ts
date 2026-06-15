import { describe, it, expect } from 'vitest'
import { authorStub, communityAttribution } from '../src/lib/questions'

describe('authorStub', () => {
  it('derives initials from the name, dropping a Dr./Prof. prefix', () => {
    expect(authorStub('u1', 'Dr. Ada Lovelace', 'Resident', 'County').initials).toBe('AL')
  })

  it('is deterministic in color for the same id', () => {
    expect(authorStub('u1', 'Ada Lovelace', '', '').color).toBe(authorStub('u1', 'Different Name', '', '').color)
  })

  it('falls back to safe defaults for empty input', () => {
    const a = authorStub('', '', '', '')
    expect(a.name).toBe('Contributor')
    expect(a.initials).toBe('?')
    expect(a.photo).toBeNull()
  })
})

describe('communityAttribution', () => {
  const base = { author_id: 'a1', author_name: 'Dr. Lee', author_creds: 'Cardiology fellow', author_institution: 'Stanford' }

  it('uses the real author and two real reviewer names', () => {
    const att = communityAttribution({ ...base, reviewer_names: ['Dr. Chen', 'Dr. Okafor'] })
    expect(att.author.name).toBe('Dr. Lee')
    expect(att.author.creds).toBe('Cardiology fellow')
    expect(att.reviewers.map((r) => r.name)).toEqual(['Dr. Chen', 'Dr. Okafor'])
  })

  it('always yields exactly two reviewers, even when names are missing', () => {
    const att = communityAttribution({ ...base, reviewer_names: [] })
    expect(att.reviewers).toHaveLength(2)
    expect(att.reviewers[0].name).toBe('Peer reviewer')
  })
})

import { describe, it, expect } from 'vitest'
import { buildRoute, parseRoute } from '../src/lib/router'

describe('parseRoute', () => {
  it('maps the root to home', () => {
    expect(parseRoute('/')).toEqual({ mode: 'home', caseId: null, authorId: null })
    expect(parseRoute('')).toEqual({ mode: 'home', caseId: null, authorId: null })
  })

  it('maps top-level views', () => {
    expect(parseRoute('/practice').mode).toBe('practice')
    expect(parseRoute('/contribute').mode).toBe('contribute')
    expect(parseRoute('/admin').mode).toBe('admin')
  })

  it('pulls a case id out of /learn/<id>', () => {
    expect(parseRoute('/learn')).toEqual({ mode: 'learn', caseId: null, authorId: null })
    expect(parseRoute('/learn/aortic-stenosis')).toEqual({ mode: 'learn', caseId: 'aortic-stenosis', authorId: null })
  })

  it('pulls an author id out of /authors/<id>', () => {
    expect(parseRoute('/authors/rivera')).toEqual({ mode: 'authors', caseId: null, authorId: 'rivera' })
  })

  it('falls back to home on an unknown path, and tolerates trailing slashes', () => {
    expect(parseRoute('/nope').mode).toBe('home')
    expect(parseRoute('/learn/aortic-stenosis/').caseId).toBe('aortic-stenosis')
  })
})

describe('buildRoute', () => {
  it('is the inverse of parseRoute for each view', () => {
    expect(buildRoute({ mode: 'home' })).toBe('/')
    expect(buildRoute({ mode: 'practice' })).toBe('/practice')
    expect(buildRoute({ mode: 'learn', caseId: 'aortic-stenosis' })).toBe('/learn/aortic-stenosis')
    expect(buildRoute({ mode: 'learn', caseId: null })).toBe('/learn')
    expect(buildRoute({ mode: 'authors', authorId: 'rivera' })).toBe('/authors/rivera')
    expect(buildRoute({ mode: 'authors', authorId: null })).toBe('/authors')
  })

  it('round-trips a case path', () => {
    const r = parseRoute('/learn/chf-frank-starling')
    expect(buildRoute(r)).toBe('/learn/chf-frank-starling')
  })
})

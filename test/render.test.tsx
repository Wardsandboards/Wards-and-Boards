import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from '../src/App'

// Smoke test: render the whole app once. Because the case data is cast
// loosely from the original JS, this catches any data-shape mismatch that
// would throw at render time (Landing reaches into cases[0], the Frank-Starling
// curve, a mini-question, and the first board question).
describe('App renders', () => {
  it('renders the home view without throwing', () => {
    const html = renderToString(<App />)
    expect(html).toContain('Wards')
    expect(html).toContain('wardsandboards.com')
    // Landing pulled real case data (the first ward moment scenario)
    expect(html).toContain('Ward Moment')
  })
})

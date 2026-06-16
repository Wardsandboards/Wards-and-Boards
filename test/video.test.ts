import { describe, it, expect } from 'vitest'
import { youtubeEmbedUrl } from '../src/lib/video'

describe('youtubeEmbedUrl', () => {
  const EMBED = 'https://www.youtube.com/embed/dQw4w9WgXcQ'

  it('parses the common YouTube link shapes', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(EMBED)
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(EMBED)
    expect(youtubeEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(EMBED)
    expect(youtubeEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(EMBED)
    expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe(EMBED)
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe(EMBED)
  })

  it('returns null for empty or non-YouTube input', () => {
    expect(youtubeEmbedUrl('')).toBeNull()
    expect(youtubeEmbedUrl(null)).toBeNull()
    expect(youtubeEmbedUrl('https://example.com/video')).toBeNull()
  })
})

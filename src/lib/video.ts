// Turn a pasted YouTube link into an embeddable URL. Accepts watch?v=, youtu.be/,
// /shorts/, /embed/, or a bare 11-character id. Returns null if it isn't YouTube,
// so callers can simply skip the embed.
export function youtubeEmbedUrl(input: string | null | undefined): string | null {
  const url = (input || '').trim()
  if (!url) return null
  let id = ''
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) { id = m[1]; break }
  }
  if (!id && /^[A-Za-z0-9_-]{11}$/.test(url)) id = url // bare id
  return id ? 'https://www.youtube.com/embed/' + id : null
}

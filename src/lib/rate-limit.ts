const requests = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 60

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const hits = (requests.get(key) || []).filter((t) => t > windowStart)
  if (hits.length >= MAX_REQUESTS) return { allowed: false, remaining: 0 }
  hits.push(now)
  requests.set(key, hits)
  return { allowed: true, remaining: MAX_REQUESTS - hits.length }
}

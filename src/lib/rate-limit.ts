// RATE LIMITER — simple in-memory IP-based limiter for Gemini endpoints
// Prevents API credit abuse. Resets on server restart (fine for hackathon/Vercel).

const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, maxRequests = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = requests.get(ip)

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

export function rateLimitResponse() {
  return Response.json(
    { error: 'Too many requests — please wait a moment' },
    { status: 429 }
  )
}

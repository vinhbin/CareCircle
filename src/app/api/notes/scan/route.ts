// PHOTO SCAN — OCR via Gemini multimodal
// POST /api/notes/scan — Send base64 image → Gemini extracts text → returns { extractedText }
// Used by the "Scan Photo" tab in the Add Note dialog

import type { NextRequest } from 'next/server'
import { extractTextFromImage } from '@/lib/gemini'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return rateLimitResponse()

  const { image, mimeType } = await req.json()

  if (!image || !mimeType) {
    return Response.json({ error: 'image (base64) and mimeType are required' }, { status: 400 })
  }

  if (image.length > 10_000_000) {
    return Response.json({ error: 'Image too large — max 7.5 MB' }, { status: 400 })
  }

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return Response.json({ error: 'Unsupported image type' }, { status: 400 })
  }

  try {
    const extractedText = await extractTextFromImage(image, mimeType)
    return Response.json({ extractedText })
  } catch (err) {
    console.error('Gemini OCR failed:', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({ extractedText: '', error: 'OCR unavailable — please type the note manually' })
  }
}

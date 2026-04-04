// PHOTO SCAN — OCR via Gemini multimodal
// POST /api/notes/scan — Send base64 image → Gemini extracts text → returns { extractedText }
// Used by the "Scan Photo" tab in the Add Note dialog

import type { NextRequest } from 'next/server'
import { extractTextFromImage } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { image, mimeType } = await req.json()

  if (!image || !mimeType) {
    return Response.json({ error: 'image (base64) and mimeType are required' }, { status: 400 })
  }

  try {
    const extractedText = await extractTextFromImage(image, mimeType)
    return Response.json({ extractedText })
  } catch (err) {
    console.error('Gemini OCR failed:', err)
    return Response.json({ error: 'Failed to extract text from image' }, { status: 500 })
  }
}

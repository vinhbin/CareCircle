// SUMMARY TRANSLATION
// POST /api/summary/translate — Translate summary text into any supported language via Gemini

import type { NextRequest } from 'next/server'
import { translateText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { text, language } = await req.json()

  if (!text || !language) {
    return Response.json({ error: 'text and language are required' }, { status: 400 })
  }

  try {
    const translatedText = await translateText(text, language)
    return Response.json({ translatedText })
  } catch (err) {
    console.error('Gemini translate failed:', err)
    return Response.json({ error: 'Failed to translate text' }, { status: 500 })
  }
}

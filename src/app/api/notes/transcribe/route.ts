// VOICE MEMO TRANSCRIPTION — audio → Gemini multimodal → transcribed text
// POST /api/notes/transcribe — Send base64 audio → Gemini transcribes → returns { transcribedText }
// Used by the "Voice Memo" tab in the Add Note dialog

import type { NextRequest } from 'next/server'
import { transcribeAudio } from '@/lib/gemini'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
]

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return rateLimitResponse()

  const { audio, mimeType } = await req.json()

  if (!audio || !mimeType) {
    return Response.json({ error: 'audio (base64) and mimeType are required' }, { status: 400 })
  }

  if (audio.length > 13_000_000) {
    return Response.json({ error: 'Audio too large — max 10 MB' }, { status: 400 })
  }

  if (!ALLOWED_AUDIO_TYPES.includes(mimeType)) {
    return Response.json({ error: 'Unsupported audio type' }, { status: 400 })
  }

  try {
    const transcribedText = await transcribeAudio(audio, mimeType)
    return Response.json({ transcribedText })
  } catch (err) {
    console.error('Gemini transcription failed:', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({ transcribedText: '', error: 'Transcription unavailable — type your notes manually' })
  }
}

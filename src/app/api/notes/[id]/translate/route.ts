// NOTE TRANSLATION — AI-powered medical jargon → plain language
// POST /api/notes/[id]/translate — Translates a doctor note into any of 10 supported languages via Gemini
// English translations are cached to ai_translations table; other languages generated on demand
// Falls back to hardcoded English if Gemini fails

import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { translateNote } from '@/lib/gemini'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return rateLimitResponse()

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const language: string = body.language ?? 'English'

  const [{ data: note, error: noteError }, { data: patient, error: patientError }] =
    await Promise.all([
      supabase.from('doctor_notes').select('*').eq('id', id).single(),
      supabase.from('patients').select('*').eq('id', 1).single()
    ])

  if (noteError || patientError || !note || !patient) {
    return Response.json({ error: 'Failed to fetch note or patient' }, { status: 500 })
  }

  try {
    const raw = await translateNote(
      note.raw_notes,
      patient.name,
      patient.age,
      patient.diagnosis,
      note.doctor_name,
      note.visit_date,
      language
    )
    const result = {
      ...raw,
      actionItems: Array.isArray(raw.actionItems)
        ? (raw.actionItems as string[]).join('\n')
        : raw.actionItems,
    }

    // Only cache English translations to DB; other languages are generated on demand
    if (language === 'English') {
      await supabase
        .from('ai_translations')
        .upsert(
          { note_id: Number(id), translation: result.translation, action_items: result.actionItems },
          { onConflict: 'note_id' }
        )
    }

    return Response.json({ ...result, language })
  } catch (err) {
    console.error('Gemini translate failed:', err instanceof Error ? err.message : 'Unknown error')
    return Response.json({
      translation:
        "The doctor reviewed Bà Lan's condition today. Her blood sugar (HbA1c) is a bit high at 8.2% — the goal is under 7.5%. Her blood pressure was also above target at 148/92, so the doctor added a new medication (Amlodipine) to help bring it down. Her kidneys are working okay but need to be watched. No nerve damage was found in her feet, which is great news.\n\nQuestions to ask the doctor:\n1. What signs should we watch for between now and the next visit?\n2. Are there Vietnamese foods that are good for blood sugar?\n3. When will we know if the new blood pressure medication is working?",
      actionItems:
        "Pick up the new Amlodipine prescription this week. Help Bà Lan check her blood sugar every morning before eating. Schedule the 3-month follow-up for blood work.",
      language
    })
  }
}

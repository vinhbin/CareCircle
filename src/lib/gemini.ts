import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

function parseJSON(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned)
}

export async function translateNote(
  rawNotes: string,
  patientName: string,
  age: number,
  diagnosis: string,
  doctor: string,
  date: string,
  language: string = 'English'
) {
  const prompt = `You are a compassionate medical translator helping a family understand their loved one's care.

Patient: ${patientName}, ${age}, ${diagnosis}
Doctor's note from ${doctor} on ${date}:
${rawNotes}

Translate this into warm, clear plain ${language} for a family caregiver with no medical background.
- Use simple language — write as if explaining to a family member, not a doctor
- Highlight anything that needs action TODAY
- Keep it under 200 words total
- End with a "Questions to ask the doctor:" section followed by 2-3 questions
- The entire response must be written in ${language}

Respond ONLY as valid JSON with no markdown, no code fences, no extra text: { "translation": "...", "actionItems": "..." }`

  const result = await model.generateContent(prompt)
  return parseJSON(result.response.text()) as { translation: string; actionItems: string }
}

export async function generateWeeklySummary(params: {
  patientName: string
  age: number
  diagnosis: string
  weekStart: string
  medications: string
  visitNotes: string
  completedTasks: number
  totalTasks: number
}) {
  const prompt = `You are summarizing a week of care for a family managing a loved one's serious illness.

Patient: ${params.patientName}, ${params.age}, ${params.diagnosis}
Week of: ${params.weekStart}
Medications: ${params.medications}
Doctor visits this week: ${params.visitNotes}
Tasks completed: ${params.completedTasks}/${params.totalTasks}

Write a warm, clear weekly summary for the whole family.
Include: (1) how ${params.patientName} did overall this week (2-3 sentences), (2) what to watch for next week, (3) top 3 action items for the family.
Tone: caring, clear, no jargon. Under 200 words.

Respond ONLY as valid JSON with no markdown, no code fences, no extra text: { "summaryText": "...", "watchFor": "...", "actionItems": "..." }`

  const result = await model.generateContent(prompt)
  return parseJSON(result.response.text()) as { summaryText: string; watchFor: string; actionItems: string }
}

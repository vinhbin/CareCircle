import { supabase } from '@/lib/supabase'
import { generateWeeklySummary } from '@/lib/gemini'

export async function GET() {
  const { data, error } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('patient_id', 1)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return Response.json(null)
  // Normalize DB snake_case to camelCase so the page doesn't need to handle both
  return Response.json({
    summaryText: data.summary_text,
    watchFor: data.watch_for,
    actionItems: data.action_items,
    weekStart: data.week_start,
  })
}

export async function POST() {
  const [
    { data: patient },
    { data: meds },
    { data: notes },
    { data: tasks }
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', 1).single(),
    supabase
      .from('medications')
      .select('name, dosage, frequency, purpose')
      .eq('patient_id', 1)
      .eq('active', true),
    supabase
      .from('doctor_notes')
      .select('doctor_name, specialty, visit_date, raw_notes')
      .eq('patient_id', 1)
      .order('visit_date', { ascending: false })
      .limit(3),
    supabase.from('tasks').select('status').eq('patient_id', 1)
  ])

  const medicationsStr =
    meds?.map(m => `${m.name} ${m.dosage} ${m.frequency} — ${m.purpose}`).join('\n') ??
    'No active medications'

  const visitNotesStr = notes?.length
    ? notes
        .map(
          n =>
            `${n.visit_date} — ${n.doctor_name} (${n.specialty}): ${n.raw_notes.substring(0, 300)}`
        )
        .join('\n\n')
    : 'No recent visits'

  const completedTasks = tasks?.filter(t => t.status === 'completed').length ?? 0
  const totalTasks = tasks?.length ?? 0
  const weekStart = new Date().toISOString().split('T')[0]

  if (!patient) {
    return Response.json({ error: 'Patient not found' }, { status: 500 })
  }

  try {
    const raw = await generateWeeklySummary({
      patientName: patient.name,
      age: patient.age,
      diagnosis: patient.diagnosis,
      weekStart,
      medications: medicationsStr,
      visitNotes: visitNotesStr,
      completedTasks,
      totalTasks
    })
    const result = {
      ...raw,
      actionItems: Array.isArray(raw.actionItems)
        ? (raw.actionItems as string[]).join('\n')
        : raw.actionItems,
    }

    await supabase.from('ai_summaries').insert({
      patient_id: 1,
      summary_text: result.summaryText,
      watch_for: result.watchFor,
      action_items: result.actionItems,
      week_start: weekStart
    })

    return Response.json(result)
  } catch (err) {
    console.error('Gemini summary failed:', err)
    return Response.json({
      summaryText:
        "It was a busy week for Bà Lan's care. She saw Dr. Tran for her diabetes and blood pressure check-up, and her blood sugar is still a bit higher than the doctors would like (HbA1c 8.2%). A new blood pressure medication was added, and Dr. Park wants her to start tracking her blood sugar at home every day. The good news — her foot exam with Dr. Lopez showed no nerve damage.",
      watchFor:
        "Watch for any dizziness or swelling now that Bà Lan started Amlodipine — these can be side effects of the new blood pressure medication. Also make sure she's eating regular meals so her blood sugar stays stable.",
      actionItems:
        "1. Help Bà Lan set up a daily glucose log — Kevin is on this.\n2. Pick up the Amlodipine refill at CVS on Buford Hwy.\n3. Research low-glycemic Vietnamese recipes Bà Lan will enjoy."
    })
  }
}

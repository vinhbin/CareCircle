// FAMILY OVERVIEW
// GET /api/family — Returns patient info, family members, 5 most recent tasks, and active medication count
// Used by: dashboard page, user selection page

import { supabase } from '@/lib/supabase'

export async function GET() {
  const [
    { data: patient, error: patientError },
    { data: members },
    { data: tasks },
    { count: activeMedCount }
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', 1).single(),
    supabase.from('family_members').select('*').eq('patient_id', 1),
    supabase
      .from('tasks')
      .select('*, family_members(name)')
      .eq('patient_id', 1)
      .order('due_date', { ascending: true })
      .limit(5),
    supabase
      .from('medications')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', 1)
      .eq('active', true)
  ])

  if (patientError) return Response.json({ error: patientError.message }, { status: 500 })

  return Response.json({ patient, members, tasks, activeMedCount })
}

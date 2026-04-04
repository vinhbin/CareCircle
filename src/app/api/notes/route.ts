import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('doctor_notes')
    .select('*, ai_translations(*)')
    .eq('patient_id', 1)
    .order('visit_date', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

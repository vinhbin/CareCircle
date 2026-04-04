// PERSON A — Medication Tracker
// Returns: Medication[]
//
// Components to build:
//   shadcn Table — name, dosage, frequency, administered_by, start_date
//   Badge        — green = active, gray = inactive
//   Read-only, no edit/delete needed

import { supabase } from '@/lib/supabase'

export default async function MedicationsPage() {
  const { data: medications } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', 1)
    .order('active', { ascending: false })

  return (
    <div>
      <h1>Medications — build me (Person A)</h1>
      <pre className="text-xs">{JSON.stringify(medications, null, 2)}</pre>
    </div>
  )
}

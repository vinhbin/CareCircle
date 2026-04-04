// PERSON A — Dashboard
// Returns: { patient, members, tasks, activeMedCount }
//
// Components to build:
//   PatientCard     — name, age, diagnosis, primary_doctor, emergency_contact
//   FamilyAvatars   — Avatar row with name + role badge per member
//   TaskSummary     — pending/completed counts + list of upcoming tasks
//   MedCountBadge   — "4 active medications"

import { supabase } from '@/lib/supabase'

export default async function DashboardPage() {
  const [
    { data: patient },
    { data: members },
    { data: tasks },
    { count: activeMedCount }
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', 1).single(),
    supabase.from('family_members').select('*').eq('patient_id', 1),
    supabase.from('tasks').select('*, family_members(name)').eq('patient_id', 1).order('due_date', { ascending: true }).limit(5),
    supabase.from('medications').select('*', { count: 'exact', head: true }).eq('patient_id', 1).eq('active', true)
  ])

  return (
    <div>
      <h1>Dashboard — build me (Person A)</h1>
      <pre className="text-xs">{JSON.stringify({ patient, members, tasks, activeMedCount }, null, 2)}</pre>
    </div>
  )
}

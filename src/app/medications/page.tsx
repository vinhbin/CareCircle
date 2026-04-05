// PERSON A — Medication Tracker
// Fetches: GET /api/medications → all medications
// Fetches: GET /api/medications/log?date=YYYY-MM-DD → today's dose logs
// Mutates: POST /api/medications/log → confirm dose (with overdose warning)
// Mutates: POST /api/medications → add new medication

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Pill, Activity, PillBottle, CalendarDays, User2, Clock,
  Plus, AlertTriangle, CheckCircle2, ShieldAlert,
} from 'lucide-react'

type Medication = {
  id: number; name: string; dosage: string; frequency: string
  purpose: string; administered_by: string; start_date: string; active: boolean
}
type DoseLog = {
  id: number; medication_id: number; logged_at: string
  family_members: { name: string }; medications: { name: string; frequency: string }
}

/* ─── Parse frequency into max daily doses ─── */
function parseMaxDoses(frequency: string): number {
  const f = frequency.toLowerCase()
  if (f.includes('three') || f.includes('3x') || f.includes('3 times')) return 3
  if (f.includes('twice') || f.includes('2x') || f.includes('2 times')) return 2
  if (f.includes('four') || f.includes('4x') || f.includes('4 times')) return 4
  if (f.includes('once') || f.includes('1x') || f.includes('daily')) return 1
  if (f.includes('needed') || f.includes('prn')) return 99
  return 1
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function frequencyColor(freq: string) {
  const f = freq.toLowerCase()
  if (f.includes('twice') || f.includes('2x')) return 'text-violet-600'
  if (f.includes('three') || f.includes('3x')) return 'text-amber-600'
  if (f.includes('needed') || f.includes('prn')) return 'text-zinc-500'
  return 'text-sky-600'
}

export default function MedicationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [meds, setMeds] = useState<Medication[]>([])
  const [logs, setLogs] = useState<DoseLog[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [overdoseDialogOpen, setOverdoseDialogOpen] = useState(false)
  const [pendingDoseMed, setPendingDoseMed] = useState<Medication | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmingDose, setConfirmingDose] = useState<number | null>(null)
  const [addForm, setAddForm] = useState({
    name: '', dosage: '', frequency: '', purpose: '', administered_by: '', start_date: '',
  })

  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

  const fetchData = useCallback(() => {
    fetch('/api/medications')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMeds(data) })
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/medications/log?date=${today}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLogs(data) })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function dosesGivenToday(medId: number) {
    return logs.filter(l => l.medication_id === medId).length
  }

  async function confirmDose(med: Medication, force = false) {
    const given = dosesGivenToday(med.id)
    const max = parseMaxDoses(med.frequency)

    if (given >= max && !force) {
      setPendingDoseMed(med)
      setOverdoseDialogOpen(true)
      return
    }

    setConfirmingDose(med.id)
    await fetch('/api/medications/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medication_id: med.id, family_member_id: user?.id }),
    })
    setConfirmingDose(null)
    fetchData()
  }

  function forceConfirmDose() {
    if (pendingDoseMed) {
      confirmDose(pendingDoseMed, true)
      setOverdoseDialogOpen(false)
      setPendingDoseMed(null)
    }
  }

  async function handleAddMed() {
    if (!addForm.name || !addForm.dosage || !addForm.frequency || !addForm.start_date) return
    setSaving(true)
    try {
      await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, family_member_id: user?.id }),
      })
      setAddDialogOpen(false)
      setAddForm({ name: '', dosage: '', frequency: '', purpose: '', administered_by: '', start_date: '' })
      fetchData()
    } finally { setSaving(false) }
  }

  if (!user) return null

  const activeCount = meds.filter(m => m.active).length
  const inactiveCount = meds.filter(m => !m.active).length

  return (
    <div className="max-w-7xl mx-auto pb-20 lg:pb-8 space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 tracking-tight">Medications</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Prescriptions, doses, and supplement tracking
          </p>
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50">
          <Plus data-icon="inline-start" className="size-3.5" /> Add Medication
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-backwards">
        {[
          { label: 'Total', value: meds.length, icon: Pill, bg: 'bg-rose-50', iconColor: 'text-rose-500', valueColor: 'text-rose-700' },
          { label: 'Active', value: activeCount, icon: Activity, bg: 'bg-emerald-50', iconColor: 'text-emerald-500', valueColor: 'text-emerald-700' },
          { label: 'Inactive', value: inactiveCount, icon: PillBottle, bg: 'bg-zinc-50', iconColor: 'text-zinc-400', valueColor: 'text-zinc-500' },
        ].map(({ label, value, icon: Icon, bg, iconColor, valueColor }) => (
          <Card key={label} className="shadow-md shadow-zinc-100/50 border-zinc-100/60">
            <CardContent className="py-4 lg:py-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${bg} rounded-lg shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                </div>
                <div>
                  <span className={`text-2xl lg:text-3xl font-bold ${valueColor} tracking-tight`}>{value}</span>
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Desktop Table ─── */}
      <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 fill-mode-backwards hidden lg:block">
        <div className="h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-zinc-800">All Prescriptions</CardTitle>
          <CardDescription className="text-xs">Confirm doses to track daily progress</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-zinc-100">
                <TableHead className="pl-6 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Medication</TableHead>
                <TableHead className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Dosage</TableHead>
                <TableHead className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Frequency</TableHead>
                <TableHead className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Today&apos;s Doses</TableHead>
                <TableHead className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Administered By</TableHead>
                <TableHead className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meds.map((med, i) => {
                const given = dosesGivenToday(med.id)
                const max = parseMaxDoses(med.frequency)
                const isPrn = max === 99
                const atLimit = !isPrn && given >= max
                const overLimit = !isPrn && given > max
                const progressPct = isPrn ? 0 : Math.min((given / max) * 100, 100)

                return (
                  <TableRow
                    key={med.id}
                    className={`border-zinc-50 transition-colors hover:bg-rose-50/40 ${!med.active ? 'opacity-50' : ''} animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-backwards`}
                    style={{ animationDelay: `${200 + i * 50}ms` }}
                  >
                    <TableCell className="pl-6">
                      {med.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] font-semibold px-2 py-0.5">Active</Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 border-none text-[10px] font-semibold px-2 py-0.5">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium text-zinc-800">{med.name}</p>
                      {med.purpose && <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[260px] truncate">{med.purpose}</p>}
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-zinc-700 font-medium">{med.dosage}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[13px] font-medium ${frequencyColor(med.frequency)}`}>{med.frequency}</span>
                    </TableCell>
                    <TableCell>
                      {isPrn ? (
                        <span className="text-[13px] text-zinc-400">{given} given</span>
                      ) : (
                        <div className="w-28">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[12px] font-semibold ${overLimit ? 'text-red-600' : atLimit ? 'text-emerald-600' : 'text-zinc-600'}`}>
                              {given}/{max}
                            </span>
                            {overLimit && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                            {atLimit && !overLimit && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <Progress
                            value={progressPct}
                            className={`h-1.5 ${overLimit ? '[&>div]:bg-red-500' : atLimit ? '[&>div]:bg-emerald-500' : '[&>div]:bg-sky-500'}`}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-zinc-600">{med.administered_by}</span>
                    </TableCell>
                    <TableCell className="pr-6">
                      {med.active ? (
                        <Button
                          size="xs"
                          variant={atLimit ? 'outline' : 'default'}
                          className={atLimit && !overLimit
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : overLimit
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50'
                          }
                          disabled={confirmingDose === med.id}
                          onClick={() => confirmDose(med)}
                        >
                          {confirmingDose === med.id ? 'Logging...' :
                            overLimit ? 'Over Limit' :
                            atLimit ? 'Complete' :
                            'Confirm Dose'}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-zinc-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {meds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                      <Pill className="w-6 h-6 text-rose-200" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600">No medications recorded</p>
                    <p className="text-xs text-zinc-400 mt-1">Add a medication to start tracking</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ─── Mobile Cards ─── */}
      <div className="space-y-2.5 lg:hidden animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 fill-mode-backwards">
        {meds.map((med, i) => {
          const given = dosesGivenToday(med.id)
          const max = parseMaxDoses(med.frequency)
          const isPrn = max === 99
          const atLimit = !isPrn && given >= max
          const overLimit = !isPrn && given > max
          const progressPct = isPrn ? 0 : Math.min((given / max) * 100, 100)

          return (
            <Card
              key={med.id}
              className={`shadow-md shadow-zinc-100/50 border-zinc-100/60 overflow-hidden transition-all hover:border-rose-200 hover:shadow-rose-100/40 animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-backwards ${!med.active ? 'opacity-50' : ''}`}
              style={{ animationDelay: `${200 + i * 60}ms` }}
            >
              <CardContent className="py-3.5">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-medium text-zinc-800 truncate">{med.name}</p>
                      {med.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] font-semibold px-1.5 py-0 shrink-0">Active</Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 border-none text-[10px] font-semibold px-1.5 py-0 shrink-0">Inactive</Badge>
                      )}
                    </div>
                    {med.purpose && <p className="text-[11px] text-zinc-400 mb-2">{med.purpose}</p>}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      <span className="flex items-center gap-1 text-zinc-600 font-medium">
                        <Pill className="w-3 h-3 text-rose-400" /> {med.dosage}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${frequencyColor(med.frequency)}`}>
                        <Clock className="w-3 h-3" /> {med.frequency}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <User2 className="w-3 h-3" /> {med.administered_by}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <CalendarDays className="w-3 h-3" /> {formatDate(med.start_date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dose progress + confirm */}
                {med.active && (
                  <div className="flex items-center gap-3 pt-2.5 border-t border-zinc-100 mt-1">
                    {isPrn ? (
                      <span className="text-[11px] text-zinc-400 flex-1">{given} dose{given !== 1 ? 's' : ''} given today</span>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-semibold ${overLimit ? 'text-red-600' : atLimit ? 'text-emerald-600' : 'text-zinc-500'}`}>
                            {given}/{max} doses today
                          </span>
                          {overLimit && <AlertTriangle className="w-3 h-3 text-red-500" />}
                          {atLimit && !overLimit && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </div>
                        <Progress
                          value={progressPct}
                          className={`h-1.5 ${overLimit ? '[&>div]:bg-red-500' : atLimit ? '[&>div]:bg-emerald-500' : '[&>div]:bg-sky-500'}`}
                        />
                      </div>
                    )}
                    <Button
                      size="xs"
                      variant={atLimit ? 'outline' : 'default'}
                      className={atLimit && !overLimit
                        ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        : overLimit
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50'
                      }
                      disabled={confirmingDose === med.id}
                      onClick={() => confirmDose(med)}
                    >
                      {confirmingDose === med.id ? '...' : overLimit ? 'Over' : atLimit ? 'Done' : 'Confirm'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {meds.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
              <Pill className="w-6 h-6 text-rose-200" />
            </div>
            <p className="text-sm font-medium text-zinc-600">No medications recorded</p>
            <p className="text-xs text-zinc-400 mt-1">Add a medication to start tracking</p>
          </div>
        )}
      </div>

      {/* ─── Overdose Warning Dialog ─── */}
      <Dialog open={overdoseDialogOpen} onOpenChange={setOverdoseDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-red-700">Dosage Limit Reached</DialogTitle>
              </div>
            </div>
            <DialogDescription className="pt-2">
              <strong className="text-zinc-700">{pendingDoseMed?.name}</strong> has already reached the recommended
              {' '}<strong className="text-zinc-700">{parseMaxDoses(pendingDoseMed?.frequency ?? '')}</strong> dose{parseMaxDoses(pendingDoseMed?.frequency ?? '') > 1 ? 's' : ''} for
              today ({pendingDoseMed?.frequency}).
              <span className="block mt-2 text-red-600 font-medium">
                Exceeding the prescribed frequency could be harmful. Are you sure?
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOverdoseDialogOpen(false); setPendingDoseMed(null) }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={forceConfirmDose}>
              Log Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Medication Dialog ─── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>Add a new prescription or supplement to track.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input id="med-name" placeholder="e.g. Metformin" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med-dosage">Dosage</Label>
                <Input id="med-dosage" placeholder="e.g. 500 mg oral" value={addForm.dosage} onChange={e => setAddForm(f => ({ ...f, dosage: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-freq">Frequency</Label>
                <Input id="med-freq" placeholder="e.g. Twice daily" value={addForm.frequency} onChange={e => setAddForm(f => ({ ...f, frequency: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med-start">Start Date</Label>
                <Input id="med-start" type="date" value={addForm.start_date} onChange={e => setAddForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-purpose">Purpose <span className="text-zinc-400 font-normal">(optional)</span></Label>
              <Textarea id="med-purpose" placeholder="What is this medication for?" rows={2} value={addForm.purpose} onChange={e => setAddForm(f => ({ ...f, purpose: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-admin">Administered By <span className="text-zinc-400 font-normal">(optional)</span></Label>
              <Input id="med-admin" placeholder="e.g. Minh (morning)" value={addForm.administered_by} onChange={e => setAddForm(f => ({ ...f, administered_by: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddMed}
              disabled={saving || !addForm.name || !addForm.dosage || !addForm.frequency || !addForm.start_date}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {saving ? 'Saving...' : 'Add Medication'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

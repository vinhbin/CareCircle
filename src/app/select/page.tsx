// USER SELECTION — Family member picker (redesigned with card-based UI)
// Shows family member avatars in polished cards with gradient rings
// Tapping a member stores them in user context and redirects to /dashboard
// "Add Family Member" button opens a dialog to create a new member

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, type FamilyMember } from '@/lib/user-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Heart } from 'lucide-react'

const memberGradients = [
  'from-rose-400/30 to-rose-500',
  'from-sky-400/30 to-sky-500',
  'from-emerald-400/30 to-emerald-500',
  'from-violet-400/30 to-violet-500',
  'from-amber-400/30 to-amber-500',
  'from-teal-400/30 to-teal-500',
]

const memberColors = [
  'bg-rose-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-teal-500',
]

function getColorIndex(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % memberGradients.length
}

export default function UserSelectionPage() {
  const router = useRouter()
  const { user, setUser } = useUser()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', relationship: '', role: 'Support' })
  const [saving, setSaving] = useState(false)

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])

  useEffect(() => {
    fetch('/api/family')
      .then(r => r.json())
      .then(data => setMembers(data.members ?? []))
  }, [])

  function selectMember(member: FamilyMember) {
    setUser(member)
    router.push('/dashboard')
  }

  async function handleAddMember() {
    if (!form.name || !form.relationship) return
    setSaving(true)
    try {
      const res = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const newMember = await res.json()
      setMembers(prev => [...prev, newMember])
      setDialogOpen(false)
      setForm({ name: '', relationship: '', role: 'Support' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50/80 flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 pt-12 pb-6 sm:pt-16 sm:pb-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-200/50">
              <Heart className="text-white" size={26} fill="currentColor" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-800 tracking-tight">CareCircle</h1>
          </div>
          <p className="text-lg text-zinc-400 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-backwards">
            Care Together, Stay Connected
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-backwards">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 mb-2">
              Who&apos;s checking in today?
            </h2>
            <p className="text-base text-zinc-400">
              Select your profile to continue
            </p>
          </div>

          {/* Family member grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
            {members.map((member, i) => {
              const colorIdx = getColorIndex(member.name)
              const gradient = memberGradients[colorIdx]
              const bgColor = memberColors[colorIdx]

              return (
                <button
                  key={member.id}
                  onClick={() => selectMember(member)}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards text-left"
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                >
                  <Card className="relative overflow-hidden p-7 sm:p-8 text-center hover:shadow-xl hover:shadow-rose-100/50 hover:scale-[1.03] transition-all duration-300 border-2 border-transparent hover:border-rose-200/60 rounded-2xl group cursor-pointer">
                    {/* Gradient hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    <div className="relative z-10 flex flex-col items-center gap-4">
                      {/* Avatar with gradient ring */}
                      <div className={`p-1 rounded-full bg-gradient-to-br ${gradient}`}>
                        <Avatar className="size-20 sm:size-24 border-4 border-white">
                          <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
                          <AvatarFallback className={`${bgColor} text-white text-xl sm:text-2xl font-bold`}>
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 mb-0.5">
                          {member.name.split(' ')[0]}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {member.role === 'Primary' ? 'Primary Caregiver' : member.relationship}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              )
            })}
          </div>

          {/* Add member button */}
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500 fill-mode-backwards">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="rounded-xl border-2 border-dashed border-zinc-300 hover:border-rose-400 hover:bg-rose-50 transition-colors text-zinc-500 hover:text-rose-600"
            >
              <Plus size={20} />
              Add Family Member
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto text-center animate-in fade-in duration-500 delay-500 fill-mode-backwards">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <Heart size={16} className="text-rose-500" fill="currentColor" />
            <span className="text-sm text-zinc-400">Caring for</span>
            <span className="text-sm font-semibold text-zinc-800">Ba Lan Nguyen</span>
          </div>
        </div>
      </footer>

      {/* Add member dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Tina Nguyen"
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={form.relationship}
                onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                placeholder="e.g. Granddaughter"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Support"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddMember}
              disabled={saving || !form.name || !form.relationship}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {saving ? 'Adding...' : 'Add to Circle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

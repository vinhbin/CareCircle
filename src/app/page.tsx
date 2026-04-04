// USER SELECTION — Landing page
// Shows family member avatars in a circle grid (Google account picker style)
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
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-rose-600 tracking-tight">CareCircle</h1>
        <p className="text-zinc-500 mt-2">Family care coordination for Bà Lan</p>
      </div>

      <p className="text-zinc-600 font-medium mb-6">Who&apos;s checking in?</p>

      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => selectMember(member)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-rose-200 flex items-center justify-center text-2xl font-bold text-rose-700 group-hover:bg-rose-300 transition-colors">
              {member.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-zinc-800">{member.name.split(' ')[0]}</span>
            <span className="text-xs text-zinc-400">{member.relationship}</span>
          </button>
        ))}

        {/* Add member button */}
        <button
          onClick={() => setDialogOpen(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-3xl text-zinc-400 group-hover:bg-zinc-200 transition-colors">
            +
          </div>
          <span className="text-sm font-medium text-zinc-500">Add Member</span>
          <span className="text-xs text-zinc-400">&nbsp;</span>
        </button>
      </div>

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
            <Button onClick={handleAddMember} disabled={saving || !form.name || !form.relationship}>
              {saving ? 'Adding...' : 'Add to Circle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

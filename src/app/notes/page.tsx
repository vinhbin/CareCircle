// PERSON B — Doctor Notes
// GET  /api/notes                    — All notes with translations joined
// POST /api/notes                    — Create new note (manual or after photo scan)
// POST /api/notes/{id}/translate     — AI translation in any of 10 languages
// POST /api/notes/scan               — Photo → Gemini OCR → extracted text
//
// Features:
//   - Note cards with raw medical text
//   - "Explain in [language]" translate button per note
//   - "Add Doctor Note" dialog with Manual Entry + Scan Photo tabs
//   - Language selector (global for all notes)

'use client'

import { useState, useEffect } from 'react'
import { LANGUAGES } from '@/lib/languages'
import { useUser } from '@/lib/user-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Translation = { translation: string; actionItems: string; language?: string }
type DBTranslation = { translation: string; action_items: string }
type Note = {
  id: number
  doctor_name: string
  specialty: string
  visit_date: string
  raw_notes: string
  ai_translations: DBTranslation[]
}

export default function NotesPage() {
  const { user } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [translations, setTranslations] = useState<Record<number, Translation>>({})
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt')

  // Add Note dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual')
  const [noteForm, setNoteForm] = useState({ doctor_name: '', specialty: '', visit_date: '', raw_notes: '' })
  const [saving, setSaving] = useState(false)

  // Scan state
  const [scanning, setScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => {
        setNotes(data)
        const existing: Record<number, Translation> = {}
        data.forEach((n: Note) => {
          if (n.ai_translations?.length) existing[n.id] = {
            translation: n.ai_translations[0].translation,
            actionItems: n.ai_translations[0].action_items,
          }
        })
        setTranslations(existing)
      })
  }, [])

  async function handleTranslate(noteId: number) {
    setLoading(prev => ({ ...prev, [noteId]: true }))
    try {
      const res = await fetch(`/api/notes/${noteId}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage })
      })
      const result = await res.json()
      setTranslations(prev => ({ ...prev, [noteId]: result }))
    } finally {
      setLoading(prev => ({ ...prev, [noteId]: false }))
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type

      setImagePreview(dataUrl)
      setScanning(true)

      try {
        const res = await fetch('/api/notes/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType }),
        })
        const { extractedText, error } = await res.json()
        if (extractedText) {
          setNoteForm(f => ({ ...f, raw_notes: extractedText }))
        } else {
          alert(error || 'Failed to extract text from image')
        }
      } catch {
        alert('Failed to scan image. Please try again.')
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveNote() {
    if (!noteForm.doctor_name || !noteForm.specialty || !noteForm.visit_date || !noteForm.raw_notes) return
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteForm, family_member_id: user?.id }),
      })
      const newNote = await res.json()
      setNotes(prev => [newNote, ...prev])
      setDialogOpen(false)
      setNoteForm({ doctor_name: '', specialty: '', visit_date: '', raw_notes: '' })
      setImagePreview(null)
      setActiveTab('manual')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-zinc-600">Translate notes into:</label>
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="text-sm border border-zinc-200 rounded-md px-3 py-1.5 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          + Add Doctor Note
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Doctor Notes</h1>
      <p className="text-sm text-zinc-500 mb-6">Medical visit records for Bà Lan. Click &quot;Explain&quot; to translate into plain language.</p>

      {/* Notes list */}
      {notes.map(note => (
        <div key={note.id} className="border rounded-xl p-5 mb-4 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-700">{note.doctor_name}</span>
            <span>·</span>
            <span>{note.specialty}</span>
            <span>·</span>
            <span>{note.visit_date}</span>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed font-mono bg-zinc-50 rounded-lg p-3">{note.raw_notes}</p>

          {translations[note.id] ? (
            <div className="mt-4 p-4 bg-gradient-to-br from-rose-50 to-amber-50 rounded-lg border border-rose-200 text-sm">
              {translations[note.id].language && translations[note.id].language !== 'English' && (
                <span className="inline-block text-xs font-semibold text-rose-500 uppercase tracking-wide mb-2">
                  {translations[note.id].language}
                </span>
              )}
              <p className="whitespace-pre-line text-zinc-700 leading-relaxed">{translations[note.id].translation}</p>
              <p className="mt-3 font-medium text-rose-700">{translations[note.id].actionItems}</p>
              <button
                onClick={() => handleTranslate(note.id)}
                disabled={loading[note.id]}
                className="mt-3 px-3 py-1 text-xs bg-white border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
              >
                {loading[note.id] ? 'Translating...' : `Retranslate in ${selectedLanguage}`}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleTranslate(note.id)}
              disabled={loading[note.id]}
              className="mt-3 px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {loading[note.id]
                ? 'Translating for your family...'
                : `Explain in ${selectedLanguage}`}
            </button>
          )}
        </div>
      ))}

      {/* Add Note Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Doctor Note</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'manual' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'scan' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Scan Photo
            </button>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doctor_name">Doctor Name</Label>
              <Input
                id="doctor_name"
                value={noteForm.doctor_name}
                onChange={e => setNoteForm(f => ({ ...f, doctor_name: e.target.value }))}
                placeholder="e.g. Dr. Jennifer Tran"
              />
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={noteForm.specialty}
                onChange={e => setNoteForm(f => ({ ...f, specialty: e.target.value }))}
                placeholder="e.g. Primary Care"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="visit_date">Visit Date</Label>
            <Input
              id="visit_date"
              type="date"
              value={noteForm.visit_date}
              onChange={e => setNoteForm(f => ({ ...f, visit_date: e.target.value }))}
            />
          </div>

          {/* Manual tab — just a textarea */}
          {activeTab === 'manual' && (
            <div>
              <Label htmlFor="raw_notes">Doctor&apos;s Notes</Label>
              <Textarea
                id="raw_notes"
                value={noteForm.raw_notes}
                onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                placeholder="Paste or type the doctor's notes here..."
                rows={6}
              />
            </div>
          )}

          {/* Scan tab — file input + preview + extracted text */}
          {activeTab === 'scan' && (
            <div className="space-y-3">
              <div>
                <Label>Upload or take a photo</Label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 file:cursor-pointer"
                />
              </div>

              {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Scanned note" className="w-full max-h-48 object-cover" />
                </div>
              )}

              {scanning && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                  <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Reading document with AI...
                </div>
              )}

              {noteForm.raw_notes && activeTab === 'scan' && !scanning && (
                <div>
                  <Label htmlFor="extracted_notes">Extracted Text (review &amp; edit)</Label>
                  <Textarea
                    id="extracted_notes"
                    value={noteForm.raw_notes}
                    onChange={e => setNoteForm(f => ({ ...f, raw_notes: e.target.value }))}
                    rows={6}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setImagePreview(null); setActiveTab('manual') }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={saving || !noteForm.doctor_name || !noteForm.specialty || !noteForm.visit_date || !noteForm.raw_notes}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

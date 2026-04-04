'use client'
// PERSON B — Doctor Notes
// Initial data fetch from: GET /api/notes
// Returns: DoctorNote[] where each note has ai_translations: Translation | null
//
// Components to build:
//   NoteCard        — doctor, specialty, date, raw_notes text
//   TranslateButton — POST /api/notes/{id}/translate on click
//                     loading state: "Translating for your family..." + spinner
//   TranslationPanel — slides in below note: plain English + actionItems + questions
//
// State: track which notes are loading and which have been translated this session

import { useState, useEffect } from 'react'
import { LANGUAGES } from '@/lib/languages'

type Translation = { translation: string; actionItems: string; language?: string }
// Raw shape returned by Supabase (snake_case column names)
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
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [translations, setTranslations] = useState<Record<number, Translation>>({})
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt')

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => {
        setNotes(data)
        // pre-populate existing English translations from DB
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

  return (
    <div>
      {/* Language selector — global for all notes */}
      <div className="flex items-center gap-3 mb-6">
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

      <h1>Doctor Notes — build me (Person B)</h1>
      <p className="text-sm text-zinc-500 mb-4">Data below confirms API is wired up. Replace this with NoteCard components.</p>
      {notes.map(note => (
        <div key={note.id} className="border rounded p-4 mb-4 bg-white">
          <p className="font-semibold">{note.doctor_name} · {note.specialty} · {note.visit_date}</p>
          <p className="text-sm text-zinc-600 mt-1">{note.raw_notes}</p>
          {translations[note.id] ? (
            <div className="mt-3 p-3 bg-rose-50 rounded text-sm">
              {translations[note.id].language && translations[note.id].language !== 'English' && (
                <span className="text-xs font-medium text-rose-500 uppercase tracking-wide">
                  {translations[note.id].language}
                </span>
              )}
              <p className="mt-1 whitespace-pre-line">{translations[note.id].translation}</p>
              <p className="mt-2 font-medium text-rose-700">{translations[note.id].actionItems}</p>
              <button
                onClick={() => handleTranslate(note.id)}
                disabled={loading[note.id]}
                className="mt-3 px-3 py-1 text-xs bg-white border border-rose-300 text-rose-600 rounded hover:bg-rose-50 disabled:opacity-50"
              >
                {loading[note.id] ? 'Translating...' : `Retranslate in ${selectedLanguage}`}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleTranslate(note.id)}
              disabled={loading[note.id]}
              className="mt-3 px-4 py-1.5 text-sm bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
            >
              {loading[note.id]
                ? 'Translating for your family...'
                : `Explain in ${selectedLanguage}`}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

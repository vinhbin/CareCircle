'use client'
// PERSON B — AI Weekly Summary
// GET  /api/summary  — returns latest saved summary or null
// POST /api/summary  — generates new summary via Gemini, saves it, returns it
//
// Components to build:
//   SummaryCard  — narrative paragraph + "Watch For" section + action items list
//   WeekBadge    — "Week of April 6, 2025"
//   EmptyState   — "No summary yet" + "Generate This Week's Summary" button
//   Skeleton     — animated loading card while POST is in-flight

import { useState, useEffect } from 'react'

type Summary = {
  summaryText: string
  watchFor: string
  actionItems: string
  week_start?: string
  weekStart?: string
}

export default function SummaryPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [generating, setGenerating] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetch('/api/summary')
      .then(r => r.json())
      .then(data => {
        if (data) setSummary(data)
      })
      .finally(() => setInitialLoading(false))
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/summary', { method: 'POST' })
      const result = await res.json()
      setSummary(result)
    } finally {
      setGenerating(false)
    }
  }

  if (initialLoading) {
    return <div className="p-8 text-zinc-400">Loading...</div>
  }

  return (
    <div>
      <h1>AI Weekly Summary — build me (Person B)</h1>
      <p className="text-sm text-zinc-500 mb-4">Data below confirms API is wired up. Replace this with SummaryCard components.</p>

      {!summary && !generating && (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">No summary generated yet.</p>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Generate This Week&apos;s Summary
          </button>
        </div>
      )}

      {generating && (
        <div className="p-8 text-zinc-400 animate-pulse">Generating summary for your family...</div>
      )}

      {summary && !generating && (
        <div className="border rounded p-4 bg-white">
          <button
            onClick={handleGenerate}
            className="float-right px-4 py-1.5 text-sm bg-rose-600 text-white rounded hover:bg-rose-700"
          >
            Regenerate
          </button>
          <p className="font-semibold mb-2">Week of {summary.week_start ?? summary.weekStart}</p>
          <p className="text-sm">{summary.summaryText}</p>
          <p className="mt-3 text-sm font-medium text-amber-700">Watch for: {summary.watchFor}</p>
          <p className="mt-3 text-sm whitespace-pre-line">{summary.actionItems}</p>
        </div>
      )}
    </div>
  )
}

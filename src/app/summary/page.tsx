// PERSON B — AI Weekly Summary
// GET  /api/summary            — Returns latest saved summary (or null)
// POST /api/summary            — Generates new summary via Gemini, saves it
// POST /api/summary/translate  — Translates summary text into any language via Gemini
//
// Components:
//   SummaryCard  — narrative paragraph + "Watch For" section + action items list
//   WeekBadge    — "Week of April 6, 2025"
//   EmptyState   — "No summary yet" + "Generate This Week's Summary" button
//   Skeleton     — animated loading card while POST is in-flight
//   Language selector + "Translate" button → translated summary panel below

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { LANGUAGES } from '@/lib/languages'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles, CalendarDays, AlertTriangle, ListChecks,
  RefreshCw, Languages, ChevronRight, FileText
} from 'lucide-react'

type Summary = {
  summaryText: string
  watchFor: string
  actionItems: string
  week_start?: string
  weekStart?: string
}

export default function SummaryPage() {
  const router = useRouter()
  const { user } = useUser()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [generating, setGenerating] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Translation state
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt')
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [translatedLang, setTranslatedLang] = useState<string | null>(null)

  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

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
    setTranslatedText(null)
    setTranslatedLang(null)
    try {
      const res = await fetch('/api/summary', { method: 'POST' })
      const result = await res.json()
      setSummary(result)
    } finally {
      setGenerating(false)
    }
  }

  async function handleTranslate() {
    if (!summary) return
    setTranslating(true)
    try {
      const fullText = [
        summary.summaryText,
        `\n\nWatch For:\n${summary.watchFor}`,
        `\n\nAction Items:\n${summary.actionItems}`,
      ].join('')

      const res = await fetch('/api/summary/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, language: selectedLanguage }),
      })
      const result = await res.json()
      if (result.translatedText) {
        setTranslatedText(result.translatedText)
        setTranslatedLang(selectedLanguage)
      }
    } finally {
      setTranslating(false)
    }
  }

  function formatWeekStart(dateStr?: string) {
    if (!dateStr) return 'This Week'
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (!user) return null

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 tracking-tight">Weekly Summary</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            AI-generated care overview for the whole family
          </p>
        </div>
        {summary && !generating && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            className="border-rose-200 text-rose-600 hover:bg-rose-50 self-start sm:self-auto"
          >
            <RefreshCw data-icon="inline-start" className="size-3.5" /> Regenerate
          </Button>
        )}
      </div>

      {/* Loading skeleton — initial page load */}
      {initialLoading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="shadow-md shadow-zinc-100/50 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
            <CardContent className="py-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-4 space-y-3">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="pt-4 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generating skeleton — after clicking Generate */}
      {generating && (
        <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300 animate-pulse" />
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-rose-400 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-zinc-700">Generating summary for your family...</p>
            <p className="text-xs text-zinc-400 mt-1">AI is reviewing medications, notes, and tasks</p>
            <div className="mt-6 mx-auto max-w-md space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!initialLoading && !summary && !generating && (
        <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-rose-200" />
          </div>
          <p className="text-sm font-medium text-zinc-600">No summary generated yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto">
            Generate a weekly overview of Bà Lan&apos;s care — medications, doctor visits, and tasks — all in one place.
          </p>
          <Button
            onClick={handleGenerate}
            className="mt-5 bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200/50"
          >
            <Sparkles data-icon="inline-start" className="size-4" />
            Generate This Week&apos;s Summary
          </Button>
        </div>
      )}

      {/* Summary card */}
      {summary && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px] gap-6 lg:gap-8">
          {/* Main summary content */}
          <div className="space-y-4">
            <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="h-1.5 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-zinc-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      Care Summary
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      AI-generated overview of this week&apos;s care
                    </CardDescription>
                  </div>
                  <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none text-[10px] font-semibold px-2.5 py-1 shrink-0">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    Week of {formatWeekStart(summary.weekStart ?? summary.week_start)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <p className="text-[13px] text-zinc-700 leading-relaxed">{summary.summaryText}</p>
                </div>

                {summary.watchFor && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Watch For</p>
                    </div>
                    <p className="text-[13px] text-amber-800 leading-relaxed">{summary.watchFor}</p>
                  </div>
                )}

                {summary.actionItems && (
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ListChecks className="w-4 h-4 text-rose-400" />
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Action Items</p>
                    </div>
                    <p className="text-[13px] text-zinc-700 leading-relaxed whitespace-pre-line">{summary.actionItems}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Translated summary panel */}
            {translatedText && (
              <Card className="shadow-md shadow-violet-100/40 border-violet-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="h-1 bg-gradient-to-r from-violet-300 via-violet-400 to-violet-300" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-zinc-800 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-violet-500" />
                      Translation
                    </CardTitle>
                    <Badge className="bg-violet-100 text-violet-600 hover:bg-violet-100 border-none text-[10px] font-semibold px-2 py-0.5">
                      {translatedLang}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] text-zinc-700 leading-relaxed whitespace-pre-line">{translatedText}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar — Language selector */}
          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <Card className="shadow-md shadow-rose-100/50 border-rose-100/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-backwards">
              <div className="h-1 bg-gradient-to-r from-violet-300 via-violet-400 to-violet-300" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-zinc-800 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-violet-500" />
                  Translate Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Share the summary in the family&apos;s preferred language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Language</p>
                  <select
                    value={selectedLanguage}
                    onChange={e => { setSelectedLanguage(e.target.value); setTranslatedText(null); setTranslatedLang(null) }}
                    className="w-full text-sm font-medium text-zinc-800 bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white shadow-sm shadow-violet-200/50"
                >
                  {translating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      Translating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Translate to {selectedLanguage}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </Button>

                {translatedLang && (
                  <p className="text-[11px] text-zinc-400 text-center">
                    Currently showing {translatedLang} translation
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

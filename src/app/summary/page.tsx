// AI WEEKLY SUMMARY — matches App Builder layout
// GET  /api/summary            — Returns latest saved summary (or null)
// POST /api/summary            — Generates new summary via Gemini, saves it
// POST /api/summary/translate  — Translates summary text into any language via Gemini

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { LANGUAGES } from '@/lib/languages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles, Calendar, CheckCircle2, AlertCircle
} from 'lucide-react'

/* ─── Language flags ─── */
const LANGUAGE_FLAGS: Record<string, string> = {
  'English': '🇺🇸',
  'Tiếng Việt': '🇻🇳',
  'Español': '🇪🇸',
  '中文': '🇨🇳',
  '한국어': '🇰🇷',
  'Português': '🇧🇷',
  'Tagalog': '🇵🇭',
  'हिन्दी': '🇮🇳',
  'العربية': '🇸🇦',
  'Français': '🇫🇷',
}

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

  function formatWeekRange(dateStr?: string) {
    if (!dateStr) return 'This Week'
    const start = new Date(dateStr + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    return `${fmt(start)} - ${fmt(end)}, ${start.getFullYear()}`
  }

  // Parse watch-for items from text (split by newlines or bullet points)
  function parseListItems(text: string): string[] {
    return text.split(/\n|•|·|-(?=\s)/).map(s => s.trim()).filter(Boolean)
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">AI Weekly Summary</h1>
          <p className="text-[#64748b]">AI-generated overview of care activities</p>
        </div>
        {summary && !generating && (
          <Button
            onClick={handleGenerate}
            className="rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 hidden sm:flex"
          >
            <Sparkles size={18} />
            Regenerate
          </Button>
        )}
      </div>

      {/* Loading skeleton */}
      {initialLoading && (
        <div className="space-y-4">
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generating state */}
      {generating && (
        <Card className="rounded-2xl border-[#8b5cf6]/20 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="size-20 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-[#8b5cf6] animate-pulse" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-[#0f172a] mb-3">
              Generating Summary...
            </h3>
            <p className="text-[#64748b] mb-8 max-w-md mx-auto">
              AI is reviewing medications, appointments, and care notes from this week.
            </p>
            <div className="mx-auto max-w-sm space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!initialLoading && !summary && !generating && (
        <Card className="rounded-2xl border-[#8b5cf6]/20 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="size-20 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-[#8b5cf6]" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-[#0f172a] mb-3">
              No Summary Yet
            </h3>
            <p className="text-[#64748b] mb-8 max-w-md mx-auto">
              Generate a comprehensive weekly summary that covers medications, appointments,
              and important care notes.
            </p>
            <Button
              onClick={handleGenerate}
              size="lg"
              className="rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90"
            >
              <Sparkles size={20} />
              Generate This Week&apos;s Summary
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary content */}
      {summary && !generating && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main summary content — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Week badge */}
            <div className="flex items-center gap-2">
              <Badge className="bg-[#8b5cf6] text-white border-0 rounded-lg px-4 py-2">
                <Calendar size={16} className="mr-2" />
                {formatWeekRange(summary.weekStart ?? summary.week_start)}
              </Badge>
            </div>

            {/* Weekly Overview card */}
            <Card data-tour="summary-card" className="rounded-2xl border-[#8b5cf6]/10 shadow-sm shadow-[#8b5cf6]/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={20} className="text-[#8b5cf6]" />
                  Weekly Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {summary.summaryText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-[#0f172a] mb-4 last:mb-0 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Watch For card */}
            {summary.watchFor && (
              <Card data-tour="watch-for" className="rounded-2xl border-[#f59e0b]/20 shadow-sm shadow-[#f59e0b]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#92400e]">
                    <AlertCircle size={20} className="text-[#f59e0b]" />
                    Watch For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {parseListItems(summary.watchFor).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="size-1.5 rounded-full bg-[#f59e0b] mt-2 flex-shrink-0" />
                        <span className="text-[#0f172a]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Items card */}
            {summary.actionItems && (
              <Card data-tour="action-items" className="rounded-2xl border-[#10b981]/20 shadow-sm shadow-[#10b981]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#065f46]">
                    <CheckCircle2 size={20} className="text-[#10b981]" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {parseListItems(summary.actionItems).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="size-4 rounded border-2 border-[#cbd5e1] mt-0.5 flex-shrink-0" />
                        <span className="text-[#0f172a]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Translated summary panel */}
            {translatedText && (
              <Card className="rounded-2xl border-[#8b5cf6]/20 shadow-sm bg-gradient-to-br from-[#8b5cf6]/5 to-[#f59e0b]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-[#8b5cf6] text-white border-0 rounded-lg">
                      <Sparkles size={12} className="mr-1" />
                      AI Translated
                    </Badge>
                    <span className="text-sm font-normal text-[#64748b]">
                      {LANGUAGE_FLAGS[translatedLang || ''] || '🌐'} {translatedLang}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {translatedText.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-[#0f172a] mb-4 last:mb-0 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar — Language selector */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card data-tour="summary-translate" className="rounded-2xl border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Translate Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language button list */}
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLanguage(lang.code); setTranslatedText(null); setTranslatedLang(null) }}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                        selectedLanguage === lang.code
                          ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                          : 'border-gray-200 hover:border-[#8b5cf6]/50'
                      }`}
                    >
                      <span className="mr-3 text-xl">{LANGUAGE_FLAGS[lang.code] || '🌐'}</span>
                      <span className="text-sm font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="w-full rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90"
                >
                  {translating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      Translating...
                    </span>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Translate
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

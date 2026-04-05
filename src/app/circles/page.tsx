// SUPPORT CIRCLES — Peer-to-peer Q&A by diagnosis
// Static page — no API needed
// Landing: diagnosis circle cards → click into thread → Q&A with auto-translated posts

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronRight, Globe, Heart, Droplets, HeartPulse, Activity,
  MessageCircle, Users,
} from 'lucide-react'

/* ─── Types ─── */
type Reply = {
  author: string
  originalLang: string
  timeAgo: string
  body: string
  helpful: number
}

type Question = {
  id: number
  author: string
  originalLang: string
  timeAgo: string
  body: string
  helpful: number
  replies: Reply[]
}

type Circle = {
  id: string
  name: string
  description: string
  icon: typeof Droplets
  pillBg: string
  pillText: string
  members: number
  questions: Question[]
}

/* ─── Avatar color hash (same as dashboard) ─── */
const MEMBER_COLORS = [
  { bg: 'bg-[#f43f5e]', text: 'text-white' },
  { bg: 'bg-[#0ea5e9]', text: 'text-white' },
  { bg: 'bg-[#10b981]', text: 'text-white' },
  { bg: 'bg-[#8b5cf6]', text: 'text-white' },
  { bg: 'bg-[#f59e0b]', text: 'text-white' },
  { bg: 'bg-[#14b8a6]', text: 'text-white' },
]

function memberColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length]
}

/* ─── Language badge colors (same as community page) ─── */
const LANGUAGE_COLORS: Record<string, string> = {
  'Vietnamese': 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50',
  'Spanish': 'bg-orange-50 text-orange-600 ring-1 ring-orange-200/50',
  'English': 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/50',
  'Hindi': 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/50',
}

/* ─── Hardcoded circles ─── */
const CIRCLES: Circle[] = [
  {
    id: 'diabetes',
    name: 'Diabetes Type 2',
    description: 'Share tips for managing blood sugar, diet, and daily life',
    icon: Droplets,
    pillBg: 'bg-[#fef3c7]',
    pillText: 'text-[#f59e0b]',
    members: 128,
    questions: [
      {
        id: 1,
        author: 'Bà Lan N.',
        originalLang: 'Vietnamese',
        timeAgo: '2 days ago',
        body: 'How do you manage blood sugar spikes after meals? I noticed my numbers go very high after lunch even when I try to eat less rice. My grandson helps me check but I want to understand what I can do myself.',
        helpful: 12,
        replies: [
          {
            author: 'Maria G.',
            originalLang: 'Spanish',
            timeAgo: '1 day ago',
            body: 'I walk for 15 minutes after every meal. My doctor said even a short walk helps your body use the sugar. It\'s become my favorite part of the day — I listen to music and it doesn\'t feel like exercise.',
            helpful: 8,
          },
          {
            author: 'James O.',
            originalLang: 'English',
            timeAgo: '1 day ago',
            body: 'Portion control was the game changer for me. I use a smaller plate now and fill half with vegetables. My A1C dropped from 8.2 to 6.9 in three months.',
            helpful: 5,
          },
        ],
      },
      {
        id: 2,
        author: 'Maria G.',
        originalLang: 'Spanish',
        timeAgo: '3 days ago',
        body: 'My doctor changed my metformin dose and I feel dizzy — is this normal? I\'m scared to keep taking it but I don\'t want to stop without asking. Has anyone else experienced this?',
        helpful: 15,
        replies: [
          {
            author: 'Bà Lan N.',
            originalLang: 'Vietnamese',
            timeAgo: '2 days ago',
            body: 'I had the same thing when my dose went up. My grandson called the doctor and they said to take it with food. After a week the dizziness went away. Don\'t skip meals when you take it.',
            helpful: 11,
          },
          {
            author: 'Priya S.',
            originalLang: 'Hindi',
            timeAgo: '2 days ago',
            body: 'This happened to me too. Make sure you\'re drinking enough water. My doctor also checked my blood pressure because dizziness can mean it dropped too low. Worth asking about.',
            helpful: 7,
          },
        ],
      },
      {
        id: 3,
        author: 'James O.',
        originalLang: 'English',
        timeAgo: '5 days ago',
        body: 'What foods do you cook that are good for diabetes? I\'m tired of eating the same things every day and I want to try recipes from other cultures that are also healthy for us.',
        helpful: 18,
        replies: [
          {
            author: 'Bà Lan N.',
            originalLang: 'Vietnamese',
            timeAgo: '4 days ago',
            body: 'I make phở with less noodles and more vegetables now. My grandson found a recipe that uses zucchini noodles instead. It\'s not the same but it\'s close, and my blood sugar stays much better.',
            helpful: 14,
          },
          {
            author: 'Maria G.',
            originalLang: 'Spanish',
            timeAgo: '4 days ago',
            body: 'Bean soups are wonderful — black beans, lentils. They fill you up and don\'t spike your sugar. I also switched to whole wheat tortillas. Small changes add up.',
            helpful: 9,
          },
          {
            author: 'Priya S.',
            originalLang: 'Hindi',
            timeAgo: '3 days ago',
            body: 'Bitter gourd (karela) is traditional in my family for diabetes. I know it\'s an acquired taste but there are ways to cook it that aren\'t so bitter. I can share recipes if anyone wants.',
            helpful: 6,
          },
        ],
      },
      {
        id: 4,
        author: 'Priya S.',
        originalLang: 'Hindi',
        timeAgo: '1 week ago',
        body: 'How do you explain your condition to family who don\'t understand? My family keeps offering me sweets at gatherings and I don\'t want to be rude, but they don\'t seem to take it seriously.',
        helpful: 22,
        replies: [
          {
            author: 'James O.',
            originalLang: 'English',
            timeAgo: '6 days ago',
            body: 'I told my kids: "My body has trouble using sugar for energy, so I have to be careful about what I eat and take medicine to help." Keeping it simple worked better than medical terms.',
            helpful: 10,
          },
          {
            author: 'Bà Lan N.',
            originalLang: 'Vietnamese',
            timeAgo: '6 days ago',
            body: 'My grandson Kevin helps me explain to the family. He translates the doctor\'s words into things everyone understands. Having someone who speaks both languages — medical and family — makes all the difference.',
            helpful: 16,
          },
        ],
      },
    ],
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    description: 'Connect with others managing high blood pressure',
    icon: HeartPulse,
    pillBg: 'bg-[#ffe4e6]',
    pillText: 'text-[#f43f5e]',
    members: 85,
    questions: [
      {
        id: 5,
        author: 'Robert K.',
        originalLang: 'English',
        timeAgo: '3 days ago',
        body: 'Does anyone else get headaches when their pressure is high?',
        helpful: 4,
        replies: [],
      },
      {
        id: 6,
        author: 'Ana L.',
        originalLang: 'Spanish',
        timeAgo: '5 days ago',
        body: 'How do you remember to take your medicine every day?',
        helpful: 7,
        replies: [],
      },
    ],
  },
  {
    id: 'ckd',
    name: 'Chronic Kidney Disease',
    description: 'Support for chronic kidney disease patients and families',
    icon: Activity,
    pillBg: 'bg-[#ede9fe]',
    pillText: 'text-[#8b5cf6]',
    members: 42,
    questions: [
      {
        id: 7,
        author: 'David M.',
        originalLang: 'English',
        timeAgo: '1 week ago',
        body: 'What diet changes helped your kidney numbers?',
        helpful: 6,
        replies: [],
      },
    ],
  },
]

/* ─── Language badge component ─── */
function LangBadge({ lang }: { lang: string }) {
  const color = LANGUAGE_COLORS[lang] ?? 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/50'
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${color}`}>
      <Globe className="w-2.5 h-2.5 opacity-60" />
      Originally in {lang}
    </span>
  )
}

/* ─── Post avatar ─── */
function PostAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'sm' }) {
  const c = memberColor(name)
  const sizeClass = size === 'sm' ? 'size-8' : 'size-10'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <Avatar className={sizeClass}>
      <AvatarFallback className={`${c.bg} ${c.text} font-semibold ${textSize}`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}

/* ─── Helpful count ─── */
function HelpfulCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
      <Heart size={14} className="text-[#f43f5e]/50" />
      <span>{count} helpful</span>
    </div>
  )
}

/* ─── Reply card ─── */
function ReplyCard({ reply }: { reply: Reply }) {
  return (
    <div className="ml-12 pl-5 border-l-2 border-[#e2e8f0]">
      <div className="py-4">
        <div className="flex items-center gap-3 mb-2">
          <PostAvatar name={reply.author} size="sm" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm text-[#0f172a]">{reply.author}</span>
            <LangBadge lang={reply.originalLang} />
            <span className="text-xs text-[#64748b]">{reply.timeAgo}</span>
          </div>
        </div>
        <p className="text-[#0f172a] leading-relaxed text-sm ml-11">{reply.body}</p>
        <div className="ml-11 mt-2">
          <HelpfulCount count={reply.helpful} />
        </div>
      </div>
    </div>
  )
}

/* ─── Question card ─── */
function QuestionCard({ question }: { question: Question }) {
  return (
    <div>
      <Card className="rounded-2xl border-gray-200 shadow-sm border-l-4 border-l-[#f43f5e]">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <PostAvatar name={question.author} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#0f172a]">{question.author}</span>
              <LangBadge lang={question.originalLang} />
              <span className="text-sm text-[#64748b]">{question.timeAgo}</span>
            </div>
          </div>
          <p className="text-[#0f172a] leading-relaxed mb-3">{question.body}</p>
          <div className="flex items-center gap-4">
            <HelpfulCount count={question.helpful} />
            <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
              <MessageCircle size={14} />
              <span>{question.replies.length} {question.replies.length === 1 ? 'reply' : 'replies'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {question.replies.map((reply, i) => (
        <ReplyCard key={i} reply={reply} />
      ))}
    </div>
  )
}

/* ─── Main page ─── */
export default function CirclesPage() {
  const [openCircle, setOpenCircle] = useState<string | null>(null)

  const activeCircle = CIRCLES.find(c => c.id === openCircle)

  // Thread view
  if (activeCircle) {
    const Icon = activeCircle.icon
    const langs = [...new Set(
      activeCircle.questions.flatMap(q => [
        q.originalLang,
        ...q.replies.map(r => r.originalLang),
      ])
    )]

    return (
      <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => setOpenCircle(null)}
            className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#f43f5e] transition-colors cursor-pointer"
          >
            <span>Support Circles</span>
            <ChevronRight size={16} />
            <span className="text-[#0f172a] font-medium">{activeCircle.name}</span>
          </button>
        </div>

        {/* Circle header */}
        <Card data-tour="circle-header" className="rounded-2xl border-[#f43f5e]/10 shadow-sm shadow-[#f43f5e]/5 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`size-14 rounded-2xl ${activeCircle.pillBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={activeCircle.pillText} size={28} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-[#0f172a] mb-1">{activeCircle.name}</h1>
                <p className="text-[#64748b] mb-3">{activeCircle.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="bg-[#f1f5f9] text-[#64748b] border-0 rounded-lg">
                    <Users size={14} className="mr-1.5" />
                    {activeCircle.members} members
                  </Badge>
                  {langs.map(lang => {
                    const color = LANGUAGE_COLORS[lang] ?? 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/50'
                    return (
                      <span key={lang} className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${color}`}>
                        <Globe className="w-2.5 h-2.5 opacity-60" />
                        {lang}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div data-tour="circle-questions" className="space-y-6">
          {activeCircle.questions.map((q, i) => (
            <div
              key={q.id}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <QuestionCard question={q} />
            </div>
          ))}
        </div>

        {/* Ask a question placeholder */}
        <div data-tour="circle-ask" className="mt-8">
          <Input
            disabled
            placeholder="Share your experience or ask a question..."
            className="rounded-xl h-12 bg-white"
          />
          <p className="text-xs text-[#94a3b8] mt-2 ml-1">All posts are automatically translated so everyone can read in their own language</p>
        </div>
      </div>
    )
  }

  // Landing page — circle cards grid
  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Support Circles</h1>
        <p className="text-[#64748b]">Connect with patients who understand your journey</p>
      </div>

      {/* Circle cards grid */}
      <div data-tour="circle-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CIRCLES.map((circle, i) => {
          const Icon = circle.icon
          const totalQuestions = circle.questions.length
          return (
            <button
              key={circle.id}
              onClick={() => setOpenCircle(circle.id)}
              data-tour={circle.id === 'diabetes' ? 'diabetes-circle' : undefined}
              className="text-left cursor-pointer animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                <CardContent className="p-6">
                  <div className={`size-14 rounded-2xl ${circle.pillBg} flex items-center justify-center mb-4`}>
                    <Icon className={circle.pillText} size={28} />
                  </div>
                  <h3 className="font-semibold text-[#0f172a] mb-1 text-lg">{circle.name}</h3>
                  <p className="text-sm text-[#64748b] mb-4 leading-relaxed">{circle.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-[#64748b]">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {circle.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-[#64748b]" />
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Info callout */}
      <div data-tour="circle-callout" className="mt-8 bg-white rounded-2xl border border-[#f43f5e]/20 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f43f5e]" />
        <div className="p-6 flex gap-4">
          <div className="size-10 rounded-xl bg-[#ffe4e6] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#f43f5e]" />
          </div>
          <div>
            <p className="font-semibold text-[#0f172a] mb-1">Every voice, every language</p>
            <p className="text-[#64748b] leading-relaxed">
              Posts are automatically translated so everyone can read in their preferred language.
              A question written in Vietnamese, an answer in Spanish — both readable by everyone.
              No language barrier in your support circle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

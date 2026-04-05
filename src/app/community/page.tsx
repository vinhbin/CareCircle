// COMMUNITY RESOURCES PAGE
// Static page — no API needed
// Curated Atlanta-area resources for immigrant families navigating healthcare
// Organized by category: Health, Rights, Language Access, Navigation

'use client'

import { Heart, Languages, ShieldCheck, Users, ExternalLink, Globe } from 'lucide-react'
import type { ReactNode } from 'react'

type ResourceItem = {
  name: string
  description: string
  action: string | null
  url: string | null
  languages: string[]
}

type ResourceSection = {
  category: string
  icon: ReactNode
  color: { bg: string; iconColor: string; border: string; shadow: string; badge: string; hoverBorder: string; hoverShadow: string; accent: string }
  items: ResourceItem[]
}

const RESOURCES: ResourceSection[] = [
  {
    category: 'Free & Low-Cost Healthcare',
    icon: <Heart className="w-4 h-4" />,
    color: {
      bg: 'bg-rose-50', iconColor: 'text-rose-500', border: 'border-rose-100/60',
      shadow: 'shadow-rose-100/50', badge: 'bg-rose-50 text-rose-600 ring-rose-200/50',
      hoverBorder: 'hover:border-rose-200', hoverShadow: 'hover:shadow-rose-100/40',
      accent: 'from-rose-300 via-rose-400 to-rose-300',
    },
    items: [
      {
        name: 'Federally Qualified Health Centers (FQHCs)',
        description: 'Sliding-scale fees based on income. Serve all patients regardless of insurance or immigration status.',
        action: 'Find a clinic near you',
        url: 'https://findahealthcenter.hrsa.gov',
        languages: ['Spanish', 'Vietnamese', 'Korean', 'Mandarin', 'Tagalog'],
      },
      {
        name: 'Georgia Charitable Care Network',
        description: 'Free clinics across Georgia for uninsured and underinsured patients.',
        action: 'Find a free clinic',
        url: 'https://gacharitycare.org/find-a-clinic',
        languages: ['Spanish', 'Vietnamese'],
      },
      {
        name: 'Grady Health System',
        description: "Atlanta's public hospital — serves all patients. Financial assistance available for uninsured.",
        action: 'Learn about financial assistance',
        url: 'https://www.gradyhealth.org',
        languages: ['Spanish', 'Vietnamese', 'Korean', 'Mandarin', 'Arabic'],
      },
    ],
  },
  {
    category: 'Your Right to an Interpreter',
    icon: <Languages className="w-4 h-4" />,
    color: {
      bg: 'bg-violet-50', iconColor: 'text-violet-500', border: 'border-violet-100/60',
      shadow: 'shadow-violet-100/50', badge: 'bg-violet-50 text-violet-600 ring-violet-200/50',
      hoverBorder: 'hover:border-violet-200', hoverShadow: 'hover:shadow-violet-100/40',
      accent: 'from-violet-300 via-violet-400 to-violet-300',
    },
    items: [
      {
        name: 'Free Medical Interpreter (Federal Law)',
        description: 'Any hospital or clinic receiving federal funding MUST provide a free interpreter. You never need to use a family member. This is your legal right under Title VI of the Civil Rights Act.',
        action: null,
        url: null,
        languages: ['All languages'],
      },
      {
        name: 'Language Line',
        description: 'Over-the-phone interpretation available at most hospitals. Ask your nurse or receptionist to connect you.',
        action: null,
        url: null,
        languages: ['240+ languages'],
      },
    ],
  },
  {
    category: 'Insurance & Coverage Help',
    icon: <ShieldCheck className="w-4 h-4" />,
    color: {
      bg: 'bg-sky-50', iconColor: 'text-sky-500', border: 'border-sky-100/60',
      shadow: 'shadow-sky-100/50', badge: 'bg-sky-50 text-sky-600 ring-sky-200/50',
      hoverBorder: 'hover:border-sky-200', hoverShadow: 'hover:shadow-sky-100/40',
      accent: 'from-sky-300 via-sky-400 to-sky-300',
    },
    items: [
      {
        name: 'Georgia Medicaid / PeachCare',
        description: 'Free or low-cost health coverage for families with limited income. Immigration status requirements vary — many children and pregnant women qualify regardless of status.',
        action: 'Apply for Medicaid',
        url: 'https://medicaid.georgia.gov',
        languages: ['Spanish', 'Vietnamese', 'Korean'],
      },
      {
        name: 'Healthcare.gov (ACA Marketplace)',
        description: 'Subsidized health insurance plans. Open enrollment every fall; special enrollment if you have a life change.',
        action: 'Browse plans',
        url: 'https://www.healthcare.gov',
        languages: ['Spanish', 'Vietnamese', 'Mandarin', 'Korean', 'Tagalog', 'Hindi', 'Arabic'],
      },
      {
        name: 'GeorgiaCares (Medicare Help)',
        description: 'Free Medicare counseling for older adults — explains your benefits, helps with enrollment, and reviews bills.',
        action: 'Get free counseling',
        url: 'https://aging.georgia.gov/georgia-ship',
        languages: ['Spanish', 'Korean', 'Vietnamese'],
      },
    ],
  },
  {
    category: 'Atlanta Community Organizations',
    icon: <Users className="w-4 h-4" />,
    color: {
      bg: 'bg-emerald-50', iconColor: 'text-emerald-500', border: 'border-emerald-100/60',
      shadow: 'shadow-emerald-100/50', badge: 'bg-emerald-50 text-emerald-600 ring-emerald-200/50',
      hoverBorder: 'hover:border-emerald-200', hoverShadow: 'hover:shadow-emerald-100/40',
      accent: 'from-emerald-300 via-emerald-400 to-emerald-300',
    },
    items: [
      {
        name: 'Asian Americans Advancing Justice – Atlanta',
        description: 'Legal aid, health access, and advocacy for the Asian immigrant community in Georgia.',
        action: 'Get help',
        url: 'https://www.advancingjustice-atlanta.org',
        languages: ['Vietnamese', 'Korean', 'Mandarin', 'Tagalog', 'Hindi'],
      },
      {
        name: 'Latin American Association',
        description: 'Health navigation, social services, and wellness programs for Hispanic families in Atlanta.',
        action: 'Find services',
        url: 'https://thelaa.org',
        languages: ['Spanish'],
      },
      {
        name: 'New American Pathways',
        description: 'Refugee resettlement and immigrant services — health, employment, and legal support.',
        action: 'Learn more',
        url: 'https://newamericanpathways.org',
        languages: ['Arabic', 'Spanish', 'Amharic', 'Somali', 'Burmese'],
      },
      {
        name: 'Global Village Project',
        description: 'Education and support for refugee girls and their families in Decatur, GA.',
        action: 'Learn more',
        url: 'https://globalvillageproject.org',
        languages: ['Arabic', 'Spanish', 'Somali'],
      },
    ],
  },
]

const LANGUAGE_COLORS: Record<string, string> = {
  'Spanish': 'bg-orange-50 text-orange-600 ring-1 ring-orange-200/50',
  'Vietnamese': 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50',
  'Korean': 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/50',
  'Mandarin': 'bg-red-50 text-red-600 ring-1 ring-red-200/50',
  'Tagalog': 'bg-purple-50 text-purple-600 ring-1 ring-purple-200/50',
  'Hindi': 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/50',
  'Arabic': 'bg-teal-50 text-teal-600 ring-1 ring-teal-200/50',
  'Amharic': 'bg-pink-50 text-pink-600 ring-1 ring-pink-200/50',
  'Somali': 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50',
  'Burmese': 'bg-lime-50 text-lime-600 ring-1 ring-lime-200/50',
  'All languages': 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/50',
  '240+ languages': 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/50',
}

function LanguageBadge({ lang }: { lang: string }) {
  const color = LANGUAGE_COLORS[lang] ?? 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/50'
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${color}`}>
      <Globe className="w-2.5 h-2.5 opacity-60" />
      {lang}
    </span>
  )
}

function ResourceCard({ item, color, index }: { item: ResourceItem; color: ResourceSection['color']; index: number }) {
  return (
    <div
      className={`group bg-white border ${color.border} rounded-xl p-4 shadow-sm ${color.hoverBorder} ${color.hoverShadow} hover:shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-backwards`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-zinc-800">{item.name}</p>
          <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">{item.description}</p>
          {item.languages && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {item.languages.map(lang => (
                <LanguageBadge key={lang} lang={lang} />
              ))}
            </div>
          )}
        </div>
        {item.action && item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all whitespace-nowrap shadow-sm shadow-rose-100/30"
          >
            {item.action}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

export default function CommunityPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-800 tracking-tight">
          Community Resources
        </h1>
        <p className="mt-2 text-[13px] text-zinc-500 leading-relaxed max-w-xl">
          Curated services for immigrant families navigating healthcare in the Atlanta area.
          Every resource on this page is free or low-cost.
        </p>
      </div>

      {/* Resource Sections */}
      <div className="space-y-8">
        {RESOURCES.map((section, sectionIdx) => (
          <section
            key={section.category}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${sectionIdx * 120}ms` }}
          >
            <div className={`bg-white rounded-2xl border ${section.color.border} shadow-md ${section.color.shadow} overflow-hidden`}>
              {/* Gradient accent bar */}
              <div className={`h-1 bg-gradient-to-r ${section.color.accent}`} />

              {/* Section header */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${section.color.bg} flex items-center justify-center ${section.color.iconColor}`}>
                  {section.icon}
                </div>
                <h2 className="text-base font-semibold text-zinc-800">{section.category}</h2>
                <span className="text-[11px] text-zinc-400 font-medium ml-auto">
                  {section.items.length} {section.items.length === 1 ? 'resource' : 'resources'}
                </span>
              </div>

              {/* Items */}
              <div className="px-4 pb-4 space-y-2.5">
                {section.items.map((item, idx) => (
                  <ResourceCard key={item.name} item={item} color={section.color} index={idx} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Know Your Rights callout */}
      <div
        className="mt-8 bg-white rounded-2xl border border-amber-200/60 shadow-md shadow-amber-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
        style={{ animationDelay: `${RESOURCES.length * 120}ms` }}
      >
        <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />
        <div className="p-5 flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-zinc-800">Know your rights</p>
            <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">
              Any hospital or clinic receiving federal funding is required by law to provide
              a free interpreter. You should never need to rely on a family member to translate medical information.
              Ask the front desk for an interpreter before your appointment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

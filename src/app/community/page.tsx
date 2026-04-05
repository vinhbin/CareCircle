// COMMUNITY RESOURCES — matches App Builder layout
// Static page — no API needed
// Search bar + category tabs + flat card grid with address/phone/website
// Preserves all original curated Atlanta-area resources

'use client'

import { MapPin, Phone, ExternalLink, Search, Globe, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type Resource = {
  id: number
  name: string
  type: string
  typeColor: string
  description: string
  address: string
  phone: string
  website: string
  languages: string[]
}

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

const resources: Resource[] = [
  // ── Free & Low-Cost Healthcare ──
  {
    id: 1,
    name: 'Federally Qualified Health Centers (FQHCs)',
    type: 'Healthcare',
    typeColor: 'bg-[#0ea5e9]',
    description: 'Sliding-scale fees based on income. Serve all patients regardless of insurance or immigration status.',
    address: 'Multiple locations across Georgia',
    phone: '(800) 275-4772',
    website: 'findahealthcenter.hrsa.gov',
    languages: ['Spanish', 'Vietnamese', 'Korean', 'Mandarin', 'Tagalog'],
  },
  {
    id: 2,
    name: 'Grady Health System',
    type: 'Healthcare',
    typeColor: 'bg-[#0ea5e9]',
    description: "Atlanta's public hospital — serves all patients. Financial assistance available for uninsured. Multilingual support including Vietnamese interpreters.",
    address: '80 Jesse Hill Jr Dr SE, Atlanta, GA 30303',
    phone: '(404) 616-1000',
    website: 'gradyhealth.org',
    languages: ['Spanish', 'Vietnamese', 'Korean', 'Mandarin', 'Arabic'],
  },
  {
    id: 3,
    name: 'Georgia Charitable Care Network',
    type: 'Healthcare',
    typeColor: 'bg-[#0ea5e9]',
    description: 'Free clinics across Georgia for uninsured and underinsured patients.',
    address: 'Multiple locations across Georgia',
    phone: '(404) 525-6677',
    website: 'gacharitycare.org/find-a-clinic',
    languages: ['Spanish', 'Vietnamese'],
  },
  // ── Legal ──
  {
    id: 4,
    name: 'Asian Americans Advancing Justice – Atlanta',
    type: 'Legal',
    typeColor: 'bg-[#8b5cf6]',
    description: 'Legal aid, health access, and advocacy for the Asian immigrant community in Georgia.',
    address: '5680 Oakbrook Pkwy, Suite 140, Norcross, GA 30093',
    phone: '(404) 585-8375',
    website: 'advancingjustice-atlanta.org',
    languages: ['Vietnamese', 'Korean', 'Mandarin', 'Tagalog', 'Hindi'],
  },
  {
    id: 5,
    name: 'New American Pathways',
    type: 'Legal',
    typeColor: 'bg-[#8b5cf6]',
    description: 'Refugee and immigrant services — health, employment, and legal support.',
    address: '3900 Jonesboro Rd SE, Clarkston, GA 30021',
    phone: '(404) 292-1121',
    website: 'newamericanpathways.org',
    languages: ['Arabic', 'Spanish', 'Amharic', 'Somali', 'Burmese'],
  },
  // ── Education ──
  {
    id: 6,
    name: 'Healthcare.gov (ACA Marketplace)',
    type: 'Education',
    typeColor: 'bg-[#10b981]',
    description: 'Subsidized health insurance plans. Open enrollment every fall; special enrollment if you have a life change.',
    address: 'National — online enrollment',
    phone: '1-800-318-2596',
    website: 'healthcare.gov',
    languages: ['Spanish', 'Vietnamese', 'Mandarin', 'Korean', 'Tagalog', 'Hindi', 'Arabic'],
  },
  {
    id: 7,
    name: 'Georgia Medicaid / PeachCare',
    type: 'Education',
    typeColor: 'bg-[#10b981]',
    description: 'Free or low-cost health coverage for families with limited income. Many children and pregnant women qualify regardless of immigration status.',
    address: 'Apply online or at county DFCS offices',
    phone: '(877) 423-4746',
    website: 'medicaid.georgia.gov',
    languages: ['Spanish', 'Vietnamese', 'Korean'],
  },
  {
    id: 8,
    name: 'GeorgiaCares (Medicare Help)',
    type: 'Education',
    typeColor: 'bg-[#10b981]',
    description: 'Free Medicare counseling for older adults — explains your benefits, helps with enrollment, and reviews bills.',
    address: 'Multiple locations across Georgia',
    phone: '(866) 552-4464',
    website: 'aging.georgia.gov/georgia-ship',
    languages: ['Spanish', 'Korean', 'Vietnamese'],
  },
  // ── Support Groups ──
  {
    id: 9,
    name: 'Latin American Association',
    type: 'Support Groups',
    typeColor: 'bg-[#f43f5e]',
    description: 'Health navigation, social services, and wellness programs for Hispanic families in Atlanta.',
    address: '2750 Buford Hwy NE, Atlanta, GA 30324',
    phone: '(404) 638-1800',
    website: 'thelaa.org',
    languages: ['Spanish'],
  },
  {
    id: 10,
    name: 'Global Village Project',
    type: 'Support Groups',
    typeColor: 'bg-[#f43f5e]',
    description: 'Education and support for refugee girls and their families in Decatur, GA.',
    address: '461 Commerce Dr, Decatur, GA 30030',
    phone: '(404) 907-2562',
    website: 'globalvillageproject.org',
    languages: ['Arabic', 'Spanish', 'Somali'],
  },
  {
    id: 11,
    name: 'Free Medical Interpreter (Federal Law)',
    type: 'Support Groups',
    typeColor: 'bg-[#f43f5e]',
    description: 'Any hospital or clinic receiving federal funding MUST provide a free interpreter. You never need to use a family member. This is your legal right under Title VI.',
    address: 'All federally funded facilities',
    phone: '(800) 368-1019',
    website: 'hhs.gov/civil-rights',
    languages: ['All languages'],
  },
  {
    id: 12,
    name: 'Language Line Solutions',
    type: 'Support Groups',
    typeColor: 'bg-[#f43f5e]',
    description: 'Over-the-phone interpretation available at most hospitals. Ask your nurse or receptionist to connect you.',
    address: 'Available at most hospitals nationwide',
    phone: '(800) 752-6096',
    website: 'languageline.com',
    languages: ['240+ languages'],
  },
]

const categories = ['All', 'Healthcare', 'Legal', 'Education', 'Support Groups']

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || resource.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Community Resources</h1>
        <p className="text-[#64748b]">Healthcare and support resources for immigrant families in Atlanta</p>
      </div>

      {/* Search */}
      <div data-tour="search-bar" className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" size={20} />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-xl h-12"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div data-tour="category-tabs" className="mb-8">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#f8fafc] p-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Resources grid */}
      <div data-tour="resource-cards" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="rounded-2xl border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#0f172a] flex-1 pr-4">
                  {resource.name}
                </h3>
                <Badge className={`${resource.typeColor} text-white border-0 rounded-lg flex-shrink-0`}>
                  {resource.type}
                </Badge>
              </div>

              <p className="text-[#64748b] mb-4 leading-relaxed">
                {resource.description}
              </p>

              {/* Language badges */}
              {resource.languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {resource.languages.map(lang => {
                    const color = LANGUAGE_COLORS[lang] ?? 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200/50'
                    return (
                      <span key={lang} className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${color}`}>
                        <Globe className="w-2.5 h-2.5 opacity-60" />
                        {lang}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={18} className="text-[#64748b] flex-shrink-0 mt-0.5" />
                  <span className="text-[#0f172a]">{resource.address}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Phone size={18} className="text-[#64748b] flex-shrink-0" />
                  <a href={`tel:${resource.phone}`} className="text-[#f43f5e] hover:underline">
                    {resource.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <ExternalLink size={18} className="text-[#64748b] flex-shrink-0" />
                  <a
                    href={`https://${resource.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f43f5e] hover:underline"
                  >
                    {resource.website}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredResources.length === 0 && (
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="size-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
              <Search className="text-[#64748b]" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-[#0f172a] mb-2">No resources found</h3>
            <p className="text-[#64748b]">Try adjusting your search or category filter</p>
          </CardContent>
        </Card>
      )}

      {/* Know Your Rights callout — preserved from original */}
      <div data-tour="know-your-rights" className="mt-8 bg-white rounded-2xl border border-[#f59e0b]/30 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b]" />
        <div className="p-6 flex gap-4">
          <div className="size-10 rounded-xl bg-[#fef3c7] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <p className="font-semibold text-[#0f172a] mb-1">Know your rights</p>
            <p className="text-[#64748b] leading-relaxed">
              Any hospital or clinic receiving federal funding is required by law to provide
              a free interpreter. You should never need to rely on a family member to translate medical information.
              Ask the front desk for an interpreter before your appointment.
            </p>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <Card className="rounded-2xl border-gray-200 shadow-sm mt-8">
        <CardContent className="p-0">
          <div className="bg-[#f8fafc] rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-[#64748b] mx-auto mb-4" />
              <p className="text-[#64748b]">Interactive map view</p>
              <p className="text-sm text-[#64748b] mt-1">Resource locations in Atlanta area</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

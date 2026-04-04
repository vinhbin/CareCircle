// COMMUNITY RESOURCES PAGE
// Static page — no API needed
// Curated Atlanta-area resources for immigrant families navigating healthcare
// Organized by category: Health, Rights, Language Access, Navigation

const RESOURCES = [
  {
    category: 'Free & Low-Cost Healthcare',
    icon: '🏥',
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
        url: 'https://gaccn.org',
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
    icon: '🗣️',
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
        languages: ['240+ languages including Vietnamese, Spanish, Korean, Tagalog, Hindi, Arabic'],
      },
    ],
  },
  {
    category: 'Insurance & Coverage Help',
    icon: '📋',
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
        url: 'https://mygeorgiacares.org',
        languages: ['Spanish', 'Korean', 'Vietnamese'],
      },
    ],
  },
  {
    category: 'Atlanta Community Organizations',
    icon: '🤝',
    items: [
      {
        name: 'Asian Americans Advancing Justice – Atlanta',
        description: 'Legal aid, health access, and advocacy for the Asian immigrant community in Georgia.',
        action: 'Get help',
        url: 'https://www.aajc.org/atlanta',
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
  'Spanish':     'bg-orange-100 text-orange-700',
  'Español':     'bg-orange-100 text-orange-700',
  'Vietnamese':  'bg-green-100 text-green-700',
  'Korean':      'bg-blue-100 text-blue-700',
  'Mandarin':    'bg-red-100 text-red-700',
  'Tagalog':     'bg-purple-100 text-purple-700',
  'Hindi':       'bg-yellow-100 text-yellow-700',
  'Arabic':      'bg-teal-100 text-teal-700',
  'Amharic':     'bg-pink-100 text-pink-700',
  'Somali':      'bg-indigo-100 text-indigo-700',
  'Burmese':     'bg-lime-100 text-lime-700',
  'All languages': 'bg-zinc-100 text-zinc-700',
  '240+ languages including Vietnamese, Spanish, Korean, Tagalog, Hindi, Arabic': 'bg-zinc-100 text-zinc-600',
}

function LanguageBadge({ lang }: { lang: string }) {
  const color = LANGUAGE_COLORS[lang] ?? 'bg-zinc-100 text-zinc-600'
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {lang}
    </span>
  )
}

export default function CommunityPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Community Resources</h1>
        <p className="mt-2 text-zinc-500 text-sm">
          Curated services for immigrant families navigating healthcare in the Atlanta area.
          Every resource on this page is free or low-cost.
        </p>
      </div>

      <div className="space-y-10">
        {RESOURCES.map(section => (
          <section key={section.category}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{section.icon}</span>
              <h2 className="text-base font-semibold text-zinc-800">{section.category}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map(item => (
                <div
                  key={item.name}
                  className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900 text-sm">{item.name}</p>
                      <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                      {item.languages && (
                        <div className="mt-2 flex flex-wrap gap-1">
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
                        className="shrink-0 text-xs font-medium text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
                      >
                        {item.action} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>Know your rights:</strong> Any hospital or clinic receiving federal funding is required by law to provide
        a free interpreter. You should never need to rely on a family member to translate medical information.
        Ask the front desk for an interpreter before your appointment.
      </div>
    </div>
  )
}

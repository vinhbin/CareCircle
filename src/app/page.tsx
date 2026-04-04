// LANDING PAGE — introduces CareCircle before the user selection screen
// Emotionally-driven design: the story of why this app exists
// Server component — no client-side JS needed

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="-mx-6 -mt-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24">
        {/* Warm radial glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-rose-200/60 via-amber-100/40 to-transparent blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-200/30 to-transparent blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-rose-200/60 text-xs font-medium text-rose-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            10 languages supported
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08]">
            <span className="bg-gradient-to-r from-rose-700 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Care, understood
            </span>
            <br />
            <span className="text-zinc-800">in every language.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto leading-relaxed">
            One shared place for your family to manage a loved one&apos;s care&mdash;medications, doctor notes, and tasks&mdash;translated into plain language your family actually understands.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/select"
              className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-rose-600 transition-all shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 text-lg"
            >
              Get Started
            </Link>
            <span className="text-sm text-zinc-400">No account needed</span>
          </div>
        </div>
      </section>

      {/* ── Before/After ── */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-zinc-400 uppercase tracking-widest mb-10">
            What the doctor writes vs. what your family sees
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-zinc-300" />
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Doctor&apos;s note</span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed font-mono">
                HbA1c 8.2% &mdash; suboptimal glycemic control. Fasting glucose 178 mg/dL. BP 148/92 &mdash; above target. Titrate Lisinopril to 10mg. eGFR 61, CKD Stage 2, monitor closely. Repeat HbA1c and BMP in 3 months.
              </p>
            </div>
            {/* After */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 p-6 ring-1 ring-rose-200/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">CareCircle explains</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                B&agrave; Lan&apos;s blood sugar is a bit high &mdash; the goal is under 7.5%. Her blood pressure was also above target, so the doctor added a new medication to help bring it down. Her kidneys are working okay but need to be watched. Good news: no nerve damage in her feet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl font-bold text-zinc-800 mb-3">Everything your family needs</h2>
          <p className="text-center text-zinc-400 mb-14 max-w-lg mx-auto">Built for families managing serious illness&mdash;no medical degree required.</p>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2a5 5 0 0 1 5 5v3H7V7a5 5 0 0 1 5-5Z" /><rect x="3" y="10" width="18" height="12" rx="2" /><circle cx="12" cy="16" r="1" /></svg>
                ),
                title: 'AI Medical Translation',
                description: 'Doctor jargon translated into warm, plain language in Vietnamese, Spanish, Mandarin, and 7 more languages.',
                color: 'from-rose-500 to-rose-600',
                bg: 'bg-rose-50',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                ),
                title: 'Photo Scan',
                description: 'Take a photo of a paper discharge note. AI reads it and explains it to your family in their language.',
                color: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-50',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                ),
                title: 'Medication Checklist',
                description: 'Track every dose with live counts. See who gave which medication and when&mdash;no confusion, no missed doses.',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                ),
                title: 'Weekly AI Summary',
                description: 'Every week, your family gets a clear story of what happened, what to watch for, and what to do next.',
                color: 'from-violet-500 to-violet-600',
                bg: 'bg-violet-50',
              },
            ].map((feature) => (
              <div key={feature.title} className={`group rounded-2xl ${feature.bg} border border-zinc-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-zinc-800 text-base mb-1.5">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="px-6 py-16 bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-zinc-400 uppercase tracking-widest mb-12">The reality for immigrant families</p>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { stat: '38%', label: 'of Hispanic adults have no regular doctor' },
              { stat: '72%', label: 'speak a language other than English at home' },
              { stat: '10', label: 'languages supported by CareCircle' },
            ].map((item) => (
              <div key={item.stat}>
                <div className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing Quote ── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl font-semibold text-zinc-800 leading-snug">
            &ldquo;Kevin is 19. He works at Best Buy. He shouldn&apos;t have to translate his grandmother&apos;s medical notes.&rdquo;
          </blockquote>
          <p className="mt-6 text-lg text-rose-600 font-medium">CareCircle does it for him.</p>

          <Link
            href="/select"
            className="mt-10 inline-block px-8 py-3.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-rose-600 transition-all shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 text-lg"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}

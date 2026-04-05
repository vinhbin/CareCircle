// LANDING PAGE — introduces CareCircle before the user selection screen
// Emotionally-driven design: the story of why this app exists
// Server component — no client-side JS needed

import Link from 'next/link'
import HeroCarousel from '@/components/HeroCarousel'

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Warm radial glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-rose-200/60 via-amber-100/40 to-transparent blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-200/30 to-transparent blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: text ── */}
          <div className="flex flex-col justify-center items-start text-left w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-rose-200/60 text-xs font-medium text-rose-700 mb-8">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              10 languages supported
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="bg-gradient-to-r from-rose-700 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Care, understood
              </span>
              <br />
              <span className="text-zinc-800">in every language.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-500 leading-relaxed">
              One shared place for your family to manage a loved one&apos;s care&mdash;medications, doctor notes, and tasks&mdash;translated into plain language your family actually understands.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/select"
                className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-rose-600 transition-all shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 text-lg"
              >
                Get Started
              </Link>
              <span className="text-sm text-zinc-400">No account needed</span>
            </div>
          </div>

          {/* ── Right: family photo carousel ── */}
          <div className="w-full">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section className="px-6 py-20 bg-gradient-to-b from-white to-rose-50/40">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">About Us</p>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-zinc-800 mb-16">Why we built CareCircle</h2>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Origin story */}
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white mb-2 self-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-800">The story behind the app</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Bà Lan is 70 years old. She immigrated from Vietnam three years ago. She has diabetes and high blood pressure. She speaks no English. Every time she sees a doctor, her 19-year-old grandson Kevin gets handed a discharge note full of words like &ldquo;suboptimal glycemic control&rdquo; and &ldquo;eGFR 61, CKD Stage 2&rdquo; — and he&apos;s supposed to explain it to her. In Vietnamese. Using words he doesn&apos;t understand in English.
              </p>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Kevin works at Best Buy. He loves his grandmother. He shouldn&apos;t have to be her doctor, her translator, and her care coordinator all at once. We built CareCircle so he doesn&apos;t have to be.
              </p>
            </div>

            {/* Mission + built for */}
            <div className="flex flex-col gap-8">
              <div>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white mb-4 self-start">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-2">Our mission</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  We&apos;re not translating words — we&apos;re translating understanding. CareCircle turns complex medical language into warm, plain-language explanations in 10 languages, so every family member can participate in a loved one&apos;s care — regardless of what language they speak or what country they came from.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-zinc-700 mb-3">Built for families who</h3>
                <ul className="space-y-2">
                  {[
                    'Navigate healthcare in a language that isn\'t their first',
                    'Rely on a younger family member to translate medical notes',
                    'Can\'t afford to misunderstand a discharge instruction',
                    'Deserve the same quality of care coordination as anyone else',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-500">
                      <span className="mt-1 w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Atlanta callout */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 p-6 text-center">
            <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl mx-auto">
              <span className="font-semibold text-zinc-700">This isn&apos;t hypothetical.</span> This is happening in Atlanta, right now, to families in your community. One misunderstood discharge note can mean a missed dose, a hospital readmission, or worse. CareCircle exists to close that gap.
            </p>
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

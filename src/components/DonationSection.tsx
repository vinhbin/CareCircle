'use client'

import { useState } from 'react'
import Link from 'next/link'

const amounts = [5, 10, 25, 50]
const allocations = [
  { id: 'platform', label: 'Improve the platform' },
  { id: 'access', label: 'Expand access' },
  { id: 'healthcare', label: 'Healthcare initiatives' },
  { id: 'split', label: 'Split evenly' },
]

export default function DonationSection() {
  const [selected, setSelected] = useState<number | null>(25)
  const [custom, setCustom] = useState('')
  const [allocation, setAllocation] = useState('split')

  const activeAmount = selected ?? (custom ? Number(custom) : null)

  return (
    <section className="px-6 py-24 bg-gradient-to-b from-sky-50/60 via-white to-sky-50/40">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-200/60 text-xs font-medium text-sky-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Non-profit organization
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            Help Make Healthcare Understandable for Everyone
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Your support helps patients understand their care, avoid mistakes, and stay safe.
          </p>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Care Circle is completely free because we believe understanding your health should never be limited by language, complexity, or access. Your contribution helps us improve the platform, expand access to underserved communities, and support real healthcare initiatives.
          </p>
        </div>

        {/* Where Your Support Goes */}
        <div className="mb-16">
          <h3 className="text-center text-xl font-bold text-zinc-800 mb-8">Where Your Support Goes</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855Z" />
                  </svg>
                ),
                title: 'Improve the Platform',
                description: 'Your donation helps us improve AI accuracy, simplify medical explanations, enhance translations (especially for Spanish-speaking users), and create a better experience for elderly and non-technical users.',
                color: 'from-sky-500 to-sky-600',
                bg: 'bg-sky-50',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: 'Expand Access to Communities',
                description: 'We use donations to keep the app free and expand it to underserved communities, including those facing language barriers or limited healthcare access.',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                ),
                title: 'Support Healthcare Initiatives',
                description: 'A portion of contributions goes toward supporting healthcare-related programs, clinics, or organizations that help people receive better care.',
                color: 'from-rose-500 to-rose-600',
                bg: 'bg-rose-50',
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl ${item.bg} border border-zinc-100 p-6`}>
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white mb-4`}>
                  {item.icon}
                </div>
                <h4 className="font-semibold text-zinc-800 text-base mb-2">{item.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Card */}
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl bg-white border border-zinc-200 shadow-lg shadow-sky-100/40 p-8">
            {/* Amount Selection */}
            <p className="text-sm font-semibold text-zinc-700 mb-3">Choose an amount</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setSelected(amt); setCustom('') }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selected === amt
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                      : 'bg-zinc-50 text-zinc-700 border border-zinc-200 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative mb-6">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">$</span>
              <input
                type="number"
                placeholder="Custom amount"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null) }}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all"
              />
            </div>

            {/* Allocation toggle */}
            <p className="text-sm font-semibold text-zinc-700 mb-3">Choose where your donation goes</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {allocations.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAllocation(opt.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    allocation === opt.id
                      ? 'bg-sky-100 text-sky-700 border border-sky-300'
                      : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:border-sky-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Transparency note */}
            <p className="text-xs text-zinc-400 text-center mb-6">
              We clearly show how your contribution creates real impact.
            </p>

            {/* Donate button */}
            <button
              disabled={!activeAmount || activeAmount <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-sky-500 text-white font-semibold rounded-xl hover:from-sky-700 hover:to-sky-600 transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeAmount && activeAmount > 0 ? `Donate $${activeAmount}` : 'Donate Now'}
            </button>

            {/* Continue free */}
            <Link
              href="/select"
              className="block mt-4 text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Continue for Free
            </Link>

            {/* Emotional message */}
            <p className="mt-6 text-center text-xs text-zinc-400 italic">
              Every contribution helps someone better understand their care.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

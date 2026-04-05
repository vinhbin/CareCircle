'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const images = [
  {
    src: '/hero-family.jpg',
    alt: 'Grandparents with their caregiver grandchild',
  },
  {
    src: '/hero-family-2.jpg',
    alt: 'Multi-generational family together outdoors',
  },
  {
    src: '/patient1.webp',
    alt: 'Patient getting blood pressure checked by doctor',
  },
  {
    src: '/patient2.webp',
    alt: 'Doctor comforting a patient during a visit',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  // Auto-advance every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/40 ring-1 ring-rose-100">
      {/* Images */}
      <div className="relative w-full h-[420px] lg:h-[540px]">
        {images.map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              quality={95}
              className="object-cover object-center"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Subtle gradient — just enough for dots to read on any photo */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/20 to-transparent z-10" />

        {/* Arrow buttons */}
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-700">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-700">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-5' : 'bg-white/50 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

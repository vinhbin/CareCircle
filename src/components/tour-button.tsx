'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tourSteps } from '@/lib/tour'

export function TourButton() {
  const pathname = usePathname()
  const tourDef = tourSteps[pathname]

  const startTour = useCallback(async () => {
    if (!tourDef) return

    const { driver } = await import('driver.js')
    await import('driver.js/dist/driver.css')

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.5,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'carecircle-tour',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      progressText: '{{current}} of {{total}}',
    })

    const steps = typeof tourDef === 'function' ? tourDef(driverObj) : tourDef
    if (steps.length === 0) return

    driverObj.setSteps(steps)
    driverObj.drive()
  }, [tourDef])

  if (!tourDef) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={startTour}
      className="rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 gap-1.5"
    >
      <HelpCircle size={18} />
      <span className="hidden sm:inline text-sm">Tour</span>
    </Button>
  )
}

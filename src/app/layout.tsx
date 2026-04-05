// ROOT LAYOUT — wraps all pages with UserProvider (context) and Nav
// Server component — metadata lives here, client logic in Nav and UserProvider

import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { UserProvider } from '@/lib/user-context'
import { Nav } from '@/components/nav'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'CareCircle',
  description: 'Family care coordination for serious illness'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-rose-50">
        <UserProvider>
          <Nav />
          <main className="flex-1 px-4 sm:px-6 lg:px-10 xl:px-16 py-8 w-full">{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}

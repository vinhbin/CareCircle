// ROOT LAYOUT — wraps all pages with UserProvider (context) and AppShell
// Server component — metadata lives here, client logic in AppShell and UserProvider

import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { UserProvider } from '@/lib/user-context'
import { AppShell } from '@/components/app-shell'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'CareCircle',
  description: 'Family care coordination for serious illness'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <AppShell>{children}</AppShell>
        </UserProvider>
      </body>
    </html>
  )
}

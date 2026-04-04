import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareCircle',
  description: 'Family care coordination for serious illness'
}

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/medications', label: 'Medications' },
  { href: '/notes', label: 'Doctor Notes' },
  { href: '/summary', label: 'Weekly Summary' },
  { href: '/community', label: 'Community' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-rose-50">
        <header className="bg-white border-b border-rose-100 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-rose-600 font-bold text-xl tracking-tight">CareCircle</span>
            <span className="text-zinc-400 text-sm font-medium">· Bà Lan Nguyen</span>
          </div>
          <nav className="flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-zinc-600 rounded-md hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
      </body>
    </html>
  )
}

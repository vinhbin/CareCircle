// APP SHELL — Sidebar-based dashboard layout
// Desktop: sticky left sidebar with nav links + top header
// Mobile: hamburger menu + bottom navigation bar
// Public routes (/, /select, /emergency): renders children without chrome

'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Home,
  Pill,
  FileText,
  Sparkles,
  FolderOpen,
  Users,
  Menu,
  X,
  Heart,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/medications', label: 'Medications', icon: Pill },
  { path: '/notes', label: 'Doctor Notes', icon: FileText },
  { path: '/summary', label: 'Weekly Summary', icon: Sparkles },
  { path: '/documents', label: 'Documents', icon: FolderOpen },
  { path: '/community', label: 'Community', icon: Users },
]

function nameToColor(name: string) {
  const palettes = [
    { bg: 'bg-rose-500', text: 'text-white' },
    { bg: 'bg-sky-500', text: 'text-white' },
    { bg: 'bg-emerald-500', text: 'text-white' },
    { bg: 'bg-violet-500', text: 'text-white' },
    { bg: 'bg-amber-500', text: 'text-white' },
    { bg: 'bg-teal-500', text: 'text-white' },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palettes[Math.abs(hash) % palettes.length]
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Public routes — no shell chrome
  const isPublic =
    pathname === '/' ||
    pathname === '/select' ||
    pathname.startsWith('/emergency')

  if (isPublic) {
    return <main className="flex-1 w-full">{children}</main>
  }

  // Dashboard routes — full sidebar layout
  const colors = user ? nameToColor(user.name) : { bg: 'bg-rose-500', text: 'text-white' }

  return (
    <div className="min-h-screen bg-rose-50/60">
      {/* ── Top header bar ── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100/60 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} className="text-zinc-700" /> : <Menu size={22} className="text-zinc-700" />}
            </button>

            {/* Greeting */}
            <h2 className="text-base sm:text-lg font-medium text-zinc-800">
              {user ? `${greeting()}, ${user.name.split(' ')[0]}` : 'CareCircle'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Switch user */}
            <button
              onClick={() => { setUser(null); router.push('/select') }}
              className="text-sm text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer hidden sm:block"
            >
              Switch User
            </button>

            {/* Patient name */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
              <span>Caring for</span>
              <span className="font-medium text-zinc-800">Ba Lan Nguyen</span>
            </div>

            {/* User avatar */}
            {user && (
              <Avatar className="size-9 ring-2 ring-rose-100">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className={`${colors.bg} ${colors.text} text-sm font-semibold`}>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-rose-100/60 min-h-[calc(100vh-4rem)] sticky top-16">
          {/* Logo */}
          <div className="px-6 pt-6 pb-4">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="size-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center shadow-md shadow-rose-200/50 group-hover:shadow-lg group-hover:shadow-rose-300/50 transition-shadow">
                <Heart className="text-white" size={18} fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-zinc-800 tracking-tight">CareCircle</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 font-medium shadow-sm shadow-rose-100/50'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sidebar footer — switch user on mobile */}
          <div className="px-4 py-4 border-t border-zinc-100">
            <button
              onClick={() => { setUser(null); router.push('/select') }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <div className="size-7 rounded-full bg-zinc-100 flex items-center justify-center">
                <Users size={14} className="text-zinc-400" />
              </div>
              <span>Switch User</span>
            </button>
          </div>
        </aside>

        {/* ── Mobile sidebar drawer ── */}
        <aside
          className={`lg:hidden fixed top-16 left-0 w-72 bg-white border-r border-rose-100/60 h-[calc(100vh-4rem)] z-50 transition-transform duration-300 ease-out shadow-xl shadow-black/5 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo in mobile drawer */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center shadow-sm shadow-rose-200/50">
                <Heart className="text-white" size={16} fill="currentColor" />
              </div>
              <span className="text-base font-bold text-zinc-800 tracking-tight">CareCircle</span>
            </div>
          </div>

          {/* Patient info in mobile */}
          <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-rose-50/80 border border-rose-100/60">
            <p className="text-xs text-zinc-400">Caring for</p>
            <p className="text-sm font-medium text-zinc-800">Ba Lan Nguyen</p>
          </div>

          <nav className="px-3 py-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 font-medium'
                      : 'text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-zinc-100">
            <button
              onClick={() => { setUser(null); setMobileMenuOpen(false); router.push('/select') }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <div className="size-7 rounded-full bg-zinc-100 flex items-center justify-center">
                <Users size={14} className="text-zinc-400" />
              </div>
              <span>Switch User</span>
            </button>
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-rose-100/60 z-40 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-rose-500' : 'text-zinc-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

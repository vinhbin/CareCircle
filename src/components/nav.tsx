// NAV — App navigation bar
// Hidden on the user selection page (/)
// Shows: CareCircle logo, patient name, page links with active highlight
// Shows: logged-in user avatar + name + "Switch" link to return to user selection

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/medications', label: 'Medications' },
  { href: '/notes', label: 'Doctor Notes' },
  { href: '/summary', label: 'Weekly Summary' },
  { href: '/community', label: 'Community' },
]

export function Nav() {
  const { user, setUser } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  // Hide nav on landing and user selection pages
  if (pathname === '/' || pathname === '/select' || pathname.startsWith('/emergency')) return null

  return (
    <header className="bg-white border-b border-rose-100 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-rose-600 font-bold text-xl tracking-tight hover:text-rose-700">
          CareCircle
        </Link>
        <span className="text-zinc-400 text-sm font-medium">· Bà Lan Nguyen</span>
      </div>
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                pathname === link.href
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-zinc-600 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
            <div className="w-7 h-7 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-700">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm text-zinc-600">{user.name.split(' ')[0]}</span>
            <button
              onClick={() => { setUser(null); router.push('/select') }}
              className="text-xs text-zinc-400 hover:text-rose-600 cursor-pointer"
            >
              Switch
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

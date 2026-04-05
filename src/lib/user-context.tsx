// USER CONTEXT — React context for the selected family member
// Persists to localStorage so the selection survives page reloads
// Provides: useUser() hook → { user, setUser }
// Wrapped around the app in layout.tsx via <UserProvider>

'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type FamilyMember = {
  id: number
  patient_id: number
  name: string
  role: string
  relationship: string
  avatar_url: string | null
  phone: string | null
}

type UserContextType = {
  user: FamilyMember | null
  setUser: (member: FamilyMember | null) => void
}

const UserContext = createContext<UserContextType>({ user: null, setUser: () => {} })

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<FamilyMember | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('carecircle_user')
    if (stored) {
      try { return JSON.parse(stored) } catch { return null }
    }
    return null
  })

  function setUser(member: FamilyMember | null) {
    setUserState(member)
    if (member) {
      localStorage.setItem('carecircle_user', JSON.stringify(member))
    } else {
      localStorage.removeItem('carecircle_user')
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

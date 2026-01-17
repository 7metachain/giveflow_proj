'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// User roles
export type UserRole = 'donor' | 'beneficiary' | null

interface UserContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  clearRole: () => void
  isRoleSelected: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null)
  const [mounted, setMounted] = useState(false)

  // Load role from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedRole = localStorage.getItem('giveflow_role') as UserRole
    if (savedRole === 'donor' || savedRole === 'beneficiary') {
      setRoleState(savedRole)
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    if (newRole) {
      localStorage.setItem('giveflow_role', newRole)
    }
  }

  const clearRole = () => {
    setRoleState(null)
    localStorage.removeItem('giveflow_role')
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <UserContext.Provider
      value={{
        role,
        setRole,
        clearRole,
        isRoleSelected: role !== null,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

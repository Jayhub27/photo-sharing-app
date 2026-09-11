import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as api from './api'
import type { User } from './api'
import { getToken, setToken } from './storage'

interface AuthState {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ;(async () => {
      const token = await getToken()
      if (token) {
        api.setAuthToken(token)
        try {
          const { user } = await api.me()
          setUser(user)
        } catch {
          api.setAuthToken(null)
          await setToken(null)
        }
      }
      setReady(true)
    })()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      async signIn(email, password) {
        const res = await api.login(email, password)
        api.setAuthToken(res.token)
        await setToken(res.token)
        setUser(res.user)
      },
      async signUp(name, email, password) {
        const res = await api.signup(name, email, password)
        api.setAuthToken(res.token)
        await setToken(res.token)
        setUser(res.user)
      },
      async signOut() {
        try {
          await api.logout()
        } catch {}
        api.setAuthToken(null)
        await setToken(null)
        setUser(null)
      },
    }),
    [user, ready]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

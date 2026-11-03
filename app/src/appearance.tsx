import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getValue, setValue } from './storage'

export type Intensity = 'subtle' | 'balanced' | 'vivid'
export type AmbientSource = 'collections' | 'photo' | 'both'

export interface Appearance {
  adaptive: boolean
  intensity: Intensity
  source: AmbientSource
  reduceMotion: boolean
}

const STORAGE_KEY = 'photoshare.appearance'

export const DEFAULT_APPEARANCE: Appearance = {
  adaptive: true,
  intensity: 'subtle',
  source: 'both',
  reduceMotion: false,
}

interface AppearanceState {
  ready: boolean
  settings: Appearance
  update: (patch: Partial<Appearance>) => Promise<void>
}

const AppearanceContext = createContext<AppearanceState | null>(null)

function normalize(raw: unknown): Appearance {
  const value = (raw || {}) as Partial<Appearance>
  const intensity: Intensity =
    value.intensity === 'balanced' || value.intensity === 'vivid' ? value.intensity : 'subtle'
  const source: AmbientSource =
    value.source === 'collections' || value.source === 'photo' ? value.source : 'both'
  return {
    adaptive: value.adaptive !== false,
    intensity,
    source,
    reduceMotion: value.reduceMotion === true,
  }
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [settings, setSettings] = useState<Appearance>(DEFAULT_APPEARANCE)

  useEffect(() => {
    let active = true
    getValue(STORAGE_KEY)
      .then((stored) => {
        if (!active) return
        if (stored) {
          try {
            setSettings(normalize(JSON.parse(stored)))
          } catch {}
        }
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  const update = async (patch: Partial<Appearance>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    await setValue(STORAGE_KEY, JSON.stringify(next))
  }

  const value = useMemo<AppearanceState>(
    () => ({ ready, settings, update }),
    // update closes over settings; recreating the value is fine and keeps it fresh.
    [ready, settings]
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance(): AppearanceState {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used inside AppearanceProvider')
  return ctx
}

export function intensityLabel(intensity: Intensity): string {
  if (intensity === 'balanced') return 'Balanced'
  if (intensity === 'vivid') return 'Vivid'
  return 'Subtle'
}

export function sourceLabel(source: AmbientSource): string {
  if (source === 'collections') return 'Collections'
  if (source === 'photo') return 'Photo'
  return 'Both'
}

export function appearanceSummary(settings: Appearance): string {
  if (!settings.adaptive) return 'Warm paper'
  return `Adaptive · ${intensityLabel(settings.intensity).toLowerCase()}`
}

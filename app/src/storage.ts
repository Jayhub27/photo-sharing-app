import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const KEY = 'photoshare.session'

export async function getValue(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    }
    return await SecureStore.getItemAsync(key)
  } catch {
    return null
  }
}

export async function setValue(key: string, value: string | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return
      if (value) localStorage.setItem(key, value)
      else localStorage.removeItem(key)
      return
    }
    if (value) await SecureStore.setItemAsync(key, value)
    else await SecureStore.deleteItemAsync(key)
  } catch {}
}

export function getToken(): Promise<string | null> {
  return getValue(KEY)
}

export function setToken(token: string | null): Promise<void> {
  return setValue(KEY, token)
}

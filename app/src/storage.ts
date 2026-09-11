import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const KEY = 'photoshare.session'

export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    }
    return await SecureStore.getItemAsync(KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return
      if (token) localStorage.setItem(KEY, token)
      else localStorage.removeItem(KEY)
      return
    }
    if (token) await SecureStore.setItemAsync(KEY, token)
    else await SecureStore.deleteItemAsync(KEY)
  } catch {}
}

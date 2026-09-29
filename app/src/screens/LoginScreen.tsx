import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../auth'
import { getApiBase, setApiBase, type RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, LoadingScreen } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [base, setBase] = useState(getApiBase())
  const [serverUrl, setServerUrl] = useState(getApiBase() || '')
  const [serverOpen, setServerOpen] = useState(!getApiBase())
  const [saving, setSaving] = useState(false)

  const saveServer = async () => {
    const value = serverUrl.trim()
    if (!/^https?:\/\//i.test(value)) {
      Alert.alert('Invalid URL', 'Enter a full URL including http:// or https://')
      return
    }
    setSaving(true)
    await setApiBase(value)
    setBase(getApiBase())
    setSaving(false)
    setServerOpen(false)
  }

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter your email and password.')
      return
    }
    setBusy(true)
    try {
      await signIn(email.trim().toLowerCase(), password)
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Could not log in')
      setBusy(false)
    }
  }

  if (busy) return <LoadingScreen />

  return (
    <View style={[styles.container, { padding: 24 }]}>
      <FadeIn>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="camera" size={21} color="#2a2119" />
          </View>
          <Text style={styles.logoText}>Take the shot</Text>
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your photo collections.</Text>
        {serverOpen ? (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8 }}>
              Server URL (the deployed API this app should talk to)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.50:3000"
              placeholderTextColor={colors.textMuted}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onSubmitEditing={saveServer}
            />
            <Pressable onPress={saveServer} disabled={saving} style={{ paddingVertical: 10 }}>
              <Text style={{ color: colors.accent, fontWeight: '600', textAlign: 'center' }}>
                {saving ? 'Saving…' : 'Save server'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setServerOpen(true)} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
              Server: <Text style={{ color: colors.accent }}>{base}</Text> · change
            </Text>
          </Pressable>
        )}
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={submit}
        />
        <AnimatedButton onPress={submit}>
          <ButtonText>Log in</ButtonText>
        </AnimatedButton>
        <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 15 }}>
            New here? <Text style={{ color: colors.accent, fontWeight: '600' }}>Create an account</Text>
          </Text>
        </Pressable>
      </FadeIn>
    </View>
  )
}

import React, { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../auth'
import type { RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, LoadingScreen } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

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
            <Text style={{ fontSize: 20 }}>📷</Text>
          </View>
          <Text style={styles.logoText}>PhotoShare</Text>
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your photo collections.</Text>
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

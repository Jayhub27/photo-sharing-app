import React, { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../auth'
import type { RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, LoadingScreen } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>

export default function SignupScreen({ navigation }: Props) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Fill in your name, email and password.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password)
    } catch (err) {
      Alert.alert('Sign up failed', err instanceof Error ? err.message : 'Could not create account')
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start sharing photos with a QR code in seconds.</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />
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
          placeholder="Password (min 8 characters)"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={submit}
        />
        <AnimatedButton onPress={submit}>
          <ButtonText>Create account</ButtonText>
        </AnimatedButton>
        <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 15 }}>
            Already have an account? <Text style={{ color: colors.accent, fontWeight: '600' }}>Log in</Text>
          </Text>
        </Pressable>
      </FadeIn>
    </View>
  )
}

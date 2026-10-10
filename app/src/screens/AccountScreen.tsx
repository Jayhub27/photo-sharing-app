import React from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { getApiBase } from '../api'
import { useAuth } from '../auth'
import { colors, fonts } from '../styles'
import { FadeIn } from '../components'

export default function AccountScreen() {
  const { user, signOut } = useAuth()

  const initials = (user?.name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const onSignOut = () => {
    if (Platform.OS === 'web') {
      signOut()
      return
    }
    Alert.alert('Log out?', 'You will need to sign in again to see your collections.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.wrap}>
      <FadeIn>
        <Text style={s.kicker}>Account</Text>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>

        <View style={s.monogram}>
          <Text style={s.monogramText}>{initials}</Text>
        </View>

        <View style={s.rule} />

        <View style={s.row}>
          <Text style={s.label}>Server</Text>
          <Text style={s.value} numberOfLines={1}>
            {getApiBase() || 'Not configured'}
          </Text>
        </View>

        <View style={s.row}>
          <Text style={s.label}>App</Text>
          <Text style={s.value}>Take the shot · private photo sharing</Text>
        </View>

        <Pressable onPress={onSignOut} style={s.signOut} accessibilityRole="button">
          <Text style={s.signOutText}>Log out</Text>
        </Pressable>
      </FadeIn>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  wrap: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48 },
  kicker: {
    fontFamily: fonts.sansSemi,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.red,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: 8,
  },
  email: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  monogram: {
    width: 64,
    height: 64,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  monogramText: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.paper,
  },
  rule: { borderTopWidth: 1, borderTopColor: colors.ink, marginTop: 24 },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 16,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 6,
  },
  value: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.ink,
  },
  signOut: { marginTop: 28 },
  signOutText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.red,
  },
})

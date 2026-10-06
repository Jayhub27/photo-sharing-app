import React from 'react'
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getApiBase } from '../api'
import { useAuth } from '../auth'
import { colors, radii, shadows, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn } from '../components'

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
    <ScrollView style={styles.container} contentContainerStyle={s.wrap}>
      <FadeIn>
        <Text style={styles.title}>Account</Text>
        <Text style={[styles.subtitle, { marginBottom: 20 }]}>
          Signed in to your Take the shot server.
        </Text>

        <View style={s.profile}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={s.email} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <Text style={s.label}>Server</Text>
        <View style={s.row}>
          <Ionicons name="server-outline" size={18} color={colors.textMuted} />
          <Text style={s.rowText} numberOfLines={1}>
            {getApiBase() || 'Not configured'}
          </Text>
        </View>

        <Text style={s.label}>About</Text>
        <View style={s.row}>
          <Ionicons name="camera-outline" size={18} color={colors.textMuted} />
          <Text style={s.rowText}>Take the shot</Text>
          <Text style={s.rowMuted}>private photo sharing</Text>
        </View>

        <View style={{ marginTop: 26 }}>
          <AnimatedButton outline onPress={onSignOut}>
            <Ionicons name="log-out-outline" size={18} color={colors.text} />
            <ButtonText outline>Log out</ButtonText>
          </AnimatedButton>
        </View>
      </FadeIn>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { padding: 24, paddingBottom: 48 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 22,
    ...shadows.card,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 19, fontWeight: '700', color: colors.onAccent },
  name: { fontSize: 17, fontWeight: '600', color: colors.text },
  email: { fontSize: 14, color: colors.textMuted, marginTop: 3 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  rowText: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
  rowMuted: { fontSize: 12, color: colors.textMuted },
})

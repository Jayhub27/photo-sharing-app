import React, { useState } from 'react'
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getApiBase, type AppTabParamList, type RootStackParamList } from '../api'
import { useAuth } from '../auth'
import { appearanceSummary, useAppearance } from '../appearance'
import { FeedbackChat } from '../components/FeedbackChat'
import { glassLight, type, wg } from '../theme/warmGlass'

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>

export default function AccountScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user, signOut } = useAuth()
  const { settings } = useAppearance()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

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
    <ScrollView
      style={s.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 18,
        paddingHorizontal: 22,
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.kicker}>Account</Text>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.email}>{user?.email}</Text>

      <View style={s.identityRow}>
        <View style={[s.monogram, glassLight]}>
          <Text style={s.monogramText}>{initials}</Text>
        </View>
        <View style={s.identityText}>
          <Text style={s.identityLabel}>Private by default</Text>
          <Text style={s.identityCopy}>Your photos stay on your server.</Text>
        </View>
      </View>

      <Text style={s.section}>Appearance</Text>

      <Pressable
        onPress={() => navigation.navigate('Appearance')}
        style={[s.appearanceCard, glassLight]}
        accessibilityRole="button"
        accessibilityLabel="Open appearance settings"
      >
        <View style={s.appearanceIcon}>
          <Ionicons name="color-palette-outline" size={18} color={wg.color.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle}>Adaptive background</Text>
          <Text style={s.rowValue}>{appearanceSummary(settings)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={wg.color.muted} />
      </Pressable>

      <Text style={s.section}>Help</Text>

      <Pressable
        onPress={() => setFeedbackOpen(true)}
        style={[s.appearanceCard, glassLight]}
        accessibilityRole="button"
        accessibilityLabel="Report a bug or suggest an improvement"
      >
        <View style={s.appearanceIcon}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={wg.color.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle}>Report a bug or idea</Text>
          <Text style={s.rowValue}>Temporary feedback chat</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={wg.color.muted} />
      </Pressable>

      <Text style={s.section}>About</Text>

      <View style={[s.infoCard, glassLight]}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Server</Text>
          <Text style={s.infoValue} numberOfLines={1}>
            {getApiBase() || 'Not configured'}
          </Text>
        </View>
        <View style={s.infoRule} />
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>App</Text>
          <Text style={s.infoValue}>Take the shot · private photo sharing</Text>
        </View>
      </View>

      <Pressable onPress={onSignOut} style={s.signOut} accessibilityRole="button">
        <Text style={s.signOutText}>Log out</Text>
      </Pressable>

      <FeedbackChat visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: wg.color.paper },
  kicker: {
    ...type.label,
    color: wg.color.bronze,
    fontSize: 9,
  },
  name: {
    ...type.display,
    fontSize: 36,
    marginTop: 7,
  },
  email: {
    fontFamily: wg.font.sans,
    fontSize: 12,
    color: wg.color.muted,
    marginTop: 4,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 20,
  },
  monogram: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: wg.font.serif,
    fontSize: 23,
    color: wg.color.ink,
  },
  identityText: { flex: 1 },
  identityLabel: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: wg.color.bronze,
  },
  identityCopy: {
    fontFamily: wg.font.sans,
    fontSize: 10.5,
    color: wg.color.muted,
    marginTop: 3,
  },
  section: {
    ...type.label,
    fontSize: 8,
    marginTop: 28,
    marginBottom: 8,
  },
  appearanceCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appearanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: wg.font.sansSemi,
    fontSize: 12.5,
    color: wg.color.ink,
  },
  rowValue: {
    fontFamily: wg.font.sans,
    fontSize: 9.5,
    color: wg.color.muted,
    marginTop: 3,
  },
  infoCard: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  infoRow: { paddingVertical: 12 },
  infoLabel: {
    ...type.label,
    fontSize: 7,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: wg.font.sans,
    fontSize: 12,
    color: wg.color.inkSoft,
  },
  infoRule: { height: 1, backgroundColor: 'rgba(33,28,21,0.1)' },
  signOut: {
    marginTop: 28,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,29,24,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  signOutText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: wg.color.danger,
  },
})

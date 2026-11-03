import React from 'react'
import {
  Image,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { collectionUrl, qrUrl, type RootStackParamList } from '../api'
import { AmbientBackground } from '../components/AmbientBackground'
import { glassLight, type, wg } from '../theme/warmGlass'

type Props = NativeStackScreenProps<RootStackParamList, 'QRDisplay'>

export default function QRDisplayScreen({ route, navigation }: Props) {
  const { id, name } = route.params
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const qrSize = Math.min(Math.max(width - 168, 176), 264)
  const uri = qrUrl(id)
  const shareUrl = collectionUrl(id)

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out my photo collection: ${shareUrl}` })
    } catch {}
  }

  const handleOpen = () => {
    Linking.openURL(shareUrl).catch(() => {})
  }

  return (
    <View style={s.screen}>
      <AmbientBackground kind="collection" id={id} variant="light" />

      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
          flex: 1,
        }}
      >
        <View style={s.toprow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[s.circle, glassLight]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={18} color={wg.color.ink} />
          </Pressable>
          <Text style={s.kicker}>Share · no app needed</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.head}>
          <Text style={s.title}>Share this{'\n'}collection</Text>
          <Text style={s.subtitle}>
            One scan opens the gallery.{'\n'}No app, no account needed.
          </Text>
        </View>

        <View style={[s.card, glassLight]}>
          <View style={[s.qrTile, { width: qrSize + 24, height: qrSize + 24 }]}>
            <Image source={{ uri }} style={{ width: qrSize, height: qrSize }} resizeMode="contain" />
          </View>
          <Text style={s.name}>{name || 'Collection'}</Text>
          <Text style={s.link} numberOfLines={1}>
            {shareUrl}
          </Text>
          <View style={s.rule} />
          <View style={s.privacyRow}>
            <Ionicons name="lock-closed-outline" size={12} color={wg.color.muted} />
            <Text style={s.privacy}>Private link · expires with the collection</Text>
          </View>
        </View>

        <View style={s.spacer} />

        <Pressable onPress={handleShare} style={s.primary} accessibilityRole="button">
          <Ionicons name="share-outline" size={15} color={wg.color.ivory} />
          <Text style={s.primaryText}>Share link</Text>
        </Pressable>

        <Pressable onPress={handleOpen} style={[s.secondary, glassLight]} accessibilityRole="button">
          <Text style={s.secondaryText}>Open in browser</Text>
        </Pressable>

        <Text style={s.footnote}>Print the QR or send the link. Buyers can pay by card.</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: wg.color.paper },
  toprow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  head: { alignItems: 'center', marginTop: 22 },
  title: {
    ...type.display,
    fontSize: 36,
    lineHeight: 35,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: wg.font.sans,
    fontSize: 10.5,
    lineHeight: 15,
    color: wg.color.muted,
    textAlign: 'center',
    marginTop: 9,
  },
  card: {
    marginTop: 22,
    borderRadius: 26,
    padding: 18,
    alignItems: 'center',
  },
  qrTile: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  name: {
    fontFamily: wg.font.serif,
    fontSize: 21,
    letterSpacing: -0.4,
    color: wg.color.ink,
    marginTop: 13,
  },
  link: {
    fontFamily: wg.font.sans,
    fontSize: 9,
    letterSpacing: 0.2,
    color: wg.color.muted,
    marginTop: 4,
    maxWidth: '90%',
  },
  rule: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(33,28,21,0.1)',
    marginTop: 12,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },
  privacy: {
    fontFamily: wg.font.sans,
    fontSize: 8,
    color: wg.color.muted,
  },
  spacer: { flex: 1, minHeight: 14 },
  primary: {
    height: 52,
    borderRadius: 999,
    backgroundColor: wg.color.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3C2B14',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  primaryText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: wg.color.ivory,
  },
  secondary: {
    height: 44,
    borderRadius: 999,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  },
  footnote: {
    fontFamily: wg.font.sans,
    fontSize: 8,
    color: 'rgba(132,122,105,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
})

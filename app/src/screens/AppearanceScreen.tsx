import React, { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listCollections, type Collection, type RootStackParamList } from '../api'
import {
  intensityLabel,
  sourceLabel,
  useAppearance,
  type AmbientSource,
  type Intensity,
} from '../appearance'
import { AmbientBackground } from '../components/AmbientBackground'
import {
  glassLight,
  paperRgba,
  type,
  wg,
} from '../theme/warmGlass'

type Props = NativeStackScreenProps<RootStackParamList, 'Appearance'>

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <View style={s.segment}>
      {options.map((option) => {
        const on = option.value === value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[s.segmentItem, on && s.segmentItemOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text style={[s.segmentText, on && s.segmentTextOn]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function AppearanceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { settings, update } = useAppearance()
  const [preview, setPreview] = useState<Collection | null>(null)

  useEffect(() => {
    let active = true
    listCollections({ limit: 4 })
      .then((res) => {
        if (!active) return
        const withCover = res.collections.find(
          (c) => c.cover_filename || c.cover_thumb_filename || c.has_ambient
        )
        const forSale = res.collections.find(
          (c) => c.price_cents && c.price_cents > 0 && (c.cover_filename || c.cover_thumb_filename || c.has_ambient)
        )
        setPreview(forSale || withCover || res.collections[0] || null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const palette =
    preview?.ambient_colors?.length
      ? preview.ambient_colors
      : [wg.color.teal, wg.color.bronze, wg.color.line, wg.color.paperDeep]

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.toprow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={s.back}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={18} color={wg.color.ink} />
          </Pressable>
          <Text style={s.kicker}>Account / Appearance</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={s.title}>Appearance</Text>
        <Text style={s.subtitle}>Make the app feel like your work.</Text>

        <Text style={s.section}>Adaptive background</Text>

        <View style={[s.card, glassLight]}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>Use your photos</Text>
              <Text style={s.rowDesc}>Tint the shell with the colours of your photos.</Text>
            </View>
            <Switch
              value={settings.adaptive}
              onValueChange={(adaptive) => update({ adaptive })}
              trackColor={{ false: 'rgba(33,28,21,0.16)', true: wg.color.teal }}
              thumbColor={wg.color.ivory}
              ios_backgroundColor="rgba(33,28,21,0.16)"
            />
          </View>

          {settings.adaptive ? (
            <>
              <View style={s.rule} />

              <Text style={s.fieldLabel}>Source</Text>
              <Segmented<AmbientSource>
                options={[
                  { value: 'collections', label: 'Collections' },
                  { value: 'photo', label: 'Photo' },
                  { value: 'both', label: 'Both' },
                ]}
                value={settings.source}
                onChange={(source) => update({ source })}
              />

              <Text style={[s.fieldLabel, { marginTop: 14 }]}>Intensity</Text>
              <Segmented<Intensity>
                options={[
                  { value: 'subtle', label: 'Subtle' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'vivid', label: 'Vivid' },
                ]}
                value={settings.intensity}
                onChange={(intensity) => update({ intensity })}
              />

              <View style={s.motionRow}>
                <Text style={s.motionText}>Reduce motion · static backdrop</Text>
                <Switch
                  value={settings.reduceMotion}
                  onValueChange={(reduceMotion) => update({ reduceMotion })}
                  trackColor={{ false: 'rgba(33,28,21,0.16)', true: wg.color.teal }}
                  thumbColor={wg.color.ivory}
                  ios_backgroundColor="rgba(33,28,21,0.16)"
                />
              </View>
            </>
          ) : null}
        </View>

        <View style={s.sectionRow}>
          <Text style={s.section}>Preview</Text>
          <Text style={s.mode}>
            {settings.adaptive
              ? `${sourceLabel(settings.source)} · ${intensityLabel(settings.intensity)}`
              : 'Warm paper'}
          </Text>
        </View>

        <View style={[s.previewCard, glassLight]}>
          <View style={s.previewHead}>
            <Text style={s.previewName} numberOfLines={1}>
              {preview?.name || 'Your collection'}
            </Text>
            <View style={s.previewDots}>
              {palette.slice(0, 4).map((color, index) => (
                <View key={`${color}-${index}`} style={[s.previewDot, { backgroundColor: color }]} />
              ))}
            </View>
          </View>

          <View style={s.preview}>
            {settings.adaptive && preview ? (
              <AmbientBackground kind="collection" id={preview.id} variant="light" force />
            ) : (
              <LinearGradient
                colors={[wg.color.paperSoft, wg.color.paperDeep, paperRgba(0.9)]}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[s.previewGlass, settings.adaptive && glassLight]}>
              <Text style={s.previewTitle} numberOfLines={1}>
                {settings.adaptive ? preview?.name || 'Your collection' : 'Warm paper'}
              </Text>
              <Text style={s.previewMeta} numberOfLines={1}>
                {settings.adaptive
                  ? `${intensityLabel(settings.intensity)} · ${sourceLabel(settings.source)}`
                  : 'No ambient images downloaded'}
              </Text>
            </View>
          </View>

          <Text style={s.note}>
            48 px copy · generated on your server · cached per collection
          </Text>
        </View>

        <Text style={s.footer}>
          Off uses the warm paper theme. Ambient images are private and served through the same
          access check as your photos.
        </Text>
      </ScrollView>
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
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(33,28,21,0.12)',
    backgroundColor: 'rgba(255,255,255,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  title: {
    ...type.display,
    fontSize: 38,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: wg.font.sans,
    fontSize: 11,
    color: wg.color.muted,
    marginTop: 5,
  },
  section: {
    ...type.label,
    fontSize: 8,
    marginTop: 24,
  },
  card: {
    marginTop: 9,
    borderRadius: 20,
    padding: 15,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowTitle: {
    fontFamily: wg.font.sansSemi,
    fontSize: 13,
    color: wg.color.ink,
  },
  rowDesc: {
    fontFamily: wg.font.sans,
    fontSize: 9,
    lineHeight: 14,
    color: wg.color.muted,
    marginTop: 4,
    maxWidth: 235,
  },
  rule: { height: 1, backgroundColor: 'rgba(33,28,21,0.1)', marginVertical: 14 },
  fieldLabel: {
    ...type.label,
    fontSize: 7,
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(33,28,21,0.1)',
    borderRadius: 11,
    padding: 3,
    gap: 2,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentItemOn: { backgroundColor: wg.color.ink },
  segmentText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  segmentTextOn: { color: wg.color.ivory },
  motionRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  motionText: {
    fontFamily: wg.font.sans,
    fontSize: 9,
    color: wg.color.muted,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  mode: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: wg.color.bronze,
  },
  previewCard: {
    marginTop: 9,
    borderRadius: 20,
    padding: 11,
  },
  previewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  previewName: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: wg.color.muted,
    flex: 1,
  },
  previewDots: { flexDirection: 'row', gap: 4 },
  previewDot: { width: 7, height: 7, borderRadius: 4 },
  preview: {
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  previewGlass: {
    margin: 9,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(250,245,234,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.56)',
  },
  previewTitle: {
    fontFamily: wg.font.serif,
    fontSize: 15,
    color: wg.color.ink,
    letterSpacing: -0.3,
  },
  previewMeta: {
    fontFamily: wg.font.sansSemi,
    fontSize: 6.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: wg.color.muted,
    marginTop: 2,
  },
  note: {
    fontFamily: wg.font.sans,
    fontSize: 8,
    lineHeight: 12,
    color: wg.color.muted,
    marginTop: 9,
    paddingHorizontal: 2,
  },
  footer: {
    fontFamily: wg.font.sans,
    fontSize: 8.5,
    lineHeight: 13,
    color: 'rgba(132,122,105,0.9)',
    marginTop: 14,
  },
})

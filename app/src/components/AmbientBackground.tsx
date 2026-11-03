import React from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ambientCollectionUrl, ambientPhotoUrl, imageHeaders } from '../api'
import { useAppearance, type Intensity } from '../appearance'
import { darkRgba, paperRgba, wg } from '../theme/warmGlass'

type Variant = 'light' | 'dark'

const washAlpha: Record<Intensity, number> = {
  subtle: wg.wash.subtle,
  balanced: wg.wash.balanced,
  vivid: wg.wash.vivid,
}

function Wash({ variant, intensity }: { variant: Variant; intensity: Intensity }) {
  const a = washAlpha[intensity]
  const colors: [string, string, string] =
    variant === 'light'
      ? [paperRgba(a), paperRgba(Math.max(0.2, a - 0.1)), paperRgba(Math.min(1, a + 0.14))]
      : [darkRgba(0.44), darkRgba(0.16), darkRgba(0.62)]

  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors}
      locations={[0, 0.52, 1]}
      style={StyleSheet.absoluteFill}
    />
  )
}

function AmbientImage({
  uri,
  transition,
  blurRadius = 0,
}: {
  uri: string
  transition: number
  blurRadius?: number
}) {
  const source = React.useMemo(() => ({ uri, headers: imageHeaders() }), [uri])
  return (
    <Image
      source={source}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={transition}
      blurRadius={blurRadius}
      accessibilityIgnoresInvertColors
    />
  )
}

/**
 * A full-bleed backdrop for a collection or a single photo. The image is already
 * blurred on the server (48 px), so no native blur module is needed.
 */
export function AmbientBackground({
  kind,
  id,
  variant = 'light',
  force = false,
  style,
}: {
  kind: 'collection' | 'photo'
  id?: string | null
  variant?: Variant
  force?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const { settings } = useAppearance()
  if (!id) return null
  if (!settings.adaptive && !force) return null

  const uri = kind === 'collection' ? ambientCollectionUrl(id) : ambientPhotoUrl(id)
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AmbientImage uri={uri} transition={settings.reduceMotion ? 0 : 350} />
      <Wash variant={variant} intensity={settings.intensity} />
    </View>
  )
}

/**
 * Home blends up to four collection covers into a 2 x 2 wash. Each tile is a
 * 48 px asset, so the whole mosaic is still only a few kilobytes.
 */
export function AmbientMosaic({
  ids,
  variant = 'light',
  style,
}: {
  ids: string[]
  variant?: Variant
  style?: StyleProp<ViewStyle>
}) {
  const { settings } = useAppearance()
  if (!settings.adaptive || !ids.length) return null

  const slots = [ids[0], ids[1] || ids[0], ids[2] || ids[0], ids[3] || ids[0]]
  const transition = settings.reduceMotion ? 0 : 350

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.mosaic}>
        {slots.map((id, index) => (
          <View key={`${id}-${index}`} style={styles.tile}>
            <AmbientImage uri={ambientCollectionUrl(id)} transition={transition} blurRadius={22} />
          </View>
        ))}
      </View>
      <Wash variant={variant} intensity={settings.intensity} />
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  mosaic: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    transform: [{ scale: 1.08 }],
  },
  tile: {
    width: '50%',
    height: '50%',
    overflow: 'hidden',
  },
})

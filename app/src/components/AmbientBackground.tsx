import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  AppState,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
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
 * Home blends up to four collection covers into a 2 x 2 wash. The mosaic
 * rotates one cover every ten seconds with a slow crossfade, and pauses when
 * Home is not focused, the app is in the background, or reduce motion is on.
 */
export function AmbientMosaic({
  ids,
  variant = 'light',
  style,
  active = true,
  intervalMs = 10000,
}: {
  ids: string[]
  variant?: Variant
  style?: StyleProp<ViewStyle>
  active?: boolean
  intervalMs?: number
}) {
  const { settings } = useAppearance()
  const [step, setStep] = useState(0)
  const [baseStep, setBaseStep] = useState(0)
  const [incoming, setIncoming] = useState<number | null>(null)
  // Assume foreground on mount; AppState can report "unknown" briefly on Android.
  const [appActive, setAppActive] = useState(true)
  const fade = useRef(new Animated.Value(1)).current
  const idsKey = ids.join('|')

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active')
    })
    return () => sub.remove()
  }, [])

  // A new set of covers starts from the beginning rather than mid-transition.
  useEffect(() => {
    setStep(0)
    setBaseStep(0)
    setIncoming(null)
    fade.setValue(1)
  }, [idsKey, fade])

  useEffect(() => {
    if (!active || !appActive || !settings.adaptive || settings.reduceMotion || ids.length < 2) {
      return
    }
    const timer = setInterval(() => setStep((value) => value + 1), intervalMs)
    return () => clearInterval(timer)
  }, [active, appActive, settings.adaptive, settings.reduceMotion, ids.length, intervalMs])

  useEffect(() => {
    if (step === baseStep) return
    setIncoming(step)
    fade.setValue(0)
    Animated.timing(fade, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return
      setBaseStep(step)
      setIncoming(null)
      fade.setValue(1)
    })
  }, [step, baseStep, fade])

  if (!settings.adaptive || !ids.length) return null

  const slotsFor = (value: number) => {
    const count = ids.length
    return [0, 1, 2, 3].map((offset) => ids[(value + offset) % count])
  }

  const renderMosaic = (value: number) => (
    <View style={styles.mosaic}>
      {slotsFor(value).map((id, index) => (
        <View key={`${id}-${index}-${value}`} style={styles.tile}>
          <AmbientImage uri={ambientCollectionUrl(id)} transition={0} />
        </View>
      ))}
    </View>
  )

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {renderMosaic(baseStep)}
      {incoming !== null ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          {renderMosaic(incoming)}
        </Animated.View>
      ) : null}
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

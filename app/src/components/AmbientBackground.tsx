import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
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
  // The hero title and subtitle sit in the top third, so the paper is densest
  // there; through the middle the photograph is almost untouched.
  const colors: [string, string, string, string] =
    variant === 'light'
      ? [
          paperRgba(Math.min(1, a + 0.54)),
          paperRgba(a + 0.38),
          paperRgba(a + 0.16),
          paperRgba(Math.min(1, a + 0.5)),
        ]
      : [darkRgba(0.86), darkRgba(0.7), darkRgba(0.52), darkRgba(0.86)]

  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors}
      locations={[0, 0.2, 0.44, 1]}
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
  src,
  blurRadius = 0,
  variant = 'light',
  force = false,
  style,
}: {
  kind: 'collection' | 'photo'
  id?: string | null
  /** Full URL to a real photograph; falls back to the blurred ambient derivative. */
  src?: string | null
  blurRadius?: number
  variant?: Variant
  force?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const { settings } = useAppearance()
  if (!id && !src) return null
  if (!settings.adaptive && !force) return null

  const uri = src || (kind === 'collection' ? ambientCollectionUrl(id!) : ambientPhotoUrl(id!))
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AmbientImage
        uri={uri}
        transition={settings.reduceMotion ? 0 : 350}
        blurRadius={blurRadius}
      />
      <Wash variant={variant} intensity={settings.intensity} />
    </View>
  )
}

/**
 * Home rotates through photographs from the collections, full-bleed.
 * Ten seconds per photo with a slow crossfade; reduce motion keeps the first.
 */
export function AmbientMosaic({
  sources,
  blurOpacity,
  blurRadius = 18,
  variant = 'light',
  style,
  intervalMs = 10000,
}: {
  sources: string[]
  /** 0 = sharp, 1 = blurred. Drive it from the list scroll position. */
  blurOpacity?: Animated.Value
  blurRadius?: number
  variant?: Variant
  style?: StyleProp<ViewStyle>
  intervalMs?: number
}) {
  const { settings } = useAppearance()
  const [step, setStep] = useState(0)
  const [baseStep, setBaseStep] = useState(0)
  const [incoming, setIncoming] = useState<number | null>(null)
  const fade = useRef(new Animated.Value(1)).current
  const idsKey = sources.join('|')

  // A new set of photos starts from the beginning rather than mid-transition.
  useEffect(() => {
    setStep(0)
    setBaseStep(0)
    setIncoming(null)
    fade.setValue(1)
  }, [idsKey, fade])

  useEffect(() => {
    if (!settings.adaptive || settings.reduceMotion || sources.length < 2) return
    const timer = setInterval(() => setStep((value) => value + 1), intervalMs)
    return () => clearInterval(timer)
  }, [settings.adaptive, settings.reduceMotion, sources.length, intervalMs])

  useEffect(() => {
    if (step === baseStep) return
    setIncoming(step)
    fade.setValue(0)

    let done = false
    const finish = () => {
      if (done) return
      done = true
      setBaseStep(step)
      setIncoming(null)
      fade.setValue(1)
    }

    // JS-driven: opacity on a tiny image layer is cheap, and this avoids
    // native-driver quirks with freshly mounted image views on Android.
    Animated.timing(fade, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(finish)

    // Guarantee the layer swap even if the animation callback is delayed.
    const fallback = setTimeout(finish, 1000)
    return () => clearTimeout(fallback)
  }, [step, baseStep, fade])

  if (!settings.adaptive || !sources.length) return null

  const renderSlide = (value: number) => {
    const uri = sources[value % sources.length]
    return (
      <View style={StyleSheet.absoluteFill}>
        <AmbientImage uri={uri} transition={0} />
        {blurOpacity ? (
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}
          >
            <AmbientImage uri={uri} transition={0} blurRadius={blurRadius} />
          </Animated.View>
        ) : null}
      </View>
    )
  }

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {renderSlide(baseStep)}
      {incoming !== null ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          {renderSlide(incoming)}
        </Animated.View>
      ) : null}
      <Wash variant={variant} intensity={settings.intensity} />
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
})

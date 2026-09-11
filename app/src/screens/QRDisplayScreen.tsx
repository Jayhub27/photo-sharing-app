import React, { useEffect, useRef } from 'react'
import { Image, Share, Text, View, Animated, Easing } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { collectionUrl, qrUrl, type RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'QRDisplay'>

export default function QRDisplayScreen({ route }: Props) {
  const { id, name } = route.params
  const uri = qrUrl(id)
  const shareUrl = collectionUrl(id)

  const scale = useRef(new Animated.Value(0.8)).current
  const opacity = useRef(new Animated.Value(0)).current
  const glow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out my photo collection: ${shareUrl}` })
    } catch {}
  }

  return (
    <View style={[styles.center]}>
      <FadeIn>
        <Text style={[styles.title, { textAlign: 'center' }]}>
          Share this QR
        </Text>
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>
          {name ? `${name}\n` : ''}Anyone who scans this with their camera opens your collection.
        </Text>
      </FadeIn>

      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          marginBottom: 32,
        }}
      >
        <Animated.View
          style={{
            padding: 12,
            borderRadius: 28,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowOpacity,
            shadowRadius: 30,
            elevation: 8,
          }}
        >
          <Image
            source={{ uri }}
            style={{ width: 260, height: 260, borderRadius: 20 }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      <FadeIn delay={300}>
        <View style={{ width: 280 }}>
          <AnimatedButton onPress={handleShare}>
            <ButtonText>Share link</ButtonText>
          </AnimatedButton>
        </View>
      </FadeIn>
    </View>
  )
}
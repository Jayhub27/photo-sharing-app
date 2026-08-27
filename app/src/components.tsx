import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Pressable,
  type PressableProps,
  type ViewStyle,
  ActivityIndicator,
  Text,
  View,
  Easing,
} from 'react-native'
import { colors, shadows } from './styles'

type AnimatedButtonProps = PressableProps & {
  children: React.ReactNode
  outline?: boolean
  style?: ViewStyle | ViewStyle[]
}

export function AnimatedButton({
  children,
  outline,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current

  const handleIn = (e: any) => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start()
    onPressIn?.(e)
  }
  const handleOut = (e: any) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
    onPressOut?.(e)
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, outline ? {} : shadows.button]}>
      <Pressable
        style={[
          {
            backgroundColor: outline ? 'transparent' : colors.accent,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            borderWidth: outline ? 1.5 : 0,
            borderColor: outline ? colors.border : 'transparent',
          },
          style as any,
        ]}
        onPressIn={handleIn}
        onPressOut={handleOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

export function ButtonText({
  children,
  outline,
}: {
  children: React.ReactNode
  outline?: boolean
}) {
  return (
    <Text
      style={{
        color: outline ? colors.text : '#fff',
        fontSize: 16,
        fontWeight: '600',
      }}
    >
      {children}
    </Text>
  )
}

export function AnimatedCard({
  index,
  children,
  onPress,
}: {
  index: number
  children: React.ReactNode
  onPress: () => void
}) {
  const fade = useRef(new Animated.Value(0)).current
  const slide = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const scale = useRef(new Animated.Value(1)).current

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }, { scale }] }}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

export function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const fade = useRef(new Animated.Value(0)).current
  const slide = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      {children}
    </Animated.View>
  )
}

export function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  })

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          height: 72,
          marginBottom: 12,
          opacity,
        },
      ]}
    />
  )
}

export function LoadingScreen() {
  const spin = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.center}>
      <Animated.View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: colors.border,
          borderTopColor: colors.accent,
          transform: [{ rotate }],
        }}
      />
    </View>
  )
}

import { styles } from './styles'
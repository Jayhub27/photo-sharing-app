import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  Text,
  View,
} from 'react-native'
import { colors, fonts } from './styles'

type AnimatedButtonProps = PressableProps & {
  children: React.ReactNode
  outline?: boolean
  style?: StyleProp<ViewStyle>
}

/** Edition button: a solid ink block or a hairline outline, uppercase label. */
export function AnimatedButton({
  children,
  outline,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current

  const handleIn = (e: any) => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, friction: 9 }).start()
    onPressIn?.(e)
  }
  const handleOut = (e: any) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }).start()
    onPressOut?.(e)
  }

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.45 : 1 }}>
      <Pressable
        style={[
          {
            backgroundColor: outline ? 'transparent' : colors.ink,
            paddingVertical: 15,
            paddingHorizontal: 22,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            borderWidth: outline ? 1 : 0,
            borderColor: colors.ink,
          },
          style as any,
        ]}
        disabled={disabled}
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
        fontFamily: fonts.sansSemi,
        color: outline ? colors.text : colors.onAccent,
        fontSize: 12.5,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
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
  const slide = useRef(new Animated.Value(14)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        delay: Math.min(index, 8) * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 420,
        delay: Math.min(index, 8) * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const scale = useRef(new Animated.Value(1)).current

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }, { scale }] }}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.99, useNativeDriver: true }).start()}
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
  const slide = useRef(new Animated.Value(10)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 460,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 460,
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

function useShimmerOpacity() {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] })
}

export function SkeletonCard() {
  const opacity = useShimmerOpacity()

  return (
    <Animated.View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        height: 72,
        marginBottom: 12,
        opacity,
      }}
    />
  )
}

export function SkeletonGridCard({ width }: { width?: number }) {
  const opacity = useShimmerOpacity()

  return (
    <Animated.View style={{ width, marginBottom: 18, opacity }}>
      <View
        style={{
          width: '100%',
          aspectRatio: 4 / 5,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <View
        style={{
          width: '68%',
          height: 12,
          backgroundColor: colors.surface,
          marginTop: 10,
        }}
      />
    </Animated.View>
  )
}

export function LoadingScreen() {
  const spin = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true })
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        gap: 16,
      }}
    >
      <Animated.View
        style={{
          width: 26,
          height: 26,
          borderWidth: 2,
          borderColor: colors.border,
          borderTopColor: colors.red,
          transform: [{ rotate }],
        }}
      />
      <Text style={{ fontFamily: fonts.serifItalic, fontSize: 16, color: colors.textMuted }}>
        Take the shot
      </Text>
    </View>
  )
}

type ViewerPhoto = { id: string; filename: string; original_name?: string }

/** Edition viewer: a photograph set as a plate on paper, caption beneath. */
export function PhotoViewer({
  visible,
  photos,
  initialIndex,
  onClose,
  urlFor,
  headers,
}: {
  visible: boolean
  photos: ViewerPhoto[]
  initialIndex: number
  onClose: () => void
  urlFor: (filename: string) => string
  headers?: Record<string, string>
}) {
  const { width, height } = Dimensions.get('window')
  const listRef = useRef<FlatList<ViewerPhoto>>(null)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => {
      if (initialIndex >= 0) listRef.current?.scrollToIndex({ index: initialIndex, animated: false })
    }, 60)
    return () => clearTimeout(t)
  }, [visible, initialIndex])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.paper }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 52,
            paddingHorizontal: 22,
          }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close viewer"
          >
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: 13, letterSpacing: 1.4, color: colors.ink }}>
              CLOSE
            </Text>
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.sansSemi,
              fontSize: 11,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: colors.textMuted,
            }}
          >
            Plate {String(Math.max(0, initialIndex) + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </Text>
        </View>

        <FlatList
          ref={listRef}
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => (
            <View style={{ width, flex: 1, paddingHorizontal: 22 }}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={{ uri: urlFor(item.filename), headers }}
                  style={{ width: '100%', height: Math.min(height * 0.72, 560) }}
                  resizeMode="contain"
                  accessibilityLabel={item.original_name ? `Photo: ${item.original_name}` : 'Photo'}
                />
              </View>
              <Text
                style={{
                  fontFamily: fonts.serifItalic,
                  fontSize: 18,
                  color: colors.ink,
                  paddingBottom: 8,
                }}
                numberOfLines={1}
              >
                {item.original_name || 'Photograph'}
              </Text>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.ink, paddingVertical: 12 }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemi,
                    fontSize: 10,
                    letterSpacing: 1.8,
                    textTransform: 'uppercase',
                    color: colors.textMuted,
                  }}
                >
                  Swipe to browse the issue
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </Modal>
  )
}

import React, { useEffect, useRef, useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { colors, fonts } from './styles'
import { AmbientBackground } from './components/AmbientBackground'
import { useAppearance } from './appearance'
import { glassDark, glassLight, wg } from './theme/warmGlass'

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

type ViewerPhoto = {
  id: string
  filename: string
  original_name?: string
  ambient_colors?: string[] | null
}

/** Photo-first viewer: the current photo tints the room behind it. */
export function PhotoViewer({
  visible,
  photos,
  initialIndex,
  onClose,
  urlFor,
  headers,
  title,
}: {
  visible: boolean
  photos: ViewerPhoto[]
  initialIndex: number
  onClose: () => void
  urlFor: (filename: string) => string
  headers?: Record<string, string>
  title?: string
}) {
  const { width, height } = Dimensions.get('window')
  const listRef = useRef<FlatList<ViewerPhoto>>(null)
  const { settings } = useAppearance()
  const [index, setIndex] = useState(Math.max(0, initialIndex))

  const dark = settings.adaptive
  const current = photos[index]
  const accent = dark ? wg.color.ivory : wg.color.ink
  const muted = dark ? 'rgba(250,245,235,0.55)' : wg.color.muted

  useEffect(() => {
    if (!visible) return
    setIndex(Math.max(0, initialIndex))
    const t = setTimeout(() => {
      if (initialIndex >= 0) listRef.current?.scrollToIndex({ index: initialIndex, animated: false })
    }, 60)
    return () => clearTimeout(t)
  }, [visible, initialIndex])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: dark ? wg.color.dark : wg.color.paper }}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <AmbientBackground kind="photo" id={current?.id} variant="dark" />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 52,
            paddingHorizontal: 22,
            zIndex: 5,
          }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close viewer"
            style={[
              {
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
              },
              dark ? glassDark : glassLight,
            ]}
          >
            <Ionicons name="close" size={18} color={accent} />
          </Pressable>
          <View
            style={[
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
              },
              dark ? glassDark : glassLight,
            ]}
          >
            <Text
              style={{
                fontFamily: fonts.sansSemi,
                fontSize: 8,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: dark ? 'rgba(250,245,235,0.78)' : wg.color.muted,
              }}
            >
              {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <View
          style={[
            {
              alignSelf: 'flex-start',
              marginTop: 14,
              marginLeft: 22,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              zIndex: 4,
            },
            dark ? glassDark : glassLight,
          ]}
        >
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: dark ? wg.color.teal : wg.color.bronze,
            }}
          />
          <Text
            style={{
              fontFamily: fonts.sansSemi,
              fontSize: 7,
              letterSpacing: 1.3,
              textTransform: 'uppercase',
              color: dark ? 'rgba(250,245,235,0.7)' : wg.color.muted,
            }}
          >
            {settings.adaptive ? 'Adaptive · this photo' : 'Warm paper'}
          </Text>
          {settings.adaptive && current?.ambient_colors?.length ? (
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {current.ambient_colors.slice(0, 4).map((color, i) => (
                <View key={`${color}-${i}`} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
              ))}
            </View>
          ) : null}
        </View>

        <FlatList
          ref={listRef}
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScrollToIndexFailed={() => {}}
          onMomentumScrollEnd={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.x / width)
            if (next >= 0 && next < photos.length) setIndex(next)
          }}
          renderItem={({ item }) => (
            <View
              style={{
                width,
                flex: 1,
                paddingHorizontal: 22,
                paddingTop: 14,
                paddingBottom: 154,
                justifyContent: 'center',
              }}
            >
              <Image
                source={{ uri: urlFor(item.filename), headers }}
                style={{
                  width: '100%',
                  height: Math.min(height * 0.56, 510),
                  borderRadius: 20,
                  backgroundColor: 'rgba(20,17,13,0.24)',
                }}
                resizeMode="cover"
                accessibilityLabel={item.original_name ? `Photo: ${item.original_name}` : 'Photo'}
              />
            </View>
          )}
        />

        <View
          style={[
            {
              position: 'absolute',
              left: 22,
              right: 22,
              bottom: 30,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 13,
              zIndex: 5,
            },
            dark ? glassDark : glassLight,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 22,
                  letterSpacing: -0.4,
                  color: accent,
                }}
              >
                {title || current?.original_name || 'Photograph'}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fonts.sansSemi,
                  fontSize: 7,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: muted,
                  marginTop: 4,
                }}
              >
                {photos.length} photographs · swipe to browse
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, paddingBottom: 4 }}>
              {photos.slice(0, 7).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === index ? 15 : 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      i === index
                        ? dark
                          ? 'rgba(250,245,235,0.92)'
                          : wg.color.ink
                        : dark
                          ? 'rgba(250,245,235,0.28)'
                          : 'rgba(33,28,21,0.2)',
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

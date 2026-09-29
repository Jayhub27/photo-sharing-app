import React, { useEffect, useRef, useState } from 'react'
import { Animated, FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii } from '../styles'

type Step = {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: 'camera-outline',
    title: 'Welcome to Take the shot',
    body: 'One place for your photos: share a collection with a QR code, or sell the originals.',
  },
  {
    icon: 'images-outline',
    title: 'Create a collection',
    body: 'Add your photos once, then send a QR code or link. Anyone who scans it sees the gallery \u2014 no app needed.',
  },
  {
    icon: 'person-add-outline',
    title: 'Sign up free',
    body: 'Create an account with your email in a few seconds. It keeps collections yours and lets buyers pay you directly.',
  },
  {
    icon: 'pricetag-outline',
    title: 'Get paid with Stripe',
    body: 'Set a price on a collection. Buyers pay by card on a secure Stripe checkout, and downloads unlock the moment the payment clears.',
  },
]

export default function OnboardingScreen({
  onDone,
}: {
  onDone: (action: 'skip' | 'signup') => void
}) {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const listRef = useRef<FlatList<Step>>(null)
  const fade = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start()
  }, [])

  useEffect(() => {
    scale.setValue(0.92)
    Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start()
  }, [index])

  const isLast = index === STEPS.length - 1

  const next = () => {
    if (isLast) return onDone('signup')
    const nextIndex = index + 1
    setIndex(nextIndex)
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true })
  }

  const back = () => {
    if (index === 0) return
    const prevIndex = index - 1
    setIndex(prevIndex)
    listRef.current?.scrollToIndex({ index: prevIndex, animated: true })
  }

  return (
    <Animated.View style={{ flex: 1, backgroundColor: colors.bg, opacity: fade }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 54, paddingHorizontal: 20 }}>
        <Pressable
          onPress={() => onDone('skip')}
          accessibilityRole="button"
          accessibilityLabel="Skip the tutorial"
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: radii.pill,
            borderWidth: 1,
            borderColor: colors.borderStrong,
          }}
        >
          <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
            <Animated.View
              style={{
                width: 140,
                height: 140,
                borderRadius: 36,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                transform: [{ scale }],
              }}
            >
              <Ionicons name={item.icon} size={56} color={colors.accentDark} />
            </Animated.View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
                letterSpacing: -0.4,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              {item.title}
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 23, color: colors.textMuted, textAlign: 'center' }}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
        {STEPS.map((s, i) => (
          <Pressable
            key={s.title}
            onPress={() => {
              setIndex(i)
              listRef.current?.scrollToIndex({ index: i, animated: true })
            }}
            accessibilityRole="button"
            accessibilityLabel={`Step ${i + 1} of ${STEPS.length}`}
            style={{
              width: i === index ? 20 : 7,
              height: 7,
              borderRadius: radii.pill,
              backgroundColor: i === index ? colors.accent : colors.borderStrong,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingBottom: 40 }}>
        {index > 0 && (
          <Pressable
            onPress={back}
            accessibilityRole="button"
            style={{
              flex: 1,
              height: 52,
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={next}
          accessibilityRole="button"
          style={{
            flex: 2,
            height: 52,
            borderRadius: radii.pill,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#a8741f',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Text style={{ color: colors.onAccent, fontWeight: '700', fontSize: 15 }}>
            {isLast ? 'Create an account' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

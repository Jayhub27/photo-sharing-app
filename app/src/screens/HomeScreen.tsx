import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listCollections, photoUrl, type Collection, type RootStackParamList } from '../api'
import { useAuth } from '../auth'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, AnimatedCard, FadeIn, SkeletonCard } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

const PAGE_SIZE = 12

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const offsetRef = useRef(0)
  const requestId = useRef(0)

  const load = useCallback(async (q: string) => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const res = await listCollections({ q, limit: PAGE_SIZE, offset: 0 })
      if (id !== requestId.current) return
      setCollections(res.collections)
      setHasMore(res.hasMore)
      offsetRef.current = res.collections.length
    } catch (err) {
      if (id !== requestId.current) return
      setError(err instanceof Error && err.message === 'Not authenticated' ? 'Session expired. Please log in again.' : 'Could not reach server. Is it running?')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(query.trim()), query ? 300 : 0)
    return () => clearTimeout(t)
  }, [query, load])

  const firstFocus = useRef(true)
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (firstFocus.current) {
        firstFocus.current = false
        return
      }
      load(query.trim())
    })
    return unsub
  }, [navigation, load, query])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    try {
      const res = await listCollections({ q: query.trim(), limit: PAGE_SIZE, offset: offsetRef.current })
      setCollections((prev) => [...prev, ...res.collections])
      setHasMore(res.hasMore)
      offsetRef.current += res.collections.length
    } catch {
      // ignore, user can retry by scrolling
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, hasMore, query])

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>
          Hi, <Text style={{ color: colors.text, fontWeight: '600' }}>{user?.name}</Text>
        </Text>
        <Pressable onPress={signOut} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>Log out</Text>
        </Pressable>
      </View>

      <FadeIn>
        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 20 }}>📷</Text>
            </View>
            <Text style={styles.logoText}>PhotoShare</Text>
          </View>
          <Text style={styles.title}>Share photos with a QR code</Text>
          <Text style={styles.subtitle}>
            Create a collection, add your photos, and share a QR code. Anyone who scans it instantly sees your gallery.
          </Text>
          <View style={{ gap: 10 }}>
            <AnimatedButton onPress={() => navigation.navigate('CreateCollection')}>
              <ButtonText>+ New Collection</ButtonText>
            </AnimatedButton>
            <AnimatedButton outline onPress={() => navigation.navigate('Scan')}>
              <ButtonText outline>Scan a QR Code</ButtonText>
            </AnimatedButton>
          </View>
        </View>
      </FadeIn>

      <Text style={styles.sectionLabel}>Your Collections</Text>

      <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          placeholder="Search collections…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 24 }}>
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
            <AnimatedButton onPress={() => load(query.trim())}>
              <ButtonText>Retry</ButtonText>
            </AnimatedButton>
          </View>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>
                {query ? 'No collections match your search.' : 'No collections yet.\nCreate one above to get started.'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <AnimatedCard
              index={index}
              onPress={() => navigation.navigate('Collection', { id: item.id, name: item.name })}
            >
              <View style={[styles.card, { borderColor: colors.border }]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardThumb}>
                    {item.cover_thumb_filename ? (
                      <Image
                        source={{ uri: photoUrl(item.cover_thumb_filename, { thumb: true }) }}
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                        resizeMode="cover"
                        accessibilityLabel={`Cover for ${item.name}`}
                      />
                    ) : (
                      <Text style={{ fontSize: 22 }}>📁</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSub}>
                      {item.photo_count ?? 0} photo{(item.photo_count ?? 0) === 1 ? '' : 's'}
                      {item.role && item.role !== 'owner' ? `  ·  ${item.role}` : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
            </AnimatedCard>
          )}
        />
      )}
    </View>
  )
}

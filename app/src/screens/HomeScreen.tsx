import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import {
  imageHeaders,
  listCollections,
  photoUrl,
  type AppTabParamList,
  type Collection,
  type RootStackParamList,
} from '../api'
import { colors, radii, shadows, styles } from '../styles'
import { AnimatedButton, AnimatedCard, FadeIn, SkeletonGridCard } from '../components'

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Collections'>,
  NativeStackScreenProps<RootStackParamList>
>

const PAGE_SIZE = 12
const GAP = 12
const PADDING = 24

const CURRENCY_SYMBOL: Record<string, string> = { usd: '$', eur: '€', gbp: '£' }

function formatPrice(cents: number, currency?: string) {
  const code = (currency || 'usd').toLowerCase()
  const amount = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)
  return CURRENCY_SYMBOL[code] ? `${CURRENCY_SYMBOL[code]}${amount}` : `${amount} ${code.toUpperCase()}`
}

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

function CollectionCard({
  item,
  index,
  width,
  onPress,
}: {
  item: Collection
  index: number
  width: number
  onPress: () => void
}) {
  const cover = item.cover_filename || item.cover_thumb_filename
  const count = item.photo_count ?? 0
  const price =
    item.price_cents && item.price_cents > 0 ? formatPrice(item.price_cents, item.currency) : null
  const expires = item.expires_at ? daysLeft(item.expires_at) : null

  return (
    <AnimatedCard index={index} onPress={onPress}>
      <View style={[g.card, { width }]}>
        <View style={g.cover}>
          {cover ? (
            <Image
              source={{ uri: photoUrl(cover, { thumb: true }), headers: imageHeaders() }}
              style={g.coverImg}
              resizeMode="cover"
              accessibilityLabel={`Cover for ${item.name}`}
            />
          ) : (
            <View style={g.coverEmpty}>
              <Ionicons name="images-outline" size={26} color={colors.textMuted} />
            </View>
          )}

          {(price || expires !== null) && (
            <View style={g.badges}>
              {price ? (
                <View style={g.badge}>
                  <Text style={g.badgeText}>{price}</Text>
                </View>
              ) : null}
              {expires !== null ? (
                <View style={[g.badge, g.badgeWarn]}>
                  <Ionicons name="time-outline" size={11} color={colors.text} />
                  <Text style={g.badgeText}>{expires}d</Text>
                </View>
              ) : null}
            </View>
          )}

          {item.is_public === false ? (
            <View style={g.lock}>
              <Ionicons name="lock-closed" size={12} color="#fffdf9" />
            </View>
          ) : null}
        </View>

        <Text style={g.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={g.meta} numberOfLines={1}>
          {count} photo{count === 1 ? '' : 's'}
          {item.role && item.role !== 'owner' ? ` · ${item.role}` : ''}
        </Text>
      </View>
    </AnimatedCard>
  )
}

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions()
  const cardWidth = (width - PADDING * 2 - GAP) / 2

  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'name'>('newest')
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared'>('all')
  const offsetRef = useRef(0)
  const requestId = useRef(0)
  const sortRef = useRef(sort)
  const filterRef = useRef(filter)
  sortRef.current = sort
  filterRef.current = filter

  const load = useCallback(async (q: string, opts: { silent?: boolean } = {}) => {
    const id = ++requestId.current
    if (!opts.silent) setLoading(true)
    setError(null)
    try {
      const res = await listCollections({
        q,
        limit: PAGE_SIZE,
        offset: 0,
        sort: sortRef.current,
        filter: filterRef.current,
      })
      if (id !== requestId.current) return
      setCollections(res.collections)
      setHasMore(res.hasMore)
      offsetRef.current = res.collections.length
    } catch (err) {
      if (id !== requestId.current) return
      setError(
        err instanceof Error && err.message === 'Not authenticated'
          ? 'Session expired. Please log in again.'
          : 'Could not reach server. Is it running?'
      )
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(query.trim()), query ? 300 : 0)
    return () => clearTimeout(t)
  }, [query, load, sort, filter])

  const firstFocus = useRef(true)
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (firstFocus.current) {
        firstFocus.current = false
        return
      }
      load(query.trim(), { silent: true })
    })
    return unsub
  }, [navigation, load, query])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await load(query.trim(), { silent: true })
    } finally {
      setRefreshing(false)
    }
  }, [load, query])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    try {
      const res = await listCollections({
        q: query.trim(),
        limit: PAGE_SIZE,
        offset: offsetRef.current,
        sort: sortRef.current,
        filter: filterRef.current,
      })
      setCollections((prev) => [...prev, ...res.collections])
      setHasMore(res.hasMore)
      offsetRef.current += res.collections.length
    } catch {
      // ignore, user can retry by scrolling
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, hasMore, query])

  const header = (
    <View style={{ paddingTop: 16 }}>
      <View style={g.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Collections</Text>
          <Text style={[styles.subtitle, { marginBottom: 0 }]}>
            Share a link or sell the originals.
          </Text>
        </View>
        <AnimatedButton
          onPress={() => navigation.navigate('CreateCollection')}
          accessibilityRole="button"
          accessibilityLabel="New collection"
          style={g.addButton}
        >
          <Ionicons name="add" size={24} color={colors.onAccent} />
        </AnimatedButton>
      </View>

      <TextInput
        style={[styles.input, { marginTop: 18 }]}
        placeholder="Search collections…"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={g.chips}>
        {(['all', 'owned', 'shared'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
            style={[g.chip, filter === f && g.chipActive]}
          >
            <Text style={[g.chipText, filter === f && g.chipTextActive]}>
              {f[0].toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setSort((s) => (s === 'newest' ? 'name' : 'newest'))}
          accessibilityRole="button"
          accessibilityLabel="Toggle sort order"
          style={g.chip}
        >
          <Text style={g.chipText}>{sort === 'newest' ? '↓ Newest' : 'A–Z'}</Text>
        </Pressable>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ paddingHorizontal: PADDING }}>
          <FadeIn>{header}</FadeIn>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonGridCard key={i} width={cardWidth} />
            ))}
          </View>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={{ paddingHorizontal: PADDING, flex: 1 }}>
          <FadeIn>{header}</FadeIn>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
              <AnimatedButton onPress={() => load(query.trim())}>
                <Text style={{ color: colors.onAccent, fontSize: 15, fontWeight: '600' }}>Retry</Text>
              </AnimatedButton>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ paddingHorizontal: PADDING, paddingBottom: 48 }}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accentDark}
            colors={[colors.accentDark]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.accentDark} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>
              {query
                ? 'No collections match your search.'
                : 'No collections yet.\nTap + to create your first one.'}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <CollectionCard
            item={item}
            index={index}
            width={cardWidth}
            onPress={() => navigation.navigate('Collection', { id: item.id, name: item.name })}
          />
        )}
      />
    </View>
  )
}

const g = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  addButton: {
    width: 48,
    height: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(233,166,58,0.22)',
  },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.text },
  card: { marginBottom: 18 },
  cover: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  coverImg: { width: '100%', height: '100%' },
  coverEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,253,249,0.92)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  badgeWarn: { backgroundColor: 'rgba(233,166,58,0.95)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.text },
  lock: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(42,33,25,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 8 },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
})

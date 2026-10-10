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
import {
  imageHeaders,
  listCollections,
  photoUrl,
  type AppTabParamList,
  type Collection,
  type RootStackParamList,
} from '../api'
import { colors, fonts } from '../styles'
import { AnimatedCard, FadeIn, SkeletonGridCard } from '../components'

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Collections'>,
  NativeStackScreenProps<RootStackParamList>
>

const PAGE_SIZE = 12
const PADDING = 22

const CURRENCY_SYMBOL: Record<string, string> = { usd: '$', eur: '€', gbp: '£' }

function formatPrice(cents: number, currency?: string) {
  const code = (currency || 'usd').toLowerCase()
  const amount = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)
  return CURRENCY_SYMBOL[code] ? `${CURRENCY_SYMBOL[code]}${amount}` : `${amount} ${code.toUpperCase()}`
}

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

function Plate({
  item,
  index,
  onPress,
}: {
  item: Collection
  index: number
  onPress: () => void
}) {
  const cover = item.cover_filename || item.cover_thumb_filename
  const count = item.photo_count ?? 0
  const price =
    item.price_cents && item.price_cents > 0 ? formatPrice(item.price_cents, item.currency) : null
  const expires = item.expires_at ? daysLeft(item.expires_at) : null

  return (
    <AnimatedCard index={index} onPress={onPress}>
      <View style={g.plate}>
        <View style={g.kickerRow}>
          <Text style={g.kicker}>Issue {String(index + 1).padStart(2, '0')}</Text>
          <Text style={g.kickerRight}>
            {count} photograph{count === 1 ? '' : 's'}
            {expires !== null ? ` · ${expires}d left` : ''}
          </Text>
        </View>

        <View style={g.imgwrap}>
          {cover ? (
            <Image
              source={{ uri: photoUrl(cover, { thumb: true }), headers: imageHeaders() }}
              style={g.img}
              resizeMode="cover"
              accessibilityLabel={`Cover for ${item.name}`}
            />
          ) : (
            <View style={[g.img, g.imgEmpty]}>
              <Text style={g.imgEmptyText}>No cover yet</Text>
            </View>
          )}
          {price ? (
            <View style={g.sticker}>
              <Text style={g.stickerText}>{price}</Text>
            </View>
          ) : null}
          {item.is_public === false ? (
            <View style={g.tag}>
              <Text style={g.tagText}>Private</Text>
            </View>
          ) : null}
        </View>

        <Text style={g.title}>{item.name}</Text>
        <Text style={g.meta}>
          {item.role && item.role !== 'owner' ? `You are ${item.role}` : 'Shared by link'}
          {price ? ' · for sale' : ' · free to download'}
        </Text>
        <View style={g.hair} />
      </View>
    </AnimatedCard>
  )
}

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions()

  const [collections, setCollections] = useState<Collection[]>([])
  const [total, setTotal] = useState(0)
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
      setTotal(res.total)
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

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const header = (
    <View style={g.masthead}>
      <View style={g.wordRow}>
        <Text style={g.wordmark}>Take the shot</Text>
        <Pressable
          onPress={() => navigation.navigate('CreateCollection')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="New collection"
        >
          <Text style={g.newAction}>+ New</Text>
        </Pressable>
      </View>
      <View style={g.dateRow}>
        <Text style={g.dateText}>{today}</Text>
        <Text style={g.dateText}>
          {total} edition{total === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={g.rule} />

      <TextInput
        style={[g.search]}
        placeholder="Search collections…"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={g.filters}>
        {(['all', 'owned', 'shared'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
            style={g.filterItem}
          >
            <Text style={[g.filterText, filter === f && g.filterTextOn]}>
              {f[0].toUpperCase() + f.slice(1)}
            </Text>
            <View style={[g.filterLine, filter === f && g.filterLineOn]} />
          </Pressable>
        ))}
        <Pressable
          onPress={() => setSort((s) => (s === 'newest' ? 'name' : 'newest'))}
          accessibilityRole="button"
          accessibilityLabel="Toggle sort order"
          style={[g.filterItem, g.sortItem]}
        >
          <Text style={g.filterText}>{sort === 'newest' ? '↓ Newest' : 'A–Z'}</Text>
          <View style={g.filterLine} />
        </Pressable>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={g.screen}>
        <FadeIn>{header}</FadeIn>
        <View style={{ paddingHorizontal: PADDING }}>
          {[0, 1].map((i) => (
            <SkeletonGridCard key={i} width={width - PADDING * 2} />
          ))}
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={g.screen}>
        <FadeIn>{header}</FadeIn>
        <View style={g.empty}>
          <Text style={g.emptyText}>{error}</Text>
          <Pressable onPress={() => load(query.trim())} style={g.retry} accessibilityRole="button">
            <Text style={g.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View style={g.screen}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: PADDING, paddingBottom: 40 }}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.red} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          <View style={g.empty}>
            <Text style={g.emptyText}>
              {query
                ? 'No collections match your search.'
                : 'No collections yet.\nCreate your first edition to begin.'}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Plate
            item={item}
            index={index}
            onPress={() => navigation.navigate('Collection', { id: item.id, name: item.name })}
          />
        )}
      />
    </View>
  )
}

const g = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  masthead: { paddingTop: 16 },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: fonts.serifItalic,
    fontSize: 24,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  newAction: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.red,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  dateText: {
    fontFamily: fonts.sans,
    fontSize: 9.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  rule: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10 },
  search: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    marginTop: 6,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
    marginBottom: 6,
  },
  filterItem: { alignItems: 'center', paddingBottom: 4 },
  sortItem: { marginLeft: 'auto' },
  filterText: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  filterTextOn: { color: colors.ink },
  filterLine: { height: 2, width: '100%', minWidth: 18, marginTop: 4, backgroundColor: 'transparent' },
  filterLineOn: { backgroundColor: colors.red },
  plate: { marginTop: 18 },
  kickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  kicker: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.red,
  },
  kickerRight: {
    fontFamily: fonts.sans,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  imgwrap: { marginTop: 8, position: 'relative' },
  img: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.surface2,
  },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  imgEmptyText: { fontFamily: fonts.serifItalic, fontSize: 15, color: colors.textMuted },
  sticker: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.red,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  stickerText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.onAccent,
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(242,240,235,0.94)',
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.4,
    marginTop: 10,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 3,
  },
  hair: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14 },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  emptyText: {
    fontFamily: fonts.serifItalic,
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retry: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
})

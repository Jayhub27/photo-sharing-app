import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useIsFocused, type CompositeScreenProps } from '@react-navigation/native'
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
import { useAuth } from '../auth'
import { useAppearance } from '../appearance'
import { AmbientMosaic } from '../components/AmbientBackground'
import { wg, glassLight, type } from '../theme/warmGlass'

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Collections'>,
  NativeStackScreenProps<RootStackParamList>
>

const PAGE_SIZE = 12

const CURRENCY_SYMBOL: Record<string, string> = { usd: '$', eur: '€', gbp: '£' }

function formatPrice(cents: number, currency?: string) {
  const code = (currency || 'usd').toLowerCase()
  const amount = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)
  return CURRENCY_SYMBOL[code] ? `${CURRENCY_SYMBOL[code]}${amount}` : `${amount} ${code.toUpperCase()}`
}

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

function metaFor(item: Collection) {
  const count = item.photo_count ?? 0
  const price = item.price_cents && item.price_cents > 0 ? formatPrice(item.price_cents, item.currency) : null
  const expires = item.expires_at ? `${daysLeft(item.expires_at)}d left` : null
  return [
    `${count} photograph${count === 1 ? '' : 's'}`,
    expires,
    price ? 'for sale' : 'free download',
  ]
    .filter(Boolean)
    .join(' · ')
}

function Cover({
  item,
  style,
}: {
  item: Collection
  style: any
}) {
  const cover = item.cover_filename || item.cover_thumb_filename
  const source = React.useMemo(
    () => (cover ? { uri: photoUrl(cover, { thumb: true }), headers: imageHeaders() } : null),
    [cover]
  )
  if (!cover || !source) {
    return (
      <View style={[style, s.coverEmpty]}>
        <Ionicons name="images-outline" size={22} color={wg.color.muted} />
      </View>
    )
  }
  return (
    <Image
      source={source}
      style={style}
      contentFit="cover"
      accessibilityLabel={`Cover for ${item.name}`}
    />
  )
}

function FeatureCard({ item, onPress }: { item: Collection; onPress: () => void }) {
  const price = item.price_cents && item.price_cents > 0 ? formatPrice(item.price_cents, item.currency) : null
  return (
    <Pressable
      onPress={onPress}
      style={[s.feature, glassLight]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name}`}
    >
      <Cover item={item} style={s.featureImg} />
      <View style={s.featureBody}>
        <Text style={s.featureName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={s.featureMeta} numberOfLines={2}>
          {metaFor(item)}
        </Text>
        {price ? (
          <View style={s.pricePill}>
            <Text style={s.priceText}>{price}</Text>
          </View>
        ) : (
          <View style={s.freePill}>
            <Text style={s.freeText}>Free</Text>
          </View>
        )}
        <View style={s.featureBottom}>
          <Text style={s.featureHint}>
            {item.role && item.role !== 'owner' ? `You are ${item.role}` : 'Shared by link'}
          </Text>
          <Text style={s.featureOpen}>Open →</Text>
        </View>
      </View>
    </Pressable>
  )
}

function RowCard({
  item,
  onPress,
}: {
  item: Collection
  onPress: () => void
}) {
  const price = item.price_cents && item.price_cents > 0 ? formatPrice(item.price_cents, item.currency) : null
  return (
    <Pressable
      onPress={onPress}
      style={[s.row, glassLight]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name}`}
    >
      <Cover item={item} style={s.rowThumb} />
      <View style={s.rowBody}>
        <Text style={s.rowName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.rowMeta} numberOfLines={1}>
          {item.photo_count ?? 0} photographs · {price || 'free'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="rgba(132,122,105,0.75)" />
    </Pressable>
  )
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  const { user } = useAuth()
  const { settings } = useAppearance()

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
          : 'Could not reach the server. Is it running?'
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
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, hasMore, query])

  const initials = (user?.name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Feature the collection that is for sale; otherwise the most recent one.
  const featured = collections.find((c) => c.price_cents && c.price_cents > 0) || collections[0]
  const rest = featured ? collections.filter((c) => c.id !== featured.id) : collections
  const ambientIds = collections
    .filter((c) => c.has_ambient || c.cover_filename || c.cover_thumb_filename)
    .slice(0, 4)
    .map((c) => c.id)
  const palette = featured?.ambient_colors?.length
    ? featured.ambient_colors
    : collections.find((c) => c.ambient_colors?.length)?.ambient_colors || []

  const header = (
    <View style={{ paddingTop: insets.top + 10 }}>
      <View style={[s.topbar, glassLight]}>
        <Text style={s.wordmark}>Take the shot</Text>
        <View style={s.topRight}>
          <Pressable
            onPress={() => navigation.navigate('CreateCollection')}
            style={s.newButton}
            accessibilityRole="button"
            accessibilityLabel="New collection"
          >
            <Text style={s.newButtonText}>+ New</Text>
          </Pressable>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      <Text style={s.title}>Your{'\n'}collections</Text>
      <Text style={s.subtitle}>Private galleries, your terms.</Text>

      <View style={[s.search, glassLight]}>
        <Ionicons name="search" size={15} color="rgba(132,122,105,0.9)" />
        <TextInput
          style={s.searchInput}
          placeholder="Search collections"
          placeholderTextColor="rgba(132,122,105,0.8)"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <View style={s.chipRow}>
        <Pressable
          onPress={() => navigation.navigate('Appearance')}
          style={[s.adaptiveChip, glassLight]}
          accessibilityRole="button"
          accessibilityLabel="Open appearance settings"
        >
          <View style={[s.statusDot, { backgroundColor: palette[0] || wg.color.teal }]} />
          <Text style={s.adaptiveText}>
            {settings.adaptive ? `Adaptive · ${Math.max(1, ambientIds.length)} covers` : 'Warm paper'}
          </Text>
          <View style={s.dots}>
            {(palette.length ? palette : [wg.color.teal, wg.color.bronze, wg.color.line]).slice(0, 4).map((c, i) => (
              <View key={`${c}-${i}`} style={[s.dot, { backgroundColor: c }]} />
            ))}
          </View>
        </Pressable>
        <Text style={s.liveText}>{total} live</Text>
      </View>

      <View style={s.filters}>
        {(['all', 'owned', 'shared'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[s.filterChip, filter === f && s.filterChipOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
          >
            <Text style={[s.filterText, filter === f && s.filterTextOn]}>
              {f === 'all' ? 'All' : f === 'owned' ? 'Mine' : 'Shared'}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setSort((value) => (value === 'newest' ? 'name' : 'newest'))}
          style={[s.sortChip, glassLight]}
          accessibilityRole="button"
          accessibilityLabel="Toggle sort order"
        >
          <Text style={s.sortText}>{sort === 'newest' ? 'Newest' : 'A–Z'}</Text>
          <Ionicons name="swap-vertical" size={12} color={wg.color.muted} />
        </Pressable>
      </View>

      {featured ? (
        <FeatureCard
          item={featured}
          onPress={() => navigation.navigate('Collection', { id: featured.id, name: featured.name })}
        />
      ) : null}

      {rest.length ? (
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>More collections</Text>
          <Text style={s.sectionCount}>{Math.max(0, total - 1)}</Text>
        </View>
      ) : null}
    </View>
  )

  if (loading) {
    return (
      <View style={s.screen}>
        <AmbientMosaic ids={ambientIds} active={isFocused} />
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 22 }}>
          <View style={[s.topbar, glassLight]}>
            <Text style={s.wordmark}>Take the shot</Text>
          </View>
          <Text style={s.title}>Your{'\n'}collections</Text>
          <ActivityIndicator color={wg.color.bronze} style={{ marginTop: 40 }} />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={s.screen}>
        <AmbientMosaic ids={ambientIds} active={isFocused} />
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 22 }}>
          <View style={[s.topbar, glassLight]}>
            <Text style={s.wordmark}>Take the shot</Text>
          </View>
          <Text style={s.title}>Your{'\n'}collections</Text>
          <View style={[s.errorCard, glassLight]}>
            <Text style={s.errorText}>{error}</Text>
            <Pressable onPress={() => load(query.trim())} style={s.retry} accessibilityRole="button">
              <Text style={s.retryText}>Try again</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={s.screen}>
      <AmbientMosaic ids={ambientIds} active={isFocused} />
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 48 }}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={wg.color.bronze}
            colors={[wg.color.bronze]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={wg.color.bronze} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          collections.length === 0 ? (
            <View style={[s.empty, glassLight]}>
              <Ionicons name="images-outline" size={26} color={wg.color.muted} />
              <Text style={s.emptyText}>
                {query ? 'No collections match your search.' : 'No collections yet.\nCreate your first one to begin.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <RowCard
            item={item}
            onPress={() => navigation.navigate('Collection', { id: item.id, name: item.name })}
          />
        )}
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: wg.color.paper },
  topbar: {
    height: 46,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 6,
  },
  wordmark: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: wg.color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: wg.color.ivory,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(33,28,21,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 10,
    letterSpacing: 0.6,
    color: wg.color.inkSoft,
  },
  title: {
    ...type.display,
    fontSize: 44,
    lineHeight: 40,
    marginTop: 22,
  },
  subtitle: {
    fontFamily: wg.font.sans,
    fontSize: 12,
    color: wg.color.muted,
    marginTop: 9,
  },
  search: {
    height: 45,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: wg.font.sans,
    fontSize: 12.5,
    color: wg.color.ink,
    paddingVertical: 0,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  adaptiveChip: {
    height: 31,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  adaptiveText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  },
  dots: { flexDirection: 'row', gap: 3, marginLeft: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  filterChip: {
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(33,28,21,0.1)',
  },
  filterChipOn: { backgroundColor: wg.color.ink, borderColor: wg.color.ink },
  filterText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  filterTextOn: { color: wg.color.ivory },
  sortChip: {
    marginLeft: 'auto',
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  feature: {
    marginTop: 16,
    borderRadius: wg.radius.card,
    padding: 9,
    flexDirection: 'row',
    gap: 12,
    minHeight: 158,
  },
  featureImg: { width: 96, height: 140, borderRadius: 17, backgroundColor: wg.color.paperDeep },
  featureBody: { flex: 1, paddingVertical: 7, paddingRight: 4 },
  featureName: {
    fontFamily: wg.font.serif,
    fontSize: 21,
    letterSpacing: -0.4,
    color: wg.color.ink,
  },
  featureMeta: {
    fontFamily: wg.font.sans,
    fontSize: 9.5,
    lineHeight: 14,
    color: wg.color.muted,
    marginTop: 5,
  },
  pricePill: {
    alignSelf: 'flex-start',
    marginTop: 9,
    backgroundColor: wg.color.ink,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: { fontFamily: wg.font.serif, fontSize: 16, color: wg.color.ivory },
  freePill: {
    alignSelf: 'flex-start',
    marginTop: 9,
    borderWidth: 1,
    borderColor: 'rgba(33,28,21,0.16)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  freeText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  },
  featureBottom: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureHint: {
    fontFamily: wg.font.sans,
    fontSize: 8,
    letterSpacing: 0.2,
    color: 'rgba(132,122,105,0.9)',
  },
  featureOpen: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  },
  coverEmpty: { alignItems: 'center', justifyContent: 'center' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 19,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: wg.font.serifItalic,
    fontSize: 15,
    color: wg.color.ink,
  },
  sectionCount: {
    fontFamily: wg.font.sansSemi,
    fontSize: 8,
    letterSpacing: 1.2,
    color: wg.color.muted,
  },
  row: {
    marginTop: 8,
    minHeight: 60,
    borderRadius: 18,
    paddingHorizontal: 9,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  rowThumb: { width: 44, height: 44, borderRadius: 12, backgroundColor: wg.color.paperDeep },
  rowBody: { flex: 1 },
  rowName: {
    fontFamily: wg.font.serif,
    fontSize: 15,
    color: wg.color.ink,
    letterSpacing: -0.2,
  },
  rowMeta: {
    fontFamily: wg.font.sans,
    fontSize: 8.5,
    color: wg.color.muted,
    marginTop: 3,
  },
  empty: {
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontFamily: wg.font.serifItalic,
    fontSize: 16,
    lineHeight: 22,
    color: wg.color.muted,
    textAlign: 'center',
  },
  errorCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  errorText: {
    fontFamily: wg.font.sans,
    fontSize: 13,
    lineHeight: 19,
    color: wg.color.muted,
    textAlign: 'center',
  },
  retry: {
    borderRadius: 999,
    backgroundColor: wg.color.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: wg.color.ivory,
  },
})

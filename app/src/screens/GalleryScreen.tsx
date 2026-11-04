import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  collectionUrl,
  getCollection,
  imageHeaders,
  photoUrl,
  type Collection,
  type Photo,
  type RootStackParamList,
} from '../api'
import { useAppearance } from '../appearance'
import { AmbientBackground } from '../components/AmbientBackground'
import { PhotoViewer } from '../components'
import { glassLight, type, wg } from '../theme/warmGlass'

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>

const PAGE_SIZE = 60

export default function GalleryScreen({ route, navigation }: Props) {
  const { collectionId } = route.params
  const insets = useSafeAreaInsets()
  const { settings } = useAppearance()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const offsetRef = useRef(0)
  const { width } = useWindowDimensions()
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2
  const gutter = width >= 700 ? 14 : 10
  const hPadding = width >= 700 ? 32 : 22
  const itemWidth = Math.floor((width - hPadding * 2 - gutter * (columns - 1)) / columns)
  const name = collection?.name || 'Gallery'
  const palette = collection?.ambient_colors || []

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCollection(collectionId, { limit: PAGE_SIZE, offset: 0 })
      setCollection(res.collection)
      setLocked(!!res.pricing?.locked)
      setPhotos(res.photos)
      setTotal(res.total)
      setHasMore(res.hasMore)
      offsetRef.current = res.photos.length
      navigation.setOptions({ title: res.collection.name })
    } catch {
      setError('Could not load this collection. The QR may be invalid.')
    } finally {
      setLoading(false)
    }
  }, [collectionId, navigation])

  useEffect(() => {
    load()
  }, [load])

  const loadMore = async () => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    try {
      const res = await getCollection(collectionId, { limit: PAGE_SIZE, offset: offsetRef.current })
      setPhotos((prev) => [...prev, ...res.photos])
      setHasMore(res.hasMore)
      offsetRef.current += res.photos.length
    } catch {
    } finally {
      setLoadingMore(false)
    }
  }

  const share = () => {
    Share.share({ message: `Check out this photo collection: ${collectionUrl(collectionId)}` }).catch(() => {})
  }

  const header = (
    <View style={{ paddingTop: insets.top + 10 }}>
      <View style={s.toprow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[s.circle, glassLight]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={18} color={wg.color.ink} />
        </Pressable>
        <Text style={s.kicker}>Shared collection</Text>
        <Pressable
          onPress={share}
          style={[s.circle, glassLight]}
          accessibilityRole="button"
          accessibilityLabel="Share collection"
        >
          <Ionicons name="share-outline" size={17} color={wg.color.ink} />
        </Pressable>
      </View>

      <Text style={s.title}>{name}</Text>
      <Text style={s.meta}>
        {total} photograph{total === 1 ? '' : 's'} · tap a photo to view
      </Text>

      <View style={s.chipRow}>
        <View style={[s.chip, glassLight]}>
          <View style={[s.dot, { backgroundColor: palette[0] || wg.color.teal }]} />
          <Text style={s.chipText}>{settings.adaptive ? 'Adaptive · this collection' : 'Warm paper'}</Text>
          {settings.adaptive && palette.length ? (
            <View style={s.dots}>
              {palette.slice(0, 4).map((color, index) => (
                <View key={`${color}-${index}`} style={[s.dot, { backgroundColor: color }]} />
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={s.rule} />
    </View>
  )

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={wg.color.bronze} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={s.loading}>
        <Text style={s.errorText}>{error}</Text>
        <Pressable onPress={load} style={s.retry} accessibilityRole="button">
          <Text style={s.retryText}>Try again</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={s.screen}>
      <AmbientBackground kind="collection" id={collectionId} variant="light" />

      <View style={s.headerWrap}>{header}</View>

      <View style={s.gridWrap}>
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          key={`grid-${columns}`}
          numColumns={columns}
          contentContainerStyle={{
            paddingHorizontal: hPadding,
            paddingTop: 4,
            paddingBottom: insets.bottom + 36,
            gap: gutter,
          }}
          columnWrapperStyle={{ gap: gutter }}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={wg.color.bronze} style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="images-outline" size={30} color={wg.color.muted} />
              <Text style={s.emptyText}>This collection has no photographs yet.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setViewerIndex(index)}
              accessibilityRole="imagebutton"
              accessibilityLabel={item.original_name ? `View photo ${item.original_name}` : 'View photo'}
              style={{ width: itemWidth }}
            >
              <View style={s.photoWrap}>
                <Image
                  source={{ uri: photoUrl(item.filename, { thumb: true }), headers: imageHeaders() }}
                  style={{ width: '100%', height: Math.round(itemWidth * 1.22) }}
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
                <View style={s.indexPill}>
                  <Text style={s.indexText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
              </View>
              <Text style={s.caption} numberOfLines={1}>
                {item.original_name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <PhotoViewer
        visible={viewerIndex !== null}
        photos={photos}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        urlFor={(filename) => photoUrl(filename, locked ? { thumb: true } : {})}
        headers={imageHeaders()}
        title={name}
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: wg.color.paper },
  loading: {
    flex: 1,
    backgroundColor: wg.color.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  headerWrap: {
    paddingHorizontal: 22,
    paddingBottom: 6,
  },
  toprow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: wg.color.muted,
  },
  title: {
    ...type.display,
    fontSize: 38,
    marginTop: 18,
  },
  meta: {
    fontFamily: wg.font.sans,
    fontSize: 10,
    color: wg.color.muted,
    marginTop: 5,
  },
  chipRow: { flexDirection: 'row', marginTop: 12 },
  chip: {
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  },
  dots: { flexDirection: 'row', gap: 3, marginLeft: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  rule: {
    height: 1,
    backgroundColor: 'rgba(33,28,21,0.12)',
    marginTop: 12,
  },
  gridWrap: {
    flex: 1,
    backgroundColor: 'rgba(244,239,229,0.9)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    paddingTop: 10,
  },
  photoWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: wg.color.paperDeep,
  },
  indexPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(250,245,234,0.86)',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  indexText: {
    fontFamily: wg.font.sansSemi,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: wg.color.inkSoft,
  },
  caption: {
    fontFamily: wg.font.sans,
    fontSize: 8,
    color: wg.color.muted,
    marginTop: 5,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    gap: 10,
    width: '100%',
  },
  emptyText: {
    fontFamily: wg.font.serifItalic,
    fontSize: 16,
    lineHeight: 22,
    color: wg.color.muted,
    textAlign: 'center',
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

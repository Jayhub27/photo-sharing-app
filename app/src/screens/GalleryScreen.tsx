import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  getCollection,
  imageHeaders,
  photoUrl,
  type Photo,
  type RootStackParamList,
} from '../api'
import { colors, fonts } from '../styles'
import { FadeIn, LoadingScreen, PhotoViewer } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>

const PAGE_SIZE = 60

export default function GalleryScreen({ route, navigation }: Props) {
  const { collectionId } = route.params
  const [photos, setPhotos] = useState<Photo[]>([])
  const [name, setName] = useState('Gallery')
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const offsetRef = useRef(0)
  const { width } = useWindowDimensions()
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2
  const gutter = width >= 700 ? 16 : 12
  const hPadding = width >= 700 ? 32 : 22
  const itemWidth = Math.floor((width - hPadding * 2 - gutter * (columns - 1)) / columns)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCollection(collectionId, { limit: PAGE_SIZE, offset: 0 })
      setPhotos(res.photos)
      setTotal(res.total)
      setHasMore(res.hasMore)
      offsetRef.current = res.photos.length
      setName(res.collection.name)
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

  if (loading) return <LoadingScreen />

  if (error) {
    return (
      <View style={g.empty}>
        <Text style={g.emptyText}>{error}</Text>
        <Pressable onPress={load} style={g.retry} accessibilityRole="button">
          <Text style={g.retryText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={g.screen}>
      <FadeIn>
        <View style={g.head}>
          <Text style={g.kicker}>Shared with you</Text>
          <Text style={g.title}>{name}</Text>
          <Text style={g.meta}>
            {total} photograph{total === 1 ? '' : 's'} · tap a plate to view
          </Text>
          <View style={g.rule} />
        </View>
      </FadeIn>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        key={`grid-${columns}`}
        numColumns={columns}
        contentContainerStyle={{ paddingHorizontal: hPadding, paddingBottom: 40, gap: gutter }}
        columnWrapperStyle={{ gap: gutter }}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={colors.red} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          <View style={g.empty}>
            <Ionicons name="images-outline" size={34} color={colors.textMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Text style={g.emptyText}>This collection has no photographs yet.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setViewerIndex(index)}
            accessibilityRole="imagebutton"
            accessibilityLabel={item.original_name ? `View photo ${item.original_name}` : 'View photo'}
            style={{ width: itemWidth }}
          >
            <Image
              source={{ uri: photoUrl(item.filename, { thumb: true }), headers: imageHeaders() }}
              style={[g.thumb, { width: itemWidth, height: Math.round(itemWidth * 1.25) }]}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View style={g.caption}>
              <Text style={g.captionNo}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={g.captionName} numberOfLines={1}>
                {item.original_name}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <PhotoViewer
        visible={viewerIndex !== null}
        photos={photos}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        urlFor={(filename) => photoUrl(filename)}
        headers={imageHeaders()}
      />
    </View>
  )
}

const g = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 22, paddingTop: 16 },
  kicker: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.red,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: -0.6,
    marginTop: 8,
  },
  meta: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
  rule: { borderTopWidth: 1, borderTopColor: colors.ink, marginTop: 16, marginBottom: 16 },
  thumb: { backgroundColor: colors.surface2 },
  caption: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  captionNo: { fontFamily: fonts.sansSemi, fontSize: 9.5, letterSpacing: 1.2, color: colors.red },
  captionName: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textMuted, flex: 1 },
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

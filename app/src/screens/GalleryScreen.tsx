import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, useWindowDimensions, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  getCollection,
  imageHeaders,
  photoUrl,
  type Photo,
  type RootStackParamList,
} from '../api'
import { colors, styles, shadows } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, LoadingScreen, PhotoViewer } from '../components'

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
  const hPadding = width >= 700 ? 32 : 24
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
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
          <AnimatedButton onPress={load}>
            <ButtonText>Retry</ButtonText>
          </AnimatedButton>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {total} photo{total === 1 ? '' : 's'} in this collection
          </Text>
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
          loadingMore ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>This collection has no photos yet.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setViewerIndex(index)}
            accessibilityRole="imagebutton"
            accessibilityLabel={item.original_name ? `View photo ${item.original_name}` : 'View photo'}
          >
            <Image
              source={{ uri: photoUrl(item.filename, { thumb: true }), headers: imageHeaders() }}
              style={[styles.photo, shadows.card, { width: itemWidth, height: itemWidth }]}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
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

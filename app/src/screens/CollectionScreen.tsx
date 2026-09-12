import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  deletePhoto as deletePhotoApi,
  getCollection,
  photoUrl,
  uploadPhoto,
  type Photo,
  type RootStackParamList,
} from '../api'
import { colors, styles, shadows } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, SkeletonCard, PhotoViewer } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>

const PAGE_SIZE = 60

export default function CollectionScreen({ route, navigation }: Props) {
  const { id, name } = route.params
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)

  const offsetRef = useRef(0)
  const newestRef = useRef('')
  const queryRef = useRef('')
  const photosRef = useRef<Photo[]>([])
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef = useRef(true)

  queryRef.current = query
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  const load = useCallback(
    async (q: string) => {
      setLoading(true)
      try {
        const res = await getCollection(id, { q, limit: PAGE_SIZE, offset: 0 })
        if (!activeRef.current) return
        photosRef.current = res.photos
        setPhotos(res.photos)
        setTotal(res.total)
        setHasMore(res.hasMore)
        setCanEdit(res.canEdit)
        setRole(res.role)
        offsetRef.current = res.photos.length
        newestRef.current = res.photos.reduce((m, p) => ((p.created_at || '') > m ? p.created_at || '' : m), '')
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Could not load collection')
      } finally {
        if (activeRef.current) setLoading(false)
      }
    },
    [id]
  )

  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(query.trim()), query ? 300 : 0)
    return () => clearTimeout(t)
  }, [query, load])

  const poll = useCallback(async () => {
    if (!newestRef.current) return
    try {
      const res = await getCollection(id, { since: newestRef.current, limit: 200, q: queryRef.current.trim() })
      const known = new Set(photosRef.current.map((p) => p.id))
      const fresh = res.photos.filter((p) => !known.has(p.id))
      if (!fresh.length) return
      const merged = [...fresh, ...photosRef.current]
      photosRef.current = merged
      setPhotos(merged)
      setTotal((t) => t + fresh.length)
      newestRef.current = merged.reduce((m, p) => ((p.created_at || '') > m ? p.created_at || '' : m), newestRef.current)
    } catch {}
  }, [id])

  useEffect(() => {
    const start = () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(poll, 5000)
    }
    const stop = () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    const unsubFocus = navigation.addListener('focus', () => {
      activeRef.current = true
      start()
    })
    const unsubBlur = navigation.addListener('blur', () => {
      activeRef.current = false
      stop()
    })
    start()
    return () => {
      unsubFocus()
      unsubBlur()
      stop()
    }
  }, [navigation, poll])

  const loadMore = async () => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    try {
      const res = await getCollection(id, { q: query.trim(), limit: PAGE_SIZE, offset: offsetRef.current })
      setPhotos((prev) => [...prev, ...res.photos])
      setHasMore(res.hasMore)
      offsetRef.current += res.photos.length
    } catch {
    } finally {
      setLoadingMore(false)
    }
  }

  const handleAdd = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to upload.')

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (result.canceled || !result.assets?.length) return

    const assets = result.assets
    const uploaded: Photo[] = []
    setUploading(true)
    setUploadProgress({ done: 0, total: assets.length })
    try {
      for (let i = 0; i < assets.length; i++) {
        const res = await uploadPhoto(id, assets[i].uri)
        uploaded.push(...res.photos)
        setUploadProgress({ done: i + 1, total: assets.length })
      }
      setPhotos((prev) => [...uploaded, ...prev])
      setTotal((t) => t + uploaded.length)
    } catch {
      if (uploaded.length) {
        setPhotos((prev) => [...uploaded, ...prev])
        Alert.alert('Upload interrupted', `Uploaded ${uploaded.length} of ${assets.length} photos.`)
      } else {
        Alert.alert('Upload failed', 'Could not upload photos')
      }
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const handleDelete = (photo: Photo) => {
    Alert.alert('Delete photo', `Delete "${photo.original_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePhotoApi(photo.id)
            setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
            setTotal((t) => Math.max(0, t - 1))
          } catch {
            Alert.alert('Error', 'Could not delete photo')
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {total} photo{total === 1 ? '' : 's'} in this collection
            {role && role !== 'owner' ? `  ·  you are ${role}` : ''}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {canEdit && (
              <View style={{ flex: 1 }}>
                <AnimatedButton onPress={handleAdd} disabled={uploading}>
                  <ButtonText>+ Add Photos</ButtonText>
                </AnimatedButton>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <AnimatedButton
                outline
                onPress={() => navigation.navigate('QRDisplay', { id, name })}
              >
                <ButtonText outline>Show QR</ButtonText>
              </AnimatedButton>
            </View>
          </View>
          {role && (
            <Pressable onPress={() => navigation.navigate('Members', { id, name })} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>👥 Manage members</Text>
            </Pressable>
          )}
        </View>
      </FadeIn>

      <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          placeholder="Search photos by filename…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🖼️</Text>
              <Text style={styles.emptyText}>
                {query ? 'No photos match your search.' : `No photos yet.\n${canEdit ? 'Tap "Add Photos" to add some.' : 'Check back later.'}`}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setViewerIndex(index)}
              onLongPress={canEdit ? () => handleDelete(item) : undefined}
              accessibilityRole="imagebutton"
              accessibilityLabel={item.original_name ? `View photo ${item.original_name}` : 'View photo'}
            >
              <Image
                source={{ uri: photoUrl(item.filename, { thumb: true }) }}
                style={[styles.photo, shadows.card]}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </Pressable>
          )}
        />
      )}

      {uploadProgress && (
        <View
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 24,
            backgroundColor: 'rgba(10,10,15,0.96)',
          }}
        >
          <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 8 }}>
            Uploading {uploadProgress.done}/{uploadProgress.total}…
          </Text>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface2, overflow: 'hidden' }}>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.accent,
                width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%`,
              }}
            />
          </View>
        </View>
      )}

      <PhotoViewer
        visible={viewerIndex !== null}
        photos={photos}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        urlFor={(filename) => photoUrl(filename)}
      />
    </View>
  )
}

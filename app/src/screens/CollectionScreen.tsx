import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  deletePhoto as deletePhotoApi,
  getCollection,
  imageHeaders,
  importFromLinks,
  photoUrl,
  setCollectionPrice,
  setCollectionVisibility,
  startCheckout,
  uploadPhoto,
  type Photo,
  type Pricing,
  type RootStackParamList,
} from '../api'
import { colors, styles, shadows } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, SkeletonCard, PhotoViewer } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>

const PAGE_SIZE = 60

function formatCents(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
  } catch {
    return `$${(cents / 100).toFixed(2)}`
  }
}

export default function CollectionScreen({ route, navigation }: Props) {
  const { id, name } = route.params
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [query, setQuery] = useState('')
  const [photoSort, setPhotoSort] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [total, setTotal] = useState(0)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [sellOpen, setSellOpen] = useState(false)
  const [priceText, setPriceText] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)

  const { width } = useWindowDimensions()
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2
  const gutter = width >= 700 ? 16 : 12
  const hPadding = width >= 700 ? 32 : 24
  const itemWidth = Math.floor((width - hPadding * 2 - gutter * (columns - 1)) / columns)

  const offsetRef = useRef(0)
  const newestRef = useRef('')
  const queryRef = useRef('')
  const photosRef = useRef<Photo[]>([])
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef = useRef(true)
  const sortRef = useRef(photoSort)

  queryRef.current = query
  sortRef.current = photoSort
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  const load = useCallback(
    async (q: string) => {
      setLoading(true)
      try {
        const res = await getCollection(id, { q, limit: PAGE_SIZE, offset: 0, sort: sortRef.current })
        if (!activeRef.current) return
        photosRef.current = res.photos
        setPhotos(res.photos)
        setTotal(res.total)
        setHasMore(res.hasMore)
        setCanEdit(res.canEdit)
        setRole(res.role)
        setIsPublic(res.collection.is_public !== false)
        if (res.pricing) setPricing(res.pricing)
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
  }, [query, load, photoSort])

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
      const res = await getCollection(id, { q: query.trim(), limit: PAGE_SIZE, offset: offsetRef.current, sort: sortRef.current })
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

  const toggleVisibility = async () => {
    const next = !isPublic
    try {
      await setCollectionVisibility(id, next)
      setIsPublic(next)
      Alert.alert(
        'Visibility updated',
        next ? 'This collection is now public.' : 'This collection is now private. Only members can view it.'
      )
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update visibility')
    }
  }

  const handleImport = async () => {
    const urls = importText
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!urls.length) return Alert.alert('Import', 'Paste at least one link')
    setImporting(true)
    try {
      const res = await importFromLinks(id, urls)
      await load(query.trim())
      setImportOpen(false)
      setImportText('')
      const failed = res.results.filter((r) => r.error)
      Alert.alert('Import finished', `${res.imported} imported${failed.length ? `, ${failed.length} failed` : ''}.`)
    } catch (err) {
      Alert.alert('Import failed', err instanceof Error ? err.message : 'Could not import those links')
    } finally {
      setImporting(false)
    }
  }

  const handleSavePrice = async () => {
    const raw = priceText.trim()
    const cents = raw === '' ? null : Math.round(Number(raw) * 100)
    if (cents !== null && (!Number.isFinite(cents) || cents < 0)) return Alert.alert('Pricing', 'Enter a valid price')
    setSavingPrice(true)
    try {
      await setCollectionPrice(id, cents, pricing?.currency || 'usd')
      await load(query.trim())
      setSellOpen(false)
      Alert.alert('Pricing saved', cents ? 'Buyers can now purchase this collection.' : 'This collection is free again.')
    } catch (err) {
      Alert.alert('Could not save pricing', err instanceof Error ? err.message : 'Try again later')
    } finally {
      setSavingPrice(false)
    }
  }

  const handleBuy = async () => {
    try {
      const res = await startCheckout(id)
      if (res.url) Linking.openURL(res.url)
      else if (res.alreadyPurchased) {
        await load(query.trim())
        Alert.alert('Purchased', 'You already own this collection.')
      } else {
        Alert.alert('Checkout unavailable', res.error || 'Payments are not configured yet')
      }
    } catch {
      Alert.alert('Checkout unavailable', 'Could not start checkout')
    }
  }

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {total} photo{total === 1 ? '' : 's'} in this collection
            {!isPublic ? '  ·  🔒 private' : ''}
            {role && role !== 'owner' ? `  ·  you are ${role}` : ''}
            {pricing?.price_cents
              ? pricing.purchased
                ? `  ·  ✓ purchased`
                : `  ·  ${formatCents(pricing.price_cents, pricing.currency)}`
              : ''}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {canEdit && (
              <View style={{ flex: 1, minWidth: 140 }}>
                <AnimatedButton onPress={handleAdd} disabled={uploading}>
                  <ButtonText>+ Add Photos</ButtonText>
                </AnimatedButton>
              </View>
            )}
            {canEdit && (
              <View style={{ flex: 1, minWidth: 140 }}>
                <AnimatedButton outline onPress={() => setImportOpen(true)}>
                  <ButtonText outline>🔗 Import</ButtonText>
                </AnimatedButton>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 140 }}>
              <AnimatedButton
                outline
                onPress={() => navigation.navigate('QRDisplay', { id, name })}
              >
                <ButtonText outline>Show QR</ButtonText>
              </AnimatedButton>
            </View>
          </View>
          {pricing?.locked && (
            <View style={{ marginTop: 12 }}>
              <AnimatedButton onPress={handleBuy}>
                <ButtonText>Buy {formatCents(pricing.price_cents || 0, pricing.currency)}</ButtonText>
              </AnimatedButton>
            </View>
          )}
          {role && (
            <Pressable
              onPress={() => navigation.navigate('Members', { id, name })}
              style={{ marginTop: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Manage members"
            >
              <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>👥 Manage members</Text>
            </Pressable>
          )}
          {role === 'owner' && (
            <Pressable
              onPress={() => {
                setPriceText(pricing?.price_cents ? String(pricing.price_cents / 100) : '')
                setSellOpen(true)
              }}
              style={{ marginTop: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Set a price for this collection"
            >
              <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>
                {pricing?.price_cents ? '🏷️ Edit price & sales' : '🏷️ Sell this collection'}
              </Text>
            </Pressable>
          )}
          {role === 'owner' && (
            <Pressable
              onPress={toggleVisibility}
              style={{ marginTop: 8 }}
              accessibilityRole="button"
              accessibilityLabel={isPublic ? 'Make collection private' : 'Make collection public'}
            >
              <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>
                {isPublic ? '🔒 Make private' : '🔓 Make public'}
              </Text>
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

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginBottom: 12, alignItems: 'center' }}>
        {(['newest', 'oldest', 'name'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setPhotoSort(s)}
            accessibilityRole="button"
            accessibilityState={{ selected: photoSort === s }}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: photoSort === s ? colors.accent : colors.border,
              backgroundColor: photoSort === s ? 'rgba(99,102,241,0.15)' : 'transparent',
            }}
          >
            <Text style={{ color: photoSort === s ? colors.text : colors.textMuted, fontSize: 13, fontWeight: '600' }}>
              {s === 'newest' ? 'Newest' : s === 'oldest' ? 'Oldest' : 'A–Z'}
            </Text>
          </Pressable>
        ))}
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
          key={`grid-${columns}`}
          keyExtractor={(item) => item.id}
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
                source={{ uri: photoUrl(item.filename, { thumb: true }), headers: imageHeaders() }}
                style={[styles.photo, shadows.card, { width: itemWidth, height: itemWidth }]}
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

      <Modal visible={importOpen} transparent animationType="fade" onRequestClose={() => setImportOpen(false)}>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>Import from link</Text>
            <Text style={modalStyles.hint}>
              One link per line: direct image URLs, Google Drive file links, or any page with an og:image tag.
            </Text>
            <TextInput
              multiline
              value={importText}
              onChangeText={setImportText}
              placeholder={'https://drive.google.com/file/d/…/view'}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { minHeight: 110, textAlignVertical: 'top' }]}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <AnimatedButton outline onPress={() => setImportOpen(false)}>
                  <ButtonText outline>Cancel</ButtonText>
                </AnimatedButton>
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedButton onPress={handleImport} disabled={importing}>
                  <ButtonText>{importing ? 'Importing…' : 'Import'}</ButtonText>
                </AnimatedButton>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sellOpen} transparent animationType="fade" onRequestClose={() => setSellOpen(false)}>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>Pricing &amp; sales</Text>
            <Text style={modalStyles.hint}>
              Set a price to sell the original files with Stripe Checkout. Leave empty to share for free.
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              value={priceText}
              onChangeText={setPriceText}
              placeholder="12.00"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <AnimatedButton outline onPress={() => setSellOpen(false)}>
                  <ButtonText outline>Cancel</ButtonText>
                </AnimatedButton>
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedButton onPress={handleSavePrice} disabled={savingPrice}>
                  <ButtonText>{savingPrice ? 'Saving…' : 'Save'}</ButtonText>
                </AnimatedButton>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,3,8,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  title: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 8 },
  hint: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
})

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
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  deletePhoto as deletePhotoApi,
  getCollection,
  getPayoutStatus,
  imageHeaders,
  importFromLinks,
  photoUrl,
  setCollectionExpiry,
  setCollectionPrice,
  setCollectionVisibility,
  startCheckout,
  startPayoutOnboarding,
  uploadPhoto,
  type Photo,
  type PayoutStatus,
  type Pricing,
  type RootStackParamList,
} from '../api'
import { colors, styles, fonts } from '../styles'
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
  const [payout, setPayout] = useState<PayoutStatus | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [expiryOpen, setExpiryOpen] = useState(false)
  const [expiryDays, setExpiryDays] = useState('')
  const [savingExpiry, setSavingExpiry] = useState(false)

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
        setExpiresAt(res.collection.expires_at || null)
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

  useEffect(() => {
    if (!sellOpen || role !== 'owner') return
    let active = true
    getPayoutStatus()
      .then((s) => {
        if (active) setPayout(s)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [sellOpen, role])

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

  const uploadAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!assets.length) return
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

  const handleAdd = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to upload.')

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (result.canceled || !result.assets?.length) return
    await uploadAssets(result.assets)
  }

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow camera access to take a photo.')
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 })
    if (result.canceled || !result.assets?.length) return
    await uploadAssets(result.assets)
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

  const handleConnectPayouts = async () => {
    setConnecting(true)
    try {
      const { url } = await startPayoutOnboarding(id)
      await Linking.openURL(url)
    } catch (err) {
      Alert.alert('Payout setup', err instanceof Error ? err.message : 'Could not start payout setup')
    } finally {
      setConnecting(false)
    }
  }

  const handleSaveExpiry = async () => {
    const raw = expiryDays.trim()
    const days = raw === '' ? null : Number(raw)
    if (days !== null && (!Number.isFinite(days) || days < 1 || days > 3650)) {
      return Alert.alert('Auto-delete', 'Enter a number of days between 1 and 3650')
    }
    setSavingExpiry(true)
    try {
      await setCollectionExpiry(id, days)
      await load(query.trim())
      setExpiryOpen(false)
      Alert.alert(
        'Auto-delete saved',
        days ? `This collection will be deleted in ${days} day${days === 1 ? '' : 's'}.` : 'This collection will be kept.'
      )
    } catch (err) {
      Alert.alert('Could not save schedule', err instanceof Error ? err.message : 'Try again later')
    } finally {
      setSavingExpiry(false)
    }
  }

  const handleBuy = async () => {    try {
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
        <View style={c.head}>
          <View style={c.topRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to collections"
            >
              <Text style={c.back}>&larr; Collections</Text>
            </Pressable>
            <Text style={c.topMeta}>
              {role === 'owner' ? 'Owner' : role ? role : ''}
            </Text>
          </View>

          <Text style={c.kicker}>
            {pricing?.price_cents
              ? pricing.purchased
                ? 'Collection — Purchased'
                : 'Collection — For sale'
              : 'Collection'}
          </Text>
          <Text style={c.title}>{name}</Text>
          <Text style={c.meta}>
            {total} photograph{total === 1 ? '' : 's'}
            {!isPublic ? '  ·  private' : ''}
            {role && role !== 'owner' ? `  ·  you are ${role}` : ''}
            {expiresAt
              ? `  ·  ${Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))} days left`
              : ''}
          </Text>

          {pricing?.price_cents ? (
            <View style={c.priceRow}>
              <Text style={c.priceLabel}>
                Originals
                {pricing.purchased
                  ? ', unlocked'
                  : `, ${formatCents(pricing.price_cents, pricing.currency)}`}
              </Text>
              {pricing.locked ? (
                <Pressable onPress={handleBuy} accessibilityRole="button">
                  <Text style={c.buy}>Buy &rarr;</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={c.actions}>
            {canEdit ? (
              <>
                <Pressable onPress={handleAdd} disabled={uploading} style={c.action} accessibilityRole="button">
                  <Text style={c.actionText}>Add photos</Text>
                </Pressable>
                <Pressable onPress={handleCamera} disabled={uploading} style={c.action} accessibilityRole="button">
                  <Text style={c.actionText}>Camera</Text>
                </Pressable>
                <Pressable onPress={() => setImportOpen(true)} style={c.action} accessibilityRole="button">
                  <Text style={c.actionText}>Import</Text>
                </Pressable>
              </>
            ) : null}
            <Pressable
              onPress={() => navigation.navigate('QRDisplay', { id, name })}
              style={c.action}
              accessibilityRole="button"
            >
              <Text style={c.actionText}>Show QR</Text>
            </Pressable>
          </View>

          <View style={c.manage}>
            {role ? (
              <Pressable
                onPress={() => navigation.navigate('Members', { id, name })}
                hitSlop={6}
                accessibilityRole="button"
              >
                <Text style={c.manageText}>Members</Text>
              </Pressable>
            ) : null}
            {role === 'owner' ? (
              <Pressable
                onPress={() => {
                  setPriceText(pricing?.price_cents ? String(pricing.price_cents / 100) : '')
                  setSellOpen(true)
                }}
                hitSlop={6}
                accessibilityRole="button"
              >
                <Text style={c.manageText}>{pricing?.price_cents ? 'Edit price' : 'Sell this collection'}</Text>
              </Pressable>
            ) : null}
            {role === 'owner' ? (
              <Pressable
                onPress={() => {
                  setExpiryDays(
                    expiresAt
                      ? String(Math.max(1, Math.round((new Date(expiresAt).getTime() - Date.now()) / 86400000)))
                      : ''
                  )
                  setExpiryOpen(true)
                }}
                hitSlop={6}
                accessibilityRole="button"
              >
                <Text style={c.manageText}>{expiresAt ? 'Edit auto-delete' : 'Auto-delete'}</Text>
              </Pressable>
            ) : null}
            {role === 'owner' ? (
              <Pressable onPress={toggleVisibility} hitSlop={6} accessibilityRole="button">
                <Text style={c.manageText}>{isPublic ? 'Make private' : 'Make public'}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={c.rule} />
        </View>
      </FadeIn>

      <View style={{ paddingHorizontal: 22 }}>
        <TextInput
          style={c.search}
          placeholder="Search photos by filename…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <View style={c.filters}>
        {(['newest', 'oldest', 'name'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setPhotoSort(s)}
            accessibilityRole="button"
            accessibilityState={{ selected: photoSort === s }}
            style={c.filterItem}
          >
            <Text style={[c.filterText, photoSort === s && c.filterTextOn]}>
              {s === 'newest' ? 'Newest' : s === 'oldest' ? 'Oldest' : 'A–Z'}
            </Text>
            <View style={[c.filterLine, photoSort === s && c.filterLineOn]} />
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
              <Ionicons name="images-outline" size={40} color={colors.textMuted} style={{ marginBottom: 14, opacity: 0.6 }} />
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
              style={{ width: itemWidth }}
            >
              <Image
                source={{ uri: photoUrl(item.filename, { thumb: true }), headers: imageHeaders() }}
                style={[c.thumb, { width: itemWidth, height: Math.round(itemWidth * 1.25) }]}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View style={c.caption}>
                <Text style={c.captionNo}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={c.captionName} numberOfLines={1}>
                  {item.original_name}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {uploadProgress && (
        <View accessibilityLiveRegion="polite" style={c.progress}>
          <Text style={c.progressText}>
            Uploading {uploadProgress.done}/{uploadProgress.total}…
          </Text>
          <View style={c.progressTrack}>
            <View
              style={[
                c.progressFill,
                { width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%` },
              ]}
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
            {payout?.configured &&
              (payout.payoutsEnabled ? (
                <Text style={[modalStyles.hint, { marginTop: 18 }]}>
                  Payouts active. Sales transfer to your Stripe account automatically.
                </Text>
              ) : (
                <View style={{ marginTop: 18 }}>
                  <Text style={[modalStyles.hint, { marginBottom: 10 }]}>
                    {payout.accountId
                      ? 'Finish Stripe setup so payouts can reach your bank.'
                      : 'Connect Stripe to receive sales directly instead of the platform account.'}
                  </Text>
                  <AnimatedButton outline onPress={handleConnectPayouts} disabled={connecting}>
                    <ButtonText outline>
                      {connecting ? 'Opening…' : payout.accountId ? 'Finish payout setup' : 'Connect Stripe'}
                    </ButtonText>
                  </AnimatedButton>
                </View>
              ))}
          </View>
        </View>
      </Modal>

      <Modal visible={expiryOpen} transparent animationType="fade" onRequestClose={() => setExpiryOpen(false)}>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>Auto-delete this collection</Text>
            <Text style={modalStyles.hint}>
              Photos are removed from storage and the database within an hour of the deadline. Leave empty (Never) to keep
              the collection forever.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {['', '1', '7', '30', '90'].map((d) => (
                <Pressable
                  key={d || 'off'}
                  onPress={() => setExpiryDays(d)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: expiryDays === d }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: colors.ink,
                    backgroundColor: expiryDays === d ? colors.ink : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.sansSemi,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      fontSize: 11,
                      color: expiryDays === d ? colors.paper : colors.textMuted,
                    }}
                  >
                    {d === '' ? 'Never' : `${d}d`}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              keyboardType="number-pad"
              value={expiryDays}
              onChangeText={setExpiryDays}
              placeholder="Custom days"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { marginBottom: 12 }]}
            />
            {pricing?.price_cents ? (
              <Text style={[modalStyles.hint, { color: colors.red }]}>
                Warning: this collection is for sale. When it deletes, buyers lose access and purchase records are removed.
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <AnimatedButton outline onPress={() => setExpiryOpen(false)}>
                  <ButtonText outline>Cancel</ButtonText>
                </AnimatedButton>
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedButton onPress={handleSaveExpiry} disabled={savingExpiry}>
                  <ButtonText>{savingExpiry ? 'Saving…' : 'Save'}</ButtonText>
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
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.ink,
    padding: 22,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 24,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  hint: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
})

const c = StyleSheet.create({
  head: { paddingHorizontal: 22, paddingTop: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  topMeta: {
    fontFamily: fonts.sansSemi,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  kicker: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.red,
    marginTop: 16,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 35,
    color: colors.ink,
    letterSpacing: -0.6,
    marginTop: 8,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 9,
    marginTop: 14,
  },
  priceLabel: { fontFamily: fonts.serifItalic, fontSize: 16, color: colors.ink },
  buy: {
    fontFamily: fonts.sansSemi,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.red,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 14 },
  action: {},
  actionText: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  manage: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 14 },
  manageText: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.red,
  },
  rule: { borderTopWidth: 1, borderTopColor: colors.ink, marginTop: 16 },
  search: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 12,
    marginBottom: 12,
  },
  filterItem: { alignItems: 'center', paddingBottom: 4 },
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
  thumb: { backgroundColor: colors.surface2 },
  caption: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  captionNo: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: colors.red,
  },
  captionName: { fontFamily: fonts.serifItalic, fontSize: 12.5, color: colors.textMuted, flex: 1 },
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 22,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.ink,
  },
  progressText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  progressTrack: { height: 4, backgroundColor: colors.surface2 },
  progressFill: { height: 4, backgroundColor: colors.red },
})

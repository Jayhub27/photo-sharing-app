import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Image, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  getCollection,
  photoUrl,
  type Photo,
  type RootStackParamList,
} from '../api'
import { colors, styles, shadows } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, SkeletonCard, LoadingScreen } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>

export default function GalleryScreen({ route, navigation }: Props) {
  const { collectionId } = route.params
  const [photos, setPhotos] = useState<Photo[]>([])
  const [name, setName] = useState('Gallery')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { collection, photos } = await getCollection(collectionId)
      setPhotos(photos)
      setName(collection.name)
      navigation.setOptions({ title: collection.name })
    } catch {
      setError('Could not load this collection. The QR may be invalid.')
    } finally {
      setLoading(false)
    }
  }, [collectionId, navigation])

  useEffect(() => {
    load()
  }, [load])

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
            {photos.length} photo{photos.length === 1 ? '' : 's'} in this collection
          </Text>
        </View>
      </FadeIn>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>This collection has no photos yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Image
            source={{ uri: photoUrl(item.filename, { thumb: true }) }}
            style={[styles.photo, shadows.card]}
            resizeMode="cover"
          />
        )}
      />
    </View>
  )
}
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  deletePhoto as deletePhotoApi,
  getCollection,
  photoUrl,
  uploadPhotos,
  type Photo,
  type RootStackParamList,
} from '../api'
import { colors, styles, shadows } from '../styles'
import {
  AnimatedButton,
  ButtonText,
  FadeIn,
  SkeletonCard,
  LoadingScreen,
} from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>

export default function CollectionScreen({ route, navigation }: Props) {
  const { id, name } = route.params
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { photos } = await getCollection(id)
      setPhotos(photos)
    } catch {
      Alert.alert('Error', 'Could not load collection')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to upload.')

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (result.canceled || !result.assets?.length) return

    setUploading(true)
    try {
      const res = await uploadPhotos(id, result.assets.map((a) => a.uri))
      setPhotos((prev) => [...res.photos, ...prev])
    } catch {
      Alert.alert('Upload failed', 'Could not upload photos')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (photo: Photo) => {
    Alert.alert(
      'Delete photo',
      `Delete "${photo.original_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhotoApi(photo.id)
              setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
            } catch {
              Alert.alert('Error', 'Could not delete photo')
            }
          },
        },
      ]
    )
  }

  if (uploading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {photos.length} photo{photos.length === 1 ? '' : 's'} in this collection
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <AnimatedButton onPress={handleAdd}>
                <ButtonText>+ Add Photos</ButtonText>
              </AnimatedButton>
            </View>
            <View style={{ flex: 1 }}>
              <AnimatedButton
                outline
                onPress={() => navigation.navigate('QRDisplay', { id, name })}
              >
                <ButtonText outline>Show QR</ButtonText>
              </AnimatedButton>
            </View>
          </View>
        </View>
      </FadeIn>

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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🖼️</Text>
              <Text style={styles.emptyText}>
                No photos yet.{'\n'}Tap "Add Photos" to add some.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onLongPress={() => handleDelete(item)}>
              <Image
                source={{ uri: photoUrl(item.filename) }}
                style={[styles.photo, shadows.card]}
                resizeMode="cover"
              />
            </Pressable>
          )}
        />
      )}
    </View>
  )
}
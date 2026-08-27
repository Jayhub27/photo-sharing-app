import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listCollections, type Collection, type RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, AnimatedCard, FadeIn, SkeletonCard } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { collections } = await listCollections()
      setCollections(collections)
    } catch {
      setError('Could not reach server. Is it running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsub = navigation.addListener('focus', load)
    return unsub
  }, [navigation, load])

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 20 }}>📷</Text>
            </View>
            <Text style={styles.logoText}>PhotoShare</Text>
          </View>
          <Text style={styles.title}>Share photos with a QR code</Text>
          <Text style={styles.subtitle}>
            Create a collection, add your photos, and share a QR code. Anyone who scans it instantly sees your gallery.
          </Text>
          <View style={{ gap: 10 }}>
            <AnimatedButton onPress={() => navigation.navigate('CreateCollection')}>
              <ButtonText>+ New Collection</ButtonText>
            </AnimatedButton>
            <AnimatedButton
              outline
              onPress={() => navigation.navigate('Scan')}
            >
              <ButtonText outline>Scan a QR Code</ButtonText>
            </AnimatedButton>
          </View>
        </View>
      </FadeIn>

      <Text style={styles.sectionLabel}>Your Collections</Text>

      {loading ? (
        <View style={{ paddingHorizontal: 24 }}>
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
            <AnimatedButton onPress={load}>
              <ButtonText>Retry</ButtonText>
            </AnimatedButton>
          </View>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>
                No collections yet.{'\n'}Create one above to get started.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <AnimatedCard
              index={index}
              onPress={() =>
                navigation.navigate('Collection', { id: item.id, name: item.name })
              }
            >
              <View style={[styles.card, shadows.card]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardThumb}>
                    <Text style={{ fontSize: 22 }}>📁</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSub}>
                      {item.photo_count ?? 0} photo{(item.photo_count ?? 0) === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </View>
            </AnimatedCard>
          )}
        />
      )}
    </View>
  )
}
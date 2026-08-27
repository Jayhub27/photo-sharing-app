import React, { useState } from 'react'
import { Alert, TextInput, View, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { createCollection, type RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, LoadingScreen } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'CreateCollection'>

export default function CreateCollectionScreen({ navigation }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed) return Alert.alert('Enter a name')
    setSaving(true)
    try {
      const col = await createCollection(trimmed)
      navigation.replace('Collection', { id: col.id, name: col.name })
    } catch {
      Alert.alert('Error', 'Could not create collection. Is the server running?')
      setSaving(false)
    }
  }

  if (saving) return <LoadingScreen />

  return (
    <View style={[styles.container, { padding: 24 }]}>
      <FadeIn>
        <Text style={styles.title}>New Collection</Text>
        <Text style={styles.subtitle}>Give your collection a name.</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Iceland Trip"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        <AnimatedButton onPress={handleCreate}>
          <ButtonText>Create</ButtonText>
        </AnimatedButton>
      </FadeIn>
    </View>
  )
}
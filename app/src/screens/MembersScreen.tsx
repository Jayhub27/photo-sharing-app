import React, { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  addMember,
  getMembers,
  removeMember,
  type Member,
  type MemberRole,
  type RootStackParamList,
} from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn, LoadingScreen } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Members'>

export default function MembersScreen({ route }: Props) {
  const { id, name } = route.params
  const [members, setMembers] = useState<Member[]>([])
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('viewer')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMembers(id)
      setMembers(data.members)
      setCanManage(data.canManage)
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not load members')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const invite = async () => {
    if (!email.trim()) return Alert.alert('Enter an email')
    setBusy(true)
    try {
      await addMember(id, email.trim().toLowerCase(), role)
      setEmail('')
      await load()
    } catch (err) {
      Alert.alert('Could not invite', err instanceof Error ? err.message : 'Try again')
    } finally {
      setBusy(false)
    }
  }

  const remove = (member: Member) => {
    Alert.alert('Remove member', `Remove ${member.name} from this collection?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMember(id, member.user_id)
            setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id))
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not remove member')
          }
        },
      },
    ])
  }

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.hero}>
          <Text style={styles.title}>{name ? `Share ${name}` : 'Members'}</Text>
          <Text style={styles.subtitle}>
            Invite people by the email of their PhotoShare account. Editors can add photos, viewers can only look.
          </Text>
          {canManage && (
            <View style={{ gap: 10 }}>
              <TextInput
                style={styles.input}
                placeholder="teammate@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['viewer', 'editor'] as MemberRole[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: role === r ? colors.accent : colors.border,
                      backgroundColor: role === r ? 'rgba(99,102,241,0.15)' : 'transparent',
                    }}
                  >
                    <Text style={{ color: role === r ? colors.text : colors.textMuted, fontWeight: '600' }}>
                      {r === 'editor' ? 'Editor' : 'Viewer'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <AnimatedButton onPress={invite} disabled={busy}>
                <ButtonText>{busy ? 'Inviting…' : 'Invite'}</ButtonText>
              </AnimatedButton>
            </View>
          )}
        </View>
      </FadeIn>

      <FlatList
        data={members}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { alignItems: 'center' },
            ]}
          >
            <View style={styles.cardLeft}>
              <View style={styles.cardThumb}>
                <Text style={{ fontSize: 18 }}>{item.role === 'owner' ? '👑' : '👤'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.email}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, textTransform: 'uppercase' }}>
                {item.role}
              </Text>
              {canManage && item.role !== 'owner' && (
                <Pressable onPress={() => remove(item)}>
                  <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600' }}>Remove</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No members yet.</Text>
          </View>
        }
      />
    </View>
  )
}

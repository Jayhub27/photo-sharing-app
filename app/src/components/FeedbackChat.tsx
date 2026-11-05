import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { sendFeedback } from '../api'
import { glassLight, wg } from '../theme/warmGlass'

type Bubble = { id: string; from: 'me' | 'team'; text: string }

/**
 * TEMPORARY feedback chat: bug reports and improvement ideas.
 * Remove this component, its Account row and POST /api/feedback when done.
 */
export function FeedbackChat({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { id: 'intro', from: 'team', text: 'Found a bug or have an idea? Tell us in a sentence.' },
  ])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const canSend = text.trim().length >= 3 && !sending

  const submit = async () => {
    if (!canSend) return
    const message = text.trim()
    const id = String(Date.now())
    setBubbles((prev) => [...prev, { id, from: 'me', text: message }])
    setText('')
    setSending(true)
    try {
      const res = await sendFeedback(message, {
        platform: Platform.OS,
        version: Constants.expoConfig?.version || null,
      })
      setBubbles((prev) => [
        ...prev,
        { id: `${id}-reply`, from: 'team', text: res.reply || 'Logged it.' },
      ])
    } catch (err) {
      setBubbles((prev) => [
        ...prev,
        {
          id: `${id}-error`,
          from: 'team',
          text: err instanceof Error ? err.message : 'Could not send that.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.sheet}
        >
          <View style={[s.card, glassLight]}>
            <View style={s.head}>
              <Text style={s.title}>Feedback</Text>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close feedback">
                <Ionicons name="close" size={22} color={wg.color.ink} />
              </Pressable>
            </View>

            <ScrollView
              style={s.log}
              contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
              keyboardShouldPersistTaps="handled"
            >
              {bubbles.map((bubble) => (
                <View
                  key={bubble.id}
                  style={[s.bubble, bubble.from === 'me' ? s.me : s.team]}
                >
                  <Text style={[s.bubbleText, bubble.from === 'me' && s.meText]}>
                    {bubble.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={s.form}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="What went wrong, or what would help?"
                placeholderTextColor={wg.color.muted}
                style={s.input}
                multiline
                maxLength={2000}
              />
              <Pressable
                onPress={submit}
                disabled={!canSend}
                style={[s.send, !canSend && { opacity: 0.45 }]}
                accessibilityLabel="Send feedback"
              >
                {sending ? (
                  <ActivityIndicator color={wg.color.paper} />
                ) : (
                  <Ionicons name="arrow-up" size={18} color={wg.color.paper} />
                )}
              </Pressable>
            </View>
            <Text style={s.note}>Temporary feedback channel</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(11,10,9,0.35)', justifyContent: 'flex-end' },
  sheet: { width: '100%' },
  card: {
    margin: 12,
    marginBottom: 22,
    borderRadius: 24,
    padding: 16,
    maxHeight: '72%',
    backgroundColor: wg.color.paperSoft,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontFamily: wg.font.serif, fontSize: 24, color: wg.color.ink },
  log: { maxHeight: 320 },
  bubble: { maxWidth: '86%', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 14 },
  me: { alignSelf: 'flex-end', backgroundColor: wg.color.ink },
  team: { alignSelf: 'flex-start', backgroundColor: wg.color.paperDeep },
  bubbleText: { fontSize: 14, lineHeight: 20, color: wg.color.ink },
  meText: { color: wg.color.paper },
  form: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: wg.color.line,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: wg.color.paper,
    borderWidth: 1,
    borderColor: wg.color.line,
    color: wg.color.ink,
    fontSize: 14,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: wg.color.ink,
  },
  note: { marginTop: 8, fontSize: 10, color: wg.color.muted },
})

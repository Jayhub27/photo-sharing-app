import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Clipboard,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  decodeCameraQr,
  importFromLinks,
  listCollections,
  parseCollectionUrl,
  type AppTabParamList,
  type CameraQrAppInfo,
  type CameraQrPayload,
  type Collection,
  type RootStackParamList,
} from '../api'
import { colors, shadows, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn } from '../components'

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Scan'>,
  NativeStackScreenProps<RootStackParamList>
>

type Step =
  | { kind: 'scanning' }
  | { kind: 'classifying' }
  | { kind: 'result'; payload: CameraQrPayload }

export default function ScanScreen({ navigation }: Props) {
  const [scanned, setScanned] = useState(false)

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <FadeIn>
          <Text style={[styles.title, { textAlign: 'center' }]}>QR scanning</Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            Camera scanning is only available in the mobile app. Open this app on your phone to scan a QR code.
          </Text>
        </FadeIn>
      </View>
    )
  }

  return <ScanScreenMobile navigation={navigation} scanned={scanned} setScanned={setScanned} />
}

function ScanScreenMobile({
  navigation,
  scanned,
  setScanned,
}: {
  navigation: Props['navigation']
  scanned: boolean
  setScanned: (v: boolean) => void
}) {
  const [permission, requestPermission] = useCameraPermissions()
  const [step, setStep] = useState<Step>({ kind: 'scanning' })
  const [collections, setCollections] = useState<Collection[] | null>(null)
  const [picking, setPicking] = useState(false)
  const [importing, setImporting] = useState(false)
  const pulse = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    if (!permission?.granted) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [permission?.granted])

  if (!permission) return <View style={styles.center} />

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <FadeIn>
          <Text style={[styles.title, { textAlign: 'center' }]}>Camera Access</Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            Camera access is needed to scan QR codes.
          </Text>
          <View style={{ width: 280, alignSelf: 'stretch' }}>
            <AnimatedButton onPress={requestPermission}>
              <ButtonText>Grant access</ButtonText>
            </AnimatedButton>
          </View>
        </FadeIn>
      </View>
    )
  }

  const reset = () => {
    setStep({ kind: 'scanning' })
    setCollections(null)
    setPicking(false)
    setImporting(false)
    setScanned(false)
  }

  const handleScanned = async ({ data }: { data: string }) => {
    if (scanned) return
    const collectionId = parseCollectionUrl(data)
    if (collectionId) {
      setScanned(true)
      navigation.navigate('Gallery', { collectionId })
      return
    }

    // Camera-app QRs (Canon, LUMIX, OI.Share, …) carry Wi-Fi details or photo
    // links. The server classifies the payload so both apps stay in sync.
    setScanned(true)
    setStep({ kind: 'classifying' })
    try {
      const res = await decodeCameraQr(data)
      setStep({ kind: 'result', payload: res.payload })
    } catch (err) {
      reset()
      Alert.alert(
        'Could not read that QR',
        err instanceof Error ? err.message : 'Try again or scan a Take the shot collection QR code.'
      )
    }
  }

  const openPicker = async () => {
    setPicking(true)
    try {
      const res = await listCollections({ limit: 50, filter: 'all' })
      setCollections(res.collections.filter((c) => c.is_owner || c.role === 'owner' || c.role === 'editor'))
    } catch {
      setCollections([])
    }
  }

  const importInto = async (collection: Collection) => {
    if (step.kind !== 'result' || !step.payload.url) return
    setImporting(true)
    try {
      const res = await importFromLinks(collection.id, [step.payload.url])
      if (res.imported > 0) {
        Alert.alert('Photo imported', `Added to “${collection.name}”.`)
        navigation.navigate('Collection', { id: collection.id, name: collection.name })
      } else {
        Alert.alert('Could not import', res.results[0]?.error || 'Try the direct image link instead.')
      }
    } catch (err) {
      Alert.alert('Could not import', err instanceof Error ? err.message : 'Import failed')
    }
    setImporting(false)
  }

  if (step.kind === 'classifying') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 18, marginBottom: 0 }]}>
          Reading the QR code…
        </Text>
      </View>
    )
  }

  if (step.kind === 'result') {
    return (
      <QrResult
        payload={step.payload}
        collections={collections}
        picking={picking}
        importing={importing}
        onPick={openPicker}
        onImport={importInto}
        onReset={reset}
        onDone={reset}
      />
    )
  }

  const cornerRadius = pulse.interpolate({
    inputRange: [0.8, 1],
    outputRange: [16, 24],
  })

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanned}
      />
      <Animated.View
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: '38%',
          width: 240,
          height: 240,
          borderWidth: 2,
          borderColor: colors.accent,
          borderRadius: cornerRadius,
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: pulse,
          shadowRadius: 20,
          opacity: pulse,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 40,
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '500' }}>
          Point the camera at a QR code
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' }}>
          Take the shot collection or camera Wi-Fi code
        </Text>
      </View>
    </View>
  )
}

function QrResult({
  payload,
  collections,
  picking,
  importing,
  onPick,
  onImport,
  onReset,
  onDone,
}: {
  payload: CameraQrPayload
  collections: Collection[] | null
  picking: boolean
  importing: boolean
  onPick: () => void
  onImport: (collection: Collection) => void
  onReset: () => void
  onDone: () => void
}) {
  const isPlainLink = payload.kind === 'url' && !payload.lan && !payload.appStore
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      {payload.kind === 'wifi' && <WifiResult payload={payload} />}
      {payload.kind === 'url' && payload.lan && <LanResult payload={payload} />}
      {payload.kind === 'url' && payload.appStore && <StoreResult payload={payload} />}
      {isPlainLink && (
        <LinkResult
          payload={payload}
          collections={collections}
          picking={picking}
          importing={importing}
          onPick={onPick}
          onImport={onImport}
        />
      )}
      {payload.kind === 'text' && (
        <>
          <Text style={styles.title}>QR content</Text>
          <Text style={styles.subtitle}>
            This code does not look like a camera connection or a photo link.
          </Text>
          <InfoRow label="Code" value={payload.text || ''} />
        </>
      )}

      <View style={{ marginTop: 22, gap: 10 }}>
        <AnimatedButton onPress={onReset}>
          <ButtonText>Scan again</ButtonText>
        </AnimatedButton>
        <AnimatedButton outline onPress={onDone}>
          <ButtonText outline>Done</ButtonText>
        </AnimatedButton>
      </View>
    </ScrollView>
  )
}

function WifiResult({ payload }: { payload: CameraQrPayload }) {
  const app = payload.app
  return (
    <>
      <Text style={styles.title}>{app ? `${app.label} camera Wi-Fi` : 'Camera Wi-Fi'}</Text>
      <Text style={styles.subtitle}>
        Join the network, transfer the photos with the camera app, then add them to a collection.
      </Text>
      <InfoRow label="Network (SSID)" value={payload.ssid || ''} />
      {payload.password ? <InfoRow label="Password" value={payload.password} /> : null}
      <View style={s.steps}>
        <Text style={s.step}>1. Join “{payload.ssid}” in your phone’s Wi-Fi settings.</Text>
        <Text style={s.step}>
          2. Open {app ? app.apps.join(' / ') : 'the camera app'} and save the photos to your phone.
        </Text>
        <Text style={s.step}>3. Create or open a collection here and tap + Add.</Text>
      </View>
      {app ? <VendorCard app={app} /> : null}
      <Text style={s.footnote}>Web apps can’t join Wi-Fi networks themselves, so the join step is manual.</Text>
    </>
  )
}

function LanResult({ payload }: { payload: CameraQrPayload }) {
  const app = payload.app
  return (
    <>
      <Text style={styles.title}>Camera network address</Text>
      <Text style={styles.subtitle}>
        “{payload.host}” only exists while your phone is on the camera’s own Wi-Fi, and web pages
        cannot talk to camera addresses directly.
      </Text>
      <InfoRow label="Address" value={payload.url || ''} />
      <View style={s.steps}>
        <Text style={s.step}>1. Join the camera’s Wi-Fi network in your phone settings.</Text>
        <Text style={s.step}>
          2. Open {app ? app.apps.join(' / ') : 'the camera app'} and save the shots to your phone.
        </Text>
        <Text style={s.step}>3. Add them here with + Add.</Text>
      </View>
      {app ? <VendorCard app={app} /> : null}
    </>
  )
}

function StoreResult({ payload }: { payload: CameraQrPayload }) {
  return (
    <>
      <Text style={styles.title}>Camera app install link</Text>
      <Text style={styles.subtitle}>
        This QR installs the camera’s phone app, not photos. Install it, connect to the camera,
        transfer your shots to the phone, then add them here.
      </Text>
      <AnimatedButton onPress={() => Linking.openURL(payload.url || '').catch(() => {})}>
        <ButtonText>Open store page</ButtonText>
      </AnimatedButton>
    </>
  )
}

function LinkResult({
  payload,
  collections,
  picking,
  importing,
  onPick,
  onImport,
}: {
  payload: CameraQrPayload
  collections: Collection[] | null
  picking: boolean
  importing: boolean
  onPick: () => void
  onImport: (collection: Collection) => void
}) {
  return (
    <>
      <Text style={styles.title}>Photo link</Text>
      <Text style={styles.subtitle}>This QR points at a photo. Import it into one of your collections.</Text>
      <InfoRow label={payload.host || 'Link'} value={payload.url || ''} />

      {!picking ? (
        <AnimatedButton onPress={onPick}>
          <ButtonText>Import into a collection</ButtonText>
        </AnimatedButton>
      ) : importing ? (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : collections === null ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
      ) : collections.length === 0 ? (
        <Text style={s.footnote}>
          No collections you can edit yet. Create one first, then import the photo again.
        </Text>
      ) : (
        collections.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onImport(c)}
            accessibilityRole="button"
            accessibilityLabel={`Import into ${c.name}`}
            style={s.collectionRow}
          >
            <Text style={{ fontSize: 18 }}>📁</Text>
            <Text style={[styles.cardTitle, { flex: 1, fontSize: 17 }]} numberOfLines={1}>
              {c.name}
            </Text>
            <Text style={{ fontWeight: '600', fontSize: 18 }}>+</Text>
          </Pressable>
        ))
      )}
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <View style={s.kvRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.kvLabel}>{label}</Text>
        <Text style={s.kvValue}>{value}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Copy ${label}`}
        onPress={() => {
          try {
            Clipboard.setString(value)
          } catch {}
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        style={s.copyBtn}
      >
        <Text style={{ fontWeight: '600', fontSize: 12, color: colors.textMuted }}>
          {copied ? 'Copied' : 'Copy'}
        </Text>
      </Pressable>
    </View>
  )
}

function VendorCard({ app }: { app: CameraQrAppInfo }) {
  return (
    <View style={s.vendorCard}>
      <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22, marginBottom: 12 }}>
        {app.transferHint}
      </Text>
      <AnimatedButton outline onPress={() => Linking.openURL(app.storeUrl).catch(() => {})}>
        <ButtonText outline>Get {app.apps[0]}</ButtonText>
      </AnimatedButton>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { padding: 24, paddingBottom: 48 },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  kvLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 3,
  },
  kvValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  copyBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  steps: { gap: 8, marginBottom: 16, marginTop: 4 },
  step: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  footnote: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 8 },
  vendorCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...shadows.card,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...shadows.card,
  },
})

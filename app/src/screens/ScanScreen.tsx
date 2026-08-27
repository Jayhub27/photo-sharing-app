import React, { useEffect, useRef, useState } from 'react'
import { Alert, Text, View, Platform, Animated, Easing } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { parseCollectionUrl, type RootStackParamList } from '../api'
import { colors, styles } from '../styles'
import { AnimatedButton, ButtonText, FadeIn } from '../components'

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>

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

  const handleScanned = ({ data }: { data: string }) => {
    if (scanned) return
    const collectionId = parseCollectionUrl(data)
    if (!collectionId) {
      setScanned(true)
      Alert.alert('Not a PhotoShare QR', 'Point the camera at a PhotoShare collection QR code.', [
        { text: 'OK', onPress: () => setScanned(false) },
      ])
      return
    }
    setScanned(true)
    navigation.replace('Gallery', { collectionId })
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
        onBarCodeScanned={handleScanned}
      />
      <Animated.View
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: '38%',
          width: 240,
          height: 240,
          borderWidth: 2.5,
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
          backgroundGradient: 'linear',
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '500' }}>
          Point the camera at a QR code
        </Text>
      </View>
    </View>
  )
}
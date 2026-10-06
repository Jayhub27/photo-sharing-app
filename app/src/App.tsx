import React, { useEffect, useState } from 'react'
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import CreateCollectionScreen from './screens/CreateCollectionScreen'
import CollectionScreen from './screens/CollectionScreen'
import QRDisplayScreen from './screens/QRDisplayScreen'
import GalleryScreen from './screens/GalleryScreen'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import MembersScreen from './screens/MembersScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import MainTabs from './MainTabs'
import { LoadingScreen } from './components'
import { AuthProvider, useAuth } from './auth'
import { getValue, setValue } from './storage'
import { colors } from './styles'
import type { RootStackParamList } from './api'

const ONBOARDED_KEY = 'tts.onboarded'

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
}

function RootNavigator() {
  const { user, ready } = useAuth()
  const [checkedTour, setCheckedTour] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [startAt, setStartAt] = useState<'Login' | 'Signup'>('Login')

  useEffect(() => {
    let active = true
    getValue(ONBOARDED_KEY).then((seen) => {
      if (!active) return
      setShowTour(!seen)
      setCheckedTour(true)
    })
    return () => {
      active = false
    }
  }, [])

  if (!ready || !checkedTour) return <LoadingScreen />

  if (showTour && !user) {
    return (
      <OnboardingScreen
        onDone={async (action) => {
          await setValue(ONBOARDED_KEY, '1')
          if (action === 'signup') setStartAt('Signup')
          setShowTour(false)
        }}
      />
    )
  }

  return (
    <Stack.Navigator initialRouteName={user ? 'Tabs' : startAt} screenOptions={screenOptions}>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="CreateCollection"
            component={CreateCollectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Collection"
            component={CollectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QRDisplay"
            component={QRDisplayScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Gallery"
            component={GalleryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Members"
            component={MembersScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

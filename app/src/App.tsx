import React from 'react'
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import HomeScreen from './screens/HomeScreen'
import CreateCollectionScreen from './screens/CreateCollectionScreen'
import CollectionScreen from './screens/CollectionScreen'
import QRDisplayScreen from './screens/QRDisplayScreen'
import ScanScreen from './screens/ScanScreen'
import GalleryScreen from './screens/GalleryScreen'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import MembersScreen from './screens/MembersScreen'
import { LoadingScreen } from './components'
import { AuthProvider, useAuth } from './auth'
import { colors } from './styles'
import type { RootStackParamList } from './api'

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

  if (!ready) return <LoadingScreen />

  return (
    <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'} screenOptions={screenOptions}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
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
          <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
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
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

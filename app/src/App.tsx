import React from 'react'
import { NavigationContainer, type DefaultTheme, type Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import HomeScreen from './screens/HomeScreen'
import CreateCollectionScreen from './screens/CreateCollectionScreen'
import CollectionScreen from './screens/CollectionScreen'
import QRDisplayScreen from './screens/QRDisplayScreen'
import ScanScreen from './screens/ScanScreen'
import GalleryScreen from './screens/GalleryScreen'
import { colors } from './styles'

export type RootStackParamList = {
  Home: undefined
  CreateCollection: undefined
  Collection: { id: string; name?: string }
  QRDisplay: { id: string; name?: string }
  Scan: undefined
  Gallery: { collectionId: string }
}

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

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}
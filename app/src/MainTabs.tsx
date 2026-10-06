import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import { PlatformPressable } from '@react-navigation/elements'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { colors } from './styles'
import type { AppTabParamList } from './api'
import HomeScreen from './screens/HomeScreen'
import ScanScreen from './screens/ScanScreen'
import AccountScreen from './screens/AccountScreen'

const Tab = createBottomTabNavigator<AppTabParamList>()

const TAB_ICONS = {
  Collections: ['images', 'images-outline'],
  Scan: ['qr-code', 'qr-code-outline'],
  Account: ['person-circle', 'person-circle-outline'],
} as const

/** Light haptic on tab press, matching the native tab bar feel. */
function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        }
        props.onPressIn?.(ev)
      }}
    />
  )
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarButton: HapticTab,
        tabBarIcon: ({ color, size, focused }) => {
          const [active, inactive] = TAB_ICONS[route.name]
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Collections" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  )
}

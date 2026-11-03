import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { AppTabParamList } from './api'
import HomeScreen from './screens/HomeScreen'
import ScanScreen from './screens/ScanScreen'
import AccountScreen from './screens/AccountScreen'
import { glassLight, wg } from './theme/warmGlass'

const Tab = createBottomTabNavigator<AppTabParamList>()

const LABELS: Record<keyof AppTabParamList, string> = {
  Collections: 'Collections',
  Scan: 'Scan',
  Account: 'Account',
}

const ICONS = {
  Collections: ['images', 'images-outline'],
  Scan: ['qr-code', 'qr-code-outline'],
  Account: ['person-circle', 'person-circle-outline'],
} as const

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[s.bar, glassLight]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index
          const name = route.name as keyof AppTabParamList
          const options = descriptors[route.key].options

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
            }
          }

          const [active, inactive] = ICONS[name]

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[s.item, focused && s.itemOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? LABELS[name]}
            >
              <Ionicons
                name={focused ? active : inactive}
                size={18}
                color={focused ? wg.color.ink : 'rgba(132,122,105,0.9)'}
              />
              <Text style={[s.label, focused && s.labelOn]}>{LABELS[name]}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
    >
      <Tab.Screen name="Collections" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  )
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: wg.color.paper,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  bar: {
    height: 62,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 7,
  },
  item: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  itemOn: {
    backgroundColor: 'rgba(255,252,245,0.94)',
    shadowColor: '#3C2B14',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    fontFamily: wg.font.sansSemi,
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(132,122,105,0.9)',
  },
  labelOn: { color: wg.color.ink },
})

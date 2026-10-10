import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from './styles'
import type { AppTabParamList } from './api'
import HomeScreen from './screens/HomeScreen'
import ScanScreen from './screens/ScanScreen'
import AccountScreen from './screens/AccountScreen'

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

/** A hairline editorial tab bar: uppercase labels, ink rule, red underline. */
function EditorialTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
            style={s.item}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? LABELS[name]}
          >
            <Ionicons
              name={focused ? active : inactive}
              size={19}
              color={focused ? colors.ink : colors.textMuted}
            />
            <Text style={[s.label, focused && s.labelOn]}>{LABELS[name]}</Text>
            <View style={[s.underline, focused && s.underlineOn]} />
          </Pressable>
        )
      })}
    </View>
  )
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <EditorialTabBar {...props} />}
      screenOptions={{ headerShown: false, lazy: false }}
    >
      <Tab.Screen name="Collections" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  )
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.ink,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  labelOn: {
    color: colors.ink,
  },
  underline: {
    height: 2,
    width: 22,
    marginTop: 3,
    backgroundColor: 'transparent',
  },
  underlineOn: {
    backgroundColor: colors.red,
  },
})

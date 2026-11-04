import { Platform, type TextStyle, type ViewStyle } from 'react-native'

/**
 * Warm Glass — the design language for Take the shot.
 *
 * Paper, ink and one bronze signal. Photography carries the colour; the shell
 * stays warm. Glass is reserved for layers that float over a photograph.
 */
export const wg = {
  color: {
    paper: '#F4EFE5',
    paperDeep: '#EDE5D7',
    paperSoft: '#F8F4EC',
    ivory: '#FAF5EA',
    ink: '#211C15',
    inkSoft: '#3B3428',
    muted: '#847A69',
    line: '#DCD3C2',
    bronze: '#96764D',
    teal: '#2F7F79',
    dark: '#0B0A09',
    danger: '#8C1D18',
    white: '#FFFFFF',
  },
  radius: { card: 24, sheet: 30, photo: 16, chip: 999, pill: 999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  font: {
    serif: 'Newsreader_400Regular',
    serifMedium: 'Newsreader_500Medium',
    serifItalic: 'Newsreader_400Regular_Italic',
    sans: 'InstrumentSans_400Regular',
    sansMedium: 'InstrumentSans_500Medium',
    sansSemi: 'InstrumentSans_600SemiBold',
  },
  wash: { subtle: 0.3, balanced: 0.22, vivid: 0.14 },
} as const

export const glassLight: ViewStyle = {
  backgroundColor: 'rgba(255,252,245,0.58)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.72)',
  ...Platform.select({
    android: { elevation: 6 },
    default: {
      shadowColor: '#3C2B14',
      shadowOpacity: 0.16,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 14 },
    },
  }),
}

export const glassLightStrong: ViewStyle = {
  ...glassLight,
  backgroundColor: 'rgba(255,252,245,0.86)',
}

export const glassDark: ViewStyle = {
  backgroundColor: 'rgba(20,17,13,0.4)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.28)',
  ...Platform.select({
    android: { elevation: 7 },
    default: {
      shadowColor: '#000000',
      shadowOpacity: 0.38,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 16 },
    },
  }),
}

export const glassDarkStrong: ViewStyle = {
  ...glassDark,
  backgroundColor: 'rgba(20,17,13,0.62)',
}

export const hairline: ViewStyle = {
  height: 1,
  backgroundColor: 'rgba(33,28,21,0.12)',
}

export const type = {
  display: {
    fontFamily: wg.font.serif,
    color: wg.color.ink,
    letterSpacing: -0.8,
  } as TextStyle,
  displayIvory: {
    fontFamily: wg.font.serif,
    color: wg.color.ivory,
    letterSpacing: -0.8,
  } as TextStyle,
  label: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: wg.color.muted,
  } as TextStyle,
  labelInk: {
    fontFamily: wg.font.sansSemi,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: wg.color.inkSoft,
  } as TextStyle,
  body: {
    fontFamily: wg.font.sans,
    fontSize: 13,
    lineHeight: 19,
    color: wg.color.muted,
  } as TextStyle,
} as const

const rgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export const paperRgba = (alpha: number) => rgba(wg.color.paper, alpha)
export const darkRgba = (alpha: number) => rgba('#0B0A09', alpha)

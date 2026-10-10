import { StyleSheet, TextStyle, ViewStyle, type ImageStyle } from 'react-native'

/**
 * Edition — the editorial design language for Take the shot.
 *
 * Paper, ink, one signal red, sharp plates and hairline rules. The photos are
 * the only colour; the interface is set like print. Serif voice (Newsreader)
 * for titles and captions, a precision grotesk (Instrument Sans) for labels.
 */
export const colors = {
  bg: '#F2F0EB',
  surface: '#FCFBF8',
  surface2: '#E9E4D9',
  card: '#FCFBF8',
  text: '#171512',
  textMuted: '#6E6A60',
  border: '#D8D3C6',
  borderStrong: 'rgba(23,21,18,0.35)',
  accent: '#C4352B',
  accentDark: '#9E2A22',
  onAccent: '#FCFBF8',
  danger: '#8C1D18',
  success: '#5E6347',
  olive: '#5E6347',
  overlay: 'rgba(23,21,18,0.62)',
  paper: '#F2F0EB',
  ink: '#171512',
  red: '#C4352B',
}

export const fonts = {
  serif: 'Newsreader_400Regular',
  serifMedium: 'Newsreader_500Medium',
  serifItalic: 'Newsreader_400Regular_Italic',
  sans: 'InstrumentSans_400Regular',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemi: 'InstrumentSans_600SemiBold',
}

/** Edition has no gradients — kept so existing imports keep resolving. */
export const grad = {
  primary: ['#F2F0EB', '#F2F0EB'] as const,
}

/** Edition has no shadows; plates sit on paper with hairline borders. */
export const shadows = {
  card: {},
  button: {},
}

export const radii = {
  sm: 0,
  md: 2,
  lg: 2,
  xl: 2,
  pill: 999,
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  } as ViewStyle,
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.bg,
  } as ViewStyle,
  hero: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
  } as ViewStyle,
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  } as ViewStyle,
  logoIcon: {
    width: 34,
    height: 34,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  logoText: {
    fontFamily: fonts.serifItalic,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.2,
  } as TextStyle,
  title: {
    fontFamily: fonts.serif,
    fontSize: 31,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 35,
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 20,
  } as TextStyle,
  sectionLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    color: colors.textMuted,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 10,
  } as TextStyle,
  button: {
    backgroundColor: colors.ink,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.ink,
  } as ViewStyle,
  buttonText: {
    fontFamily: fonts.sansSemi,
    color: colors.onAccent,
    fontSize: 12.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  } as TextStyle,
  buttonTextOutline: {
    color: colors.text,
  } as TextStyle,
  input: {
    fontFamily: fonts.sans,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  } as TextStyle,
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  } as ViewStyle,
  cardThumb: {
    width: 58,
    height: 58,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cardTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.text,
  } as TextStyle,
  cardSub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  } as TextStyle,
  cardArrow: {
    color: colors.textMuted,
    fontSize: 20,
  } as TextStyle,
  photo: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.surface2,
  } as ImageStyle,
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  } as ViewStyle,
  emptyIcon: {
    fontSize: 34,
    marginBottom: 14,
    opacity: 0.5,
  } as TextStyle,
  emptyText: {
    fontFamily: fonts.serifItalic,
    fontSize: 17,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  statChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 14,
  } as ViewStyle,
  statChipText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as TextStyle,
  skeleton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    height: 72,
    marginBottom: 12,
  } as ViewStyle,
})

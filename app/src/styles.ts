import { StyleSheet, TextStyle, ViewStyle, type ImageStyle } from 'react-native'

/**
 * Warm, homely palette shared with the web app:
 * paper backgrounds, honey accent, soft brown ink.
 */
export const colors = {
  bg: '#f9f4ec',
  surface: '#fffdf9',
  surface2: '#f1e9dd',
  card: '#fffdf9',
  text: '#2a2119',
  textMuted: '#7d6b5c',
  border: 'rgba(74,52,34,0.14)',
  borderStrong: 'rgba(74,52,34,0.30)',
  accent: '#e9a63a',
  accentDark: '#c98a2e',
  onAccent: '#2a2119',
  danger: '#b8452f',
  success: '#4c7a3f',
  overlay: 'rgba(42,33,25,0.55)',
}

export const grad = {
  primary: ['#f0b558', '#e9a63a', '#d98f24'] as const,
}

export const shadows = {
  card: {
    shadowColor: '#4a3422',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  button: {
    shadowColor: '#a8741f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
}

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
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
    padding: 24,
    paddingBottom: 12,
  } as ViewStyle,
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  } as ViewStyle,
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  } as TextStyle,
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 33,
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  } as TextStyle,
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.2,
    paddingHorizontal: 24,
    marginBottom: 12,
  } as TextStyle,
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadows.button,
  } as ViewStyle,
  buttonOutline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  buttonText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,
  buttonTextOutline: {
    color: colors.text,
  } as TextStyle,
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  } as TextStyle,
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: radii.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.card,
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
    borderRadius: radii.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,
  cardSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 3,
  } as TextStyle,
  cardArrow: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '400',
  } as TextStyle,
  photo: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface2,
  } as ImageStyle,
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  } as ViewStyle,
  emptyIcon: {
    fontSize: 40,
    marginBottom: 14,
    opacity: 0.55,
  } as TextStyle,
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  } as TextStyle,
  statChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 7,
    paddingHorizontal: 14,
  } as ViewStyle,
  statChipText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  } as TextStyle,
  skeleton: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 72,
    marginBottom: 12,
  } as ViewStyle,
})

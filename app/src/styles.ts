import { StyleSheet, TextStyle, ViewStyle } from 'react-native'

export const colors = {
  bg: '#0a0a0f',
  surface: '#13131a',
  surface2: '#1a1a24',
  card: '#16161e',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6366f1',
  accent2: '#a855f7',
  accent3: '#ec4899',
  danger: '#ef4444',
  success: '#22c55e',
}

export const grad = {
  primary: ['#6366f1', '#a855f7', '#ec4899'] as const,
}

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
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
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  } as TextStyle,
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1.2,
    lineHeight: 38,
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 28,
  } as TextStyle,
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 14,
  } as TextStyle,
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  } as ViewStyle,
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  buttonTextOutline: {
    color: colors.text,
  } as TextStyle,
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  } as TextStyle,
  card: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    width: 48,
    height: 48,
    borderRadius: 12,
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
  } as TextStyle,
  photo: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  } as ViewStyle,
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 56,
  } as ViewStyle,
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.3,
  } as TextStyle,
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,
  statChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  statChipText: {
    fontSize: 14,
    color: colors.textMuted,
  } as TextStyle,
  skeleton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 72,
    marginBottom: 12,
  } as ViewStyle,
})
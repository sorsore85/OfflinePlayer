// Powered by OnSpace.AI
// Apple Music-inspired dark theme for Android 16

export const Colors = {
  // Base
  bg: '#000000',
  bgSecondary: '#0d0d0d',
  bgCard: '#161616',
  bgElevated: '#1c1c1c',
  bgInput: '#1a1a1a',

  // Brand / Accent
  primary: '#FC3C44',
  primaryLight: '#FF6B70',
  primaryDim: 'rgba(252, 60, 68, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#ABABAB',
  textTertiary: '#666666',
  textDisabled: '#3a3a3a',

  // Borders
  border: '#242424',
  borderLight: '#2e2e2e',

  // Semantic
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',

  // Overlays
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(255,255,255,0.06)',
  overlayMed: 'rgba(255,255,255,0.10)',
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  hero: 34,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 999,
};

export const Shadow = {
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  player: {
    elevation: 12,
    shadowColor: '#FC3C44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
};

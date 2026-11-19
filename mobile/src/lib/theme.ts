import { createContext, useContext } from 'react';

// Couleurs reprises du CRM web Light Academy (thème DOXHA : bleu #1f52e5, Inter).
export const light = {
  dark: false,
  bg: '#F9F9FB',
  bgTop: '#F2F5FE',
  card: '#FFFFFF',
  cardAlt: '#F6F8FC',
  border: '#E9EDF3',
  text: '#111A2E',
  text2: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  primary: '#1F52E5',
  primaryDark: '#1A46C7',
  primarySoft: '#EEF2FE',
  danger: '#E11D48',
  dangerSoft: '#FFE9EE',
  success: '#059669',
  successSoft: '#E7F7EF',
  warning: '#F59E0B',
  warningSoft: '#FDF3E2',
  violet: '#7C3AED',
  violetSoft: '#F2ECFE',
  pink: '#DB2777',
  pinkSoft: '#FCE7F3',
  input: '#F3F5F9',
  tabBar: 'rgba(255,255,255,0.94)',
  shadow: '#101828',
};

export type Theme = typeof light;

export const dark: Theme = {
  dark: true,
  bg: '#0B1020',
  bgTop: '#111833',
  card: '#131B2D',
  cardAlt: '#18223A',
  border: '#243049',
  text: '#F8FAFC',
  text2: '#D7DEEA',
  muted: '#94A3B8',
  faint: '#6B7891',
  primary: '#5B7FF5',
  primaryDark: '#4B74F5',
  primarySoft: '#1B2A57',
  danger: '#F87171',
  dangerSoft: '#3A1D24',
  success: '#4ADE80',
  successSoft: '#13301F',
  warning: '#FBBF24',
  warningSoft: '#352A12',
  violet: '#A78BFA',
  violetSoft: '#2A2147',
  pink: '#F472B6',
  pinkSoft: '#3B1B2E',
  input: '#18223A',
  tabBar: 'rgba(15,21,38,0.96)',
  shadow: '#000000',
};

export type ThemeMode = 'auto' | 'light' | 'dark';

export const ThemeCtx = createContext<{ t: Theme; mode: ThemeMode; setMode: (m: ThemeMode) => void }>({
  t: light,
  mode: 'auto',
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  heavy: 'Inter_800ExtraBold',
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 };

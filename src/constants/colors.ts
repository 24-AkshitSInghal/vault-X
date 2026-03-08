/**
 * VaultX — Design Token Colors
 * Single source of truth for all colors used across the app.
 */

export const DARK = {
  bg:          '#111111',
  surface:     '#1C1C1C',
  surfaceHigh: '#262626',
  border:      '#2A2A2A',
  borderLight: '#333333',
  text:        '#FFFFFF',
  subText:     '#AAAAAA',
  muted:       '#666666',
  placeholder: '#555555',
  tabActiveBg: '#2E2E2E',
  btnBg:       '#FFFFFF',
  btnText:     '#111111',
  label:       '#888888',
  danger:      '#EF4444',
  success:     '#22C55E',
  warning:     '#F59E0B',
};

export const LIGHT = {
  bg:          '#F4F4F7',
  surface:     '#FFFFFF',
  surfaceHigh: '#F0F0F5',
  border:      '#E0E0E8',
  borderLight: '#ECECF4',
  text:        '#0F0F12',
  subText:     '#555566',
  muted:       '#9999AA',
  placeholder: '#AAAAAA',
  tabActiveBg: '#ECECF4',
  btnBg:       '#0F0F12',
  btnText:     '#FFFFFF',
  label:       '#888899',
  danger:      '#DC2626',
  success:     '#16A34A',
  warning:     '#D97706',
};

export type Theme = typeof DARK;
export type ThemeMode = 'dark' | 'light';

export const getTheme = (isDark: boolean): Theme => (isDark ? DARK : LIGHT);

/** Shared design constants */
export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   14,
  pill: 50,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

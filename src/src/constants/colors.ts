/**
 * デザインシステムに準拠した UIカラー定数
 * iOS HIG + Tailwind Color Palette に基づく
 */

// Grayscale / Primary
export const COLORS_GRAY = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
} as const;

// Semantic Colors
export const COLORS_SEMANTIC = {
  // Text and placeholders
  placeholder: '#9ca3af',
  secondaryLabel: '#6b7280',
  tertiaryLabel: '#d1d5db',
  label: '#374151',

  // Backgrounds
  white: '#ffffff',
  black: '#000000',

  // Interactive (iOS Blue)
  accent500: '#007AFF',
  accent400: '#5caeff',

  // Success (iOS Green)
  success500: '#34C759',
  success400: '#4bcf73',

  // Danger (iOS Red)
  danger500: '#FF3B30',
  danger400: '#ff6b6b',

  // Warning (iOS Orange)
  warning500: '#FF9500',
  warning400: '#ffc233',

  // Info (iOS Teal)
  info500: '#32ADE6',
  info400: '#4dd1ff',
} as const;

// Common UI Elements
export const UI_COLORS = {
  // Icon colors
  iconActive: COLORS_GRAY[700],
  iconInactive: COLORS_GRAY[400],
  iconActiveDark: COLORS_GRAY[300],
  iconSecondary: COLORS_GRAY[500],
  iconTertiary: COLORS_GRAY[400],

  // Border colors
  border: COLORS_GRAY[200],
  borderDark: COLORS_GRAY[800],

  // Button backgrounds
  buttonDelete: COLORS_SEMANTIC.danger500,
  buttonDeleteLight: COLORS_SEMANTIC.danger500,
  buttonPrimary: COLORS_GRAY[800],

  // Text
  textPrimary: COLORS_GRAY[900],
  textSecondary: COLORS_GRAY[500],
  textTertiary: COLORS_GRAY[400],

  // Backgrounds
  white: COLORS_SEMANTIC.white,
  black: COLORS_SEMANTIC.black,

  // Default fallback colors
  defaultColor: COLORS_GRAY[400],
  placeholder: COLORS_GRAY[400],
} as const;

/**
 * ダークモード対応のカラーペアを取得
 * @param lightColor ライトモード用カラー
 * @param darkColor ダークモード用カラー
 */
export const darkModeColor = (lightColor: string, darkColor?: string) => ({
  light: lightColor,
  dark: darkColor || lightColor,
});

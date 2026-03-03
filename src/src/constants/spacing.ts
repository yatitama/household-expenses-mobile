/**
 * iOS 8ptグリッドに基づくスペーシング定数
 * デザインシステムより: DESIGN_SYSTEM.md に準拠
 */

// Base spacing unit (8pt)
export const SPACING = {
  // 4pt (0.5倍)
  xs: 4,
  // 8pt (1倍)
  sm: 8,
  // 16pt (2倍) - 標準内部余白
  md: 16,
  // 24pt (3倍) - セクション間余白
  lg: 24,
  // 32pt (4倍) - 大きなセクション余白
  xl: 32,
  // 40pt (5倍) - エクストララージ余白
  '2xl': 40,
  // 48pt (6倍) - ページレベル余白
  '3xl': 48,
} as const;

/**
 * タッチターゲット最小サイズ
 * iOS HIG必須要件: 44×44pt
 */
export const TOUCH_TARGET = 44 as const;

/**
 * ボーダーラディウス（iOS標準値）
 */
export const BORDER_RADIUS = {
  // 4pt - タグ、チップ、バッジ
  xs: 4,
  // 8pt - 入力フィールド、小さなボタン
  sm: 8,
  // 10pt - Inset Grouped List のセル（iOS標準）
  md: 10,
  // 12pt - カード、標準コンポーネント
  lg: 12,
  // 16pt - ボトムシート・モーダル（iOS標準）
  xl: 16,
  // 20pt - 大型コンテナ、Pill型ボタン
  '2xl': 20,
  // 9999px - アバター、FAB、ピル型ボタン
  full: 9999,
} as const;

/**
 * シャドウプロパティ（iOS最適化）
 */
export const SHADOW = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

/**
 * フォントサイズ（iOS Dynamic Type準拠）
 */
export const FONT_SIZE = {
  caption2: 11,
  caption1: 12,
  footnote: 13,
  subheadline: 15,
  callout: 16,
  body: 17, // iOS標準本文
  title3: 20,
  title2: 22,
  title1: 28,
  largeTitle: 34,
} as const;

/**
 * フォントウェイト
 */
export const FONT_WEIGHT = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * ナビゲーションバー・タブバー高さ
 */
export const NAVIGATION = {
  // 標準ナビゲーションバー高さ
  navbarHeight: 44,
  // タブバー高さ（セーフエリア除く）
  tabbarHeight: 49,
} as const;

/**
 * アニメーション設定（ms）
 */
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

/**
 * Spring Animation パラメータ（iOS標準）
 */
export const SPRING = {
  // ボトムシート登場
  sheet: {
    damping: 30,
    stiffness: 300,
  },
  // スケール強調
  scale: {
    damping: 15,
    stiffness: 200,
  },
} as const;

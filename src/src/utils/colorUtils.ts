/**
 * Dark mode対応のカラーユーティリティ
 */
import type { ViewStyle, TextStyle } from 'react-native';

/**
 * 16進数カラーコードをrgba形式に変換
 * @param hex - 16進数カラーコード (#ffffff)
 * @param alpha - アルファ値 (0-1)
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Dark modeに対応したカラースタイルを生成
 * @param lightColor - ライトモード用カラーコード
 * @param darkColor - ダークモード用カラーコード (オプション)
 * @param opacity - 背景色の場合は透明度を調整
 */
export const getDarkModeAwareColor = (
  lightColor: string,
  darkColor?: string,
  opacity?: number
): { light: string; dark: string } => {
  // 背景色の場合は透明度を上げ、ダークモードで見やすくする
  if (opacity !== undefined) {
    return {
      light: hexToRgba(lightColor, opacity),
      dark: darkColor ? hexToRgba(darkColor, Math.min(opacity + 0.15, 1)) : hexToRgba(lightColor, Math.min(opacity + 0.15, 1)),
    };
  }

  return {
    light: lightColor,
    dark: darkColor || lightColor,
  };
};

/**
 * カスタムカラー用の背景色スタイル（Dark mode対応）
 * @param color - カラーコード
 * @param isDark - ダークモード判定
 */
export const getCustomColorBgStyle = (color: string, isDark: boolean = false): ViewStyle => {
  if (isDark) {
    // ダークモードでは透明度を上げて見やすくする
    return {
      backgroundColor: hexToRgba(color, 0.25),
    };
  }
  return {
    backgroundColor: hexToRgba(color, 0.15),
  };
};

/**
 * アカウントやカテゴリのアイコン背景色スタイル
 */
export const getIconBgStyle = (color: string, isDark: boolean = false): ViewStyle => {
  return getCustomColorBgStyle(color, isDark);
};

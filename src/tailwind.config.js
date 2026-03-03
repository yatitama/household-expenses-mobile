/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        // ─── iOS Dynamic Type Scale ───────────────────────────────────────
        // Apple HIG準拠のフォントサイズ定義
        // https://developer.apple.com/design/human-interface-guidelines/typography
        caption:     ['11px', { lineHeight: '1.36' }], // caption2  (11pt)
        caption2:    ['11px', { lineHeight: '1.36' }], // caption2  (11pt)
        label:       ['12px', { lineHeight: '1.33' }], // caption1  (12pt)
        caption1:    ['12px', { lineHeight: '1.33' }], // caption1  (12pt)
        xs:          ['12px', { lineHeight: '1.33' }], // caption1  (12pt)
        footnote:    ['13px', { lineHeight: '1.38' }], // footnote  (13pt)
        sm:          ['13px', { lineHeight: '1.38' }], // footnote  (13pt)
        subheadline: ['15px', { lineHeight: '1.47' }], // subheadline (15pt)
        base:        ['15px', { lineHeight: '1.47' }], // subheadline (15pt)
        callout:     ['16px', { lineHeight: '1.50' }], // callout   (16pt)
        lg:          ['16px', { lineHeight: '1.50' }], // callout   (16pt)
        // ⚠️ iOS標準の本文サイズは17pt (text-xl)
        body:        ['17px', { lineHeight: '1.47' }], // body      (17pt) ← iOS本文標準
        headline:    ['17px', { lineHeight: '1.47' }], // headline  (17pt, semibold)
        xl:          ['17px', { lineHeight: '1.47' }], // body/headline (17pt)
        title3:      ['20px', { lineHeight: '1.40' }], // title3    (20pt)
        '2xl':       ['20px', { lineHeight: '1.40' }], // title3    (20pt)
        title2:      ['22px', { lineHeight: '1.36' }], // title2    (22pt)
        '3xl':       ['22px', { lineHeight: '1.36' }], // title2    (22pt)
        title1:      ['28px', { lineHeight: '1.21' }], // title1    (28pt)
        '4xl':       ['28px', { lineHeight: '1.21' }], // title1    (28pt)
        largeTitle:  ['34px', { lineHeight: '1.21' }], // largeTitle (34pt)
        '5xl':       ['34px', { lineHeight: '1.21' }], // largeTitle (34pt)
      },
      fontWeight: {
        light:    '300',
        normal:   '400',
        medium:   '500',
        semibold: '600', // iOS Navigation Bar Title / Section Header
        bold:     '700', // iOS Large Title
      },
      spacing: {
        // ─── iOS 8pt Grid System ──────────────────────────────────────────
        // すべての値は 8pt の倍数（または 4pt の半倍数）
        'xs':    '4px',  // 0.5 × 8pt — アイコン間隔、最小余白
        'sm':    '8px',  // 1   × 8pt — コンポーネント内小余白
        'md':    '16px', // 2   × 8pt — 標準内部余白（推奨）
        'lg':    '24px', // 3   × 8pt — セクション間余白
        'xl':    '32px', // 4   × 8pt — 大きなセクション余白
        '2xl':   '40px', // 5   × 8pt — エクストララージ
        '3xl':   '48px', // 6   × 8pt — ページレベル余白
        'touch': '44px', // iOS HIG必須：最小タッチターゲット (44pt)
      },
      minHeight: {
        'touch': '44px', // iOS HIG必須：最小タッチターゲット
      },
      minWidth: {
        'touch': '44px', // iOS HIG必須：最小タッチターゲット
      },
      borderRadius: {
        // ─── iOS Standard Border Radius ───────────────────────────────────
        'none': '0px',
        'xs':   '4px',    // タグ、チップなど最小要素
        'sm':   '8px',    // 入力フィールド、小さなボタン
        'md':   '10px',   // Inset Grouped List のセル（iOS標準）
        'lg':   '12px',   // カード、標準コンポーネント
        'xl':   '16px',   // ボトムシート、モーダル（iOS標準）
        '2xl':  '20px',   // 大型コンテナ、Pill型ボタン
        'full': '9999px', // アバター、FAB、完全な丸
      },
      boxShadow: {
        // ─── iOS-Optimized Shadows ────────────────────────────────────────
        // iOSネイティブの繊細なシャドウ（opacity: 0.04〜0.12）
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',    // ヘアライン、微妙な区切り
        'sm': '0 1px 4px 0 rgba(0, 0, 0, 0.06)',    // カード、リスト要素
        'md': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',    // 浮き出るカード
        'lg': '0 8px 24px 0 rgba(0, 0, 0, 0.10)',   // ボトムシート、モーダル
        'xl': '0 16px 40px 0 rgba(0, 0, 0, 0.12)',  // オーバーレイ、最優先UI
      },
      colors: {
        // ─── Primary（ニュートラル）- グレースケール ───────────────────────
        // テキスト・背景・区切り線に使用
        primary: {
          '50':  '#f9fafb',
          '100': '#f3f4f6',
          '200': '#e5e7eb',
          '300': '#d1d5db',
          '400': '#9ca3af',
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
          '800': '#1f2937',
          '900': '#111827',
        },
        // ─── Accent（iOS System Blue）- インタラクティブ要素 ──────────────
        // ボタン、リンク、選択状態など操作可能要素に使用
        // Light: #007AFF / Dark: #0A84FF
        accent: {
          '50':  '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#8fc7ff',
          '400': '#5caeff',
          '500': '#007AFF', // iOS System Blue (Light)
          '600': '#0063d6',
          '700': '#004dab',
          '800': '#003880',
          '900': '#002454',
        },
        // ─── Success（iOS System Green）- 収入・成功 ───────────────────────
        // 収入表示、成功メッセージ、ポジティブアクション
        // Light: #34C759 / Dark: #30D158
        success: {
          '50':  '#f0fdf4',
          '100': '#dcfce7',
          '200': '#a8f5bf',
          '300': '#6fe199',
          '400': '#4bcf73',
          '500': '#34C759', // iOS System Green (Light)
          '600': '#28a348',
          '700': '#1d8037',
          '800': '#135e28',
          '900': '#0a3d1a',
        },
        // ─── Danger（iOS System Red）- 支出・危険 ─────────────────────────
        // 支出表示、削除、警告、ネガティブアクション
        // Light: #FF3B30 / Dark: #FF453A
        danger: {
          '50':  '#fff5f5',
          '100': '#ffebeb',
          '200': '#ffc9c9',
          '300': '#ff9f9f',
          '400': '#ff6b6b',
          '500': '#FF3B30', // iOS System Red (Light)
          '600': '#e53229',
          '700': '#c02620',
          '800': '#9a1c17',
          '900': '#73130f',
        },
        // ─── Warning（iOS System Orange）- 警告・注意 ─────────────────────
        // 警告メッセージ、注意が必要な情報
        // Light: #FF9500 / Dark: #FF9F0A
        warning: {
          '50':  '#fffbeb',
          '100': '#fff3cd',
          '200': '#ffe799',
          '300': '#ffd566',
          '400': '#ffc233',
          '500': '#FF9500', // iOS System Orange (Light)
          '600': '#e07c00',
          '700': '#b86600',
          '800': '#8f5000',
          '900': '#663a00',
        },
        // ─── Info（iOS System Teal）- 情報・ヒント ────────────────────────
        // 情報メッセージ、ツールチップ
        // Light: #32ADE6 / Dark: #64D2FF
        info: {
          '50':  '#edfbff',
          '100': '#d8f6ff',
          '200': '#b0edff',
          '300': '#7ddeff',
          '400': '#4dd1ff',
          '500': '#32ADE6', // iOS System Teal (Light)
          '600': '#1b8fc7',
          '700': '#1272a3',
          '800': '#0d567a',
          '900': '#083a52',
        },
      },
    },
  },
  plugins: [],
};

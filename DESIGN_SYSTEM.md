# 🍎 iOSデザインシステム

Apple Human Interface Guidelines (HIG) に準拠した、家計管理アプリのiOSデザイン規約。

---

## 📑 目次

1. [デザイン原則](#デザイン原則)
2. [カラーパレット](#カラーパレット)
3. [タイポグラフィ（Dynamic Type）](#タイポグラフィ)
4. [スペーシング・レイアウト（8ptグリッド）](#スペーシングレイアウト)
5. [ボーダーラディウス](#ボーダーラディウス)
6. [シャドウ](#シャドウ)
7. [コンポーネント一覧](#コンポーネント一覧)
8. [iOSコンポーネントパターン](#iOSコンポーネントパターン)
9. [セーフエリア](#セーフエリア)
10. [インタラクション](#インタラクション)
11. [アクセシビリティ](#アクセシビリティ)
12. [使用ガイド](#使用ガイド)
13. [デザインレビューチェックリスト](#デザインレビューチェックリスト)

---

## デザイン原則

Apple HIGの3つの核心的な設計哲学をアプリに適用する。

### 明瞭性（Clarity）
- コンテンツが最優先。UIは情報を引き立てるために存在する。
- 余白を積極的に活用してコンテンツを呼吸させる。
- テキストはあらゆるサイズで読みやすく。

### 従順性（Deference）
- ユーザーが操作するコンテンツを前景に置く。
- アニメーションはユーザーが現在地を理解する手助けをする。
- コンテキストを維持したまま画面遷移する。

### 奥行き（Depth）
- 視覚的なレイヤーで階層構造を表現する。
- 適切なフィードバック（ハプティクス・アニメーション）で操作を確認する。
- コンテンツが広がる・折り畳まれる感覚を大切にする。

---

## カラーパレット

### iOSシステムカラー

Apple の Dynamic System Colors を基準に設定。ライトモード/ダークモードで自動的に最適な値に切り替わる。

#### Accent（インタラクティブ要素）- iOS System Blue

ボタン、リンク、選択状態、インタラクティブ要素に使用。

| コード（Light） | コード（Dark） | Tailwind | 用途 |
|---|---|---|---|
| #eff6ff | — | `accent-50` | 背景（ハイライト） |
| #dbeafe | — | `accent-100` | 背景 |
| #bfdbfe | — | `accent-200` | 背景（ホバー） |
| #8fc7ff | — | `accent-300` | 枠線 |
| #5caeff | — | `accent-400` | アイコン（明るい） |
| **#007AFF** | **#0A84FF** | `accent-500` | **インタラクティブ要素（推奨）** |
| #0063d6 | — | `accent-600` | ボタン（ダークモード） |
| #004dab | — | `accent-700` | ボタン（押下時） |
| #003880 | — | `accent-800` | テキスト（濃い） |
| #002454 | — | `accent-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// メインアクションボタン
<TouchableOpacity className="bg-accent-500 dark:bg-accent-400 rounded-xl min-h-touch items-center justify-center px-xl">
  <Text className="text-white font-semibold text-xl">保存</Text>
</TouchableOpacity>

// リンクテキスト
<Text className="text-accent-500 dark:text-accent-400 text-xl">詳細を見る</Text>
```

---

#### Primary（ニュートラル）- グレースケール

テキスト・背景・区切り線に使用。iOS の label / systemBackground 系に対応。

| コード | Tailwind | 用途 |
|---|---|---|
| #f9fafb | `primary-50` | 最も明るい背景（systemGroupedBackground相当） |
| #f3f4f6 | `primary-100` | 背景（secondarySystemBackground相当） |
| #e5e7eb | `primary-200` | ボーダー、opaqueSeparator |
| #d1d5db | `primary-300` | 薄いテキスト（tertiaryLabel相当） |
| #9ca3af | `primary-400` | プレースホルダー（placeholderText相当） |
| #6b7280 | `primary-500` | 副次テキスト（secondaryLabel相当） |
| #4b5563 | `primary-600` | 本文テキスト（ダークモード） |
| #374151 | `primary-700` | 本文テキスト（label相当） |
| #1f2937 | `primary-800` | 濃いテキスト |
| #111827 | `primary-900` | 最も濃いテキスト |

---

#### Success（収入・成功）- iOS System Green

収入表示、成功確認、ポジティブアクション。

| コード（Light） | コード（Dark） | Tailwind | 推奨用途 |
|---|---|---|---|
| #f0fdf4 | — | `success-50` | 背景（ハイライト） |
| #dcfce7 | — | `success-100` | 背景 |
| #a8f5bf | — | `success-200` | 背景（ホバー） |
| #6fe199 | — | `success-300` | 枠線 |
| #4bcf73 | — | `success-400` | アイコン（明るい） |
| **#34C759** | **#30D158** | `success-500` | **テキスト・ボタン（推奨）** |
| #28a348 | — | `success-600` | ボタン（ダークモード） |
| #1d8037 | — | `success-700` | ボタン（押下時） |
| #135e28 | — | `success-800` | テキスト（濃い） |
| #0a3d1a | — | `success-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 収入金額表示
<Text className="text-success-500 dark:text-success-400 font-bold text-3xl">+¥10,000</Text>

// 成功バッジ（iOS Capsule スタイル）
<View className="bg-success-100 dark:bg-success-900/30 rounded-full px-md py-xs">
  <Text className="text-success-600 dark:text-success-400 text-sm font-semibold">収入</Text>
</View>
```

---

#### Danger（支出・危険）- iOS System Red

支出表示、削除、警告、ネガティブアクション。

| コード（Light） | コード（Dark） | Tailwind | 推奨用途 |
|---|---|---|---|
| #fff5f5 | — | `danger-50` | 背景（ハイライト） |
| #ffebeb | — | `danger-100` | 背景 |
| #ffc9c9 | — | `danger-200` | 背景（ホバー） |
| #ff9f9f | — | `danger-300` | 枠線 |
| #ff6b6b | — | `danger-400` | アイコン（明るい） |
| **#FF3B30** | **#FF453A** | `danger-500` | **テキスト・ボタン（推奨）** |
| #e53229 | — | `danger-600` | ボタン（ダークモード） |
| #c02620 | — | `danger-700` | ボタン（押下時） |
| #9a1c17 | — | `danger-800` | テキスト（濃い） |
| #73130f | — | `danger-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 支出金額表示
<Text className="text-danger-500 dark:text-danger-400 font-bold text-3xl">-¥5,000</Text>

// 削除ボタン（iOS Action Sheet スタイル）
<TouchableOpacity className="bg-danger-500 rounded-xl min-h-touch items-center justify-center">
  <Text className="text-white font-semibold text-xl">削除</Text>
</TouchableOpacity>
```

---

#### Warning（警告・注意）- iOS System Orange

警告メッセージ、注意が必要な情報。

| コード（Light） | コード（Dark） | Tailwind | 推奨用途 |
|---|---|---|---|
| #fffbeb | — | `warning-50` | 背景（ハイライト） |
| #fff3cd | — | `warning-100` | 背景 |
| #ffe799 | — | `warning-200` | 背景（ホバー） |
| #ffd566 | — | `warning-300` | 枠線 |
| #ffc233 | — | `warning-400` | アイコン（明るい） |
| **#FF9500** | **#FF9F0A** | `warning-500` | **テキスト・ボタン（推奨）** |
| #e07c00 | — | `warning-600` | ボタン（ダークモード） |
| #b86600 | — | `warning-700` | ボタン（押下時） |
| #8f5000 | — | `warning-800` | テキスト（濃い） |
| #663a00 | — | `warning-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 警告バナー
<View className="bg-warning-50 dark:bg-warning-900/30 border border-warning-300 dark:border-warning-700 rounded-xl p-md flex-row gap-sm items-center">
  <AlertTriangle size={20} color="#FF9500" />
  <Text className="text-warning-700 dark:text-warning-400 text-base flex-1">残高が少なくなっています</Text>
</View>
```

---

#### Info（情報・ヒント）- iOS System Teal

情報メッセージ、ツールチップ、ヒント。

| コード（Light） | コード（Dark） | Tailwind | 推奨用途 |
|---|---|---|---|
| #edfbff | — | `info-50` | 背景（ハイライト） |
| #d8f6ff | — | `info-100` | 背景 |
| #b0edff | — | `info-200` | 背景（ホバー） |
| #7ddeff | — | `info-300` | 枠線 |
| #4dd1ff | — | `info-400` | アイコン（明るい） |
| **#32ADE6** | **#64D2FF** | `info-500` | **テキスト・ボタン（推奨）** |
| #1b8fc7 | — | `info-600` | ボタン（ダークモード） |
| #1272a3 | — | `info-700` | ボタン（押下時） |
| #0d567a | — | `info-800` | テキスト（濃い） |
| #083a52 | — | `info-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 情報バナー
<View className="bg-info-50 dark:bg-info-900/30 border border-info-300 dark:border-info-700 rounded-xl p-md flex-row gap-sm items-center">
  <Info size={20} color="#32ADE6" />
  <Text className="text-info-700 dark:text-info-400 text-base flex-1">スワイプで素早く削除できます</Text>
</View>
```

---

### iOSシステム背景色（参照）

iOSの背景色は階層構造を持つ。コンポーネントのレイヤーに合わせて使い分ける。

| レベル | Light | Dark | 対応クラス | 用途 |
|---|---|---|---|---|
| systemBackground | #FFFFFF | #000000 | `bg-white dark:bg-black` | 最前面ビュー |
| secondarySystemBackground | #F2F2F7 | #1C1C1E | `bg-primary-100 dark:bg-primary-900` | グループ化コンテンツ |
| systemGroupedBackground | #F2F2F7 | #000000 | `bg-primary-100 dark:bg-black` | グループリスト背景 |
| secondarySystemGroupedBackground | #FFFFFF | #1C1C1E | `bg-white dark:bg-primary-900` | グループリストのセル |

---

## タイポグラフィ

### iOSダイナミックタイプスケール

Apple の Dynamic Type に対応したフォントサイズ定義。ユーザーのアクセシビリティ設定（フォントサイズ）を尊重する。

| Tailwind | iOS名称 | サイズ | 行高 | 推奨用途 |
|---|---|---|---|---|
| `text-caption` / `text-caption2` | caption2 | 11px | 1.36 | 補足情報、最小ラベル |
| `text-label` / `text-caption1` / `text-xs` | caption1 | 12px | 1.33 | フォームラベル、タグ |
| `text-footnote` / `text-sm` | footnote | 13px | 1.38 | 注釈、補助テキスト |
| `text-subheadline` / `text-base` | subheadline | 15px | 1.47 | サブヘッドライン |
| `text-callout` / `text-lg` | callout | 16px | 1.50 | コールアウト、ボタン |
| `text-body` / `text-headline` / `text-xl` | body / headline | **17px** | 1.47 | **本文テキスト（iOS標準）** |
| `text-title3` / `text-2xl` | title3 | 20px | 1.40 | タイトル（小） |
| `text-title2` / `text-3xl` | title2 | 22px | 1.36 | タイトル（中） |
| `text-title1` / `text-4xl` | title1 | 28px | 1.21 | タイトル（大） |
| `text-largeTitle` / `text-5xl` | largeTitle | 34px | 1.21 | ラージタイトル |

> **重要**: iOS のデフォルト本文サイズは **17pt (`text-xl`)**。Android の 16pt に慣れている場合は要注意。

### フォントウェイト

| Tailwind | ウェイト | iOS利用場面 |
|---|---|---|
| `font-light` | 300 | 数値の補足、装飾的テキスト |
| `font-normal` | 400 | 一般的な本文テキスト |
| `font-medium` | 500 | 強調テキスト、ボタン |
| `font-semibold` | 600 | ナビゲーションバータイトル、セクションヘッダ（HIG準拠） |
| `font-bold` | 700 | ラージタイトル、金額表示 |

**使用例：**
```jsx
// ナビゲーションバータイトル（iOS Navigation Title）
<Text className="text-xl font-semibold text-primary-900 dark:text-white">家計管理</Text>

// ラージタイトル（iOS Large Title - スクロールで収縮）
<Text className="text-5xl font-bold text-primary-900 dark:text-white">収支一覧</Text>

// 金額表示（大きく・太く）
<Text className="text-4xl font-bold text-success-500 dark:text-success-400">+¥10,000</Text>
<Text className="text-4xl font-bold text-danger-500 dark:text-danger-400">-¥5,000</Text>

// セクションヘッダ（iOS Grouped Section Header）
<Text className="text-sm font-semibold text-primary-500 uppercase tracking-wide px-md mb-xs">
  今月の支出
</Text>

// 本文テキスト（iOS Body）
<Text className="text-xl text-primary-900 dark:text-white">食費</Text>

// 補助テキスト（iOS Secondary Label）
<Text className="text-base text-primary-500 dark:text-primary-400">2024年3月1日</Text>
```

---

## スペーシング・レイアウト

### iOS 8ptグリッド

iOSはすべてのスペーシングを **8の倍数（または4）** で定義する。これによりRetina・Super Retina XDRディスプレイで鮮明に表示される。

| Tailwind | サイズ | iOS 8ptグリッド | 用途 |
|---|---|---|---|
| `gap-xs` / `p-xs` | 4px | 0.5倍 | アイコン内余白、バッジ内余白 |
| `gap-sm` / `p-sm` | 8px | 1倍 | コンポーネント内の小余白 |
| `gap-md` / `p-md` | **16px** | **2倍** | **標準内部余白（推奨）** |
| `gap-lg` / `p-lg` | 24px | 3倍 | セクション間余白 |
| `gap-xl` / `p-xl` | 32px | 4倍 | 大きなセクション余白 |
| `gap-2xl` / `p-2xl` | 40px | 5倍 | エクストララージ余白 |
| `gap-3xl` / `p-3xl` | 48px | 6倍 | ページレベル余白 |
| `min-h-touch` / `min-w-touch` | **44px** | — | **iOS最小タッチターゲット（必須）** |

> **必須要件**: すべてのインタラクティブ要素（ボタン、リンク、アイコンタップ）は **最小 44×44pt のタッチターゲット** を確保すること（Apple HIG 必須要件）。

**使用例：**
```jsx
// 標準カードコンポーネント（iOS Card）
<View className="p-md gap-sm rounded-xl bg-white dark:bg-primary-800 shadow-sm mx-md">
  {/* コンテンツ */}
</View>

// セクション間レイアウト
<View className="gap-lg px-md">
  <SectionA />
  <SectionB />
</View>

// 44pt最小タッチターゲットを持つアイコンボタン
<TouchableOpacity className="min-h-touch min-w-touch items-center justify-center">
  <ChevronRight size={20} color="#C7C7CC" />
</TouchableOpacity>

// テキストボタン（44pt高さ確保）
<TouchableOpacity className="min-h-touch items-center justify-center px-md">
  <Text className="text-xl text-accent-500">キャンセル</Text>
</TouchableOpacity>
```

### レイアウトグリッド（iPhone）

| 項目 | 値 |
|---|---|
| 画面外マージン（標準） | 16px（`px-md`相当） |
| カードの左右余白 | 16px（`mx-md`相当） |
| セクション間隔 | 24px（`gap-lg`） |
| ナビゲーションバー高さ | 44pt（カスタム時） |
| タブバー高さ | 49pt + セーフエリア |
| 最小タッチターゲット | 44×44pt（`min-h-touch min-w-touch`） |

---

## ボーダーラディウス

iOSコンポーネントに最適化された角丸定義。

| Tailwind | サイズ | iOS標準利用場面 |
|---|---|---|
| `rounded-none` | 0px | 全幅区切り線 |
| `rounded-xs` | 4px | タグ、チップ、バッジ |
| `rounded-sm` | 8px | 入力フィールド、小さなボタン |
| `rounded-md` | **10px** | **Inset Grouped List のセル（iOS標準）** |
| `rounded-lg` | 12px | カード、標準コンポーネント |
| `rounded-xl` | **16px** | **ボトムシート・モーダル（iOS標準）** |
| `rounded-2xl` | 20px | 大型コンテナ、Pill型ボタン |
| `rounded-full` | 9999px | アバター、FAB、ピル型ボタン |

> iOS標準のボトムシートは **`rounded-t-xl`（上部のみ16pt）**、Inset Grouped List のセルは **`rounded-xl`（グループ全体に16pt）** を使用。

**使用例：**
```jsx
// ボトムシート（iOS Sheet）
<View className="bg-white dark:bg-primary-900 rounded-t-xl">
  {/* シートコンテンツ */}
</View>

// Inset Grouped List セルグループ
<View className="bg-white dark:bg-primary-800 rounded-xl mx-md overflow-hidden shadow-xs">
  <TouchableOpacity className="flex-row items-center px-md min-h-touch gap-md border-b border-primary-100 dark:border-primary-700">
    {/* セルコンテンツ */}
  </TouchableOpacity>
  <TouchableOpacity className="flex-row items-center px-md min-h-touch gap-md">
    {/* 最後のセルはボーダーなし */}
  </TouchableOpacity>
</View>

// 大型アクションボタン（iOS 継続型ボタン）
<TouchableOpacity className="bg-accent-500 rounded-2xl min-h-touch items-center justify-center px-xl mx-md">
  <Text className="text-white font-semibold text-xl">収入を追加</Text>
</TouchableOpacity>
```

---

## シャドウ

iOS に最適化されたシャドウ強度。Android では elevation が自動適用される。

| Tailwind | 効果 | 推奨用途 |
|---|---|---|
| `shadow-xs` | ヘアライン | 微妙な区切り、入力フィールドの浮き |
| `shadow-sm` | 薄い | カード、リスト要素（一般的） |
| `shadow-md` | 標準 | 浮き出るカード、ツールバー |
| `shadow-lg` | 強い | ボトムシート、モーダル |
| `shadow-xl` | 非常に強い | オーバーレイ、最優先UI要素 |

> iOSネイティブのシャドウは非常に繊細（opacity: 0.04〜0.12）。過度なシャドウはiOSのデザイン品質を下げる。

**使用例：**
```jsx
// スタンダードカード（最も一般的）
<View className="bg-white dark:bg-primary-800 rounded-xl p-md shadow-sm">
  {/* コンテンツ */}
</View>

// FAB（フローティングアクションボタン）はインラインスタイルで詳細制御
<View
  style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  }}
>
  {/* FABコンテンツ */}
</View>
```

---

## コンポーネント一覧

### ModalWrapper（ボトムシート）

iOS標準のシートプレゼンテーションに準拠した汎用モーダルコンポーネント。

**機能:**
- スプリングアニメーション（damping: 30, stiffness: 300）
- ドラッグハンドル表示
- 下スワイプで閉じる（isForm時）
- キーボード回避（iOS: KeyboardAvoidingView / Android: adjustResize）
- セーフエリア対応（useSafeAreaInsets）

**Props:**
- `title: string` — シートタイトル
- `isForm?: boolean` — フォームモード（ドラッグ・背景タップで閉じる）
- `visible: boolean` — 表示状態
- `onClose: () => void` — クローズコールバック
- `footer?: ReactNode` — 保存ボタン等（スクロール領域外に固定）
- `headerAction?: ReactNode` — ヘッダ右側のアクション（削除ボタン等）

**使用例：**
```jsx
<ModalWrapper
  title="取引を追加"
  visible={isOpen}
  isForm
  onClose={onClose}
  footer={
    <Button variant="primary" onPress={handleSave} size="lg">
      保存する
    </Button>
  }
>
  {/* フォームコンテンツ */}
</ModalWrapper>
```

---

### ConfirmDialog（確認アラート）

iOS標準の Alert に準拠した確認ダイアログ。重要な操作（削除等）の前に表示。

**Props:**
- `isOpen: boolean` — 表示状態
- `onClose: () => void` — キャンセルコールバック
- `onConfirm: () => void` — 確認コールバック
- `title: string` — ダイアログタイトル
- `message: string` — 確認メッセージ
- `confirmText?: string` — 確認ボタンテキスト（デフォルト: "確認"）
- `confirmVariant?: ButtonVariant` — 確認ボタンのバリアント

**使用例：**
```jsx
<ConfirmDialog
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="削除しますか？"
  message="この操作は取り消せません"
  confirmText="削除"
  confirmVariant="danger"
/>
```

---

### Button

**バリアント:** `primary` | `success` | `danger` | `warning` | `ghost` | `secondary`
**サイズ:** `sm` | `md` | `lg`

> すべてのサイズで最小 44pt のタッチターゲットを確保すること。

### Card

**バリアント:** `default` | `elevated` | `outlined`

### Badge

**バリアント:** `success` | `danger` | `warning` | `info` | `default`
**サイズ:** `sm` | `md`

---

## iOSコンポーネントパターン

### パターン1：Inset Grouped List（設定・一覧）

iOS の UITableView.Style.insetGrouped に相当するリストレイアウト。設定画面や項目一覧に使用。

```jsx
<ScrollView className="flex-1 bg-primary-100 dark:bg-black">
  <View className="gap-lg px-md pt-lg pb-3xl">

    {/* セクション */}
    <View>
      {/* セクションヘッダ（iOS Grouped Section Header） */}
      <Text className="text-sm font-semibold text-primary-500 uppercase tracking-wide px-xs mb-sm">
        アカウント
      </Text>

      {/* セルグループ（角丸コンテナ） */}
      <View className="bg-white dark:bg-primary-800 rounded-xl overflow-hidden shadow-xs">
        {/* セル（44pt最小高さ + ディバイダー） */}
        <TouchableOpacity
          className="flex-row items-center px-md min-h-touch gap-md border-b border-primary-100 dark:border-primary-700"
        >
          <WalletIcon size={20} color="#007AFF" />
          <Text className="flex-1 text-xl text-primary-900 dark:text-white">現金</Text>
          <Text className="text-xl text-primary-400">¥50,000</Text>
          <ChevronRight size={16} color="#C7C7CC" />
        </TouchableOpacity>

        {/* 最後のセルはボーダーなし */}
        <TouchableOpacity
          className="flex-row items-center px-md min-h-touch gap-md"
        >
          <CreditCardIcon size={20} color="#34C759" />
          <Text className="flex-1 text-xl text-primary-900 dark:text-white">クレジットカード</Text>
          <Text className="text-xl text-primary-400">¥120,000</Text>
          <ChevronRight size={16} color="#C7C7CC" />
        </TouchableOpacity>
      </View>
    </View>

  </View>
</ScrollView>
```

---

### パターン2：ナビゲーションバー（カスタム）

```jsx
// iOS Large Title スタイルのカスタムナビゲーションバー
<View className="bg-white dark:bg-black border-b border-primary-200 dark:border-primary-800">
  <SafeAreaView edges={['top']}>
    <View className="flex-row items-end justify-between px-md pb-sm pt-xs min-h-touch">
      <Text className="text-5xl font-bold text-primary-900 dark:text-white">収支</Text>
      <TouchableOpacity className="min-h-touch min-w-touch items-center justify-center">
        <Plus size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</View>
```

---

### パターン3：スワイプアクション（Swipe Action）

```jsx
// react-native-gesture-handler の Swipeable を使用
<Swipeable
  renderRightActions={() => (
    <TouchableOpacity
      className="bg-danger-500 justify-center items-center px-lg"
      onPress={onDelete}
    >
      <Trash2 size={22} color="#fff" />
      <Text className="text-white text-sm font-medium mt-xs">削除</Text>
    </TouchableOpacity>
  )}
>
  <View className="bg-white dark:bg-primary-800 flex-row items-center px-md min-h-touch gap-md">
    {/* アイテムコンテンツ */}
  </View>
</Swipeable>
```

---

### パターン4：フォームセクション（iOS Grouped Form）

```jsx
<View className="gap-lg">
  {/* フォームセクションタイトル */}
  <Text className="text-xl font-semibold text-primary-900 dark:text-white">取引情報</Text>

  {/* フォームセルグループ */}
  <View className="bg-white dark:bg-primary-800 rounded-xl overflow-hidden shadow-xs">

    {/* テキスト入力セル */}
    <View className="px-md border-b border-primary-100 dark:border-primary-700">
      <Text className="text-sm text-primary-500 pt-sm">金額</Text>
      <TextInput
        className="text-xl text-primary-900 dark:text-white pb-sm"
        placeholder="¥0"
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
        style={{ minHeight: 44 }}
      />
    </View>

    {/* 選択セル（ディスクロージャーインジケーター付き） */}
    <TouchableOpacity className="flex-row items-center px-md min-h-touch border-b border-primary-100 dark:border-primary-700">
      <Text className="flex-1 text-xl text-primary-900 dark:text-white">カテゴリ</Text>
      <Text className="text-xl text-primary-400 mr-sm">食費</Text>
      <ChevronRight size={16} color="#C7C7CC" />
    </TouchableOpacity>

    {/* 日付選択セル */}
    <TouchableOpacity className="flex-row items-center px-md min-h-touch">
      <Text className="flex-1 text-xl text-primary-900 dark:text-white">日付</Text>
      <Text className="text-xl text-primary-400">2024年3月1日</Text>
    </TouchableOpacity>

  </View>
</View>
```

---

### パターン5：アクションボタン行

```jsx
// iOS標準のボタン行（キャンセル + 確認）
<View className="flex-row gap-sm">
  <TouchableOpacity
    className="flex-1 bg-primary-100 dark:bg-primary-700 rounded-xl min-h-touch items-center justify-center"
    onPress={onCancel}
  >
    <Text className="text-xl font-medium text-primary-700 dark:text-primary-100">キャンセル</Text>
  </TouchableOpacity>
  <TouchableOpacity
    className="flex-1 bg-accent-500 rounded-xl min-h-touch items-center justify-center"
    onPress={onConfirm}
  >
    <Text className="text-xl font-semibold text-white">保存</Text>
  </TouchableOpacity>
</View>

// 危険なアクション（削除）
<TouchableOpacity
  className="bg-danger-500 rounded-xl min-h-touch items-center justify-center mx-md"
  onPress={onDelete}
>
  <Text className="text-xl font-semibold text-white">削除する</Text>
</TouchableOpacity>
```

---

### パターン6：ステータスバッジ（iOS Capsule）

```jsx
// 収入バッジ
<View className="bg-success-100 dark:bg-success-900/30 rounded-full px-md py-xs">
  <Text className="text-success-600 dark:text-success-400 text-sm font-semibold">収入</Text>
</View>

// 支出バッジ
<View className="bg-danger-100 dark:bg-danger-900/30 rounded-full px-md py-xs">
  <Text className="text-danger-600 dark:text-danger-400 text-sm font-semibold">支出</Text>
</View>

// 情報バッジ
<View className="bg-info-100 dark:bg-info-900/30 rounded-full px-md py-xs">
  <Text className="text-info-600 dark:text-info-400 text-sm font-semibold">定期</Text>
</View>
```

---

### パターン7：空状態（Empty State）

```jsx
<View className="flex-1 items-center justify-center gap-lg p-3xl">
  <View className="bg-primary-100 dark:bg-primary-800 rounded-full p-xl">
    <Receipt size={48} color="#9ca3af" />
  </View>
  <View className="items-center gap-sm">
    <Text className="text-3xl font-semibold text-primary-900 dark:text-white">取引がありません</Text>
    <Text className="text-xl text-primary-500 dark:text-primary-400 text-center">
      右下の「+」ボタンから最初の取引を追加してみましょう
    </Text>
  </View>
  <TouchableOpacity
    className="bg-accent-500 rounded-2xl min-h-touch items-center justify-center px-xl"
    onPress={onAdd}
  >
    <Text className="text-white font-semibold text-xl">取引を追加</Text>
  </TouchableOpacity>
</View>
```

---

## セーフエリア

### ルール

iPhone のノッチ・Dynamic Island・ホームインジケーターに対応するため、すべての画面でセーフエリアを考慮すること。

```jsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

// パターン1: insets を使って手動でパディング
const MyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* コンテンツ */}
    </View>
  );
};

// パターン2: SafeAreaView で特定のエッジのみ対応
const MyModal = () => (
  <SafeAreaView edges={['bottom']} className="bg-white dark:bg-primary-900">
    {/* ボトムシートのフッター */}
  </SafeAreaView>
);
```

### セーフエリアが必要な箇所

| 箇所 | edges | 備考 |
|---|---|---|
| 画面最上部（ノッチ・Dynamic Island） | `['top']` | ナビゲーションバーの上 |
| 画面最下部（ホームインジケーター） | `['bottom']` | タブバー外のコンテンツ |
| ボトムシートのフッター | `['bottom']` | キーボード表示時は不要 |
| タブバー | — | React Navigation が自動対応 |
| カスタムFAB | `insets.bottom` を加算 | タブバー上に配置する場合 |

---

## インタラクション

### Haptic Feedback（触覚フィードバック）

iOSアプリはユーザーの操作に応じて適切なHapticフィードバックを提供する。`expo-haptics` を使用。

```jsx
import * as Haptics from 'expo-haptics';

// 軽いタップ（選択変更、タブ切り替え）
await Haptics.selectionAsync();

// 保存完了・確認
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// 重要なアクション実行（削除等）
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// 通知フィードバック
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

| 操作 | フィードバック種類 |
|---|---|
| リスト項目タップ・タブ切り替え | `selectionAsync()` |
| トグル・スイッチ操作 | `selectionAsync()` |
| 保存・送信成功 | `notificationAsync(Success)` |
| 削除・エラー発生 | `notificationAsync(Error)` |
| 重要なアクションボタン押下 | `impactAsync(Heavy)` |

---

### アニメーション原則

```jsx
// iOS Spring Animation（自然な弾性感）
Animated.spring(translateY, {
  toValue: 0,
  useNativeDriver: true,
  damping: 30,     // 減衰係数（高いほど素早く止まる）
  stiffness: 300,  // 剛性（高いほど速い）
}).start();

// iOS Timing Animation（短めの duration）
Animated.timing(opacity, {
  toValue: 1,
  duration: 200,   // 200〜300ms が iOS 標準
  useNativeDriver: true,
}).start();
```

| アニメーション用途 | 種類 | duration / 設定 |
|---|---|---|
| ボトムシート登場 | spring | damping: 30, stiffness: 300 |
| ボトムシート退場 | timing | 250ms |
| フェードイン/アウト | timing | 200ms |
| スケール強調 | spring | damping: 15, stiffness: 200 |

---

## アクセシビリティ

### VoiceOver 対応

```jsx
// accessibilityLabel でスクリーンリーダーが読み上げるテキストを指定
<TouchableOpacity
  accessibilityLabel="食費 5,000円 2024年3月1日 削除するにはダブルタップ"
  accessibilityRole="button"
  accessibilityHint="取引詳細を開きます"
>
  <TransactionItem />
</TouchableOpacity>

// グループ化で読み上げをまとめる
<View accessible={true} accessibilityLabel="食費カテゴリ 今月の合計 25,000円">
  <CategoryIcon />
  <Text>食費</Text>
  <Text>¥25,000</Text>
</View>

// 装飾要素は非表示に
<View accessibilityElementsHidden={true}>
  <DecorativeIcon />
</View>
```

### Dynamic Type 対応

```jsx
// allowFontScaling をデフォルト（true）のままにする
// ユーザーのフォントサイズ設定を尊重する
<Text className="text-xl">本文テキスト</Text>

// 固定サイズが必要な場合のみ無効化（例：タブバーラベル）
<Text allowFontScaling={false} className="text-caption">収支</Text>
```

### コントラスト比

| 組み合わせ | 最小比率 | 目標比率 |
|---|---|---|
| 通常テキスト（18px以下） | **4.5:1** | 7:1 |
| 大きなテキスト（18px以上・14px太字） | **3:1** | 4.5:1 |
| UIコンポーネント境界 | **3:1** | — |

---

## 使用ガイド

### 新しいコンポーネントを作成する場合

1. **iOSシステムカラーを使用する**
   - `accent-500`（iOS Blue）: インタラクティブ要素・ボタン
   - `success-500`（iOS Green）: 収入・ポジティブアクション
   - `danger-500`（iOS Red）: 支出・削除・ネガティブアクション
   - `warning-500`（iOS Orange）: 警告・注意
   - ハードコードされた色値（`#007AFF` など）は避ける

2. **iOS Dynamic Typeサイズを使用する**
   - 本文: `text-xl`（17pt = iOS Body）
   - ナビバータイトル: `text-xl font-semibold`（iOS Navigation Title）
   - ラージタイトル: `text-5xl font-bold`（iOS Large Title）
   - セクションヘッダ: `text-sm font-semibold uppercase`

3. **8ptグリッドのスペーシングを守る**
   - 標準内部余白: `p-md`（16px = 2 × 8pt）
   - セクション間: `gap-lg`（24px = 3 × 8pt）
   - 画面マージン: `px-md`（16px）

4. **44pt最小タッチターゲットを確保する**
   ```jsx
   <TouchableOpacity className="min-h-touch items-center justify-center px-md">
     <Text className="text-xl">タップ可能な要素</Text>
   </TouchableOpacity>
   ```

5. **ダークモードを必ず対応する**
   ```jsx
   <View className="bg-white dark:bg-primary-900">
     <Text className="text-primary-900 dark:text-white">テキスト</Text>
     <Text className="text-primary-500 dark:text-primary-400">補助テキスト</Text>
   </View>
   ```

6. **セーフエリアを必ず考慮する**
   - 画面コンポーネント: `useSafeAreaInsets()` で上下に対応
   - ボトムシートフッター: `insets.bottom` を `paddingBottom` に加算

### よくある間違い

| 間違い | 正しい対応 |
|---|---|
| タッチ要素が 44pt 未満 | `min-h-touch min-w-touch` を追加 |
| ハードコードされたカラーコード | セマンティックカラー（`accent-500` 等）を使用 |
| ダークモード未対応 | `dark:` プレフィックスで全スタイルを対応 |
| セーフエリア無視 | `useSafeAreaInsets()` で上下を対応 |
| ノッチ部分へのコンテンツ侵入 | `SafeAreaView edges={['top']}` で保護 |
| アニメーションなしの表示切替 | Animated.spring() または timing() で遷移 |

---

## デザインレビューチェックリスト

新しいコンポーネント・画面を実装した際は、以下をチェックしてください。

### 必須要件（Apple HIG準拠）

- [ ] **タッチターゲット**: すべてのインタラクティブ要素が **44×44pt** 以上（`min-h-touch min-w-touch`）
- [ ] **セーフエリア**: ノッチ・Dynamic Island・ホームインジケーターに対応
- [ ] **ダークモード**: すべての `bg-*` `text-*` `border-*` に `dark:` プレフィックスを設定
- [ ] **Dynamic Type**: テキストがフォントサイズ設定（アクセシビリティ）で正しくスケールする

### デザイン品質

- [ ] **カラー**: iOSシステムカラー（accent / success / danger / warning / info）を使用
- [ ] **タイポグラフィ**: iOS Dynamic Typeスケール（`text-caption`〜`text-5xl`）を使用
- [ ] **スペーシング**: 8ptグリッド（`gap-xs`〜`gap-3xl`）を使用、カスタム値は避ける
- [ ] **ボーダーラディウス**: iOS標準値（シート: `rounded-xl`、セル: `rounded-md`）
- [ ] **シャドウ**: 繊細なiOSシャドウ（過度なシャドウ禁止）

### インタラクション

- [ ] **アニメーション**: spring または timing で自然な動きを実装
- [ ] **ハプティクス**: 適切なフィードバックを実装（expo-haptics）
- [ ] **スワイプ**: モーダルは下スワイプで閉じられる

### アクセシビリティ

- [ ] **VoiceOver**: `accessibilityLabel` と `accessibilityRole` を設定
- [ ] **コントラスト比**: 通常テキスト 4.5:1 以上、大きなテキスト 3:1 以上
- [ ] **一貫性**: 既存コンポーネントと視覚的・操作的に統一されている

---

**iOS Design System Version**: 2.0
**準拠ガイドライン**: Apple Human Interface Guidelines 2025
**Last Updated**: 2026年

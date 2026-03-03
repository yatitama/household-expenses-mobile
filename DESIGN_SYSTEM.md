# 🎨 デザインシステム

このドキュメントは、家計管理アプリのデザイン規約とコンポーネント仕様を記載しています。

---

## 📑 目次

1. [カラーパレット](#カラーパレット)
2. [タイポグラフィ](#タイポグラフィ)
3. [スペーシング・レイアウト](#スペーシングレイアウト)
4. [コンポーネント一覧](#コンポーネント一覧)
5. [使用ガイド](#使用ガイド)

---

## カラーパレット

### セマンティックカラー

アプリケーション全体で使用される意味別のカラーパレット。各色は10段階のバリエーション（50〜900）を提供。

#### Primary（ニュートラル）- グレースケール
ナビゲーション、本文テキスト、背景に使用。

| コード | Tailwind | 用途 |
|-------|----------|------|
| #f9fafb | `primary-50` | 最も明るい背景 |
| #f3f4f6 | `primary-100` | 背景（ホバー時）|
| #e5e7eb | `primary-200` | ボーダー、区切り線 |
| #d1d5db | `primary-300` | 薄いテキスト |
| #9ca3af | `primary-400` | プレースホルダー |
| #6b7280 | `primary-500` | 副次テキスト |
| #4b5563 | `primary-600` | 本文テキスト（ダークモード） |
| #374151 | `primary-700` | 本文テキスト |
| #1f2937 | `primary-800` | 濃いテキスト |
| #111827 | `primary-900` | 最も濃いテキスト |

#### Success（成功・収入）- グリーン
収入表示、成功メッセージ、ポジティブアクションに使用。

| コード | Tailwind | 推奨用途 |
|-------|----------|---------|
| #f0fdf4 | `success-50` | 背景（ハイライト） |
| #dcfce7 | `success-100` | 背景 |
| #bbf7d0 | `success-200` | 背景（ホバー） |
| #86efac | `success-300` | 枠線 |
| #4ade80 | `success-400` | アイコン（明るい） |
| #22c55e | `success-500` | **テキスト・ボタン（推奨）** |
| #16a34a | `success-600` | ボタン（ダークモード） |
| #15803d | `success-700` | ボタン（押下時） |
| #166534 | `success-800` | テキスト（濃い） |
| #145231 | `success-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 収入金額表示
<Text className="text-success-500 font-bold">+¥10,000</Text>

// 成功メッセージボタン
<TouchableOpacity className="bg-success-500 rounded-lg">
  <Text className="text-white">確認</Text>
</TouchableOpacity>
```

#### Danger（危険・支出）- レッド
支出表示、削除/警告メッセージ、ネガティブアクションに使用。

| コード | Tailwind | 推奨用途 |
|-------|----------|---------|
| #fef2f2 | `danger-50` | 背景（ハイライト） |
| #fee2e2 | `danger-100` | 背景 |
| #fecaca | `danger-200` | 背景（ホバー） |
| #fca5a5 | `danger-300` | 枠線 |
| #f87171 | `danger-400` | アイコン（明るい） |
| #ef4444 | `danger-500` | **テキスト・ボタン（推奨）** |
| #dc2626 | `danger-600` | ボタン（ダークモード） |
| #b91c1c | `danger-700` | ボタン（押下時） |
| #991b1b | `danger-800` | テキスト（濃い） |
| #7f1d1d | `danger-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 支出金額表示
<Text className="text-danger-500 font-bold">-¥5,000</Text>

// 削除ボタン
<TouchableOpacity className="bg-danger-500 rounded-lg">
  <Text className="text-white">削除</Text>
</TouchableOpacity>
```

#### Warning（警告）- オレンジ
警告メッセージ、注意が必要な情報に使用。

| コード | Tailwind | 推奨用途 |
|-------|----------|---------|
| #fffbeb | `warning-50` | 背景（ハイライト） |
| #fef3c7 | `warning-100` | 背景 |
| #fde68a | `warning-200` | 背景（ホバー） |
| #fcd34d | `warning-300` | 枠線 |
| #fbbf24 | `warning-400` | アイコン（明るい） |
| #f59e0b | `warning-500` | **テキスト・ボタン（推奨）** |
| #d97706 | `warning-600` | ボタン（ダークモード） |
| #b45309 | `warning-700` | ボタン（押下時） |
| #92400e | `warning-800` | テキスト（濃い） |
| #78350f | `warning-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 警告メッセージ
<View className="bg-warning-50 border border-warning-300 rounded-lg p-3">
  <Text className="text-warning-700">重要な更新があります</Text>
</View>
```

#### Info（情報）- ブルー
情報メッセージ、ヒントに使用。

| コード | Tailwind | 推奨用途 |
|-------|----------|---------|
| #eff6ff | `info-50` | 背景（ハイライト） |
| #dbeafe | `info-100` | 背景 |
| #bfdbfe | `info-200` | 背景（ホバー） |
| #93c5fd | `info-300` | 枠線 |
| #60a5fa | `info-400` | アイコン（明るい） |
| #3b82f6 | `info-500` | **テキスト・ボタン（推奨）** |
| #2563eb | `info-600` | ボタン（ダークモード） |
| #1d4ed8 | `info-700` | ボタン（押下時） |
| #1e40af | `info-800` | テキスト（濃い） |
| #1e3a8a | `info-900` | テキスト（最も濃い） |

**使用例：**
```jsx
// 情報バナー
<View className="bg-info-50 border border-info-300 rounded-lg p-3">
  <Text className="text-info-700">Tip: スワイプで素早く削除できます</Text>
</View>
```

---

## タイポグラフィ

### フォントサイズ

アプリケーション全体で使用可能な標準フォントサイズ。各サイズは行高（line-height）も指定済み。

| Tailwind | サイズ | 行高 | 推奨用途 |
|----------|--------|------|---------|
| `text-caption` | 11px | 1.4 | 補足情報、小さなラベル |
| `text-label` | 12px | 1.4 | フォームラベル、タグ |
| `text-xs` | 12px | 1.5 | 小さいテキスト、注釈 |
| `text-sm` | 14px | 1.5 | サブテキスト、説明 |
| `text-base` | 15px | 1.6 | 本文テキスト（通常） |
| `text-lg` | 16px | 1.6 | サブタイトル、ボタン |
| `text-xl` | 17px | 1.6 | タイトル、セクションヘッダ |
| `text-2xl` | 19px | 1.5 | 大きなタイトル |
| `text-3xl` | 21px | 1.4 | ページタイトル |

**使用例：**
```jsx
// ページタイトル
<Text className="text-3xl font-bold">取引一覧</Text>

// セクションタイトル
<Text className="text-lg font-semibold">今月の支出</Text>

// 本文テキスト
<Text className="text-base">¥10,000</Text>

// 補足情報
<Text className="text-caption text-gray-500">2024年3月1日</Text>
```

### フォントウェイト

| Tailwind | ウェイト | 推奨用途 |
|----------|----------|---------|
| `font-light` | 300 | 補足情報の薄いテキスト |
| `font-normal` | 400 | 本文テキスト（デフォルト） |
| `font-medium` | 500 | 強調テキスト、ボタンテキスト |
| `font-semibold` | 600 | サブタイトル、重要な情報 |
| `font-bold` | 700 | タイトル、強い強調 |

**使用例：**
```jsx
// タイトル：bold + 大きいサイズ
<Text className="text-2xl font-bold">月間支出</Text>

// セクション見出し：semibold + 中サイズ
<Text className="text-lg font-semibold">カテゴリ別</Text>

// 通常の本文：normal（デフォルト）
<Text className="text-base">支出額</Text>
```

---

## スペーシング・レイアウト

### 標準スペーシング

コンポーネント間、要素内のスペーシングは以下を標準化。

| Tailwind | サイズ | 用途 |
|----------|--------|------|
| `gap-xs` / `m-xs` / `p-xs` | 4px | コンポーネント内の最小スペーシング |
| `gap-sm` / `m-sm` / `p-sm` | 8px | フォーム要素間、タイトと テキスト間 |
| `gap-md` / `m-md` / `p-md` | 12px | フォームセクション間、ボタン周囲 |
| `gap-lg` / `m-lg` / `p-lg` | 16px | 主要セクション間（標準） |
| `gap-xl` / `m-xl` / `p-xl` | 20px | ページ内セクション間 |
| `gap-2xl` / `m-2xl` / `p-2xl` | 24px | 大きなセクション間 |
| `gap-3xl` / `m-3xl` / `p-3xl` | 32px | ページレベルのセクション間 |

**使用例：**
```jsx
// フォーム内のフィールド間
<View className="gap-md">
  <View>
    <Text className="text-label mb-sm">金額</Text>
    <TextInput className="p-md border border-primary-200 rounded-lg" />
  </View>
  <View>
    <Text className="text-label mb-sm">カテゴリ</Text>
    <TouchableOpacity className="p-md border border-primary-200 rounded-lg" />
  </View>
</View>

// モーダルの内容
<View className="p-lg gap-lg">
  <Text className="text-xl font-semibold">取引を追加</Text>
  {/* フォーム内容 */}
</View>

// ページレベルのセクション
<View className="gap-3xl">
  <SectionA />
  <SectionB />
  <SectionC />
</View>
```

### ボーダーラディウス

| Tailwind | サイズ | 推奨用途 |
|----------|--------|---------|
| `rounded-none` | 0px | 角丸なし |
| `rounded-xs` | 4px | スモール UI要素（チェックボックスなど） |
| `rounded-sm` | 6px | 小さなボタン、バッジ |
| `rounded-md` | 8px | カード、モーダル（推奨） |
| `rounded-lg` | 12px | 大きなカード、ボタン |
| `rounded-xl` | 16px | 特に目立つコンポーネント |
| `rounded-full` | 9999px | アバター、アイコン、丸いボタン |

**使用例：**
```jsx
// カード
<View className="bg-white rounded-md border border-primary-200 p-md">
  {/* コンテンツ */}
</View>

// ボタン
<TouchableOpacity className="bg-primary-500 rounded-lg p-md">
  <Text className="text-white font-medium">送信</Text>
</TouchableOpacity>

// アバター
<View className="w-12 h-12 rounded-full bg-primary-300" />
```

### シャドウ

ドロップシャドウの強度レベル。

| Tailwind | 効果 | 推奨用途 |
|----------|------|---------|
| `shadow-xs` | 最小限 | 微妙なハイライト、ホバー状態 |
| `shadow-sm` | 薄い | 浮き出ている印象 |
| `shadow-md` | 標準 | カード、通常のドロップシャドウ |
| `shadow-lg` | 強い | モーダル、強調表示 |
| `shadow-xl` | 非常に強い | オーバーレイ、最優先 UI |

**使用例：**
```jsx
// 通常のカード
<View className="bg-white rounded-md p-md shadow-md">
  {/* コンテンツ */}
</View>

// ホバー時
<View className="bg-white rounded-md p-md shadow-xs active:shadow-md">
  {/* コンテンツ */}
</View>

// モーダル
<View className="bg-white rounded-md p-lg shadow-lg">
  {/* モーダルコンテンツ */}
</View>
```

---

## コンポーネント一覧

### 既存コンポーネント

#### ModalWrapper
汎用モーダルコンポーネント。タイトル、ヘッダアクション、ボディコンテンツをサポート。

**Props:**
- `title: string` - モーダルタイトル
- `isForm?: boolean` - フォーム要素を含むかどうか
- `visible: boolean` - 表示/非表示
- `onClose: () => void` - クローズコールバック
- `headerAction?: ReactNode` - ヘッダの右側に表示するアクション

**使用例：**
```jsx
<ModalWrapper
  title="取引詳細"
  visible={isOpen}
  onClose={onClose}
  headerAction={<EditButton />}
>
  {/* モーダルコンテンツ */}
</ModalWrapper>
```

#### ConfirmDialog
確認ダイアログ。削除確認など重要な判断に使用。

**Props:**
- `isOpen: boolean` - 表示/非表示
- `onClose: () => void` - キャンセルコールバック
- `onConfirm: () => void` - 確認コールバック
- `title: string` - ダイアログタイトル
- `message: string` - 確認メッセージ
- `confirmText?: string` - 確認ボタンテキスト（デフォルト: "確認"）

**使用例：**
```jsx
<ConfirmDialog
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="削除しますか？"
  message="この操作は取り消せません"
  confirmText="削除"
/>
```

#### TransactionDetailsSheet
取引詳細を表示するシート。カテゴリ、金額、日付、メモなど。

---

## 使用ガイド

### 新しいコンポーネントを作成する場合

1. **カラーを指定する**
   - Tailwind クラス（`text-success-500`, `bg-danger-500` など）を使用
   - ハードコードされた色値（`#ef4444` など）は避ける

2. **サイズを指定する**
   - `text-sm`, `text-base`, `text-lg` など標準フォントサイズを使用
   - `gap-md`, `p-lg` など標準スペーシングを使用
   - `rounded-md`, `rounded-lg` など標準ボーダーラディウスを使用

3. **ダークモード対応**
   - 必要に応じて `dark:` プレフィックスでダークモード対応
   ```jsx
   <View className="bg-primary-50 dark:bg-primary-900">
     <Text className="text-primary-900 dark:text-primary-50">テキスト</Text>
   </View>
   ```

### よくあるパターン

#### パターン1：フォームセクション
```jsx
<View className="gap-lg">
  {/* タイトル */}
  <Text className="text-lg font-semibold">セクションタイトル</Text>

  {/* フォーム項目 */}
  <View className="gap-md">
    <View>
      <Text className="text-label mb-sm">ラベル</Text>
      <TextInput className="border border-primary-200 rounded-md p-md" />
    </View>
    <View>
      <Text className="text-label mb-sm">ラベル</Text>
      <TextInput className="border border-primary-200 rounded-md p-md" />
    </View>
  </View>
</View>
```

#### パターン2：アクションボタン行
```jsx
<View className="flex-row gap-md">
  <TouchableOpacity
    className="flex-1 bg-primary-200 rounded-lg p-md"
    onPress={handleCancel}
  >
    <Text className="text-center font-medium">キャンセル</Text>
  </TouchableOpacity>
  <TouchableOpacity
    className="flex-1 bg-success-500 rounded-lg p-md"
    onPress={handleConfirm}
  >
    <Text className="text-center text-white font-medium">確認</Text>
  </TouchableOpacity>
</View>
```

#### パターン3：ステータスバッジ
```jsx
// 成功
<View className="bg-success-50 border border-success-200 rounded-sm px-md py-sm">
  <Text className="text-success-700 font-medium text-label">成功</Text>
</View>

// 警告
<View className="bg-warning-50 border border-warning-200 rounded-sm px-md py-sm">
  <Text className="text-warning-700 font-medium text-label">注意</Text>
</View>

// エラー
<View className="bg-danger-50 border border-danger-200 rounded-sm px-md py-sm">
  <Text className="text-danger-700 font-medium text-label">エラー</Text>
</View>
```

---

## チェックリスト：デザインレビュー

新しいコンポーネント・画面を実装した際は、以下をチェックしてください。

- [ ] **カラー**：セマンティックカラー（primary, success, danger, warning, info）を使用している
- [ ] **フォントサイズ**：Tailwind の標準フォントサイズ（text-xs～text-3xl）を使用している
- [ ] **スペーシング**：標準スペーシング（gap-xs～gap-3xl）を使用している
- [ ] **ボーダーラディウス**：標準ボーダーラディウス（rounded-xs～rounded-xl）を使用している
- [ ] **ダークモード**：ダークモード時のスタイル（`dark:` プレフィックス）を確認した
- [ ] **一貫性**：既存コンポーネントと視覚的に統一されている
- [ ] **アクセシビリティ**：テキストのコントラストが十分か、タッチエリアが十分か確認した

---

## よくある質問

**Q: 新しい色を追加したい場合は？**
A: まず、既存のセマンティックカラーで対応できないか確認してください。本当に新しい色が必要な場合は、`tailwind.config.js` に色を追加し、このドキュメントを更新してください。

**Q: ハードコードされた色値を見つけました**
A: それは古いコードの可能性があります。リファクタリングして、セマンティックカラーに置き換えてください。

**Q: スペーシングがしっくりこない**
A: 標準スペーシングに最も近い値を使用してください。カスタム値は避けましょう。

---

**Last Updated**: 2024年
**Version**: 1.0

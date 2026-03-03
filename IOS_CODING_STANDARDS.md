# iOS アプリ コーディング規約
# Household Expenses Mobile — React Native + Expo

> **対象**: iOS向けReact Native / Expoプロジェクト全体
> **言語**: TypeScript (strict mode)
> **フレームワーク**: React Native 0.81.x / Expo 54.x
> **最終更新**: 2026-03-03

---

## 目次

1. [現在の設計問題と改善方針](#1-現在の設計問題と改善方針)
2. [プロジェクト構造](#2-プロジェクト構造)
3. [TypeScript 規約](#3-typescript-規約)
4. [Reactコンポーネント規約](#4-reactコンポーネント規約)
5. [カスタムフック規約](#5-カスタムフック規約)
6. [状態管理規約](#6-状態管理規約)
7. [データ永続化・ストレージ規約](#7-データ永続化ストレージ規約)
8. [ビジネスロジック・サービス層規約](#8-ビジネスロジックサービス層規約)
9. [フォーム・バリデーション規約](#9-フォームバリデーション規約)
10. [スタイリング規約 (NativeWind)](#10-スタイリング規約-nativewind)
11. [iOS固有のUI/UX規約](#11-ios固有のuiux規約)
12. [エラーハンドリング規約](#12-エラーハンドリング規約)
13. [パフォーマンス規約](#13-パフォーマンス規約)
14. [テスト規約](#14-テスト規約)
15. [ネーミング規約](#15-ネーミング規約)
16. [ファイル・ディレクトリ規約](#16-ファイルディレクトリ規約)

---

## 1. 現在の設計問題と改善方針

### 1.1 重大な問題 (CRITICAL)

#### 問題1: ストレージの競合状態 (Race Condition)

**現状コード** (`syncStorage.ts`):
```typescript
// ❌ 問題: 非同期書き込みが未待機のため、アプリ強制終了時にデータ消失
setItem(key: string, value: string): void {
  this.cache.set(key, value);              // 同期でキャッシュ更新
  void AsyncStorage.setItem(key, value)    // 非同期で永続化 (fire-and-forget)
    .catch((e) => console.warn('failed:', e));
}
```

**改善方針**:
```typescript
// ✅ 改善: 書き込みキューで順序保証 + エラー回復機能
class SafeStorage {
  private writeQueue: Promise<void> = Promise.resolve();

  async setItem(key: string, value: string): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await AsyncStorage.setItem(key, value);
      this.cache.set(key, value);
    });
    return this.writeQueue;
  }
}
```

#### 問題2: アプリ初期化の失敗処理なし

**現状コード** (`App.tsx`):
```typescript
// ❌ 問題: 初期化失敗時にローディング画面から抜け出せない
useEffect(() => {
  const init = async () => {
    await syncStorage.initialize(); // エラー時もsetIsReady(true)が呼ばれない
    runMigrations();
    setIsReady(true);
  };
  void init();
}, []);
```

**改善方針**:
```typescript
// ✅ 改善: エラー状態を明示的に管理し、リカバリ手段を提供
const [initError, setInitError] = useState<Error | null>(null);

useEffect(() => {
  const init = async () => {
    try {
      await syncStorage.initialize();
      runMigrations();
    } catch (error) {
      setInitError(error instanceof Error ? error : new Error('初期化に失敗しました'));
      return;
    } finally {
      setIsReady(true);
    }
  };
  void init();
}, []);

if (initError) {
  return <InitializationErrorScreen error={initError} onRetry={() => setInitError(null)} />;
}
```

#### 問題3: トランザクションの原子性なし

**現状コード** (`AddTransactionScreen.tsx`):
```typescript
// ❌ 問題: 途中でエラーが起きると残高と取引記録が不整合になる
transactionService.create(input);
accountService.update(accountId, { balance: newBalance }); // ここで失敗すると不整合
```

**改善方針**: 「全て成功か全て失敗」の原子的操作を実装する。

---

### 1.2 高優先度の問題 (HIGH)

| 問題 | 場所 | 影響 |
|------|------|------|
| フォームバリデーションなし | `AddTransactionScreen.tsx` | 不正データの蓄積 |
| `any`型の使用 | `TransactionFilterContext.tsx` | 型安全性の欠如 |
| マジックナンバー多用 | 複数ファイル | 保守性の低下 |
| エラーバウンダリが1箇所のみ | `App.tsx` | 1画面のエラーがアプリ全体をクラッシュ |
| コンソールログが本番コードに残存 | 全体 | 情報漏洩・パフォーマンス低下 |

### 1.3 中優先度の問題 (MEDIUM)

| 問題 | 場所 | 影響 |
|------|------|------|
| デザインシステムの不一致 | `AppNavigator.tsx` | ハードコードカラー混在 |
| 重いContext再計算 | `TransactionFilterContext.tsx` | 大量データで遅延発生 |
| 画面コンポーネントが巨大 | `AddTransactionScreen.tsx` (516行) | テスト困難・保守性低下 |
| マイグレーション設計の硬直性 | `storage.ts` | スキーマ変更が困難 |

---

## 2. プロジェクト構造

### 2.1 推奨ディレクトリ構造

```
src/
├── app/                          # エントリーポイント
│   ├── App.tsx                   # ルートコンポーネント
│   └── index.ts                  # Expoエントリー
├── screens/                      # 画面コンポーネント (表示のみ)
│   ├── AddTransactionScreen/
│   │   ├── index.tsx             # メイン画面コンポーネント
│   │   ├── components/           # 画面固有のサブコンポーネント
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   └── AmountInput.tsx
│   │   └── hooks/                # 画面固有のカスタムフック
│   │       └── useTransactionForm.ts
│   ├── AccountsScreen/
│   ├── MoneyScreen/
│   ├── TransactionsScreen/
│   └── SettingsScreen/
├── components/                   # 共有コンポーネント
│   ├── ui/                       # プリミティブUIコンポーネント
│   ├── feedback/                 # ユーザーフィードバック
│   └── modals/                   # モーダルコンポーネント
├── hooks/                        # グローバル共有カスタムフック
├── contexts/                     # React Context
├── services/                     # データアクセス層
│   ├── storage/
│   │   ├── SafeStorage.ts        # ストレージ抽象化
│   │   ├── migrations/           # マイグレーション (v1.ts, v2.ts...)
│   │   └── keys.ts               # ストレージキー定数
│   ├── transaction/
│   │   └── transactionService.ts
│   └── account/
│       └── accountService.ts
├── domain/                       # ドメインロジック (純粋関数)
│   ├── transaction/
│   ├── account/
│   └── recurring/
├── utils/                        # 汎用ユーティリティ
│   ├── formatters.ts
│   ├── dateUtils.ts
│   └── colorUtils.ts
├── types/                        # TypeScript型定義
│   ├── domain.ts                 # ドメイン型
│   ├── api.ts                    # API/ストレージ入出力型
│   └── navigation.ts             # ナビゲーション型
├── constants/                    # アプリ定数
│   ├── colors.ts                 # デザインシステムカラー
│   ├── spacing.ts                # スペーシング
│   └── config.ts                 # アプリ設定
└── navigation/                   # ナビゲーション設定
    └── AppNavigator.tsx
```

### 2.2 ファイル配置の原則

- **1ファイル = 1責任**: コンポーネント、フック、ユーティリティのいずれか
- **画面コンポーネントは200行以内**: 超える場合はサブコンポーネントに分割
- **index.ts でバレルエクスポート**: ディレクトリ内のパブリックAPIを明示
- **画面固有のコンポーネントは画面ディレクトリ内**: 再利用しない限り移動しない

---

## 3. TypeScript 規約

### 3.1 型の定義

```typescript
// ✅ 明示的な型定義を優先
type TransactionId = string & { readonly __brand: 'TransactionId' };
type Amount = number & { readonly __brand: 'Amount' };

// ✅ ドメイン型はReadonlyで不変性を保証
type Transaction = Readonly<{
  id: TransactionId;
  amount: Amount;
  date: string; // ISO 8601 形式
  categoryId: string;
  accountId: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
}>;

// ✅ 入力型はOmitで自動生成フィールドを除外
type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

// ✅ 更新型はPartialで部分更新を許可
type TransactionUpdate = Partial<TransactionInput>;
```

### 3.2 禁止事項

```typescript
// ❌ any型の使用禁止
const transactions: any[] = [];

// ✅ 代替: unknown + 型ガード
const parseTransactions = (data: unknown): Transaction[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(isValidTransaction);
};

// ❌ 型アサーション (as) の乱用
const amount = value as number;

// ✅ 代替: 型ガードで安全に変換
const toAmount = (value: unknown): Amount | null => {
  if (typeof value !== 'number' || !isFinite(value) || value < 0) return null;
  return value as Amount;
};

// ❌ 非nullアサーション (!) の乱用
const category = categories.find(c => c.id === id)!;

// ✅ 代替: 明示的なnullチェック
const category = categories.find(c => c.id === id);
if (!category) throw new Error(`カテゴリが見つかりません: ${id}`);
```

### 3.3 Enum vs Union型

```typescript
// ❌ TypeScript enumは使用しない (tree-shakingに不利、逆引き問題)
enum TransactionType { EXPENSE, INCOME, TRANSFER }

// ✅ const unionを使用
const TRANSACTION_TYPES = ['expense', 'income', 'transfer'] as const;
type TransactionType = typeof TRANSACTION_TYPES[number];
// → 'expense' | 'income' | 'transfer'
```

### 3.4 Result型でエラーを型安全に扱う

```typescript
// ✅ エラーをthrowではなくResult型で返す
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 使用例
const createTransaction = (input: TransactionInput): Result<Transaction> => {
  const validation = validateTransactionInput(input);
  if (!validation.ok) return validation;

  try {
    const transaction = transactionRepository.create(input);
    return { ok: true, value: transaction };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error('作成に失敗') };
  }
};
```

---

## 4. Reactコンポーネント規約

### 4.1 コンポーネントの基本形

```typescript
// ✅ 推奨: 型付きPropsと明示的なReturnType
type TransactionItemProps = {
  readonly transaction: Transaction;
  readonly category: Category;
  readonly account: Account;
  readonly onPress: (id: string) => void;
  readonly onDelete?: (id: string) => void;
};

const TransactionItem = ({
  transaction,
  category,
  account,
  onPress,
  onDelete,
}: TransactionItemProps): React.ReactElement => {
  const { isDark } = useDarkMode();

  const handlePress = useCallback(() => {
    onPress(transaction.id);
  }, [onPress, transaction.id]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}の取引、${formatCurrency(transaction.amount)}`}
    >
      {/* 実装 */}
    </Pressable>
  );
};

export { TransactionItem };
```

### 4.2 コンポーネントの責任分離

```typescript
// ❌ 問題: 1コンポーネントがデータ取得・変換・表示を全て担当
const AddTransactionScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // 516行のビジネスロジック + UI
};

// ✅ 改善: Container/Presentational パターン
// Container: データ取得と状態管理
const AddTransactionScreenContainer = () => {
  const { form, submit, isLoading } = useTransactionForm();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  return (
    <AddTransactionScreen
      form={form}
      categories={categories}
      accounts={accounts}
      onSubmit={submit}
      isLoading={isLoading}
    />
  );
};

// Presentational: 表示のみ、副作用なし
const AddTransactionScreen = ({
  form,
  categories,
  accounts,
  onSubmit,
  isLoading,
}: AddTransactionScreenProps) => {
  // 純粋な表示ロジックのみ
};
```

### 4.3 メモ化の基準

```typescript
// ✅ メモ化すべきケース
// 1. 親コンポーネントが頻繁に再レンダリングされる場合
const TransactionItem = React.memo(({ transaction, onPress }: Props) => {
  // ...
}, (prev, next) => prev.transaction.id === next.transaction.id &&
                   prev.transaction.amount === next.transaction.amount);

// 2. 重い計算を伴うuseMemo
const groupedTransactions = useMemo(
  () => groupTransactionsByDate(filteredTransactions),
  [filteredTransactions],
);

// 3. コールバック関数は常にuseCallback
const handleDelete = useCallback((id: string) => {
  deleteTransaction(id);
}, [deleteTransaction]);

// ❌ 過剰なメモ化は避ける (プリミティブ値の比較は不要)
const label = useMemo(() => `合計: ${amount}円`, [amount]); // 不要
const label = `合計: ${amount}円`; // これで十分
```

### 4.4 エラーバウンダリの配置

```typescript
// ✅ 各画面に個別のエラーバウンダリを配置
const AppNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Home"
      component={() => (
        <ErrorBoundary
          fallback={<ScreenErrorFallback screenName="ホーム" />}
          onError={(error) => logger.error('HomeScreen error', error)}
        >
          <MoneyScreen />
        </ErrorBoundary>
      )}
    />
    {/* 他の画面も同様 */}
  </Tab.Navigator>
);
```

---

## 5. カスタムフック規約

### 5.1 フックの基本形

```typescript
// ✅ 明確なReturnTypeとエラー状態を持つフック
type UseTransactionsReturn = {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<Result<void>>;
};

const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('データの取得に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { transactions, isLoading, error, refresh, deleteTransaction };
};
```

### 5.2 フォーム専用フック

```typescript
// ✅ フォームロジックは専用フックに分離
const useTransactionForm = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      date: new Date().toISOString(),
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await createTransaction(data);
    if (result.ok) {
      reset();
      Toast.show({ type: 'success', text1: '取引を追加しました' });
    } else {
      Toast.show({ type: 'error', text1: result.error.message });
    }
  });

  return { control, errors, onSubmit, reset };
};
```

---

## 6. 状態管理規約

### 6.1 状態の分類と管理場所

```
状態の種類          管理場所
─────────────────────────────────────────────────
UIローカル状態      useState (モーダル開閉、入力値)
画面間共有状態      React Context (テーマ、フィルター)
永続化データ        Service層 + AsyncStorage
サーバー状態        (将来: React Query等)
```

### 6.2 Context の設計原則

```typescript
// ✅ Contextは関心ごとに分割し、値と更新を分離
type ThemeContextValue = {
  isDark: boolean;
  colorScheme: 'light' | 'dark';
};

type ThemeActionsContextValue = {
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
};

// 値と更新操作を別Contextに分けることで不要な再レンダリングを防ぐ
const ThemeContext = createContext<ThemeContextValue | null>(null);
const ThemeActionsContext = createContext<ThemeActionsContextValue | null>(null);

// カスタムフックで安全なアクセス
const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider の外で useTheme が呼ばれました');
  return context;
};
```

### 6.3 Contextのパフォーマンス最適化

```typescript
// ❌ 問題: filterが変わるたびに全トランザクションを再計算
const TransactionFilterProvider = ({ children }) => {
  const filteredTransactions = useMemo(
    () => applyFilters(allTransactions, filters), // 毎回全データを走査
    [allTransactions, filters, categories, paymentMethods]
  );
  // ...
};

// ✅ 改善: 計算を遅延し、必要な粒度でメモ化
const useFilteredTransactions = () => {
  const { allTransactions } = useAllTransactions();
  const { filters } = useTransactionFilters();

  // 段階的フィルタリングでショートサーキット
  return useMemo(() => {
    if (!filters.isActive) return allTransactions;
    return allTransactions.filter(t => matchesFilter(t, filters));
  }, [allTransactions, filters]);
};
```

---

## 7. データ永続化・ストレージ規約

### 7.1 ストレージキーの管理

```typescript
// ✅ ストレージキーは定数として一元管理
// constants/storageKeys.ts
const STORAGE_KEYS = {
  // バージョン管理
  SCHEMA_VERSION: '@app/schema_version',

  // ドメインデータ
  MEMBERS: '@domain/members',
  ACCOUNTS: '@domain/accounts',
  TRANSACTIONS: '@domain/transactions',
  TRANSFERS: '@domain/transfers',
  CATEGORIES: '@domain/categories',

  // 設定
  USER_PREFERENCES: '@settings/preferences',
  THEME: '@settings/theme',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
```

### 7.2 スキーマバリデーション必須

```typescript
// ✅ ストレージからの読み込みは必ずZodでバリデーション
import { z } from 'zod';

const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive().int(),
  date: z.string().datetime(),
  categoryId: z.string(),
  accountId: z.string(),
  memo: z.string().default(''),
  type: z.enum(['expense', 'income']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const parseTransactions = (raw: unknown): Transaction[] => {
  const result = z.array(TransactionSchema).safeParse(raw);
  if (!result.success) {
    logger.warn('トランザクションデータのパース失敗', { error: result.error });
    return [];
  }
  return result.data;
};
```

### 7.3 マイグレーション設計

```typescript
// ✅ マイグレーションはバージョンごとにファイルを分割
// services/storage/migrations/

// migration_v1_to_v2.ts
export const migrationV1ToV2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  up: async (storage: StorageAdapter): Promise<void> => {
    const accounts = await storage.getItem(STORAGE_KEYS.ACCOUNTS);
    // ... マイグレーションロジック
  },
  down: async (storage: StorageAdapter): Promise<void> => {
    // ロールバック処理 (可能な場合)
  },
};

// services/storage/MigrationRunner.ts
const MIGRATIONS: Migration[] = [
  migrationV1ToV2,
  migrationV2ToV3,
  // 新しいマイグレーションをここに追加
];

const runMigrations = async (storage: StorageAdapter): Promise<void> => {
  const currentVersion = await getCurrentVersion(storage);
  const pendingMigrations = MIGRATIONS.filter(m => m.fromVersion >= currentVersion);

  for (const migration of pendingMigrations) {
    await storage.backup(); // マイグレーション前にバックアップ
    await migration.up(storage);
    await setVersion(storage, migration.toVersion);
  }
};
```

---

## 8. ビジネスロジック・サービス層規約

### 8.1 サービスの責任範囲

```typescript
// ✅ サービス層: ストレージ操作 + ドメインロジックの調整
// services/transaction/transactionService.ts

type TransactionService = {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(input: TransactionInput): Promise<Result<Transaction>>;
  update(id: string, input: TransactionUpdate): Promise<Result<Transaction>>;
  delete(id: string): Promise<Result<void>>;
};

// ✅ ドメインロジックは純粋関数でutils/domain層に
// domain/transaction/transactionCalculator.ts

// 純粋関数: テスト容易、副作用なし
const calculateMonthlyTotal = (
  transactions: readonly Transaction[],
  year: number,
  month: number,
  type: TransactionType,
): number =>
  transactions
    .filter(t => t.type === type && isInMonth(t.date, year, month))
    .reduce((sum, t) => sum + t.amount, 0);
```

### 8.2 原子的操作の実装

```typescript
// ✅ 複数データの整合性が必要な操作は原子的に実行
const createTransactionWithAccountUpdate = async (
  input: TransactionInput,
  accountUpdate: AccountUpdate,
): Promise<Result<{ transaction: Transaction; account: Account }>> => {
  // 開始前の状態を保存
  const originalAccount = await accountService.getById(input.accountId);
  if (!originalAccount) {
    return { ok: false, error: new Error('口座が見つかりません') };
  }

  // トランザクション作成
  const transactionResult = await transactionService.create(input);
  if (!transactionResult.ok) return transactionResult;

  // 残高更新
  const accountResult = await accountService.update(input.accountId, accountUpdate);
  if (!accountResult.ok) {
    // ロールバック: 作成したトランザクションを削除
    await transactionService.delete(transactionResult.value.id);
    return { ok: false, error: new Error('残高更新に失敗しました') };
  }

  return {
    ok: true,
    value: {
      transaction: transactionResult.value,
      account: accountResult.value,
    },
  };
};
```

---

## 9. フォーム・バリデーション規約

### 9.1 Zodスキーマの定義

```typescript
// ✅ バリデーションスキーマはfeature層に配置
// screens/AddTransactionScreen/schemas/transactionSchema.ts

import { z } from 'zod';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z
    .string()
    .min(1, '金額を入力してください')
    .refine(v => /^\d+$/.test(v), '正の整数を入力してください')
    .transform(v => parseInt(v, 10))
    .refine(v => v > 0, '0より大きい金額を入力してください')
    .refine(v => v <= 999_999_999, '金額が大きすぎます'),
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  accountId: z.string().min(1, '口座を選択してください'),
  date: z.string().datetime('日付の形式が正しくありません'),
  memo: z.string().max(200, 'メモは200文字以内で入力してください').default(''),
});

type TransactionFormData = z.input<typeof transactionSchema>;
type TransactionFormOutput = z.output<typeof transactionSchema>;
```

### 9.2 React Hook Form との統合

```typescript
// ✅ フォームはReact Hook Form + Zodで管理
const {
  control,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
} = useForm<TransactionFormData>({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    type: 'expense',
    amount: '',
    date: new Date().toISOString(),
    memo: '',
  },
  mode: 'onBlur', // iOSではフォーカスアウト時にバリデーション
});

// ✅ エラーメッセージは日本語で統一
<Controller
  control={control}
  name="amount"
  render={({ field: { onChange, onBlur, value } }) => (
    <FormField
      label="金額"
      error={errors.amount?.message}
      required
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        keyboardType="numeric"
        returnKeyType="next"
        placeholder="0"
      />
    </FormField>
  )}
/>
```

---

## 10. スタイリング規約 (NativeWind)

### 10.1 カラーシステムの一元化

```typescript
// ✅ ハードコードカラー禁止: 定数ファイルから参照
// constants/colors.ts — デザインシステムと同期
export const COLORS = {
  // Primary
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
    900: '#111827',
  },
  // Semantic
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
} as const;

// AppNavigatorでの正しい使用例
// ❌ const ICON_COLOR_ACTIVE = '#374151';
// ✅
const ICON_COLOR_ACTIVE = COLORS.gray[700];
const ICON_COLOR_ACTIVE_DARK = COLORS.gray[300];
```

### 10.2 NativeWindクラスの使用ルール

```typescript
// ✅ Tailwindクラスを優先使用
<View className="flex-1 bg-white dark:bg-gray-900 px-4 py-6">
  <Text className="text-base font-semibold text-gray-900 dark:text-white">
    タイトル
  </Text>
</View>

// ❌ インラインスタイルは最小限に (動的な値のみ許可)
// BAD: 静的な値にstyleを使用
<View style={{ flex: 1, backgroundColor: '#ffffff' }} />

// OK: 動的な値 (ユーザー設定のカスタムカラー等)
<View style={{ backgroundColor: account.color }} className="rounded-lg p-4" />
```

### 10.3 レスポンシブ対応

```typescript
// ✅ iOS端末サイズに対応したグリッド計算
import { Dimensions } from 'react-native';

// constants/layout.ts
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16; // spacing.md

export const GRID = {
  columns: {
    3: (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 8 * 2) / 3, // 8px gap x2
    4: (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 8 * 3) / 4,
  },
} as const;

// ❌ マジックナンバー
const gridItemWidth = (windowWidth - 48) / 3;

// ✅ 定数から計算
const gridItemWidth = GRID.columns[3];
```

---

## 11. iOS固有のUI/UX規約

### 11.1 Human Interface Guidelines への準拠

```typescript
// ✅ iOSネイティブコンポーネントを優先使用
import DateTimePicker from '@react-native-community/datetimepicker';

// 日付選択はiOSネイティブのDateTimePickerを使用
<DateTimePicker
  value={selectedDate}
  mode="date"
  display="spinner"  // iOSではspinnerスタイルが標準
  locale="ja-JP"
  onChange={(_, date) => date && setSelectedDate(date)}
/>

// ✅ SafeAreaを必ず考慮
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Screen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* コンテンツ */}
    </View>
  );
};
```

### 11.2 アクセシビリティ必須項目

```typescript
// ✅ 全インタラクティブ要素にアクセシビリティ属性を付与
<Pressable
  onPress={handleDelete}
  accessibilityRole="button"
  accessibilityLabel="取引を削除"
  accessibilityHint="ダブルタップで削除します"
  accessibilityState={{ disabled: isDeleting }}
>
  <TrashIcon />
</Pressable>

// ✅ 金額の読み上げ最適化
<Text
  accessibilityLabel={`${formatCurrency(amount)}円`}
  // VoiceOverが「12,345円」と読む (「¥12,345」ではなく)
>
  {formatCurrency(amount)}
</Text>

// ✅ 最小タップターゲット (44x44pt iOS HIG準拠)
<Pressable
  className="min-h-[44px] min-w-[44px] items-center justify-center"
  onPress={onPress}
>
  {/* アイコン */}
</Pressable>
```

### 11.3 キーボード対応

```typescript
// ✅ キーボード表示時のUI調整
import { KeyboardAvoidingView, Platform } from 'react-native';

const FormScreen = () => (
  <KeyboardAvoidingView
    className="flex-1"
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
  >
    <ScrollView keyboardShouldPersistTaps="handled">
      {/* フォームコンテンツ */}
    </ScrollView>
  </KeyboardAvoidingView>
);

// ✅ テキスト入力間のフォーカス移動
const amountRef = useRef<TextInput>(null);
const memoRef = useRef<TextInput>(null);

<TextInput
  ref={amountRef}
  returnKeyType="next"
  onSubmitEditing={() => memoRef.current?.focus()}
  blurOnSubmit={false}
/>
<TextInput
  ref={memoRef}
  returnKeyType="done"
  onSubmitEditing={() => Keyboard.dismiss()}
/>
```

### 11.4 Haptic Feedback

```typescript
// ✅ 重要な操作にはHapticフィードバックを追加
import * as Haptics from 'expo-haptics';

const handleDelete = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  // 削除処理...
};

const handleSuccess = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

const handleButtonPress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // ボタン処理...
};
```

### 11.5 スワイプジェスチャー

```typescript
// ✅ リスト項目のスワイプ削除はiOS標準パターンに従う
import Swipeable from 'react-native-gesture-handler/Swipeable';

const TransactionItem = ({ transaction, onDelete }: Props) => {
  const renderRightActions = () => (
    <Pressable
      className="bg-red-500 w-20 items-center justify-center"
      onPress={() => onDelete(transaction.id)}
      accessibilityLabel="削除"
    >
      <TrashIcon color="white" size={24} />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2}>
      {/* 取引内容 */}
    </Swipeable>
  );
};
```

---

## 12. エラーハンドリング規約

### 12.1 ロギングサービス

```typescript
// ✅ console.log/warnの直接使用禁止: ロガーを使用
// services/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => void;
};

// 開発環境: コンソール出力
// 本番環境: エラー監視サービスに送信 (将来: Sentry等)
export const logger: Logger = {
  debug: (message, context) => {
    if (__DEV__) console.debug(`[DEBUG] ${message}`, context);
  },
  info: (message, context) => {
    if (__DEV__) console.info(`[INFO] ${message}`, context);
  },
  warn: (message, context) => {
    console.warn(`[WARN] ${message}`, context);
    // TODO: Sentryへの送信
  },
  error: (message, error, context) => {
    console.error(`[ERROR] ${message}`, { error, ...context });
    // TODO: Sentryへの送信
  },
};
```

### 12.2 エラーバウンダリの実装

```typescript
// ✅ 型付きエラーバウンダリ
type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactElement | ((error: Error) => React.ReactElement);
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('UIエラー', error, { componentStack: info.componentStack });
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) {
      const fallback = this.props.fallback;
      return typeof fallback === 'function'
        ? fallback(this.state.error)
        : fallback;
    }
    return this.props.children;
  }
}
```

---

## 13. パフォーマンス規約

### 13.1 FlatListの最適化

```typescript
// ✅ 大量のリストはFlatListで仮想化必須
<FlatList
  data={transactions}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TransactionItem transaction={item} onPress={handlePress} />
  )}
  // パフォーマンス最適化
  getItemLayout={(_, index) => ({
    length: TRANSACTION_ITEM_HEIGHT, // 固定高さで計算を省略
    offset: TRANSACTION_ITEM_HEIGHT * index,
    index,
  })}
  maxToRenderPerBatch={10}      // 1バッチの最大レンダリング数
  windowSize={5}                // 画面サイズの5倍をメモリ保持
  initialNumToRender={15}       // 初期レンダリング数
  removeClippedSubviews         // 画面外のビューを非マウント
  // キャッシュ
  updateCellsBatchingPeriod={50}
/>
```

### 13.2 画像最適化

```typescript
// ✅ Expo Image を使用してキャッシュと最適化を活用
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUri }}
  style={{ width: 48, height: 48 }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
/>
```

### 13.3 バンドルサイズ最適化

```typescript
// ✅ Tree-shakingを活かした名前付きインポート
import { format, parseISO, startOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

// ❌ ライブラリ全体のインポート
import dateFns from 'date-fns';

// ✅ lucide-react-nativeは必要なアイコンのみインポート
import { Home, Settings, Plus } from 'lucide-react-native';

// ❌
import * as Icons from 'lucide-react-native';
```

---

## 14. テスト規約

### 14.1 テストの種類と目標カバレッジ

```
テスト種別                  目標カバレッジ  ツール
────────────────────────────────────────────────────────
ドメインロジック (純粋関数)  90%+          Jest
カスタムフック              80%+          React Native Testing Library
UIコンポーネント            70%+          React Native Testing Library
統合テスト (画面)           50%+          React Native Testing Library
E2Eテスト (重要フロー)      主要フロー    Maestro / Detox
```

### 14.2 ドメインロジックのテスト例

```typescript
// domain/transaction/__tests__/transactionCalculator.test.ts
describe('calculateMonthlyTotal', () => {
  const transactions: Transaction[] = [
    { id: '1', amount: 1000, type: 'expense', date: '2026-03-01T00:00:00Z', /* ... */ },
    { id: '2', amount: 2000, type: 'expense', date: '2026-03-15T00:00:00Z', /* ... */ },
    { id: '3', amount: 500,  type: 'income',  date: '2026-03-10T00:00:00Z', /* ... */ },
    { id: '4', amount: 3000, type: 'expense', date: '2026-04-01T00:00:00Z', /* ... */ },
  ];

  it('指定月の支出合計を正しく計算する', () => {
    expect(calculateMonthlyTotal(transactions, 2026, 3, 'expense')).toBe(3000);
  });

  it('翌月のデータは含まない', () => {
    expect(calculateMonthlyTotal(transactions, 2026, 3, 'expense')).not.toBe(6000);
  });

  it('空の配列で0を返す', () => {
    expect(calculateMonthlyTotal([], 2026, 3, 'expense')).toBe(0);
  });
});
```

### 14.3 フックのテスト例

```typescript
// hooks/__tests__/useTransactions.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';

describe('useTransactions', () => {
  it('初期状態でローディング中', () => {
    const { result } = renderHook(() => useTransactions());
    expect(result.current.isLoading).toBe(true);
  });

  it('データ取得成功後にトランザクション一覧を返す', async () => {
    const mockTransactions = [/* ... */];
    jest.spyOn(transactionService, 'getAll').mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.error).toBeNull();
  });
});
```

---

## 15. ネーミング規約

### 15.1 一般規約

| 種類 | 規約 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `TransactionItem`, `AmountInput` |
| フック | camelCase + `use` prefix | `useTransactions`, `useTheme` |
| 型・インターフェース | PascalCase | `Transaction`, `AccountType` |
| 定数 (モジュールスコープ) | UPPER_SNAKE_CASE | `STORAGE_KEYS`, `MAX_AMOUNT` |
| 関数・変数 | camelCase | `formatCurrency`, `isLoading` |
| ファイル (コンポーネント) | PascalCase | `TransactionItem.tsx` |
| ファイル (ユーティリティ) | camelCase | `formatters.ts`, `dateUtils.ts` |
| ディレクトリ | camelCase | `screens/`, `components/` |
| テストファイル | `.test.ts(x)` suffix | `TransactionItem.test.tsx` |

### 15.2 命名の原則

```typescript
// ✅ 意図が明確な名前
const isTransactionValid = (t: Transaction): boolean => { /* ... */ };
const getTransactionsByMonth = (year: number, month: number): Transaction[] => { /* ... */ };
const formatJPY = (amount: number): string => `¥${amount.toLocaleString('ja-JP')}`;

// ❌ 省略形・曖昧な名前
const isValid = (t: any) => { /* ... */ };
const getData = (y: number, m: number) => { /* ... */ };
const fmt = (n: number) => `¥${n}`;

// ✅ ブール値は is/has/can/should prefix
const isLoading = true;
const hasError = false;
const canDelete = user.role === 'admin';
const shouldShowModal = selectedItem !== null;

// ✅ イベントハンドラは handle prefix
const handleSubmit = () => { /* ... */ };
const handleDeletePress = () => { /* ... */ };

// ✅ コールバックPropsは on prefix
type ButtonProps = {
  onPress: () => void;
  onLongPress?: () => void;
};
```

---

## 16. ファイル・ディレクトリ規約

### 16.1 インポート順序

```typescript
// 1. React / React Native
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';

// 2. サードパーティライブラリ (アルファベット順)
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Controller, useForm } from 'react-hook-form';

// 3. 内部モジュール (パスエイリアス使用, アルファベット順)
import { Button, FormField } from '@/components/ui';
import { useTransactions } from '@/hooks/useTransactions';
import { transactionService } from '@/services/transaction';
import type { Transaction, TransactionInput } from '@/types/domain';

// 4. 相対インポート
import { TransactionForm } from './components/TransactionForm';
import { transactionSchema } from './schemas/transactionSchema';
```

### 16.2 barrelエクスポートの規約

```typescript
// ✅ components/ui/index.ts — パブリックAPIを明示
export { Alert } from './Alert';
export { Badge } from './Badge';
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { Card } from './Card';
export { FormField } from './FormField';

// ❌ ワイルドカードエクスポートは禁止 (循環参照の原因)
export * from './Alert';
```

### 16.3 コメントの書き方

```typescript
// ✅ WHY を説明するコメント (WHATはコードから明らか)

// iOSではDateTimePickerのdismissが非同期のため、
// setTimeoutで次のイベントループに処理を遅延させる必要がある
setTimeout(() => setShowDatePicker(false), 100);

// クレジットカードの締め日は月末日を超えられないため、
// 28日を上限としてどの月でも有効な日付を保証する
const safeBillingDay = Math.min(billingDay, 28);

// ✅ 複雑な型に型ドキュメント
/**
 * フィルター適用済みの取引一覧を返す
 * @param transactions - 全取引データ
 * @param filter - 適用するフィルター条件
 * @returns フィルター後の取引一覧 (変更不可)
 */
const applyFilter = (
  transactions: readonly Transaction[],
  filter: TransactionFilter,
): readonly Transaction[] => { /* ... */ };
```

---

## まとめ: 優先度別アクションプラン

### Phase 1 — 安定性 (最優先)
- [ ] `syncStorage.ts` の競合状態を修正 (書き込みキュー実装)
- [ ] `App.tsx` の初期化エラーハンドリング追加
- [ ] 全画面にエラーバウンダリを追加
- [ ] Zodによるストレージデータのスキーマバリデーション追加

### Phase 2 — 品質 (高優先度)
- [ ] `any`型の撤廃 (厳密な型定義に置換)
- [ ] React Hook Form + Zodでフォームバリデーション実装
- [ ] `console.log/warn`をロガーサービスに置換
- [ ] マジックナンバーを定数に抽出

### Phase 3 — 保守性 (中優先度)
- [ ] 500行超のコンポーネントをサブコンポーネントに分割
- [ ] デザインシステムカラーの定数化 (ハードコード撤廃)
- [ ] マイグレーション設計のリファクタリング
- [ ] Jest + RTLでドメインロジックのユニットテスト追加

### Phase 4 — 最適化 (低優先度)
- [ ] FlatListへの移行 (ScrollView → FlatList)
- [ ] React.memoで重いコンポーネントを最適化
- [ ] Haptic Feedbackの追加
- [ ] アクセシビリティ属性の完備

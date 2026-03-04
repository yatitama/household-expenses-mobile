import { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
  Users, Tag, CreditCard, Database, Wallet, Repeat2, PiggyBank,
  ChevronDown, ChevronUp, Plus, Trash2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../constants/colors';
import {
  accountService, transactionService, categoryService,
  memberService, paymentMethodService, recurringPaymentService,
  cardBillingService, linkedPaymentMethodService, savingsGoalService,
} from '../services/storage';
import { initializeDefaultData } from '../services/initialData';
import { getCategoryIcon } from '../utils/categoryIcons';
import { getSavingsGoalIcon } from '../utils/savingsGoalIcons';
import { ACCOUNT_TYPE_LABELS, PM_TYPE_LABELS } from '../components/accounts/constants';
import { ACCOUNT_TYPE_ICONS } from '../components/accounts/AccountIcons';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog';
import type {
  Member, Category, TransactionType,
  Account, PaymentMethod, RecurringPayment, SavingsGoal,
} from '../types';
import type { NavigationProp } from '@react-navigation/native';

export type SettingsStackParamList = {
  Settings: undefined;
  MemberDetail: { memberId?: string };
  CategoryDetail: { categoryId?: string };
  AccountDetail: { accountId?: string };
  PaymentMethodDetail: { paymentMethodId?: string };
  RecurringPaymentDetail: { recurringPaymentId?: string };
  SavingsGoalDetail: { savingsGoalId?: string };
};

const Section = ({
  title, icon, isOpen, onToggle, children, action,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <View className="bg-white dark:bg-slate-800 rounded-xl mb-3 overflow-hidden">
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center justify-between px-4 py-3.5"
    >
      <View className="flex-row items-center gap-2 flex-1">
        {icon}
        <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {action}
        {isOpen ? <ChevronUp size={16} color={COLORS_GRAY[400]} /> : <ChevronDown size={16} color={COLORS_GRAY[400]} />}
      </View>
    </TouchableOpacity>
    {isOpen && (
      <View className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 pt-3">
        {children}
      </View>
    )}
  </View>
);

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const [membersOpen, setMembersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);

  // メンバー
  const [members, setMembers] = useState<Member[]>(() => memberService.getAll());

  // カテゴリ
  const [categories, setCategories] = useState<Category[]>(() => categoryService.getAll());
  const [categoryType, setCategoryType] = useState<TransactionType>('expense');

  // 口座
  const [accounts, setAccounts] = useState<Account[]>(() => accountService.getAll());

  // カード（支払い手段）
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => paymentMethodService.getAll());

  // 定期取引
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(
    () => recurringPaymentService.getAll(),
  );

  // 貯金目標
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(
    () => savingsGoalService.getAll(),
  );

  // 確認ダイアログ
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: '', message: '', onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  useFocusEffect(
    useCallback(() => {
      setMembers(memberService.getAll());
      setCategories(categoryService.getAll());
      setAccounts(accountService.getAll());
      setPaymentMethods(paymentMethodService.getAll());
      setRecurringPayments(recurringPaymentService.getAll());
      setSavingsGoals(savingsGoalService.getAll());
      return () => {};
    }, []),
  );

  const handleDeleteMember = (id: string) => {
    showConfirm('メンバーを削除', `このメンバーを削除しますか？この操作は取り消せません。`, () => {
      memberService.delete(id);
      setMembers(memberService.getAll());
      Toast.show({ type: 'success', text1: 'メンバーを削除しました' });
    });
  };

  const handleDeleteCategory = (id: string) => {
    showConfirm('カテゴリを削除', 'このカテゴリを削除しますか？この操作は取り消せません。', () => {
      categoryService.delete(id);
      setCategories(categoryService.getAll());
      Toast.show({ type: 'success', text1: 'カテゴリを削除しました' });
    });
  };

  const handleDeleteAccount = (id: string) => {
    showConfirm('口座を削除', 'この口座を削除しますか？この操作は取り消せません。', () => {
      accountService.delete(id);
      setAccounts(accountService.getAll());
      Toast.show({ type: 'success', text1: '口座を削除しました' });
    });
  };

  const handleDeletePM = (id: string) => {
    showConfirm('カードを削除', 'このカードを削除しますか？この操作は取り消せません。', () => {
      paymentMethodService.delete(id);
      setPaymentMethods(paymentMethodService.getAll());
      Toast.show({ type: 'success', text1: 'カードを削除しました' });
    });
  };

  const handleDeleteRecurring = (id: string) => {
    showConfirm('定期取引を削除', 'この定期取引を削除しますか？この操作は取り消せません。', () => {
      recurringPaymentService.delete(id);
      setRecurringPayments(recurringPaymentService.getAll());
      Toast.show({ type: 'success', text1: '定期取引を削除しました' });
    });
  };

  const handleDeleteSavingsGoal = (id: string) => {
    showConfirm('貯金目標を削除', 'この貯金目標を削除しますか？この操作は取り消せません。', () => {
      savingsGoalService.delete(id);
      setSavingsGoals(savingsGoalService.getAll());
      Toast.show({ type: 'success', text1: '貯金目標を削除しました' });
    });
  };

  // --- 全データ削除 ---
  const handleDeleteAllData = () => {
    showConfirm(
      '全データを削除',
      'すべてのデータを削除します。この操作は取り消せません。',
      () => {
        accountService.getAll().forEach((a) => accountService.delete(a.id));
        transactionService.getAll().forEach((t) => transactionService.delete(t.id));
        categoryService.getAll().forEach((c) => categoryService.delete(c.id));
        memberService.getAll().filter((m) => !m.isDefault).forEach((m) => memberService.delete(m.id));
        paymentMethodService.getAll().forEach((p) => paymentMethodService.delete(p.id));
        recurringPaymentService.getAll().forEach((r) => recurringPaymentService.delete(r.id));
        cardBillingService.getAll().forEach((b) => cardBillingService.delete(b.id));
        linkedPaymentMethodService.getAll().forEach((l) => linkedPaymentMethodService.delete(l.id));
        savingsGoalService.getAll().forEach((g) => savingsGoalService.delete(g.id));
        initializeDefaultData();
        setMembers(memberService.getAll());
        setCategories(categoryService.getAll());
        setAccounts(accountService.getAll());
        setPaymentMethods(paymentMethodService.getAll());
        Toast.show({ type: 'success', text1: 'データを削除しました' });
      },
    );
  };

  const filteredCategories = categories.filter((c) => c.type === categoryType);
  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)),
    [accounts],
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <View className="px-4 pt-2 pb-3">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">設定</Text>
        </View>

        <View className="px-4 pt-4">
          {/* メンバー管理 */}
          <Section
            title="メンバー管理"
            icon={<Users size={16} color={COLORS_GRAY[500]} />}
            isOpen={membersOpen}
            onToggle={() => setMembersOpen(!membersOpen)}
            action={
              membersOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('MemberDetail', {});
                  }}
                  className="p-1"
                >
                  <Plus size={16} color={COLORS_GRAY[500]} />
                </TouchableOpacity>
              ) : undefined
            }
          >
            {members.map((m) => (
              <TouchableOpacity
                key={m.id}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                onPress={() => navigation.navigate('MemberDetail', { memberId: m.id })}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: m.color }}>
                  <Users size={14} color={COLORS_SEMANTIC.white} />
                </View>
                <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">{m.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => navigation.navigate('MemberDetail', {})}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color={COLORS_GRAY[500]} />
              <Text className="text-xs text-gray-500">メンバーを追加</Text>
            </TouchableOpacity>
          </Section>

          {/* カテゴリ管理 */}
          <Section
            title="カテゴリ管理"
            icon={<Tag size={16} color={COLORS_GRAY[500]} />}
            isOpen={categoriesOpen}
            onToggle={() => setCategoriesOpen(!categoriesOpen)}
            action={
              categoriesOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('CategoryDetail', {});
                  }}
                  className="p-1"
                >
                  <Plus size={16} color={COLORS_GRAY[500]} />
                </TouchableOpacity>
              ) : undefined
            }
          >
            <View className="flex-row gap-2 mb-3">
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setCategoryType(t)}
                  className={`px-3 py-1 rounded-full ${categoryType === t ? 'bg-gray-800' : 'bg-gray-100 dark:bg-slate-700'}`}
                >
                  <Text className={`text-xs font-medium ${categoryType === t ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {t === 'expense' ? '支出' : '収入'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700"
                onPress={() => navigation.navigate('CategoryDetail', { categoryId: cat.id })}
              >
                <View className="w-7 h-7 rounded-full items-center justify-center mr-3" style={{ backgroundColor: cat.color }}>
                  {getCategoryIcon(cat.icon ?? '', 13, COLORS_SEMANTIC.white)}
                </View>
                <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">{cat.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => navigation.navigate('CategoryDetail', {})}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color={COLORS_GRAY[500]} />
              <Text className="text-xs text-gray-500">カテゴリを追加</Text>
            </TouchableOpacity>
          </Section>

          {/* 口座管理 */}
          <Section
            title="口座管理"
            icon={<Wallet size={16} color={COLORS_GRAY[500]} />}
            isOpen={accountsOpen}
            onToggle={() => setAccountsOpen(!accountsOpen)}
            action={
              accountsOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('AccountDetail', {});
                  }}
                  className="p-1"
                >
                  <Plus size={16} color={COLORS_GRAY[500]} />
                </TouchableOpacity>
              ) : undefined
            }
          >
            {sortedAccounts.map((account) => {
              const member = members.find((m) => m.id === account.memberId);
              return (
                <TouchableOpacity
                  key={account.id}
                  className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  onPress={() => navigation.navigate('AccountDetail', { accountId: account.id })}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: account.color }}
                  >
                    {ACCOUNT_TYPE_ICONS[account.type]}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {ACCOUNT_TYPE_LABELS[account.type]}
                      {member ? ` · ${member.name}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountDetail', {})}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color={COLORS_GRAY[500]} />
              <Text className="text-xs text-gray-500">口座を追加</Text>
            </TouchableOpacity>
          </Section>

          {/* カード管理 */}
          <Section
            title="カード管理"
            icon={<CreditCard size={16} color={COLORS_GRAY[500]} />}
            isOpen={cardsOpen}
            onToggle={() => setCardsOpen(!cardsOpen)}
            action={
              cardsOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('PaymentMethodDetail', {});
                  }}
                  className="p-1"
                >
                  <Plus size={16} color={COLORS_GRAY[500]} />
                </TouchableOpacity>
              ) : undefined
            }
          >
            {paymentMethods.map((pm) => {
              const linkedAccount = accounts.find((a) => a.id === pm.linkedAccountId);
              const member = members.find((m) => m.id === pm.memberId);
              return (
                <TouchableOpacity
                  key={pm.id}
                  className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  onPress={() => navigation.navigate('PaymentMethodDetail', { paymentMethodId: pm.id })}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: pm.color }}
                  >
                    <CreditCard size={14} color={COLORS_SEMANTIC.white} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">{pm.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {PM_TYPE_LABELS[pm.type]}
                      {member ? ` · ${member.name}` : ''}
                      {linkedAccount ? ` · ${linkedAccount.name}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => navigation.navigate('PaymentMethodDetail', {})}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color={COLORS_GRAY[500]} />
              <Text className="text-xs text-gray-500">カードを追加</Text>
            </TouchableOpacity>
          </Section>

          {/* 定期取引管理 */}
          <Section
            title="定期取引管理"
            icon={<Repeat2 size={16} color={COLORS_GRAY[500]} />}
            isOpen={recurringOpen}
            onToggle={() => setRecurringOpen(!recurringOpen)}
            action={
              recurringOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('RecurringPaymentDetail', {});
                  }}
                  className="p-1"
                >
                  <Plus size={16} color={COLORS_GRAY[500]} />
                </TouchableOpacity>
              ) : undefined
            }
          >
            {recurringPayments.length === 0 ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400 py-3">
                定期取引が登録されていません
              </Text>
            ) : (
              recurringPayments.map((rp) => {
                const category = categories.find((c) => c.id === rp.categoryId);
                return (
                  <TouchableOpacity
                    key={rp.id}
                    className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    onPress={() => navigation.navigate('RecurringPaymentDetail', { recurringPaymentId: rp.id })}
                  >
                    {category && (
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: category.color }}
                      >
                        {getCategoryIcon(category.icon ?? '', 14, COLORS_SEMANTIC.white)}
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {rp.name}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        ¥{rp.amount.toLocaleString()}
                        {' · '}
                        {rp.periodValue}
                        {rp.periodType === 'months' ? 'ヶ月' : '日'}
                        に一回
                        {!rp.isActive && ' · 無効'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('RecurringPaymentDetail', {})}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color={COLORS_GRAY[500]} />
              <Text className="text-xs text-gray-500">定期取引を追加</Text>
            </TouchableOpacity>
          </Section>

          {/* 貯金管理 */}
          <Section
            title="貯金管理"
            icon={<PiggyBank size={16} color={COLORS_GRAY[500]} />}
            isOpen={savingsOpen}
            onToggle={() => setSavingsOpen(!savingsOpen)}
            action={
              savingsOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('SavingsGoalDetail', {});
                  }}
                  className="p-1"
                >
                  <Plus size={16} color={COLORS_GRAY[500]} />
                </TouchableOpacity>
              ) : undefined
            }
          >
            {savingsGoals.length === 0 ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400 py-3">
                貯金目標が登録されていません
              </Text>
            ) : (
              savingsGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  onPress={() => navigation.navigate('SavingsGoalDetail', { savingsGoalId: goal.id })}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: goal.color || '#3b82f6' }}
                  >
                    {getSavingsGoalIcon(goal.icon || 'PiggyBank', 14, COLORS_SEMANTIC.white)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {goal.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      目標: ¥{goal.targetAmount.toLocaleString()} ({goal.targetDate})
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('SavingsGoalDetail', {})}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color={COLORS_GRAY[500]} />
              <Text className="text-xs text-gray-500">貯金目標を追加</Text>
            </TouchableOpacity>
          </Section>

          {/* データ管理 */}
          <Section
            title="データ管理"
            icon={<Database size={16} color={COLORS_GRAY[500]} />}
            isOpen={dataOpen}
            onToggle={() => setDataOpen(!dataOpen)}
          >
            <TouchableOpacity
              onPress={handleDeleteAllData}
              className="flex-row items-center gap-2 py-2.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <Trash2 size={15} color={COLORS_SEMANTIC.danger500} />
              <Text className="text-sm text-red-600 dark:text-red-400 font-medium">全データを削除</Text>
            </TouchableOpacity>
          </Section>
        </View>
      </ScrollView>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmVariant="danger"
      />
    </View>
  );
};

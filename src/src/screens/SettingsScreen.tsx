import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users, Tag, CreditCard, Database, Wallet,
  ChevronDown, ChevronUp, Plus, Trash2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {
  accountService, transactionService, categoryService,
  memberService, paymentMethodService, recurringPaymentService,
  cardBillingService, linkedPaymentMethodService, savingsGoalService,
} from '../services/storage';
import { initializeDefaultData } from '../services/initialData';
import { getCategoryIcon } from '../utils/categoryIcons';
import { ACCOUNT_TYPE_LABELS, PM_TYPE_LABELS } from '../components/accounts/constants';
import { ACCOUNT_TYPE_ICONS } from '../components/accounts/AccountIcons';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog';
import { AccountModal } from '../components/accounts/modals/AccountModal';
import { PaymentMethodModal } from '../components/accounts/modals/PaymentMethodModal';
import { MemberModal } from '../components/settings/MemberModal';
import { CategoryModal } from '../components/settings/CategoryModal';
import type {
  Member, Category, TransactionType,
  Account, PaymentMethod,
  AccountInput, PaymentMethodInput,
  MemberInput, CategoryInput,
} from '../types';

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
        {isOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
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
  const [membersOpen, setMembersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);

  // メンバー
  const [members, setMembers] = useState<Member[]>(() => memberService.getAll());
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // カテゴリ
  const [categories, setCategories] = useState<Category[]>(() => categoryService.getAll());
  const [categoryType, setCategoryType] = useState<TransactionType>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // 口座
  const [accounts, setAccounts] = useState<Account[]>(() => accountService.getAll());
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // カード（支払い手段）
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => paymentMethodService.getAll());
  const [editingPM, setEditingPM] = useState<PaymentMethod | null>(null);
  const [isPMModalOpen, setIsPMModalOpen] = useState(false);

  // 確認ダイアログ
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: '', message: '', onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  // --- メンバー操作 ---
  const handleSaveMember = (input: MemberInput) => {
    if (editingMember) {
      memberService.update(editingMember.id, input);
      Toast.show({ type: 'success', text1: 'メンバーを更新しました' });
    } else {
      memberService.create(input);
      Toast.show({ type: 'success', text1: 'メンバーを追加しました' });
    }
    setMembers(memberService.getAll());
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    showConfirm('メンバーを削除', `このメンバーを削除しますか？この操作は取り消せません。`, () => {
      memberService.delete(id);
      setMembers(memberService.getAll());
      Toast.show({ type: 'success', text1: 'メンバーを削除しました' });
    });
  };

  // --- カテゴリ操作 ---
  const handleSaveCategory = (input: CategoryInput) => {
    if (editingCategory) {
      categoryService.update(editingCategory.id, input);
      Toast.show({ type: 'success', text1: 'カテゴリを更新しました' });
    } else {
      categoryService.create(input);
      Toast.show({ type: 'success', text1: 'カテゴリを追加しました' });
    }
    setCategories(categoryService.getAll());
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    showConfirm('カテゴリを削除', 'このカテゴリを削除しますか？この操作は取り消せません。', () => {
      categoryService.delete(id);
      setCategories(categoryService.getAll());
      Toast.show({ type: 'success', text1: 'カテゴリを削除しました' });
    });
  };

  // --- 口座操作 ---
  const handleSaveAccount = (input: AccountInput) => {
    if (editingAccount) {
      accountService.update(editingAccount.id, input);
      Toast.show({ type: 'success', text1: '口座を更新しました' });
    } else {
      accountService.create(input);
      Toast.show({ type: 'success', text1: '口座を追加しました' });
    }
    setAccounts(accountService.getAll());
    setIsAccountModalOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    showConfirm('口座を削除', 'この口座を削除しますか？この操作は取り消せません。', () => {
      accountService.delete(id);
      setAccounts(accountService.getAll());
      Toast.show({ type: 'success', text1: '口座を削除しました' });
    });
  };

  // --- カード（支払い手段）操作 ---
  const handleSavePM = (input: PaymentMethodInput) => {
    if (editingPM) {
      paymentMethodService.update(editingPM.id, input);
      Toast.show({ type: 'success', text1: 'カードを更新しました' });
    } else {
      paymentMethodService.create(input);
      Toast.show({ type: 'success', text1: 'カードを追加しました' });
    }
    setPaymentMethods(paymentMethodService.getAll());
    setIsPMModalOpen(false);
  };

  const handleDeletePM = (id: string) => {
    showConfirm('カードを削除', 'このカードを削除しますか？この操作は取り消せません。', () => {
      paymentMethodService.delete(id);
      setPaymentMethods(paymentMethodService.getAll());
      Toast.show({ type: 'success', text1: 'カードを削除しました' });
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

        <View className="px-4">
          {/* メンバー管理 */}
          <Section
            title="メンバー管理"
            icon={<Users size={16} color="#6b7280" />}
            isOpen={membersOpen}
            onToggle={() => setMembersOpen(!membersOpen)}
            action={
              membersOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setEditingMember(null);
                    setIsMemberModalOpen(true);
                  }}
                  className="p-1"
                >
                  <Plus size={16} color="#6b7280" />
                </TouchableOpacity>
              ) : undefined
            }
          >
            {members.map((m) => (
              <TouchableOpacity
                key={m.id}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                onPress={() => { setEditingMember(m); setIsMemberModalOpen(true); }}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: m.color }}>
                  <Users size={14} color="#fff" />
                </View>
                <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">{m.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => { setEditingMember(null); setIsMemberModalOpen(true); }}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color="#6b7280" />
              <Text className="text-xs text-gray-500">メンバーを追加</Text>
            </TouchableOpacity>
          </Section>

          {/* カテゴリ管理 */}
          <Section
            title="カテゴリ管理"
            icon={<Tag size={16} color="#6b7280" />}
            isOpen={categoriesOpen}
            onToggle={() => setCategoriesOpen(!categoriesOpen)}
            action={
              categoriesOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="p-1"
                >
                  <Plus size={16} color="#6b7280" />
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
                onPress={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
              >
                <View className="w-7 h-7 rounded-full items-center justify-center mr-3" style={{ backgroundColor: cat.color }}>
                  {getCategoryIcon(cat.icon ?? '', 13, '#fff')}
                </View>
                <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">{cat.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color="#6b7280" />
              <Text className="text-xs text-gray-500">カテゴリを追加</Text>
            </TouchableOpacity>
          </Section>

          {/* 口座管理 */}
          <Section
            title="口座管理"
            icon={<Wallet size={16} color="#6b7280" />}
            isOpen={accountsOpen}
            onToggle={() => setAccountsOpen(!accountsOpen)}
            action={
              accountsOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setEditingAccount(null);
                    setIsAccountModalOpen(true);
                  }}
                  className="p-1"
                >
                  <Plus size={16} color="#6b7280" />
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
                  onPress={() => { setEditingAccount(account); setIsAccountModalOpen(true); }}
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
              onPress={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color="#6b7280" />
              <Text className="text-xs text-gray-500">口座を追加</Text>
            </TouchableOpacity>
          </Section>

          {/* カード管理 */}
          <Section
            title="カード管理"
            icon={<CreditCard size={16} color="#6b7280" />}
            isOpen={cardsOpen}
            onToggle={() => setCardsOpen(!cardsOpen)}
            action={
              cardsOpen ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setEditingPM(null);
                    setIsPMModalOpen(true);
                  }}
                  className="p-1"
                >
                  <Plus size={16} color="#6b7280" />
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
                  onPress={() => { setEditingPM(pm); setIsPMModalOpen(true); }}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: pm.color }}
                  >
                    <CreditCard size={14} color="#fff" />
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
              onPress={() => { setEditingPM(null); setIsPMModalOpen(true); }}
              className="flex-row items-center gap-1 mt-3 py-1"
            >
              <Plus size={13} color="#6b7280" />
              <Text className="text-xs text-gray-500">カードを追加</Text>
            </TouchableOpacity>
          </Section>

          {/* データ管理 */}
          <Section
            title="データ管理"
            icon={<Database size={16} color="#6b7280" />}
            isOpen={dataOpen}
            onToggle={() => setDataOpen(!dataOpen)}
          >
            <TouchableOpacity
              onPress={handleDeleteAllData}
              className="flex-row items-center gap-2 py-2.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <Trash2 size={15} color="#ef4444" />
              <Text className="text-sm text-red-600 dark:text-red-400 font-medium">全データを削除</Text>
            </TouchableOpacity>
          </Section>
        </View>
      </ScrollView>

      {/* モーダル */}
      {isMemberModalOpen && (
        <MemberModal
          member={editingMember}
          onSave={handleSaveMember}
          onClose={() => setIsMemberModalOpen(false)}
          onDelete={handleDeleteMember}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onDelete={handleDeleteCategory}
          defaultType={categoryType}
        />
      )}

      {isAccountModalOpen && (
        <AccountModal
          account={editingAccount}
          members={members}
          onSave={handleSaveAccount}
          onClose={() => setIsAccountModalOpen(false)}
          onDelete={editingAccount ? (id) => {
            setIsAccountModalOpen(false);
            handleDeleteAccount(id);
          } : undefined}
        />
      )}

      {isPMModalOpen && (
        <PaymentMethodModal
          paymentMethod={editingPM}
          accounts={accounts}
          members={members}
          onSave={handleSavePM}
          onClose={() => setIsPMModalOpen(false)}
          onDelete={editingPM ? (id) => {
            setIsPMModalOpen(false);
            handleDeletePM(id);
          } : undefined}
        />
      )}

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

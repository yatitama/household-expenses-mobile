import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, DatePickerAndroid, Keyboard,
  useWindowDimensions,
} from 'react-native';
import DatePickerIOS from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { Wallet, CreditCard, ChevronDown, Check, Plus } from 'lucide-react-native';
import {
  accountService, transactionService, categoryService,
  paymentMethodService, quickAddTemplateService,
} from '../services/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DismissibleTextInput } from '../components/inputs/DismissibleTextInput';
import { QuickAddTemplateModal } from '../components/settings/QuickAddTemplateModal';
import type { TransactionType, TransactionInput, QuickAddTemplate, QuickAddTemplateInput } from '../types';
import type { ScrollView as RNScrollView } from 'react-native';

type TabType = TransactionType | 'transfer';

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const AddTransactionScreen = () => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<RNScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  // px-4 (16px × 2 = 32px) のコンテナ水平パディング + gap-2 (8px) × 2 列間 = 48px
  const gridItemWidth = (windowWidth - 48) / 3;
  const allAccounts = accountService.getAll();
  const allPaymentMethods = paymentMethodService.getAll();
  const categories = categoryService.getAll();

  const [tab, setTab] = useState<TabType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [memo, setMemo] = useState('');
  const [transferFromAccountId, setTransferFromAccountId] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(() => parseDate(format(new Date(), 'yyyy-MM-dd')));
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuickAddTemplate | null>(null);
  const [templates, setTemplates] = useState<QuickAddTemplate[]>(() => quickAddTemplateService.getAll());

  const type: TransactionType = tab === 'transfer' ? 'income' : tab;
  const filteredCategories = categories.filter((c) => c.type === type);

  const resetForm = (currentTab: TabType = 'expense') => {
    setTab(currentTab);
    setAmount('');
    setCategoryId('');
    setSelectedSourceId('');
    setMemo('');
    setTransferFromAccountId('');
    setTransferFee('');
  };

  const applyTemplate = (template: QuickAddTemplate) => {
    if (template.type === 'transfer') {
      setTab('transfer');
      setAmount(template.amount ? String(template.amount) : '');
      setTransferFromAccountId(template.fromAccountId || '');
      setSelectedSourceId(template.accountId || '');
      setTransferFee(template.fee ? String(template.fee) : '');
    } else {
      setTab(template.type);
      setAmount(template.amount ? String(template.amount) : '');
      setCategoryId(template.categoryId || '');
      setSelectedSourceId(template.accountId || template.paymentMethodId || '');
    }
  };

  const handleSaveTemplate = (input: QuickAddTemplateInput) => {
    if (editingTemplate) {
      quickAddTemplateService.update(editingTemplate.id, input);
    } else {
      quickAddTemplateService.create(input);
    }
    setTemplates(quickAddTemplateService.getAll());
    setShowTemplateModal(false);
    setEditingTemplate(null);
    Toast.show({ type: 'success', text1: editingTemplate ? 'テンプレートを更新しました' : 'テンプレートを作成しました' });
  };

  const handleDeleteTemplate = (id: string) => {
    quickAddTemplateService.delete(id);
    setTemplates(quickAddTemplateService.getAll());
    Toast.show({ type: 'success', text1: 'テンプレートを削除しました' });
  };

  const openDatePicker = () => {
    setPickerDate(parseDate(date));
    setShowDatePicker(true);
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setPickerDate(selectedDate);
      setDate(format(selectedDate, 'yyyy-MM-dd'));
      setShowDatePicker(false);
    }
  };

  const handleDateConfirm = () => {
    setDate(format(pickerDate, 'yyyy-MM-dd'));
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (Platform.OS === 'android' && showDatePicker) {
      DatePickerAndroid.open({
        date: new Date(date),
        mode: 'calendar',
      }).then(({ action, year, month, day }) => {
        if (action === DatePickerAndroid.dateSetAction) {
          setDate(format(new Date(year, month, day), 'yyyy-MM-dd'));
        }
        setShowDatePicker(false);
      }).catch(() => {
        setShowDatePicker(false);
      });
    }
  }, [showDatePicker]);

  const handleSubmit = () => {
    if (tab === 'transfer') {
      if (!amount || !transferFromAccountId || !selectedSourceId) {
        Toast.show({ type: 'error', text1: '金額、入金元、入金先を入力してください' });
        return;
      }
      if (transferFromAccountId === selectedSourceId) {
        Toast.show({ type: 'error', text1: '入金元と入金先は別の口座を選択してください' });
        return;
      }

      const parsedAmount = parseInt(amount, 10);
      const parsedFee = transferFee ? parseInt(transferFee, 10) : 0;
      const fromAccount = accountService.getById(transferFromAccountId);
      const toAccount = accountService.getById(selectedSourceId);

      if (!fromAccount || !toAccount) {
        Toast.show({ type: 'error', text1: '口座が見つかりません' });
        return;
      }

      accountService.update(transferFromAccountId, { balance: fromAccount.balance - parsedAmount - parsedFee });
      accountService.update(selectedSourceId, { balance: toAccount.balance + parsedAmount });

      if (parsedFee > 0) {
        const feeCategory = categories.find((c) => c.type === 'expense') ?? categories[0];
        if (feeCategory) {
          transactionService.create({
            type: 'expense',
            amount: parsedFee,
            categoryId: feeCategory.id,
            accountId: transferFromAccountId,
            date,
            memo: '振替手数料',
          });
        }
      }

      Toast.show({ type: 'success', text1: '振替を登録しました' });
      resetForm('transfer');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (!amount || !categoryId || !selectedSourceId) {
      Toast.show({ type: 'error', text1: '金額、カテゴリ、支払い元を入力してください' });
      return;
    }

    const parsedAmount = parseInt(amount, 10);
    const account = allAccounts.find((a) => a.id === selectedSourceId);
    const paymentMethod = allPaymentMethods.find((p) => p.id === selectedSourceId);

    const input: TransactionInput = {
      type,
      amount: parsedAmount,
      categoryId,
      accountId: account?.id || paymentMethod?.linkedAccountId || '',
      paymentMethodId: paymentMethod?.id,
      date,
      memo: memo || undefined,
    };

    transactionService.create(input);

    if (paymentMethod) {
      if (paymentMethod.billingType === 'immediate' && paymentMethod.linkedAccountId) {
        const linkedAccount = accountService.getById(paymentMethod.linkedAccountId);
        if (linkedAccount) {
          const newBalance = type === 'expense'
            ? linkedAccount.balance - parsedAmount
            : linkedAccount.balance + parsedAmount;
          accountService.update(paymentMethod.linkedAccountId, { balance: newBalance });
        }
        const allTx = transactionService.getAll();
        const lastTx = allTx[allTx.length - 1];
        if (lastTx) {
          transactionService.update(lastTx.id, { settledAt: new Date().toISOString() });
        }
      }
    } else if (account) {
      const newBalance = type === 'expense'
        ? account.balance - parsedAmount
        : account.balance + parsedAmount;
      accountService.update(account.id, { balance: newBalance });
    }

    Toast.show({ type: 'success', text1: '取引を追加しました' });
    resetForm();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const isSubmitDisabled = tab === 'transfer'
    ? !amount || !transferFromAccountId || !selectedSourceId
    : !amount || !categoryId || !selectedSourceId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-white dark:bg-slate-900"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">取引を追加</Text>
        </View>

        <View className="px-4 pt-4 gap-5">
          {/* タブ */}
          <View className="flex-row rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
            {(['expense', 'income', 'transfer'] as TabType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => { setTab(t); setCategoryId(''); setSelectedSourceId(''); }}
                className={`flex-1 py-2.5 items-center ${tab === t ? 'bg-gray-800 dark:bg-gray-600' : ''}`}
              >
                <Text className={`text-sm font-medium ${tab === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {t === 'expense' ? '支出' : t === 'income' ? '収入' : '振替'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* クイック入力テンプレート */}
          {templates.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">クイック入力</Text>
              <View className="flex-row flex-wrap gap-2 mx-0">
                {templates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => applyTemplate(template)}
                    onLongPress={() => { setEditingTemplate(template); setShowTemplateModal(true); }}
                    style={{ width: gridItemWidth }}
                    className="relative items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600"
                  >
                    <Text
                      className="text-xs text-gray-900 dark:text-gray-100 text-center"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* クイック入力を作成ボタン */}
          <TouchableOpacity
            onPress={() => { setEditingTemplate(null); setShowTemplateModal(true); }}
            className="flex-row items-center gap-2 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5"
          >
            <Plus size={16} color="#6b7280" />
            <Text className="text-sm text-gray-700 dark:text-gray-300">クイック入力を作成</Text>
          </TouchableOpacity>

          {/* 金額 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">金額</Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
              <Text className="text-gray-500 mr-1 text-base">¥</Text>
              <DismissibleTextInput
                className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* 日付 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">日付</Text>
            <TouchableOpacity
              onPress={openDatePicker}
              className="flex-row items-center justify-between bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-12"
            >
              <Text className="text-base text-gray-900 dark:text-gray-100">{date}</Text>
              <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>
            {Platform.OS === 'ios' && showDatePicker && (
              <View className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800">
                <View className="items-center">
                  <DatePickerIOS
                    value={pickerDate}
                    onChange={handleDateChange}
                    mode="date"
                    display="inline"
                    locale="ja-JP"
                  />
                </View>
              </View>
            )}
          </View>

          {tab !== 'transfer' ? (
            <>
              {/* カテゴリ */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">カテゴリ</Text>
                <View className="flex-row flex-wrap gap-2 mx-0">
                  {filteredCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={{ width: gridItemWidth }}
                      className={`relative items-center p-2 rounded-lg ${categoryId === cat.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <View className="mb-1">
                        {getCategoryIcon(cat.icon ?? '', 24, cat.color)}
                      </View>
                      <Text
                        className="text-xs text-gray-900 dark:text-gray-100 text-center"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {cat.name}
                      </Text>
                      {categoryId === cat.id && (
                        <View className="absolute top-0 right-0">
                          <Check size={12} color="#374151" strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 支払い元 */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">支払い元</Text>
                <View className="flex-row flex-wrap gap-2 mx-0">
                  {[
                    ...allAccounts.map((acc) => ({ id: acc.id, name: acc.name, color: acc.color, isAccount: true as const })),
                    ...allPaymentMethods.map((pm) => ({ id: pm.id, name: pm.name, color: pm.color, isAccount: false as const })),
                  ].map((src) => (
                    <TouchableOpacity
                      key={src.id}
                      onPress={() => setSelectedSourceId(src.id)}
                      style={{ width: gridItemWidth }}
                      className={`relative items-center p-2 rounded-lg ${selectedSourceId === src.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mb-1"
                        style={{ backgroundColor: src.color }}
                      >
                        {src.isAccount ? <Wallet size={16} color="#fff" /> : <CreditCard size={16} color="#fff" />}
                      </View>
                      <Text
                        className="text-xs text-gray-900 dark:text-gray-100 text-center"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {src.name}
                      </Text>
                      {selectedSourceId === src.id && (
                        <View className="absolute top-0 right-0">
                          <Check size={12} color="#374151" strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* 振替: 入金元 */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">入金元</Text>
                <View className="gap-2">
                  {allAccounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setTransferFromAccountId(acc.id)}
                      className={`flex-row items-center gap-2 px-3 py-2.5 rounded-lg border ${
                        transferFromAccountId === acc.id
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: acc.color }}>
                        <Wallet size={12} color="#fff" />
                      </View>
                      <Text className="text-sm text-gray-900 flex-1">{acc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 振替: 入金先 */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">入金先</Text>
                <View className="gap-2">
                  {allAccounts
                    .filter((a) => a.id !== transferFromAccountId)
                    .map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setSelectedSourceId(acc.id)}
                        className={`flex-row items-center gap-2 px-3 py-2.5 rounded-lg border ${
                          selectedSourceId === acc.id
                            ? 'border-gray-800 bg-gray-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: acc.color }}>
                          <Wallet size={12} color="#fff" />
                        </View>
                        <Text className="text-sm text-gray-900 flex-1">{acc.name}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* 振替手数料 */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">振替手数料（任意）</Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
                  <Text className="text-gray-500 mr-1 text-base">¥</Text>
                  <DismissibleTextInput
                    className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                    value={transferFee}
                    onChangeText={setTransferFee}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </>
          )}

          {/* メモ */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">メモ（任意）</Text>
            <DismissibleTextInput
              className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-3 text-gray-900 dark:text-gray-100"
              value={memo}
              onChangeText={setMemo}
              placeholder="メモを入力..."
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>

          {/* 追加ボタン */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            className={`py-3 rounded-lg items-center ${isSubmitDisabled ? 'bg-gray-300' : 'bg-gray-800'}`}
          >
            <Text className={`font-semibold text-sm ${isSubmitDisabled ? 'text-gray-500' : 'text-white'}`}>
              追加する
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* クイック入力テンプレートモーダル */}
      {showTemplateModal && (
        <QuickAddTemplateModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          onDelete={handleDeleteTemplate}
          defaultType={tab}
        />
      )}
    </KeyboardAvoidingView>
  );
};

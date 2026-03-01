import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, DatePickerAndroid, DatePickerIOS, Modal, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { Wallet, CreditCard, ChevronDown } from 'lucide-react-native';
import {
  accountService, transactionService, categoryService,
  paymentMethodService, quickAddTemplateService,
} from '../services/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import type { TransactionType, TransactionInput, QuickAddTemplate } from '../types';

type TabType = TransactionType | 'transfer';

export const AddTransactionScreen = () => {
  const insets = useSafeAreaInsets();
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

  const handleDateChange = (selectedDate: Date) => {
    setDate(format(selectedDate, 'yyyy-MM-dd'));
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
  };

  const isSubmitDisabled = tab === 'transfer'
    ? !amount || !transferFromAccountId || !selectedSourceId
    : !amount || !categoryId || !selectedSourceId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-white dark:bg-slate-900"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">取引を追加</Text>
        </View>

        <View className="p-4 gap-5">
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

          {/* 金額 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">金額</Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-12">
              <Text className="text-gray-500 mr-1 text-base">¥</Text>
              <TextInput
                className="flex-1 text-gray-900 dark:text-gray-100 text-base"
                style={{ textAlignVertical: 'center', includeFontPadding: false }}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>

          {/* 日付 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">日付</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-12"
            >
              <Text className="text-base text-gray-900 dark:text-gray-100">{date}</Text>
              <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <Modal
                transparent
                animationType="slide"
                visible={showDatePicker}
              >
                <View className="flex-1 bg-black/50 justify-end">
                  <View className="bg-white dark:bg-slate-800">
                    <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text className="text-blue-500">キャンセル</Text>
                      </TouchableOpacity>
                      <Text className="font-bold text-gray-900 dark:text-gray-100">日付を選択</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text className="text-blue-500">完了</Text>
                      </TouchableOpacity>
                    </View>
                    <DatePickerIOS
                      date={new Date(date)}
                      onDateChange={handleDateChange}
                      mode="date"
                      locale="ja-JP"
                    />
                  </View>
                </View>
              </Modal>
            )}
          </View>

          {tab !== 'transfer' ? (
            <>
              {/* カテゴリ */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">カテゴリ</Text>
                <View className="flex-row flex-wrap gap-3 justify-center">
                  {filteredCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      className="w-[30%]"
                    >
                      <View
                        className={`items-center p-2 rounded-lg border ${
                          categoryId === cat.id
                            ? 'border-gray-800 bg-gray-50 dark:bg-slate-700'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800'
                        }`}
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
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 支払い元 */}
              <View>
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">支払い元</Text>
                <View className="flex-row flex-wrap gap-3 justify-center">
                  {allAccounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setSelectedSourceId(acc.id)}
                      className="w-[30%]"
                    >
                      <View
                        className={`items-center p-2 rounded-lg border ${
                          selectedSourceId === acc.id
                            ? 'border-gray-800 bg-gray-50 dark:bg-slate-700'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <View
                          className="w-8 h-8 rounded-full items-center justify-center mb-1"
                          style={{ backgroundColor: acc.color }}
                        >
                          <Wallet size={16} color="#fff" />
                        </View>
                        <Text
                          className="text-xs text-gray-900 dark:text-gray-100 text-center"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {acc.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {allPaymentMethods.map((pm) => (
                    <TouchableOpacity
                      key={pm.id}
                      onPress={() => setSelectedSourceId(pm.id)}
                      className="w-[30%]"
                    >
                      <View
                        className={`items-center p-2 rounded-lg border ${
                          selectedSourceId === pm.id
                            ? 'border-gray-800 bg-gray-50 dark:bg-slate-700'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <View
                          className="w-8 h-8 rounded-full items-center justify-center mb-1"
                          style={{ backgroundColor: pm.color }}
                        >
                          <CreditCard size={16} color="#fff" />
                        </View>
                        <Text
                          className="text-xs text-gray-900 dark:text-gray-100 text-center"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {pm.name}
                        </Text>
                      </View>
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
                <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-12">
                  <Text className="text-gray-500 mr-1 text-base">¥</Text>
                  <TextInput
                    className="flex-1 text-gray-900 dark:text-gray-100 text-base"
                    style={{ textAlignVertical: 'center', includeFontPadding: false }}
                    value={transferFee}
                    onChangeText={setTransferFee}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              </View>
            </>
          )}

          {/* メモ */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">メモ（任意）</Text>
            <TextInput
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
    </KeyboardAvoidingView>
  );
};

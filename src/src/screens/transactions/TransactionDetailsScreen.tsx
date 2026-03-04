import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { revertTransactionBalance } from '../../components/accounts/balanceHelpers';
import { transactionService, categoryService, accountService, paymentMethodService } from '../../services/storage';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type { Transaction, Category, Account, PaymentMethod } from '../../types';
import type { TransactionDetailsScreenProps } from '../../navigation/types/navigation';

export const TransactionDetailsScreen = ({ navigation, route }: TransactionDetailsScreenProps) => {
  const insets = useSafeAreaInsets();
  const { transactionId } = route.params;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [category, setCategory] = useState<Category | undefined>();
  const [account, setAccount] = useState<Account | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load transaction data on focus
  useFocusEffect(
    useCallback(() => {
      const trans = transactionService.getById(transactionId);
      if (!trans) {
        Toast.show({ type: 'error', text1: '取引が見つかりません' });
        navigation.goBack();
        return;
      }

      setTransaction(trans);
      setCategory(categoryService.getById(trans.categoryId));
      setAccount(accountService.getById(trans.accountId));
      if (trans.paymentMethodId) {
        setPaymentMethod(paymentMethodService.getById(trans.paymentMethodId));
      }
    }, [transactionId, navigation])
  );

  // Set header actions
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center gap-2 mr-2">
          <TouchableOpacity
            onPress={() => {
              if (transaction) {
                // Navigate to edit screen (assuming there's an edit screen)
                Toast.show({ type: 'info', text1: '編集機能は準備中です' });
              }
            }}
            className="p-1"
          >
            <Pencil size={15} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDeleteDialog(true)}
            className="p-2 rounded-lg"
          >
            <Trash2 size={18} color={COLORS_SEMANTIC.danger500} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, transaction]);

  const handleConfirmDelete = () => {
    if (transaction) {
      revertTransactionBalance(transaction);
      transactionService.delete(transaction.id);
      Toast.show({ type: 'success', text1: '取引を削除しました' });
      navigation.goBack();
    }
  };

  if (!transaction) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500">取引を読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-4 py-4" style={{ paddingTop: insets.top + 16 }}>
            {/* カテゴリ */}
            <View className="flex-row items-center gap-4 mb-6">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: category?.color ?? COLORS_GRAY[400] }}
              >
                {getCategoryIcon(category?.icon ?? '', 20, COLORS_SEMANTIC.white)}
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">カテゴリ</Text>
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">{category?.name ?? '不明'}</Text>
              </View>
            </View>

            {/* 金額 */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">金額</Text>
              <Text
                className={`text-3xl font-bold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}
              >
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>

            {/* 日付 */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">日付</Text>
              <Text className="text-base font-medium text-gray-900 dark:text-gray-100">{formatDate(transaction.date.slice(0, 10))}</Text>
            </View>

            {/* 支払い元 */}
            {(account || paymentMethod) && (
              <View className="mb-6">
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">支払い元</Text>
                <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {paymentMethod?.name ?? account?.name ?? ''}
                </Text>
              </View>
            )}

            {/* メモ */}
            {transaction.memo && (
              <View className="mb-6">
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">メモ</Text>
                <Text className="text-base text-gray-900 dark:text-gray-100">{transaction.memo}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="取引を削除しますか？"
        message="この操作は取り消せません。"
        confirmText="削除"
      />
    </>
  );
};

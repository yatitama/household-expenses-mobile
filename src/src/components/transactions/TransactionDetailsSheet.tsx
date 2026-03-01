import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../feedback/ConfirmDialog';
import { revertTransactionBalance, transactionService } from '../../services/storage';
import type { Transaction } from '../../types';

interface TransactionDetailsSheetProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  category: { id: string; name: string; color: string; icon?: string; type: 'expense' | 'income' } | undefined;
  account: { id: string; name: string; balance: number; color: string } | undefined;
  paymentMethod: { id: string; name: string; linkedAccountId?: string } | undefined;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionDetailsSheet = ({
  transaction,
  isOpen,
  onClose,
  category,
  account,
  paymentMethod,
  onEdit,
}: TransactionDetailsSheetProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!transaction) return null;

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    revertTransactionBalance(transaction);
    transactionService.delete(transaction.id);
    Toast.show({ type: 'success', text1: '取引を削除しました' });
    onClose();
  };

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
          <View className="flex-1 px-4 py-4">
            {/* ヘッダー */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">取引詳細</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-gray-500 text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            {/* カテゴリ */}
            <View className="flex-row items-center mb-5">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: category?.color ?? '#9ca3af' }}
              >
                {getCategoryIcon(category?.icon ?? '', 20, '#fff')}
              </View>
              <View>
                <Text className="text-sm text-gray-500 dark:text-gray-400">カテゴリ</Text>
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">{category?.name ?? '不明'}</Text>
              </View>
            </View>

            {/* 金額 */}
            <View className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-5">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">金額</Text>
              <Text
                className={`text-3xl font-bold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}
              >
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>

            {/* 日付 */}
            <View className="mb-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">日付</Text>
              <Text className="text-base font-medium text-gray-900 dark:text-gray-100">{formatDate(transaction.date.slice(0, 10))}</Text>
            </View>

            {/* 支払い元 */}
            {(account || paymentMethod) && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">支払い元</Text>
                <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {paymentMethod?.name ?? account?.name ?? ''}
                </Text>
              </View>
            )}

            {/* メモ */}
            {transaction.memo && (
              <View className="mb-6">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">メモ</Text>
                <Text className="text-base text-gray-900 dark:text-gray-100">{transaction.memo}</Text>
              </View>
            )}

            {/* アクションボタン */}
            <View className="flex-row gap-3 mt-auto">
              <TouchableOpacity
                onPress={() => {
                  onEdit(transaction);
                  onClose();
                }}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-blue-500 rounded-lg"
              >
                <Pencil size={18} color="#fff" />
                <Text className="font-semibold text-white">編集</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteClick}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-red-500 rounded-lg"
              >
                <Trash2 size={18} color="#fff" />
                <Text className="font-semibold text-white">削除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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

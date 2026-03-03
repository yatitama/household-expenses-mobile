import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../feedback/ConfirmDialog';
import { revertTransactionBalance, transactionService } from '../../services/storage';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
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

  const headerAction = (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => {
          onEdit(transaction);
          onClose();
        }}
        className="p-1"
      >
        <Pencil size={15} color={COLORS_GRAY[400]} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDeleteClick}
        className="p-2 rounded-lg hover:bg-red-50 active:bg-red-100"
      >
        <Trash2 size={18} color={COLORS_SEMANTIC.danger500} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <ModalWrapper
        title="取引詳細"
        onClose={onClose}
        isForm
        visible={isOpen}
        headerAction={headerAction}
      >
        {/* カテゴリ */}
        <View className="flex-row items-center gap-lg mb-lg">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: category?.color ?? COLORS_GRAY[400] }}
          >
            {getCategoryIcon(category?.icon ?? '', 20, COLORS_SEMANTIC.white)}
          </View>
          <View>
            <Text className="text-label text-primary-600 dark:text-primary-400">カテゴリ</Text>
            <Text className="text-base font-semibold text-primary-900 dark:text-primary-50">{category?.name ?? '不明'}</Text>
          </View>
        </View>

        {/* 金額 */}
        <View className="bg-primary-50 dark:bg-primary-900 rounded-md p-lg mb-lg">
          <Text className="text-label text-primary-600 dark:text-primary-400 mb-sm">金額</Text>
          <Text
            className={`text-3xl font-bold ${transaction.type === 'expense' ? 'text-danger-500' : 'text-success-500'}`}
          >
            {transaction.type === 'expense' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        {/* 日付 */}
        <View className="mb-lg">
          <Text className="text-label text-primary-600 dark:text-primary-400 mb-sm">日付</Text>
          <Text className="text-base font-medium text-primary-900 dark:text-primary-50">{formatDate(transaction.date.slice(0, 10))}</Text>
        </View>

        {/* 支払い元 */}
        {(account || paymentMethod) && (
          <View className="mb-lg">
            <Text className="text-label text-primary-600 dark:text-primary-400 mb-sm">支払い元</Text>
            <Text className="text-base font-medium text-primary-900 dark:text-primary-50">
              {paymentMethod?.name ?? account?.name ?? ''}
            </Text>
          </View>
        )}

        {/* メモ */}
        {transaction.memo && (
          <View className="mb-2xl">
            <Text className="text-label text-primary-600 dark:text-primary-400 mb-sm">メモ</Text>
            <Text className="text-base text-primary-900 dark:text-primary-50">{transaction.memo}</Text>
          </View>
        )}
      </ModalWrapper>

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

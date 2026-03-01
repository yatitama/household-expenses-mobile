import { Animated, View, Text } from 'react-native';
import { useTransactionSwipe } from '../../hooks/useTransactionSwipe';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { formatCurrency } from '../../utils/formatters';
import type { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  category: { id: string; name: string; color: string; icon?: string; type: 'expense' | 'income' } | undefined;
  paymentMethod: { id: string; name: string; linkedAccountId?: string } | undefined;
  account: { id: string; name: string; balance: number; color: string } | undefined;
  isLast: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionItem = ({
  transaction: t,
  category: cat,
  paymentMethod: pm,
  account: acc,
  isLast,
  onEdit,
  onDelete,
}: TransactionItemProps) => {
  const { panHandlers, pan } = useTransactionSwipe({
    onSwipeLeft: () => onEdit(t),
    onSwipeRight: () => onDelete(t),
  });

  return (
    <Animated.View
      {...panHandlers}
      style={{ transform: [{ translateX: pan.x }] }}
      className={`flex-row items-center px-4 py-3 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
    >
      {/* カテゴリアイコン */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: cat?.color ?? '#9ca3af' }}
      >
        {getCategoryIcon(cat?.icon ?? '', 14, '#fff')}
      </View>
      {/* 情報 */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100" numberOfLines={1}>
          {cat?.name ?? '不明'}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {pm?.name ?? acc?.name ?? ''}
          {t.memo ? ` · ${t.memo}` : ''}
        </Text>
      </View>
      {/* 金額 */}
      <Text className={`text-sm font-semibold ${t.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
        {t.type === 'expense' ? '-' : '+'}
        {formatCurrency(t.amount)}
      </Text>
    </Animated.View>
  );
};

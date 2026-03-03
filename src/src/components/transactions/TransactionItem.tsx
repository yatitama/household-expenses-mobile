import { TouchableOpacity, View, Text } from 'react-native';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { formatCurrency } from '../../utils/formatters';
import type { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  category: { id: string; name: string; color: string; icon?: string; type: 'expense' | 'income' } | undefined;
  paymentMethod: { id: string; name: string; linkedAccountId?: string } | undefined;
  account: { id: string; name: string; balance: number; color: string } | undefined;
  isLast: boolean;
  onPress: (transaction: Transaction) => void;
}

export const TransactionItem = ({
  transaction: t,
  category: cat,
  paymentMethod: pm,
  account: acc,
  isLast,
  onPress,
}: TransactionItemProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(t)}
      className={`flex-row items-center px-lg py-lg ${!isLast ? 'border-b border-primary-100 dark:border-primary-800' : ''}`}
    >
      {/* カテゴリアイコン */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-md"
        style={{ backgroundColor: cat?.color ?? '#9ca3af' }}
      >
        {getCategoryIcon(cat?.icon ?? '', 14, '#fff')}
      </View>
      {/* 情報 */}
      <View className="flex-1 min-w-0">
        <Text className="text-base font-medium text-primary-900 dark:text-primary-100" numberOfLines={1}>
          {cat?.name ?? '不明'}
        </Text>
        <Text className="text-label text-primary-500 dark:text-primary-400" numberOfLines={1}>
          {pm?.name ?? acc?.name ?? ''}
          {t.memo ? ` · ${t.memo}` : ''}
        </Text>
      </View>
      {/* 金額 */}
      <Text className={`text-base font-semibold ${t.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
        {t.type === 'expense' ? '-' : '+'}
        {formatCurrency(t.amount)}
      </Text>
    </TouchableOpacity>
  );
};

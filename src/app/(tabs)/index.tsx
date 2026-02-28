import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useAppContext } from '@/context/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthTransactions = useMemo(() => {
    return state.transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [state.transactions, currentMonth]);

  const summary = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === 'expense') {
          acc.totalExpense += t.amount;
        } else {
          acc.totalIncome += t.amount;
        }
        return acc;
      },
      { totalExpense: 0, totalIncome: 0 }
    );
  }, [monthTransactions]);

  const sortedTransactions = [...monthTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    Alert.alert('削除してもよろしいですか？', '削除すると復元できません', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
      },
    ]);
  };

  const getCategory = (categoryId: string) => {
    return state.categories.find((c) => c.id === categoryId);
  };

  const getCategoryName = (categoryId: string) => {
    return getCategory(categoryId)?.name || '-';
  };

  const getCategoryColor = (categoryId: string) => {
    return getCategory(categoryId)?.color || '#999999';
  };

  const getCategoryIcon = (categoryId: string) => {
    return (getCategory(categoryId)?.icon || 'folder.fill') as any;
  };

  const getPaymentMethodName = (transaction: typeof state.transactions[0]) => {
    if (transaction.paymentMethodType === 'cash') {
      return '現金';
    }
    if (transaction.paymentMethodType === 'card') {
      return state.cards.find((c) => c.id === transaction.paymentMethodId)?.name || '-';
    }
    return state.accounts.find((a) => a.id === transaction.paymentMethodId)?.name || '-';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {currentMonth}
        </Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              収入
            </Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              ¥{summary.totalIncome.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              支出
            </Text>
            <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>
              ¥{summary.totalExpense.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              残額
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    summary.totalIncome - summary.totalExpense >= 0
                      ? '#4CAF50'
                      : '#FF6B6B',
                },
              ]}>
              ¥{(summary.totalIncome - summary.totalExpense).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          取引一覧 ({sortedTransactions.length})
        </Text>
        {sortedTransactions.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            取引がありません
          </Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={sortedTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.transactionItem,
                  {
                    backgroundColor: colors.background,
                    borderBottomColor: '#f0f0f0',
                  },
                ]}
                onLongPress={() => handleDelete(item.id)}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: getCategoryColor(item.categoryId) },
                  ]}
                />
                <View style={styles.transactionContent}>
                  <View style={styles.categoryRow}>
                    <IconSymbol
                      size={16}
                      name={getCategoryIcon(item.categoryId)}
                      color={getCategoryColor(item.categoryId)}
                    />
                    <Text style={[styles.transactionCategory, { color: colors.text }]}>
                      {getCategoryName(item.categoryId)}
                    </Text>
                  </View>
                  <Text style={[styles.transactionMethod, { color: colors.icon }]}>
                    {getPaymentMethodName(item)} • {item.date}
                  </Text>
                  {item.memo && (
                    <Text style={[styles.transactionMemo, { color: colors.icon }]}>
                      {item.memo}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: item.type === 'expense' ? '#FF6B6B' : '#4CAF50',
                    },
                  ]}>
                  {item.type === 'expense' ? '-' : '+'}¥{item.amount.toLocaleString()}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  listSection: {
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 24,
  },
  transactionItem: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: '600',
  },
  transactionMethod: {
    fontSize: 13,
    marginBottom: 2,
  },
  transactionMemo: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
});

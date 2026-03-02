import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { Search, List, Settings2 } from 'lucide-react-native';
import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { categoryService, accountService, paymentMethodService } from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatters';
import { DismissibleTextInput } from '../components/inputs/DismissibleTextInput';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { TransactionDetailsSheet } from '../components/transactions/TransactionDetailsSheet';
import { FilterModal } from '../components/transactions/FilterModal';
import type { Transaction } from '../types';

export const TransactionsScreen = () => {
  const insets = useSafeAreaInsets();
  const [, setFocused] = useState(false);
  const {
    filters,
    filteredTransactions,
    updateFilter,
    activeFilterCount,
    savedFilters,
    saveFilter,
    applySavedFilter,
    deleteSavedFilter,
  } = useTransactionFilter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
      };
    }, []),
  );

  const categories = categoryService.getAll();
  const accounts = accountService.getAll();
  const paymentMethods = paymentMethodService.getAll();

  // 日付でグループ化
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filteredTransactions) {
      const dateKey = t.date.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTransactions]);

  const totalExpense = useMemo(
    () => filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filteredTransactions],
  );
  const totalIncome = useMemo(
    () => filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [filteredTransactions],
  );

  const handleTransactionPress = (t: Transaction) => {
    setSelectedTransaction(t);
    setDetailsSheetOpen(true);
  };

  const handleEdit = (t: Transaction) => {
    // TODO: 編集画面への遷移、またはモーダルを開く
    console.log('Edit transaction:', t.id);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900" style={{ paddingTop: insets.top }}>
      {/* ヘッダー */}
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">履歴</Text>
          <TouchableOpacity
            onPress={() => setFilterModalOpen(true)}
            className="relative p-2"
          >
            <Settings2 size={20} color="#6b7280" />
            {activeFilterCount > 0 && (
              <View className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-white">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* 検索バー */}
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 gap-2">
          <Search size={16} color="#9ca3af" />
          <DismissibleTextInput
            className="flex-1 py-2.5 text-sm text-gray-900 dark:text-gray-100"
            placeholder="検索..."
            placeholderTextColor="#9ca3af"
            value={filters.searchQuery}
            onChangeText={(v) => updateFilter('searchQuery', v)}
          />
        </View>
      </View>

      {/* 合計 */}
      <View className="mx-4 mb-2 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 flex-row gap-6">
        <View>
          <Text className="text-xs text-gray-500">支出</Text>
          <Text className="text-sm font-bold text-red-500">{formatCurrency(totalExpense)}</Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">収入</Text>
          <Text className="text-sm font-bold text-green-500">{formatCurrency(totalIncome)}</Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">件数</Text>
          <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">{filteredTransactions.length}件</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        {grouped.length === 0 ? (
          <View className="items-center justify-center py-16">
            <List size={40} color="#d1d5db" />
            <Text className="text-gray-400 mt-3">取引がありません</Text>
          </View>
        ) : (
          grouped.map(([dateKey, txns]) => (
            <View key={dateKey} className="mb-1">
              {/* 日付ヘッダー */}
              <View className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800">
                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {formatDate(dateKey)}
                </Text>
              </View>
              {/* 取引リスト */}
              <View className="bg-white dark:bg-slate-900">
                {txns.map((t, idx) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const acc = accounts.find((a) => a.id === t.accountId);
                  const pm = paymentMethods.find((p) => p.id === t.paymentMethodId);
                  const isLast = idx === txns.length - 1;

                  return (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      category={cat}
                      paymentMethod={pm}
                      account={acc}
                      isLast={isLast}
                      onPress={handleTransactionPress}
                    />
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 詳細シート */}
      <TransactionDetailsSheet
        transaction={selectedTransaction}
        isOpen={detailsSheetOpen}
        onClose={() => {
          setDetailsSheetOpen(false);
          setSelectedTransaction(null);
        }}
        category={selectedTransaction ? categories.find((c) => c.id === selectedTransaction.categoryId) : undefined}
        account={selectedTransaction ? accounts.find((a) => a.id === selectedTransaction.accountId) : undefined}
        paymentMethod={selectedTransaction ? paymentMethods.find((p) => p.id === selectedTransaction.paymentMethodId) : undefined}
        onEdit={handleEdit}
      />

      {/* フィルターモーダル */}
      <FilterModal
        visible={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onFilterChange={updateFilter}
        categories={categories}
        accounts={accounts}
        paymentMethods={paymentMethods}
        savedFilters={savedFilters}
        onSaveFilter={saveFilter}
        onApplySavedFilter={applySavedFilter}
        onDeleteSavedFilter={deleteSavedFilter}
      />
    </View>
  );
};

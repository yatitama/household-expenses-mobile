import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Trash2 } from 'lucide-react-native';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import type { FilterOptions } from '../../hooks/useTransactionFilter';
import type { Category, Account, PaymentMethod, SavedFilter } from '../../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  categories: Category[];
  accounts: Account[];
  paymentMethods: PaymentMethod[];
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string) => void;
  onApplySavedFilter: (filterId: string) => void;
  onDeleteSavedFilter: (filterId: string) => void;
}

type PeriodType = 'thisMonth' | 'lastMonth' | '3months' | '6months' | '1year' | 'custom';

export const FilterModal = ({
  visible,
  onClose,
  filters,
  onFilterChange,
  categories,
  accounts,
  paymentMethods,
  savedFilters,
  onSaveFilter,
  onApplySavedFilter,
  onDeleteSavedFilter,
}: FilterModalProps) => {
  const insets = useSafeAreaInsets();
  const [saveFilterName, setSaveFilterName] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    period: true,
    transactionType: true,
    category: false,
    account: false,
    paymentMethod: false,
    savedFilters: false,
  });

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter((c) => c.type === 'income'), [categories]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getPeriodDates = (period: PeriodType) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
      case 'thisMonth':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        };
      case '3months':
        const threeMonthsAgo = subMonths(now, 2);
        return {
          start: format(startOfMonth(threeMonthsAgo), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case '6months':
        const sixMonthsAgo = subMonths(now, 5);
        return {
          start: format(startOfMonth(sixMonthsAgo), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case '1year':
        const oneYearAgo = subMonths(now, 11);
        return {
          start: format(startOfMonth(oneYearAgo), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      default:
        return { start: '', end: '' };
    }
  };

  const handleSetPeriod = (period: PeriodType) => {
    if (period === 'custom') {
      // Keep current values for custom
      return;
    }
    const dates = getPeriodDates(period);
    onFilterChange('dateRange', dates);
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter(saveFilterName.trim());
      setSaveFilterName('');
    }
  };

  const CategorySection = ({ title, cats }: { title: string; cats: Category[] }) => {
    if (cats.length === 0) return null;
    return (
      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{title}</Text>
        <View className="flex-row flex-wrap gap-2">
          {cats.map((cat) => {
            const isSelected = filters.categoryIds.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  const newIds = isSelected
                    ? filters.categoryIds.filter((id) => id !== cat.id)
                    : [...filters.categoryIds, cat.id];
                  onFilterChange('categoryIds', newIds);
                }}
                className={`px-3 py-1.5 rounded-full ${
                  isSelected
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const ToggleSection = ({ title, section, children }: { title: string; section: string; children: React.ReactNode }) => {
    const isExpanded = expandedSections[section];
    return (
      <View className="border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => toggleSection(section)}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</Text>
          <ChevronDown
            size={16}
            color="#6b7280"
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
        {isExpanded && <View className="px-4 pb-3">{children}</View>}
      </View>
    );
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="フィルター"
      isForm={true}
      footer={
        <View className="gap-2">
          <TouchableOpacity
            onPress={() => onFilterChange('dateRange', { start: '', end: '' })}
            className="bg-gray-200 dark:bg-gray-700 py-2 rounded-lg items-center justify-center"
          >
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">リセット</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="bg-blue-500 py-2 rounded-lg items-center justify-center"
          >
            <Text className="text-sm font-bold text-white">適用</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Section */}
        <ToggleSection title="期間" section="period">
          <View className="gap-2 mb-3">
            {[
              { label: '今月', value: 'thisMonth' as PeriodType },
              { label: '先月', value: 'lastMonth' as PeriodType },
              { label: '3ヶ月', value: '3months' as PeriodType },
              { label: '半年', value: '6months' as PeriodType },
              { label: '1年', value: '1year' as PeriodType },
            ].map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleSetPeriod(value)}
                className="py-2"
              >
                <Text className="text-sm text-gray-900 dark:text-gray-100">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Date Range */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 gap-2">
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">カスタム</Text>
            <View className="gap-2">
              <View>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">開始日</Text>
                <DismissibleTextInput
                  placeholder="yyyy-MM-dd"
                  placeholderTextColor="#9ca3af"
                  value={filters.dateRange.start}
                  onChangeText={(v) => onFilterChange('dateRange', { ...filters.dateRange, start: v })}
                  className="bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                />
              </View>
              <View>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">終了日</Text>
                <DismissibleTextInput
                  placeholder="yyyy-MM-dd"
                  placeholderTextColor="#9ca3af"
                  value={filters.dateRange.end}
                  onChangeText={(v) => onFilterChange('dateRange', { ...filters.dateRange, end: v })}
                  className="bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                />
              </View>
            </View>
          </View>
        </ToggleSection>

        {/* Transaction Type Section */}
        <ToggleSection title="取引種別" section="transactionType">
          <View className="flex-row gap-2">
            {[
              { label: 'すべて', value: 'all' as const },
              { label: '支出', value: 'expense' as const },
              { label: '収入', value: 'income' as const },
            ].map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => onFilterChange('transactionType', value)}
                className={`flex-1 py-2 rounded-lg items-center justify-center ${
                  filters.transactionType === value
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  filters.transactionType === value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ToggleSection>

        {/* Category Section */}
        <ToggleSection title="カテゴリ" section="category">
          <CategorySection title="支出" cats={expenseCategories} />
          <CategorySection title="収入" cats={incomeCategories} />
        </ToggleSection>

        {/* Account Section */}
        <ToggleSection title="口座" section="account">
          <View className="gap-2">
            {accounts.map((acc) => {
              const isSelected = filters.accountIds.includes(acc.id);
              return (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => {
                    const newIds = isSelected
                      ? filters.accountIds.filter((id) => id !== acc.id)
                      : [...filters.accountIds, acc.id];
                    onFilterChange('accountIds', newIds);
                  }}
                  className={`p-3 rounded-lg flex-row items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: acc.color }}
                  />
                  <Text className={`text-sm font-medium flex-1 ${
                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {acc.name}
                  </Text>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ToggleSection>

        {/* Payment Method Section */}
        <ToggleSection title="支払い手段" section="paymentMethod">
          <View className="gap-2">
            {paymentMethods.map((pm) => {
              const isSelected = filters.paymentMethodIds.includes(pm.id);
              return (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => {
                    const newIds = isSelected
                      ? filters.paymentMethodIds.filter((id) => id !== pm.id)
                      : [...filters.paymentMethodIds, pm.id];
                    onFilterChange('paymentMethodIds', newIds);
                  }}
                  className={`p-3 rounded-lg flex-row items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pm.color }}
                  />
                  <Text className={`text-sm font-medium flex-1 ${
                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {pm.name}
                  </Text>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ToggleSection>

        {/* Save Filter Section */}
        <View className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            フィルターを保存
          </Text>
          <View className="flex-row gap-2">
            <DismissibleTextInput
              placeholder="フィルター名"
              placeholderTextColor="#9ca3af"
              value={saveFilterName}
              onChangeText={setSaveFilterName}
              className="flex-1 bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
            />
            <TouchableOpacity
              onPress={handleSaveFilter}
              disabled={!saveFilterName.trim()}
              className="bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 px-4 py-2 rounded items-center justify-center"
            >
              <Text className="text-sm font-bold text-white">保存</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Filters Section */}
        {savedFilters.length > 0 && (
          <ToggleSection title="保存済みフィルター" section="savedFilters">
            <View className="gap-2">
              {savedFilters.map((filter) => (
                <View
                  key={filter.id}
                  className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex-row items-center justify-between"
                >
                  <TouchableOpacity
                    onPress={() => onApplySavedFilter(filter.id)}
                    className="flex-1"
                  >
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {filter.name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteSavedFilter(filter.id)}
                    className="p-1.5"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ToggleSection>
        )}
      </ScrollView>
    </ModalWrapper>
  );
};

import React, { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Trash2, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import Toast from 'react-native-toast-message';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import { accountService, categoryService, paymentMethodService } from '../../services/storage';
import { useTransactionFilterContext } from '../../contexts/TransactionFilterContext';
import type { FilterScreenProps } from '../../navigation/types/navigation';
import type { Category, Account, PaymentMethod } from '../../types';

type PeriodType = 'thisMonth' | 'lastMonth' | '3months' | '6months' | '1year' | 'custom';

export const FilterScreen = ({ navigation }: FilterScreenProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth = (windowWidth - 40) / 3;

  const { filters, updateFilter, activeFilterCount, savedFilters, saveFilter, applySavedFilter, deleteSavedFilter } = useTransactionFilterContext();

  const [saveFilterName, setSaveFilterName] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    period: true,
    transactionType: true,
    category: false,
    accountPaymentMethod: false,
    savedFilters: false,
  });
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      setCategories(categoryService.getAll());
      setAccounts(accountService.getAll());
      setPaymentMethods(paymentMethodService.getAll());
    }, [])
  );

  // Set header title with badge
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `フィルター${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`,
    });
  }, [navigation, activeFilterCount]);

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
      setShowCustomDateInput(!showCustomDateInput);
      if (showCustomDateInput) {
        setSelectedPeriod(null);
      } else {
        setSelectedPeriod('custom');
      }
      return;
    }

    if (selectedPeriod === period) {
      setSelectedPeriod(null);
      updateFilter('dateRange', { start: '', end: '' });
      setShowCustomDateInput(false);
    } else {
      setSelectedPeriod(period);
      setShowCustomDateInput(false);
      const dates = getPeriodDates(period);
      updateFilter('dateRange', dates);
    }
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      saveFilter(saveFilterName.trim());
      setSaveFilterName('');
      Toast.show({ type: 'success', text1: 'フィルターを保存しました' });
    }
  };

  const handleResetFilters = () => {
    setSelectedPeriod(null);
    setShowCustomDateInput(false);
    updateFilter('dateRange', { start: '', end: '' });
    updateFilter('categoryIds', []);
    updateFilter('transactionType', 'all');
    updateFilter('accountIds', []);
    updateFilter('paymentMethodIds', []);
    Toast.show({ type: 'success', text1: 'フィルターをリセットしました' });
  };

  const handleApply = () => {
    Toast.show({ type: 'success', text1: 'フィルターを適用しました' });
    navigation.goBack();
  };

  const CategorySection = ({ title, cats }: { title: string; cats: Category[] }) => {
    if (cats.length === 0) return null;
    return (
      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{title}</Text>
        <View style={{ margin: -12, marginBottom: 12 }}>
          <View className="flex-row flex-wrap px-3">
            {cats.map((cat) => {
              const isSelected = filters.categoryIds.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    const newIds = isSelected
                      ? filters.categoryIds.filter((id) => id !== cat.id)
                      : [...filters.categoryIds, cat.id];
                    updateFilter('categoryIds', newIds);
                  }}
                  style={{ width: gridItemWidth, marginBottom: 8 }}
                  className={`py-2.5 rounded-lg items-center justify-center mx-1 relative ${
                    isSelected
                      ? 'bg-gray-800 dark:bg-gray-700'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <View className="items-center gap-1">
                    {getCategoryIcon(cat.icon, 20, isSelected ? 'white' : cat.color)}
                    <Text className={`text-xs font-medium text-center ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {cat.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="absolute top-1 right-1 bg-gray-600 dark:bg-gray-600 rounded-full p-0.5">
                      <Check size={12} color="white" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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
            color={COLORS_GRAY[500]}
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
        {isExpanded && <View className="px-4 pb-3">{children}</View>}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Period Section */}
        <ToggleSection title="期間" section="period">
          <View style={{ margin: -12, marginBottom: 12 }}>
            <View className="flex-row flex-wrap px-3">
              {[
                { label: '今月', value: 'thisMonth' as PeriodType },
                { label: '先月', value: 'lastMonth' as PeriodType },
                { label: '3ヶ月', value: '3months' as PeriodType },
                { label: '半年', value: '6months' as PeriodType },
                { label: '1年', value: '1year' as PeriodType },
                { label: 'カスタム', value: 'custom' as PeriodType },
              ].map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleSetPeriod(value)}
                  style={{ width: gridItemWidth, marginBottom: 8 }}
                  className={`py-2.5 rounded-lg items-center justify-center mx-1 ${
                    selectedPeriod === value
                      ? 'bg-gray-800 dark:bg-gray-700'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedPeriod === value
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Date Range */}
          {showCustomDateInput && (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 gap-3">
              <View>
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">開始日</Text>
                <DismissibleTextInput
                  placeholder="yyyy-MM-dd"
                  placeholderTextColor={COLORS_GRAY[400]}
                  value={filters.dateRange.start}
                  onChangeText={(v) => updateFilter('dateRange', { ...filters.dateRange, start: v })}
                  className="bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                />
              </View>
              <View>
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">終了日</Text>
                <DismissibleTextInput
                  placeholder="yyyy-MM-dd"
                  placeholderTextColor={COLORS_GRAY[400]}
                  value={filters.dateRange.end}
                  onChangeText={(v) => updateFilter('dateRange', { ...filters.dateRange, end: v })}
                  className="bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                />
              </View>
            </View>
          )}
        </ToggleSection>

        {/* Transaction Type Section */}
        <ToggleSection title="取引種別" section="transactionType">
          <View style={{ margin: -12 }}>
            <View className="flex-row flex-wrap px-3">
              {[
                { label: 'すべて', value: 'all' as const },
                { label: '支出', value: 'expense' as const },
                { label: '収入', value: 'income' as const },
              ].map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => updateFilter('transactionType', value)}
                  style={{ width: gridItemWidth, marginBottom: 8 }}
                  className={`py-2.5 rounded-lg items-center justify-center mx-1 ${
                    filters.transactionType === value
                      ? 'bg-gray-800 dark:bg-gray-700'
                      : 'bg-gray-200 dark:bg-gray-600'
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
          </View>
        </ToggleSection>

        {/* Category Section */}
        <ToggleSection title="カテゴリ" section="category">
          {expenseCategories.length > 0 && <CategorySection title="支出" cats={expenseCategories} />}
          {incomeCategories.length > 0 && <CategorySection title="収入" cats={incomeCategories} />}
        </ToggleSection>

        {/* Account & Payment Method Section */}
        <ToggleSection title="口座・支払い手段" section="accountPaymentMethod">
          <View style={{ margin: -12 }}>
            <View className="flex-row flex-wrap px-3">
              {/* Accounts */}
              {accounts.map((acc) => {
                const isSelected = filters.accountIds.includes(acc.id);
                return (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => {
                      const newIds = isSelected
                        ? filters.accountIds.filter((id) => id !== acc.id)
                        : [...filters.accountIds, acc.id];
                      updateFilter('accountIds', newIds);
                    }}
                    style={{ width: gridItemWidth, marginBottom: 8 }}
                    className={`py-2.5 rounded-lg items-center justify-center mx-1 relative ${
                      isSelected
                        ? 'bg-gray-800 dark:bg-gray-700'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <View className="items-center gap-1">
                      <View
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: acc.color }}
                      />
                      <Text className={`text-xs font-medium text-center ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {acc.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="absolute top-1 right-1 bg-gray-600 dark:bg-gray-600 rounded-full p-0.5">
                        <Check size={12} color="white" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Payment Methods */}
              {paymentMethods.map((pm) => {
                const isSelected = filters.paymentMethodIds.includes(pm.id);
                return (
                  <TouchableOpacity
                    key={pm.id}
                    onPress={() => {
                      const newIds = isSelected
                        ? filters.paymentMethodIds.filter((id) => id !== pm.id)
                        : [...filters.paymentMethodIds, pm.id];
                      updateFilter('paymentMethodIds', newIds);
                    }}
                    style={{ width: gridItemWidth, marginBottom: 8 }}
                    className={`py-2.5 rounded-lg items-center justify-center mx-1 relative ${
                      isSelected
                        ? 'bg-gray-800 dark:bg-gray-700'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <View className="items-center gap-1">
                      <View
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: pm.color }}
                      />
                      <Text className={`text-xs font-medium text-center ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {pm.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="absolute top-1 right-1 bg-gray-600 dark:bg-gray-600 rounded-full p-0.5">
                        <Check size={12} color="white" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
              placeholderTextColor={COLORS_GRAY[400]}
              value={saveFilterName}
              onChangeText={setSaveFilterName}
              className="flex-1 bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
            />
            <TouchableOpacity
              onPress={handleSaveFilter}
              disabled={!saveFilterName.trim()}
              className="bg-gray-800 dark:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 px-4 py-2 rounded items-center justify-center"
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
                    onPress={() => {
                      applySavedFilter(filter.id);
                      Toast.show({ type: 'success', text1: 'フィルターを適用しました' });
                    }}
                    className="flex-1"
                  >
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {filter.name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deleteSavedFilter(filter.id);
                      Toast.show({ type: 'success', text1: 'フィルターを削除しました' });
                    }}
                    className="p-1.5"
                  >
                    <Trash2 size={16} color={COLORS_SEMANTIC.danger500} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ToggleSection>
        )}

        {/* Bottom padding for footer */}
        <View className="h-20" />
      </ScrollView>

      {/* Footer */}
      <View
        className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 gap-2"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleResetFilters}
          className="bg-gray-300 dark:bg-gray-700 py-2.5 rounded-lg items-center justify-center"
        >
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">リセット</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          className="bg-gray-800 dark:bg-gray-700 py-2.5 rounded-lg items-center justify-center"
        >
          <Text className="text-sm font-bold text-white">適用</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

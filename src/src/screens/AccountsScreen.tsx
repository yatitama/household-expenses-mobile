import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react-native';
import { format, subMonths, addMonths, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import type { NavigationProp } from '@react-navigation/native';

import {
  transactionService,
  categoryService,
  paymentMethodService,
  accountService,
} from '../services/storage';
import { formatCurrency } from '../utils/formatters';
import { getRecurringPaymentsForMonth } from '../utils/billingUtils';
import { getEffectiveRecurringAmount } from '../utils/savingsUtils';
import { useTransactionFilterContext } from '../contexts/TransactionFilterContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TrendPeriod = '3months' | '6months' | '1year';
type TrendType = 'net' | 'expense' | 'income';
type PieGroupMode = 'category' | 'payment' | 'account';

export const AccountsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();
  const { updateFilter } = useTransactionFilterContext();
  const now = useMemo(() => new Date(), []);

  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('6months');
  const [trendType, setTrendType] = useState<TrendType>('expense');
  const [pieYear, setPieYear] = useState(() => now.getFullYear());
  const [pieMonth, setPieMonth] = useState(() => now.getMonth() + 1);
  const [pieGroupMode, setPieGroupMode] = useState<PieGroupMode>('category');
  const [, setRefresh] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRefresh((prev) => !prev);
      return () => {};
    }, []),
  );

  const allTransactions = transactionService.getAll();
  const categories = categoryService.getAll();
  const paymentMethods = paymentMethodService.getAll();
  const accounts = accountService.getAll();

  // 月別データ
  const monthCount = trendPeriod === '3months' ? 3 : trendPeriod === '6months' ? 6 : 12;
  const trendData = useMemo(() => {
    const data = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStr = format(monthDate, 'yyyy-MM');
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthTxns = allTransactions.filter((t) => {
        const d = parseISO(t.date);
        return d >= start && d <= end;
      });

      const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      // 定期取引
      const recurring = getRecurringPaymentsForMonth(monthDate.getFullYear(), monthDate.getMonth() + 1);
      const recurringExpense = recurring.reduce((s, rp) => s + getEffectiveRecurringAmount(rp, monthStr), 0);
      const totalExpense = expense + recurringExpense;

      data.push({
        label: format(monthDate, 'M月'),
        income,
        expense: totalExpense,
        net: income - totalExpense,
      });
    }
    return data;
  }, [allTransactions, monthCount, now]);

  // 円グラフデータ
  const pieData = useMemo(() => {
    const selectedDate = new Date(pieYear, pieMonth - 1, 1);
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const monthTxns = allTransactions.filter((t) => {
      const d = parseISO(t.date);
      return t.type === 'expense' && d >= start && d <= end;
    });

    const map = new Map<string, { id: string; name: string; value: number; color: string }>();
    for (const t of monthTxns) {
      let key: string;
      let id: string;
      let name: string;
      let color: string;

      if (pieGroupMode === 'category') {
        const cat = categories.find((c) => c.id === t.categoryId);
        key = t.categoryId;
        id = t.categoryId;
        name = cat?.name ?? '不明';
        color = cat?.color ?? '#9ca3af';
      } else if (pieGroupMode === 'payment') {
        const pm = paymentMethods.find((p) => p.id === t.paymentMethodId);
        key = t.paymentMethodId ?? '__direct__';
        id = t.paymentMethodId ?? '__direct__';
        name = pm?.name ?? '直接支払い';
        color = pm?.color ?? '#9ca3af';
      } else {
        const acc = accounts.find((a) => a.id === t.accountId);
        key = t.accountId;
        id = t.accountId;
        name = acc?.name ?? '不明';
        color = acc?.color ?? '#9ca3af';
      }

      const existing = map.get(key);
      if (existing) {
        existing.value += t.amount;
      } else {
        map.set(key, { id, name, value: t.amount, color });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [allTransactions, pieYear, pieMonth, pieGroupMode, categories, paymentMethods, accounts]);

  const barData = useMemo(() => {
    return trendData.map((d) => ({
      value: trendType === 'income' ? d.income : trendType === 'expense' ? d.expense : Math.max(0, d.net),
      label: d.label,
      frontColor: trendType === 'income' ? '#22c55e' : trendType === 'expense' ? '#ef4444' : '#3b82f6',
    }));
  }, [trendData, trendType]);

  const totalExpense = useMemo(
    () => trendData.reduce((s, d) => s + d.expense, 0),
    [trendData],
  );
  const totalIncome = useMemo(
    () => trendData.reduce((s, d) => s + d.income, 0),
    [trendData],
  );

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 }}
    >
      {/* iOS Large Title (34pt) */}
      <View className="px-4 pb-2">
        <Text className="text-largeTitle font-bold text-gray-900 dark:text-gray-50">収支</Text>
      </View>

      {/* トレンドカード */}
      <View className="mx-4 mb-4 bg-white dark:bg-slate-800 rounded-xl p-4">
        {/* 期間選択 */}
        <View className="flex-row gap-2 mb-3">
          {(['3months', '6months', '1year'] as TrendPeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setTrendPeriod(p)}
              className={`px-3 py-1 rounded-full ${trendPeriod === p ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <Text className={`text-xs font-medium ${trendPeriod === p ? 'text-white' : 'text-gray-600'}`}>
                {p === '3months' ? '3ヶ月' : p === '6months' ? '6ヶ月' : '1年'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* タイプ選択 */}
        <View className="flex-row gap-2 mb-4">
          {(['expense', 'income', 'net'] as TrendType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTrendType(t)}
              className={`px-3 py-1 rounded-full ${trendType === t ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <Text className={`text-xs font-medium ${trendType === t ? 'text-white' : 'text-gray-600'}`}>
                {t === 'expense' ? '支出' : t === 'income' ? '収入' : '収支'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 合計 */}
        <View className="flex-row gap-4 mb-4">
          <View>
            <Text className="text-xs text-gray-500">合計支出</Text>
            <Text className="text-base font-bold text-red-500">{formatCurrency(totalExpense)}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">合計収入</Text>
            <Text className="text-base font-bold text-green-500">{formatCurrency(totalIncome)}</Text>
          </View>
        </View>

        {/* バーチャート */}
        {barData.length > 0 && (
          <BarChart
            data={barData}
            width={SCREEN_WIDTH - 80}
            height={160}
            barWidth={Math.max(8, (SCREEN_WIDTH - 100) / barData.length - 4)}
            spacing={4}
            noOfSections={4}
            barBorderRadius={3}
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            hideRules={false}
            rulesColor="#f3f4f6"
            yAxisColor="#e5e7eb"
            xAxisColor="#e5e7eb"
          />
        )}
      </View>

      {/* 円グラフカード */}
      <View className="mx-4 mb-4 bg-white dark:bg-slate-800 rounded-xl p-4">
        {/* 月選択 — 44pt minimum touch targets (iOS HIG) */}
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => {
              const d = subMonths(new Date(pieYear, pieMonth - 1, 1), 1);
              setPieYear(d.getFullYear());
              setPieMonth(d.getMonth() + 1);
            }}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {pieYear}年{pieMonth}月
          </Text>
          <TouchableOpacity
            onPress={() => {
              const d = addMonths(new Date(pieYear, pieMonth - 1, 1), 1);
              setPieYear(d.getFullYear());
              setPieMonth(d.getMonth() + 1);
            }}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* グループ選択 */}
        <View className="flex-row gap-2 mb-4">
          {(['category', 'payment', 'account'] as PieGroupMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setPieGroupMode(m)}
              className={`px-3 py-1 rounded-full ${pieGroupMode === m ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <Text className={`text-xs font-medium ${pieGroupMode === m ? 'text-white' : 'text-gray-600'}`}>
                {m === 'category' ? 'カテゴリ' : m === 'payment' ? '支払い' : '口座'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {pieData.length > 0 ? (
          <View className="items-center">
            <PieChart
              data={pieData.map((d) => ({
                value: d.value,
                color: d.color,
                text: '',
              }))}
              donut
              radius={80}
              innerRadius={50}
              centerLabelComponent={() => (
                <View className="items-center">
                  <Text className="text-xs text-gray-500">合計</Text>
                  <Text className="text-sm font-bold text-gray-900">{formatCurrency(pieTotal)}</Text>
                </View>
              )}
            />
            {/* 凡例 */}
            <View className="w-full mt-3 gap-1">
              {pieData.map((d) => (
                <View
                  key={d.id}
                  className="flex-row items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800"
                >
                  <View className="flex-row items-center gap-2 flex-1">
                    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <Text className="text-xs text-gray-700 dark:text-gray-300 flex-1">{d.name}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(d.value)}
                      <Text className="text-gray-400">
                        {' '}({pieTotal > 0 ? Math.round((d.value / pieTotal) * 100) : 0}%)
                      </Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        // 選択している月の開始日と終了日を計算
                        const selectedDate = new Date(pieYear, pieMonth - 1, 1);
                        const start = startOfMonth(selectedDate);
                        const end = endOfMonth(selectedDate);
                        const startStr = format(start, 'yyyy-MM-dd');
                        const endStr = format(end, 'yyyy-MM-dd');

                        // 日付フィルターを設定
                        updateFilter('dateRange', { start: startStr, end: endStr });

                        // カテゴリ・支払い方法・口座のフィルターを設定
                        if (pieGroupMode === 'category') {
                          updateFilter('categoryIds', [d.id]);
                        } else if (pieGroupMode === 'payment') {
                          updateFilter('paymentMethodIds', [d.id]);
                        } else {
                          updateFilter('accountIds', [d.id]);
                        }
                        navigation.navigate('Transactions');
                      }}
                      className="ml-2 p-1.5 rounded-lg active:bg-gray-200 dark:active:bg-slate-700"
                    >
                      <ArrowRight size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="items-center py-8">
            <Text className="text-gray-400">この月のデータがありません</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

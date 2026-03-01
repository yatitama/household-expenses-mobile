import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react-native';
import { memberService, accountService, paymentMethodService, savingsGoalService } from '../services/storage';
import { formatCurrency } from '../utils/formatters';
import { calculateAccumulatedAmount, toYearMonth } from '../utils/savingsUtils';
import { getPendingAmountByPaymentMethod } from '../utils/billingUtils';
import { ACCOUNT_TYPE_LABELS, PM_TYPE_LABELS } from '../components/accounts/constants';
import { ACCOUNT_TYPE_ICONS } from '../components/accounts/AccountIcons';

export const MoneyScreen = () => {
  const insets = useSafeAreaInsets();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const members = useMemo(() => memberService.getAll(), []);
  const accounts = useMemo(() => accountService.getAll(), []);
  const paymentMethods = useMemo(() => paymentMethodService.getAll(), []);

  const currentRealMonth = toYearMonth(new Date());
  const savingsGoals = savingsGoalService.getAll();
  const totalAccumulatedSavings = savingsGoals.reduce(
    (sum, goal) => sum + calculateAccumulatedAmount(goal, currentRealMonth),
    0,
  );

  const pendingByPM = getPendingAmountByPaymentMethod();

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)),
    [accounts],
  );

  const totalBalance = useMemo(
    () => sortedAccounts.reduce((s, a) => s + a.balance, 0) - totalAccumulatedSavings,
    [sortedAccounts, totalAccumulatedSavings],
  );

  const toggleExpand = (id: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        {/* ヘッダー */}
        <View className="px-4 pt-2 pb-3">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">お金</Text>
        </View>

        {/* 総資産カード */}
        <View className="mx-4 mb-4 bg-gray-800 rounded-xl p-4">
          <Text className="text-sm text-gray-400 mb-1">純資産（貯金除く）</Text>
          <Text className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</Text>
          {totalAccumulatedSavings > 0 && (
            <Text className="text-xs text-gray-400 mt-1">貯金: {formatCurrency(totalAccumulatedSavings)}</Text>
          )}
        </View>

        {/* 口座一覧 */}
        <View className="mx-4 mb-4 gap-2">
          {sortedAccounts.map((account) => {
            const member = members.find((m) => m.id === account.memberId);
            const linkedPMs = paymentMethods.filter((pm) => pm.linkedAccountId === account.id);
            const isExpanded = expandedAccounts.has(account.id);

            return (
              <View key={account.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                <TouchableOpacity
                  onPress={() => toggleExpand(account.id)}
                  className="flex-row items-center px-4 py-3"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: account.color }}
                  >
                    {ACCOUNT_TYPE_ICONS[account.type]}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{account.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {ACCOUNT_TYPE_LABELS[account.type]}
                      {member ? ` · ${member.name}` : ''}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                  {linkedPMs.length > 0 && (
                    isExpanded ? (
                      <ChevronUp size={16} color="#9ca3af" style={{ marginLeft: 8 }} />
                    ) : (
                      <ChevronDown size={16} color="#9ca3af" style={{ marginLeft: 8 }} />
                    )
                  )}
                </TouchableOpacity>

                {isExpanded && linkedPMs.length > 0 && (
                  <View className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700">
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 mb-1">紐づくカード</Text>
                    {linkedPMs.map((pm) => {
                      const pending = pendingByPM[pm.id] ?? 0;
                      return (
                        <View
                          key={pm.id}
                          className="flex-row items-center gap-2 py-1.5"
                        >
                          <View
                            className="w-7 h-7 rounded-full items-center justify-center"
                            style={{ backgroundColor: pm.color }}
                          >
                            <CreditCard size={13} color="#fff" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-xs font-medium text-gray-800 dark:text-gray-200">{pm.name}</Text>
                            <Text className="text-xs text-gray-400">{PM_TYPE_LABELS[pm.type]}</Text>
                          </View>
                          {pending > 0 && (
                            <Text className="text-xs font-medium text-red-500">
                              未精算: {formatCurrency(pending)}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* カード一覧（紐づいていない） */}
        {paymentMethods.filter((pm) => !pm.linkedAccountId).length > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">紐づきなしカード</Text>
            {paymentMethods
              .filter((pm) => !pm.linkedAccountId)
              .map((pm) => (
                <View
                  key={pm.id}
                  className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 mb-2 flex-row items-center gap-3"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: pm.color }}
                  >
                    <CreditCard size={18} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{pm.name}</Text>
                    <Text className="text-xs text-gray-400">{PM_TYPE_LABELS[pm.type]}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

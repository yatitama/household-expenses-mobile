import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { COLORS } from '../accounts/constants';
import { SAVINGS_GOAL_ICON_NAMES, getSavingsGoalIcon } from '../../utils/savingsGoalIcons';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import { getCurrentMonth } from '../../utils/savingsUtils';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type { SavingsGoal, SavingsGoalInput } from '../../types';

interface SavingsGoalModalProps {
  goal: SavingsGoal | null;
  onSave: (input: SavingsGoalInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const SavingsGoalModal = ({
  goal,
  onSave,
  onClose,
  onDelete,
}: SavingsGoalModalProps) => {
  const [name, setName] = useState(goal?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() ?? '');
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '');
  const [color, setColor] = useState(goal?.color ?? COLORS[14]); // デフォルトはブルー
  const [icon, setIcon] = useState(goal?.icon ?? 'PiggyBank');

  const handleSubmit = () => {
    if (!name.trim() || !targetAmount.trim() || !targetDate.trim()) return;

    const amount = parseInt(targetAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    // targetDate の形式チェック (yyyy-MM)
    if (!/^\d{4}-\d{2}$/.test(targetDate)) return;

    onSave({
      name: name.trim(),
      targetAmount: amount,
      targetDate,
      startMonth: goal?.startMonth ?? getCurrentMonth(),
      excludedMonths: goal?.excludedMonths ?? [],
      icon,
      color,
    });
  };

  const isValidDate = /^\d{4}-\d{2}$/.test(targetDate);

  return (
    <ModalWrapper
      title={goal ? '貯金目標を編集' : '貯金目標を追加'}
      onClose={onClose}
      isForm
      headerAction={
        goal && onDelete ? (
          <TouchableOpacity onPress={() => { onDelete(goal.id); onClose(); }} className="p-1">
            <Trash2 size={15} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : undefined
      }
      footer={
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full py-3 bg-gray-800 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-sm">保存</Text>
        </TouchableOpacity>
      }
    >
      <View className="gap-5">
        {/* 貯金名 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">貯金名</Text>
          <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={name}
              onChangeText={setName}
              placeholder="例: ディズニー旅行"
              placeholderTextColor={COLORS_GRAY[400]}
            />
          </View>
        </View>

        {/* 目標金額 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">目標金額</Text>
          <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
            <Text className="text-gray-600 dark:text-gray-400 mr-2">¥</Text>
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="150000"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* 目標期間 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">目標期間 (yyyy-MM)</Text>
          <View className={`bg-gray-50 dark:bg-slate-700 border rounded-lg px-3 flex-row items-center ${isValidDate || !targetDate ? 'border-gray-200 dark:border-gray-600' : 'border-red-500'}`}>
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="2026-08"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* アイコン */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">アイコン</Text>
          <View className="flex-row flex-wrap gap-2 justify-start">
            {SAVINGS_GOAL_ICON_NAMES.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: icon === iconName ? color : COLORS_GRAY[100],
                }}
              >
                {getSavingsGoalIcon(iconName, 16, icon === iconName ? COLORS_SEMANTIC.white : COLORS_GRAY[500])}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 色 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">色</Text>
          <View className="flex-row flex-wrap gap-2 justify-start">
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                className="w-8 h-8 rounded-full relative"
                style={{
                  backgroundColor: c,
                }}
              >
                {color === c && (
                  <View className="absolute inset-0 rounded-full items-center justify-center bg-black/40">
                    <Check size={12} color="white" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ModalWrapper>
  );
};

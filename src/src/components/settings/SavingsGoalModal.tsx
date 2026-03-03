import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { Button } from '../ui/Button';
import { COLORS } from '../accounts/constants';
import { SAVINGS_GOAL_ICON_NAMES, getSavingsGoalIcon } from '../../utils/savingsGoalIcons';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import { getCurrentMonth } from '../../utils/savingsUtils';
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
            <Trash2 size={15} color="#9ca3af" />
          </TouchableOpacity>
        ) : undefined
      }
      footer={
        <Button variant="primary" size="lg" onPress={handleSubmit}>
          保存
        </Button>
      }
    >
      <View className="gap-lg">
        {/* 貯金名 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">貯金名</Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={name}
              onChangeText={setName}
              placeholder="例: ディズニー旅行"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 目標金額 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">目標金額</Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <Text className="text-primary-600 dark:text-primary-400 mr-sm">¥</Text>
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
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
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">目標期間 (yyyy-MM)</Text>
          <View className={`bg-primary-50 dark:bg-primary-700 border rounded-md px-md flex-row items-center ${isValidDate || !targetDate ? 'border-primary-200 dark:border-primary-600' : 'border-red-500'}`}>
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="2026-08"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* アイコン */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">アイコン</Text>
          <View className="flex-row flex-wrap gap-sm justify-start">
            {SAVINGS_GOAL_ICON_NAMES.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
                className="w-9 h-9 rounded-md items-center justify-center"
                style={{
                  backgroundColor: icon === iconName ? color : '#f3f4f6',
                }}
              >
                {getSavingsGoalIcon(iconName, 16, icon === iconName ? '#fff' : '#6b7280')}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 色 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">色</Text>
          <View className="flex-row flex-wrap gap-sm justify-start">
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

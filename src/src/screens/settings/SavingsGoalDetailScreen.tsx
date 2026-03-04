import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { savingsGoalService } from '../../services/storage';
import { COLORS } from '../../components/accounts/constants';
import { SAVINGS_GOAL_ICON_NAMES, getSavingsGoalIcon } from '../../utils/savingsGoalIcons';
import { getCurrentMonth } from '../../utils/savingsUtils';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type { SavingsGoal, SavingsGoalInput } from '../../types';
import type { SavingsGoalDetailScreenProps } from '../../navigation/types/navigation';

export const SavingsGoalDetailScreen = ({
  navigation,
  route,
}: SavingsGoalDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const savingsGoalId = route.params?.savingsGoalId;
  const isEditMode = !!savingsGoalId;

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(COLORS[14]);
  const [icon, setIcon] = useState('PiggyBank');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load savings goal data
  useFocusEffect(
    useCallback(() => {
      if (isEditMode && savingsGoalId) {
        const data = savingsGoalService.getById(savingsGoalId);
        if (data) {
          setGoal(data);
          setName(data.name);
          setTargetAmount(data.targetAmount.toString());
          setTargetDate(data.targetDate);
          setColor(data.color);
          setIcon(data.icon);
        }
        setIsLoading(false);
      }
    }, [savingsGoalId, isEditMode])
  );

  // Update header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? '貯金目標を編集' : '貯金目標を追加',
      headerRight: () =>
        goal ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="pr-4">
            <Trash2 size={18} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isEditMode, goal]);

  const isValidDate = /^\d{4}-\d{2}$/.test(targetDate);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: '貯金名を入力してください' });
      return;
    }

    if (!targetAmount.trim()) {
      Toast.show({ type: 'error', text1: '目標金額を入力してください' });
      return;
    }

    if (!targetDate.trim()) {
      Toast.show({ type: 'error', text1: '目標期間を入力してください' });
      return;
    }

    const amount = parseInt(targetAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Toast.show({ type: 'error', text1: '目標金額は0より大きい値を入力してください' });
      return;
    }

    if (!isValidDate) {
      Toast.show({ type: 'error', text1: '目標期間は yyyy-MM 形式で入力してください' });
      return;
    }

    const input: SavingsGoalInput = {
      name: name.trim(),
      targetAmount: amount,
      targetDate,
      startMonth: goal?.startMonth ?? getCurrentMonth(),
      excludedMonths: goal?.excludedMonths ?? [],
      icon,
      color,
    };

    try {
      if (isEditMode && goal) {
        savingsGoalService.update(goal.id, input);
        Toast.show({ type: 'success', text1: '貯金目標を更新しました' });
      } else {
        savingsGoalService.create(input);
        Toast.show({ type: 'success', text1: '貯金目標を追加しました' });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '保存に失敗しました',
        text2: error instanceof Error ? error.message : '不明なエラーが発生しました',
      });
    }
  };

  const handleDelete = () => {
    if (!goal) return;
    try {
      savingsGoalService.delete(goal.id);
      Toast.show({ type: 'success', text1: '貯金目標を削除しました' });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '削除に失敗しました',
        text2: error instanceof Error ? error.message : '不明なエラーが発生しました',
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
        <Text className="text-gray-900 dark:text-gray-100">読み込み中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-900" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        className="flex-1 px-4 py-4"
      >
        <View className="gap-5">
          {/* 貯金名 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              貯金名
            </Text>
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
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              目標金額
            </Text>
            <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400 mr-2">¥</Text>
              <DismissibleTextInput
                className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="150000"
                placeholderTextColor={COLORS_GRAY[400]}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* 目標期間 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              目標期間 (yyyy-MM)
            </Text>
            <View
              className={`bg-gray-50 dark:bg-slate-700 border rounded-lg px-3 flex-row items-center ${
                isValidDate || !targetDate
                  ? 'border-gray-200 dark:border-gray-600'
                  : 'border-red-500'
              }`}
            >
              <DismissibleTextInput
                className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="2026-08"
                placeholderTextColor={COLORS_GRAY[400]}
              />
            </View>
          </View>

          {/* アイコン */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              アイコン
            </Text>
            <View className="flex-row flex-wrap gap-2 justify-start">
              {SAVINGS_GOAL_ICON_NAMES.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setIcon(iconName)}
                  className="w-9 h-9 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor:
                      icon === iconName ? color : COLORS_GRAY[100],
                  }}
                >
                  {getSavingsGoalIcon(
                    iconName,
                    16,
                    icon === iconName
                      ? COLORS_SEMANTIC.white
                      : COLORS_GRAY[500]
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 色 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              色
            </Text>
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
      </ScrollView>

      {/* Footer - Save button */}
      <View
        className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 px-4 py-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSave}
          className="w-full py-3 bg-gray-800 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-sm">保存</Text>
        </TouchableOpacity>
      </View>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="貯金目標を削除"
        message="この貯金目標を削除しますか？この操作は取り消せません。"
        confirmVariant="danger"
      />
    </View>
  );
};

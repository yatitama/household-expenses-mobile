import { useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Check, CreditCard } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import {
  recurringPaymentService,
  categoryService,
  paymentMethodService,
} from '../../services/storage';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type {
  RecurringPayment,
  RecurringPaymentInput,
  TransactionType,
  Category,
  PaymentMethod,
} from '../../types';
import type { RecurringPaymentDetailScreenProps } from '../../navigation/types/navigation';

export const RecurringPaymentDetailScreen = ({
  navigation,
  route,
}: RecurringPaymentDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const recurringPaymentId = route.params?.recurringPaymentId;
  const isEditMode = !!recurringPaymentId;

  const [recurringPayment, setRecurringPayment] = useState<RecurringPayment | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [periodType, setPeriodType] = useState<'months' | 'days'>('months');
  const [periodValue, setPeriodValue] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const gridItemWidth = useMemo(() => (windowWidth - 48) / 4, [windowWidth]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  // Load recurring payment, categories and payment methods data
  useFocusEffect(
    useCallback(() => {
      try {
        const loadedCategories = categoryService.getAll();
        const loadedPaymentMethods = paymentMethodService.getAll();
        setCategories(loadedCategories);
        setPaymentMethods(loadedPaymentMethods);

        if (isEditMode && recurringPaymentId) {
          const data = recurringPaymentService.getById(recurringPaymentId);
          if (data) {
            setRecurringPayment(data);
            setName(data.name);
            setAmount(data.amount.toString());
            setType(data.type);
            setCategoryId(data.categoryId || '');
            setPaymentMethodId(data.paymentMethodId || '');
            setPeriodType(data.periodType);
            setPeriodValue(data.periodValue.toString());
            setStartDate(data.startDate);
            setEndDate(data.endDate || '');
            setIsActive(data.isActive);
          }
        }
        setIsLoading(false);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'データ読み込みエラー',
          text2: error instanceof Error ? error.message : '不明なエラーが発生しました',
        });
        setIsLoading(false);
      }
    }, [recurringPaymentId, isEditMode])
  );

  // Update header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? '定期取引を編集' : '定期取引を追加',
      headerRight: () =>
        recurringPayment ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="pr-4">
            <Trash2 size={18} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isEditMode, recurringPayment]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: '名前を入力してください' });
      return;
    }

    if (!amount.trim()) {
      Toast.show({ type: 'error', text1: '金額を入力してください' });
      return;
    }

    const input: RecurringPaymentInput = {
      name: name.trim(),
      amount: Number(amount),
      type,
      periodType,
      periodValue: Number(periodValue),
      startDate,
      endDate: endDate || undefined,
      isActive,
      categoryId: categoryId || undefined,
      paymentMethodId: paymentMethodId || undefined,
    };

    try {
      if (isEditMode && recurringPayment) {
        recurringPaymentService.update(recurringPayment.id, input);
        Toast.show({ type: 'success', text1: '定期取引を更新しました' });
      } else {
        recurringPaymentService.create(input);
        Toast.show({ type: 'success', text1: '定期取引を追加しました' });
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
    if (!recurringPayment) return;
    try {
      recurringPaymentService.delete(recurringPayment.id);
      Toast.show({ type: 'success', text1: '定期取引を削除しました' });
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
          {/* 種類（支出/収入） */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              種類
            </Text>
            <View className="flex-row rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    setType(t);
                    setCategoryId('');
                  }}
                  className={`flex-1 py-2.5 items-center ${
                    type === t ? 'bg-gray-800 dark:bg-gray-600' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t === 'expense' ? '支出' : '収入'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 名前 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              名前
            </Text>
            <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
              <DismissibleTextInput
                className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                value={name}
                onChangeText={setName}
                placeholder="例: 家賃, 携帯料金, Netflix"
                placeholderTextColor={COLORS_GRAY[400]}
              />
            </View>
          </View>

          {/* 金額 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              金額
            </Text>
            <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400">¥</Text>
              <DismissibleTextInput
                className="flex-1 py-2.5 ml-1 text-gray-900 dark:text-gray-100"
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={COLORS_GRAY[400]}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* カテゴリ */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              カテゴリ
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {filteredCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={{ width: gridItemWidth }}
                  className={`relative items-center p-2 rounded-lg ${
                    categoryId === cat.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <View className="mb-1">
                    {getCategoryIcon(cat.icon ?? '', 24, cat.color)}
                  </View>
                  <Text
                    className="text-xs text-gray-900 dark:text-gray-100 text-center"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {cat.name}
                  </Text>
                  {categoryId === cat.id && (
                    <View className="absolute top-0 right-0">
                      <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 支払い手段（オプション） */}
          {paymentMethods.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
                支払い手段（任意）
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  key="none"
                  onPress={() => setPaymentMethodId('')}
                  style={{ width: gridItemWidth }}
                  className={`relative items-center p-2 rounded-lg ${
                    paymentMethodId === '' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <View className="w-8 h-8 rounded-full items-center justify-center mb-1 bg-gray-300 dark:bg-gray-500">
                    <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      -
                    </Text>
                  </View>
                  <Text
                    className="text-xs text-gray-900 dark:text-gray-100 text-center"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    指定しない
                  </Text>
                  {paymentMethodId === '' && (
                    <View className="absolute top-0 right-0">
                      <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
                {paymentMethods.map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    onPress={() => setPaymentMethodId(pm.id)}
                    style={{ width: gridItemWidth }}
                    className={`relative items-center p-2 rounded-lg ${
                      paymentMethodId === pm.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mb-1"
                      style={{ backgroundColor: pm.color }}
                    >
                      <CreditCard size={16} color={COLORS_SEMANTIC.white} />
                    </View>
                    <Text
                      className="text-xs text-gray-900 dark:text-gray-100 text-center"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {pm.name}
                    </Text>
                    {paymentMethodId === pm.id && (
                      <View className="absolute top-0 right-0">
                        <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 頻度 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              頻度
            </Text>
            <View className="flex-row gap-2 items-center">
              <View className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
                <DismissibleTextInput
                  className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                  value={periodValue}
                  onChangeText={(text) => setPeriodValue(text.replace(/[^0-9]/g, '') || '1')}
                  placeholder="1"
                  placeholderTextColor={COLORS_GRAY[400]}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
                <TouchableOpacity
                  onPress={() =>
                    setPeriodType(periodType === 'months' ? 'days' : 'months')
                  }
                  className="py-2.5"
                >
                  <Text className="text-sm text-gray-900 dark:text-gray-100">
                    {periodType === 'months' ? 'ヶ月' : '日'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 開始日 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              開始日
            </Text>
            <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
              <DismissibleTextInput
                className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS_GRAY[400]}
              />
            </View>
          </View>

          {/* 終了日 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              終了日（任意）
            </Text>
            <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
              <DismissibleTextInput
                className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS_GRAY[400]}
              />
            </View>
          </View>

          {/* 有効/無効 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              ステータス
            </Text>
            <View className="flex-row rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
              {[
                { label: '有効', value: true },
                { label: '無効', value: false },
              ].map((option) => (
                <TouchableOpacity
                  key={String(option.value)}
                  onPress={() => setIsActive(option.value)}
                  className={`flex-1 py-2.5 items-center ${
                    isActive === option.value ? 'bg-gray-800 dark:bg-gray-600' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isActive === option.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </Text>
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
        title="定期取引を削除"
        message="この定期取引を削除しますか？この操作は取り消せません。"
        confirmVariant="danger"
      />
    </View>
  );
};

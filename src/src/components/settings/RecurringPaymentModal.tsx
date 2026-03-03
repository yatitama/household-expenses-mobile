import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { Trash2, Check, Wallet, CreditCard } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type {
  RecurringPayment, RecurringPaymentInput, TransactionType, Category, PaymentMethod,
} from '../../types';

interface RecurringPaymentModalProps {
  recurringPayment: RecurringPayment | null;
  onSave: (input: RecurringPaymentInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export const RecurringPaymentModal = ({
  recurringPayment,
  onSave,
  onClose,
  onDelete,
  categories,
  paymentMethods,
}: RecurringPaymentModalProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const [name, setName] = useState(recurringPayment?.name ?? '');
  const [amount, setAmount] = useState(recurringPayment?.amount.toString() ?? '');
  const [type, setType] = useState<TransactionType>(recurringPayment?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState(recurringPayment?.categoryId ?? '');
  const [paymentMethodId, setPaymentMethodId] = useState(
    recurringPayment?.paymentMethodId ?? '',
  );
  const [periodType, setPeriodType] = useState<'months' | 'days'>(
    recurringPayment?.periodType ?? 'months',
  );
  const [periodValue, setPeriodValue] = useState(
    recurringPayment?.periodValue.toString() ?? '1',
  );
  const [startDate, setStartDate] = useState(
    recurringPayment?.startDate ?? new Date().toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState(recurringPayment?.endDate ?? '');
  const [isActive, setIsActive] = useState(recurringPayment?.isActive ?? true);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );
  const filteredPaymentMethods = paymentMethods;

  // ModalWrapper の padding: 12 (24px) + gap-2 (8px × 3) = 48px
  const gridItemWidth = useMemo(
    () => (windowWidth - 48) / 4,
    [windowWidth],
  );

  const handleSubmit = () => {
    if (!name.trim() || !amount.trim()) return;

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

    onSave(input);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    return `${y}年${m}月${d}日`;
  };

  return (
    <ModalWrapper
      title={recurringPayment ? '定期取引を編集' : '定期取引を追加'}
      onClose={onClose}
      isForm
      headerAction={
        recurringPayment && onDelete ? (
          <TouchableOpacity
            onPress={() => {
              onDelete(recurringPayment.id);
              onClose();
            }}
            className="p-1"
          >
            <Trash2 size={15} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : undefined
      }
      footer={
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full py-3 bg-gray-800 rounded-lg items-center"
          disabled={!name.trim() || !amount.trim()}
        >
          <Text className="text-white font-semibold text-sm">保存</Text>
        </TouchableOpacity>
      }
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
        {filteredPaymentMethods.length > 0 && (
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
              {filteredPaymentMethods.map((pm) => (
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
                onPress={() => setPeriodType(periodType === 'months' ? 'days' : 'months')}
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
    </ModalWrapper>
  );
};

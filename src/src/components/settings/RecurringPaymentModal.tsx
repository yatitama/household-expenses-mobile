import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { Trash2, Check, Wallet, CreditCard } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { Button } from '../ui/Button';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
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
            <Trash2 size={15} color="#9ca3af" />
          </TouchableOpacity>
        ) : undefined
      }
      footer={
        <Button variant="primary" size="lg" onPress={handleSubmit} disabled={!name.trim() || !amount.trim()}>
          保存
        </Button>
      }
    >
      <View className="gap-lg">
        {/* 種類（支出/収入） */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            種類
          </Text>
          <View className="flex-row rounded-md overflow-hidden bg-primary-100 dark:bg-primary-700">
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setType(t);
                  setCategoryId('');
                }}
                className={`flex-1 py-sm items-center ${
                  type === t ? 'bg-primary-800 dark:bg-primary-600' : ''
                }`}
              >
                <Text
                  className={`text-base font-medium ${
                    type === t ? 'text-white' : 'text-primary-700 dark:text-primary-300'
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
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            名前
          </Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={name}
              onChangeText={setName}
              placeholder="例: 家賃, 携帯料金, Netflix"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 金額 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            金額
          </Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <Text className="text-primary-600 dark:text-primary-400">¥</Text>
            <DismissibleTextInput
              className="flex-1 py-sm ml-sm text-primary-900 dark:text-primary-100"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* カテゴリ */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            カテゴリ
          </Text>
          <View className="flex-row flex-wrap gap-sm">
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={{ width: gridItemWidth }}
                className={`relative items-center p-sm rounded-md ${
                  categoryId === cat.id ? 'bg-primary-100 dark:bg-primary-700' : ''
                }`}
              >
                <View className="mb-1">
                  {getCategoryIcon(cat.icon ?? '', 24, cat.color)}
                </View>
                <Text
                  className="text-label text-primary-900 dark:text-primary-100 text-center"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cat.name}
                </Text>
                {categoryId === cat.id && (
                  <View className="absolute top-0 right-0">
                    <Check size={12} color="#374151" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 支払い手段（オプション） */}
        {filteredPaymentMethods.length > 0 && (
          <View>
            <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
              支払い手段（任意）
            </Text>
            <View className="flex-row flex-wrap gap-sm">
              <TouchableOpacity
                key="none"
                onPress={() => setPaymentMethodId('')}
                style={{ width: gridItemWidth }}
                className={`relative items-center p-sm rounded-md ${
                  paymentMethodId === '' ? 'bg-primary-100 dark:bg-primary-700' : ''
                }`}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mb-1 bg-primary-300 dark:bg-primary-500">
                  <Text className="text-label font-semibold text-primary-600 dark:text-primary-400">
                    -
                  </Text>
                </View>
                <Text
                  className="text-label text-primary-900 dark:text-primary-100 text-center"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  指定しない
                </Text>
                {paymentMethodId === '' && (
                  <View className="absolute top-0 right-0">
                    <Check size={12} color="#374151" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
              {filteredPaymentMethods.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => setPaymentMethodId(pm.id)}
                  style={{ width: gridItemWidth }}
                  className={`relative items-center p-sm rounded-md ${
                    paymentMethodId === pm.id ? 'bg-primary-100 dark:bg-primary-700' : ''
                  }`}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mb-1"
                    style={{ backgroundColor: pm.color }}
                  >
                    <CreditCard size={16} color="#fff" />
                  </View>
                  <Text
                    className="text-label text-primary-900 dark:text-primary-100 text-center"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {pm.name}
                  </Text>
                  {paymentMethodId === pm.id && (
                    <View className="absolute top-0 right-0">
                      <Check size={12} color="#374151" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 頻度 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            頻度
          </Text>
          <View className="flex-row gap-2 items-center">
            <View className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
              <DismissibleTextInput
                className="flex-1 py-sm text-primary-900 dark:text-primary-100"
                value={periodValue}
                onChangeText={(text) => setPeriodValue(text.replace(/[^0-9]/g, '') || '1')}
                placeholder="1"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
              <TouchableOpacity
                onPress={() => setPeriodType(periodType === 'months' ? 'days' : 'months')}
                className="py-sm"
              >
                <Text className="text-base text-primary-900 dark:text-primary-100">
                  {periodType === 'months' ? 'ヶ月' : '日'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 開始日 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            開始日
          </Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 終了日 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            終了日（任意）
          </Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 有効/無効 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">
            ステータス
          </Text>
          <View className="flex-row rounded-md overflow-hidden bg-primary-100 dark:bg-primary-700">
            {[
              { label: '有効', value: true },
              { label: '無効', value: false },
            ].map((option) => (
              <TouchableOpacity
                key={String(option.value)}
                onPress={() => setIsActive(option.value)}
                className={`flex-1 py-sm items-center ${
                  isActive === option.value ? 'bg-primary-800 dark:bg-primary-600' : ''
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

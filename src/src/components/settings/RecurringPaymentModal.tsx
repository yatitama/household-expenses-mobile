import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
} from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { COLORS } from '../accounts/constants';
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

const FREQUENCY_OPTIONS = [
  { label: 'ヶ月に一回', value: 'months', periodValue: 1 },
  { label: '日に一回', value: 'days', periodValue: 1 },
];

export const RecurringPaymentModal = ({
  recurringPayment,
  onSave,
  onClose,
  onDelete,
  categories,
  paymentMethods,
}: RecurringPaymentModalProps) => {
  const [name, setName] = useState(recurringPayment?.name ?? '');
  const [amount, setAmount] = useState(recurringPayment?.amount.toString() ?? '');
  const [type, setType] = useState<TransactionType>(recurringPayment?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState(recurringPayment?.categoryId ?? '');
  const [paymentMethodId, setPaymentMethodId] = useState(
    recurringPayment?.paymentMethodId ?? '',
  );
  const [accountId, setAccountId] = useState(recurringPayment?.accountId ?? '');
  const [periodType, setPeriodType] = useState<'months' | 'days'>(
    recurringPayment?.periodType ?? 'months',
  );
  const [periodValue, setPeriodValue] = useState(
    recurringPayment?.periodValue.toString() ?? '1',
  );
  const [startDate, setStartDate] = useState(
    recurringPayment?.startDate ? new Date(recurringPayment.startDate) : new Date(),
  );
  const [endDate, setEndDate] = useState(
    recurringPayment?.endDate ? new Date(recurringPayment.endDate) : null,
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isActive, setIsActive] = useState(recurringPayment?.isActive ?? true);

  const filteredCategories = categories.filter((c) => c.type === type);
  const filteredPaymentMethods = paymentMethods;

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartPicker(false);
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndPicker(false);
    if (date) setEndDate(date);
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount.trim()) return;

    const input: RecurringPaymentInput = {
      name: name.trim(),
      amount: Number(amount),
      type,
      periodType,
      periodValue: Number(periodValue),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      isActive,
      categoryId: categoryId || undefined,
      paymentMethodId: paymentMethodId || undefined,
      accountId: accountId || undefined,
    };

    onSave(input);
  };

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
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
              placeholderTextColor="#9ca3af"
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
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* カテゴリ */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
            カテゴリ
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                className="items-center gap-1"
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor: categoryId === cat.id ? cat.color : '#f3f4f6',
                  }}
                >
                  {getCategoryIcon(
                    cat.icon ?? '',
                    18,
                    categoryId === cat.id ? '#fff' : '#6b7280',
                  )}
                </View>
                <Text className="text-xs text-gray-600 dark:text-gray-400 text-center w-12">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 支払い手段（オプション） */}
        {filteredPaymentMethods.length > 0 && (
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              支払い手段（任意）
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setPaymentMethodId('')}
                className={`px-3 py-2 rounded-full ${
                  paymentMethodId === ''
                    ? 'bg-gray-800 dark:bg-gray-600'
                    : 'bg-gray-100 dark:bg-slate-700'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    paymentMethodId === ''
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  指定しない
                </Text>
              </TouchableOpacity>
              {filteredPaymentMethods.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => setPaymentMethodId(pm.id)}
                  className={`px-3 py-2 rounded-full ${
                    paymentMethodId === pm.id
                      ? 'bg-gray-800 dark:bg-gray-600'
                      : 'bg-gray-100 dark:bg-slate-700'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      paymentMethodId === pm.id
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {pm.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                placeholderTextColor="#9ca3af"
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
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5"
          >
            <Text className="text-sm text-gray-900 dark:text-gray-100">{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={handleStartDateChange}
            />
          )}
        </View>

        {/* 終了日 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
            終了日（任意）
          </Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5"
          >
            <Text className="text-sm text-gray-900 dark:text-gray-100">
              {endDate ? formatDate(endDate) : '未設定'}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="spinner"
              onChange={handleEndDateChange}
            />
          )}
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

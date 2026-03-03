import { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Trash2, User, Check } from 'lucide-react-native';
import { ModalWrapper } from './ModalWrapper';
import { Button } from '../../ui/Button';
import { PM_TYPE_LABELS, BILLING_TYPE_LABELS, COLORS } from '../constants';
import { COMMON_MEMBER_ID } from '../../../types';
import { DismissibleTextInput } from '../../inputs/DismissibleTextInput';
import type {
  Account, PaymentMethod, PaymentMethodType,
  PaymentMethodInput, BillingType, Member,
} from '../../../types';

interface PaymentMethodModalProps {
  paymentMethod: PaymentMethod | null;
  members: Member[];
  accounts: Account[];
  onSave: (input: PaymentMethodInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const PaymentMethodModal = ({
  paymentMethod, members, accounts, onSave, onClose, onDelete,
}: PaymentMethodModalProps) => {
  const { width: windowWidth } = useWindowDimensions();
  // padding: 12 (12px × 2 = 24px) のモーダル水平パディング + gap-2 (8px) × 2 列間 = 40px
  const gridItemWidth = (windowWidth - 40) / 3;
  const [name, setName] = useState(paymentMethod?.name ?? '');
  const [memberId, setMemberId] = useState(paymentMethod?.memberId ?? COMMON_MEMBER_ID);
  const [pmType, setPmType] = useState<PaymentMethodType>(paymentMethod?.type ?? 'credit_card');
  const [linkedAccountId, setLinkedAccountId] = useState(paymentMethod?.linkedAccountId ?? '');
  const [billingType, setBillingType] = useState<BillingType>(paymentMethod?.billingType ?? 'monthly');
  const [closingDay, setClosingDay] = useState(paymentMethod?.closingDay?.toString() ?? '15');
  const [paymentDay, setPaymentDay] = useState(paymentMethod?.paymentDay?.toString() ?? '10');
  const [paymentMonthOffset, setPaymentMonthOffset] = useState(paymentMethod?.paymentMonthOffset?.toString() ?? '1');
  const [color, setColor] = useState(paymentMethod?.color ?? COLORS[5]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      memberId,
      type: pmType,
      linkedAccountId,
      billingType,
      closingDay: billingType === 'monthly' ? parseInt(closingDay, 10) || 15 : undefined,
      paymentDay: billingType === 'monthly' ? parseInt(paymentDay, 10) || 10 : undefined,
      paymentMonthOffset: billingType === 'monthly' ? parseInt(paymentMonthOffset, 10) || 1 : undefined,
      color,
    });
  };

  return (
    <ModalWrapper
      title={paymentMethod ? '支払い手段を編集' : '支払い手段を追加'}
      onClose={onClose}
      isForm
      headerAction={
        paymentMethod && onDelete ? (
          <TouchableOpacity onPress={() => { onDelete(paymentMethod.id); onClose(); }} className="p-1">
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
        {/* 名前 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">名前</Text>
          <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={name}
              onChangeText={setName}
              placeholder="例: クレジットカード"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 種類 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">種類</Text>
          <View className="flex-row gap-sm">
            {(Object.entries(PM_TYPE_LABELS) as [PaymentMethodType, string][]).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setPmType(value)}
                className={`flex-1 py-sm rounded-md items-center ${pmType === value ? 'bg-primary-800 dark:bg-primary-600' : 'bg-primary-100 dark:bg-primary-700'}`}
              >
                <Text className={`text-label font-medium ${pmType === value ? 'text-white' : 'text-primary-700 dark:text-primary-300'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 所有者 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">所有者</Text>
          <View className="flex-row flex-wrap gap-sm">
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => setMemberId(member.id)}
                style={{ width: gridItemWidth }}
                className={`relative items-center p-sm rounded-md ${memberId === member.id ? 'bg-primary-100 dark:bg-primary-700' : ''}`}
              >
                <View className="w-7 h-7 rounded-full items-center justify-center mb-sm" style={{ backgroundColor: `${member.color}30` }}>
                  <User size={14} color={member.color} />
                </View>
                <Text className="text-label text-primary-900 dark:text-primary-200 text-center">{member.name}</Text>
                {memberId === member.id && (
                  <View className="absolute top-0 right-0">
                    <Check size={12} color="#374151" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 引き落とし口座 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">引き落とし口座</Text>
          <View className="gap-sm">
            <TouchableOpacity
              onPress={() => setLinkedAccountId('')}
              className={`py-sm px-md rounded-md border ${!linkedAccountId ? 'border-primary-800 bg-primary-50 dark:bg-primary-700' : 'border-primary-200 dark:border-primary-600'}`}
            >
              <Text className="text-base text-primary-700 dark:text-primary-300">未設定</Text>
            </TouchableOpacity>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setLinkedAccountId(acc.id)}
                className={`py-sm px-md rounded-md border ${linkedAccountId === acc.id ? 'border-primary-800 bg-primary-50 dark:bg-primary-700' : 'border-primary-200 dark:border-primary-600'}`}
              >
                <Text className="text-base text-primary-700 dark:text-primary-300">{acc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 精算タイプ */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">精算タイプ</Text>
          <View className="flex-row gap-sm">
            {(Object.entries(BILLING_TYPE_LABELS) as [BillingType, string][]).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setBillingType(value)}
                className={`flex-1 py-sm rounded-md items-center ${billingType === value ? 'bg-primary-800 dark:bg-primary-600' : 'bg-primary-100 dark:bg-primary-700'}`}
              >
                <Text className={`text-label font-medium ${billingType === value ? 'text-white' : 'text-primary-700 dark:text-primary-300'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {billingType === 'monthly' && (
          <View className="flex-row gap-md">
            <View className="flex-1">
              <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">締め日</Text>
              <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
                <DismissibleTextInput
                  className="flex-1 py-sm text-primary-900 dark:text-primary-100"
                  value={closingDay}
                  onChangeText={setClosingDay}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">支払い日</Text>
              <View className="bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md flex-row items-center">
                <DismissibleTextInput
                  className="flex-1 py-sm text-primary-900 dark:text-primary-100"
                  value={paymentDay}
                  onChangeText={setPaymentDay}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        )}

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

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Trash2, User, Check } from 'lucide-react-native';
import { ModalWrapper } from './ModalWrapper';
import { ACCOUNT_TYPE_LABELS, COLORS } from '../constants';
import { ACCOUNT_TYPE_ICONS } from '../AccountIcons';
import { COMMON_MEMBER_ID } from '../../../types';
import { DismissibleTextInput } from '../../inputs/DismissibleTextInput';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../../constants/colors';
import type { Account, AccountType, AccountInput, Member } from '../../../types';

interface AccountModalProps {
  account: Account | null;
  members: Member[];
  onSave: (input: AccountInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AccountModal = ({ account, members, onSave, onClose, onDelete }: AccountModalProps) => {
  const [name, setName] = useState(account?.name ?? '');
  const [memberId, setMemberId] = useState(account?.memberId ?? COMMON_MEMBER_ID);
  const [accountType, setAccountType] = useState<AccountType>(account?.type ?? 'bank');
  const [balance, setBalance] = useState(account?.balance.toString() ?? '0');
  const [color, setColor] = useState(account?.color ?? COLORS[0]);
  const { width: windowWidth } = useWindowDimensions();
  // padding: 12 (12px × 2 = 24px) のモーダル水平パディング + gap-2 (8px) × 2 列間 = 40px
  const gridItemWidth = (windowWidth - 40) / 3;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      memberId,
      type: accountType,
      balance: parseInt(balance, 10) || 0,
      color,
    });
  };

  return (
    <ModalWrapper
      title={account ? '口座を編集' : '口座を追加'}
      onClose={onClose}
      isForm
      headerAction={
        account && onDelete ? (
          <TouchableOpacity onPress={() => { onDelete(account.id); onClose(); }} className="p-1">
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
        {/* 名前 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">名前</Text>
          <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={name}
              onChangeText={setName}
              placeholder="例: メイン銀行"
              placeholderTextColor={COLORS_GRAY[400]}
            />
          </View>
        </View>

        {/* 所有者 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">所有者</Text>
          <View className="flex-row flex-wrap gap-2">
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => setMemberId(member.id)}
                style={{ width: gridItemWidth }}
                className={`relative items-center p-2 rounded-lg ${memberId === member.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <View className="w-7 h-7 rounded-full items-center justify-center mb-1" style={{ backgroundColor: `${member.color}30` }}>
                  <User size={14} color={member.color} />
                </View>
                <Text className="text-xs text-gray-900 dark:text-gray-200 text-center">{member.name}</Text>
                {memberId === member.id && (
                  <View className="absolute top-0 right-0">
                    <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 種類 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">種類</Text>
          <View className="flex-row gap-2">
            {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setAccountType(value)}
                className={`relative flex-col items-center p-2 rounded-lg flex-1 ${accountType === value ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <View className="w-8 h-8 rounded-full bg-gray-400 dark:bg-slate-600 items-center justify-center mb-1">
                  {ACCOUNT_TYPE_ICONS[value]}
                </View>
                <Text className="text-xs text-gray-900 dark:text-gray-200 text-center">{label}</Text>
                {accountType === value && (
                  <View className="absolute top-0 right-0">
                    <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 残高 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">残高</Text>
          <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
            <Text className="text-gray-500 mr-1">¥</Text>
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={balance}
              onChangeText={setBalance}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS_GRAY[400]}
            />
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

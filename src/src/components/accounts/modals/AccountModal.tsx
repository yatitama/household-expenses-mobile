import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Trash2, User, Check } from 'lucide-react-native';
import { ModalWrapper } from './ModalWrapper';
import { Button } from '../../ui/Button';
import { ACCOUNT_TYPE_LABELS, COLORS } from '../constants';
import { ACCOUNT_TYPE_ICONS } from '../AccountIcons';
import { COMMON_MEMBER_ID } from '../../../types';
import { DismissibleTextInput } from '../../inputs/DismissibleTextInput';
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
              placeholder="例: メイン銀行"
              placeholderTextColor="#9ca3af"
            />
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

        {/* 種類 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">種類</Text>
          <View className="flex-row gap-sm">
            {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setAccountType(value)}
                className={`relative flex-col items-center p-sm rounded-md flex-1 ${accountType === value ? 'bg-primary-100 dark:bg-primary-700' : ''}`}
              >
                <View className="w-8 h-8 rounded-full bg-primary-400 dark:bg-primary-600 items-center justify-center mb-sm">
                  {ACCOUNT_TYPE_ICONS[value]}
                </View>
                <Text className="text-label text-primary-900 dark:text-primary-200 text-center">{label}</Text>
                {accountType === value && (
                  <View className="absolute top-0 right-0">
                    <Check size={12} color="#374151" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 残高 */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">残高</Text>
          <View className="flex-row items-center bg-primary-50 dark:bg-primary-700 border border-primary-200 dark:border-primary-600 rounded-md px-md">
            <Text className="text-primary-600 dark:text-primary-400 mr-sm">¥</Text>
            <DismissibleTextInput
              className="flex-1 py-sm text-primary-900 dark:text-primary-100"
              value={balance}
              onChangeText={setBalance}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9ca3af"
            />
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

import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { Button } from '../ui/Button';
import { COLORS } from '../accounts/constants';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import type { Member, MemberInput } from '../../types';

interface MemberModalProps {
  member: Member | null;
  onSave: (input: MemberInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const MemberModal = ({ member, onSave, onClose, onDelete }: MemberModalProps) => {
  const [name, setName] = useState(member?.name ?? '');
  const [color, setColor] = useState(member?.color ?? COLORS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      isDefault: member?.isDefault,
    });
  };

  return (
    <ModalWrapper
      title={member ? 'メンバーを編集' : 'メンバーを追加'}
      onClose={onClose}
      isForm
      headerAction={
        member && onDelete && !member.isDefault ? (
          <TouchableOpacity onPress={() => { onDelete(member.id); onClose(); }} className="p-1">
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
              placeholder="例: 夫"
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

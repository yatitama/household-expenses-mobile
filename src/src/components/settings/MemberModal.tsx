import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { COLORS } from '../accounts/constants';
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
            <TextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={name}
              onChangeText={setName}
              placeholder="例: 夫"
              placeholderTextColor="#9ca3af"
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
                className="w-8 h-8 rounded-full"
                style={{
                  backgroundColor: c,
                  borderWidth: color === c ? 3 : 0,
                  borderColor: '#374151',
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </ModalWrapper>
  );
};

import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { COLORS } from '../accounts/constants';
import { ICON_NAMES, getCategoryIcon } from '../../utils/categoryIcons';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type { Category, CategoryInput, TransactionType } from '../../types';

interface CategoryModalProps {
  category: Category | null;
  onSave: (input: CategoryInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
  defaultType?: TransactionType;
}

export const CategoryModal = ({
  category,
  onSave,
  onClose,
  onDelete,
  defaultType = 'expense',
}: CategoryModalProps) => {
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType);
  const [color, setColor] = useState(category?.color ?? COLORS[2]);
  const [icon, setIcon] = useState(category?.icon ?? 'MoreHorizontal');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, color, icon });
  };

  return (
    <ModalWrapper
      title={category ? 'カテゴリを編集' : 'カテゴリを追加'}
      onClose={onClose}
      isForm
      headerAction={
        category && onDelete ? (
          <TouchableOpacity onPress={() => { onDelete(category.id); onClose(); }} className="p-1">
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
              placeholder="例: 食費"
              placeholderTextColor={COLORS_GRAY[400]}
            />
          </View>
        </View>

        {/* 種類（新規作成時のみ変更可） */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">種類</Text>
          <View className={`flex-row rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 ${category ? 'opacity-50' : ''}`}>
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => !category && setType(t)}
                className={`flex-1 py-2.5 items-center ${type === t ? 'bg-gray-800 dark:bg-gray-600' : ''}`}
              >
                <Text className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {t === 'expense' ? '支出' : '収入'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* アイコン */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">アイコン</Text>
          <View className="flex-row flex-wrap gap-2 justify-start">
            {ICON_NAMES.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: icon === iconName ? color : COLORS_GRAY[100],
                }}
              >
                {getCategoryIcon(iconName, 16, icon === iconName ? COLORS_SEMANTIC.white : COLORS_GRAY[500])}
              </TouchableOpacity>
            ))}
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

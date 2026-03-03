import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { Button } from '../ui/Button';
import { COLORS } from '../accounts/constants';
import { ICON_NAMES, getCategoryIcon } from '../../utils/categoryIcons';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
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
              placeholder="例: 食費"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 種類（新規作成時のみ変更可） */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">種類</Text>
          <View className={`flex-row rounded-md overflow-hidden bg-primary-100 dark:bg-primary-700 ${category ? 'opacity-50' : ''}`}>
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => !category && setType(t)}
                className={`flex-1 py-sm items-center ${type === t ? 'bg-primary-800 dark:bg-primary-600' : ''}`}
              >
                <Text className={`text-base font-medium ${type === t ? 'text-white' : 'text-primary-700 dark:text-primary-300'}`}>
                  {t === 'expense' ? '支出' : '収入'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* アイコン */}
        <View>
          <Text className="text-label font-semibold text-primary-900 dark:text-primary-200 mb-sm">アイコン</Text>
          <View className="flex-row flex-wrap gap-sm justify-start">
            {ICON_NAMES.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
                className="w-9 h-9 rounded-md items-center justify-center"
                style={{
                  backgroundColor: icon === iconName ? color : '#f3f4f6',
                }}
              >
                {getCategoryIcon(iconName, 16, icon === iconName ? '#fff' : '#6b7280')}
              </TouchableOpacity>
            ))}
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

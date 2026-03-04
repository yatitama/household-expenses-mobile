import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { categoryService } from '../../services/storage';
import { COLORS } from '../../components/accounts/constants';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type { Category, CategoryInput, TransactionType } from '../../types';
import type { CategoryDetailScreenProps } from '../../navigation/types/navigation';

const CATEGORY_ICONS = [
  'ShoppingCart', 'Utensils', 'Home', 'Heart', 'Zap', 'Smartphone',
  'Plane', 'Book', 'Dumbbell', 'Music', 'Gift', 'DollarSign',
];

export const CategoryDetailScreen = ({ navigation, route }: CategoryDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const categoryId = route.params?.categoryId;
  const defaultType = route.params?.defaultType || 'expense';
  const isEditMode = !!categoryId;

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('ShoppingCart');
  const [type, setType] = useState<TransactionType>(defaultType as TransactionType);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load category data if editing
  useFocusEffect(
    useCallback(() => {
      if (isEditMode && categoryId) {
        const data = categoryService.getById(categoryId);
        if (data) {
          setCategory(data);
          setName(data.name);
          setColor(data.color);
          setIcon(data.icon || 'ShoppingCart');
          setType(data.type);
        }
        setIsLoading(false);
      }
    }, [categoryId, isEditMode])
  );

  // Update header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'カテゴリを編集' : 'カテゴリを追加',
      headerRight: () =>
        category ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="pr-4">
            <Trash2 size={18} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isEditMode, category]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'カテゴリ名を入力してください' });
      return;
    }

    const input: CategoryInput = {
      name: name.trim(),
      color,
      icon,
      type,
    };

    try {
      if (isEditMode && category) {
        categoryService.update(category.id, input);
        Toast.show({ type: 'success', text1: 'カテゴリを更新しました' });
      } else {
        categoryService.create(input);
        Toast.show({ type: 'success', text1: 'カテゴリを追加しました' });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '保存に失敗しました',
        text2: error instanceof Error ? error.message : '不明なエラーが発生しました',
      });
    }
  };

  const handleDelete = () => {
    if (!category) return;
    try {
      categoryService.delete(category.id);
      Toast.show({ type: 'success', text1: 'カテゴリを削除しました' });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '削除に失敗しました',
        text2: error instanceof Error ? error.message : '不明なエラーが発生しました',
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
        <Text className="text-gray-900 dark:text-gray-100">読み込み中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-900" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        className="flex-1 px-4 py-4"
      >
        <View className="gap-5">
          {/* カテゴリ名 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              カテゴリ名
            </Text>
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

          {/* Type */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              タイプ
            </Text>
            <View className="flex-row gap-2">
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-lg items-center ${
                    type === t
                      ? 'bg-gray-800 dark:bg-gray-600'
                      : 'bg-gray-100 dark:bg-slate-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      type === t
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t === 'expense' ? '支出' : '収入'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* アイコン */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              アイコン
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setIcon(iconName)}
                  className={`w-12 h-12 rounded-lg items-center justify-center border-2 ${
                    icon === iconName
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700'
                  }`}
                >
                  {getCategoryIcon(iconName, 20, color)}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 色 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              色
            </Text>
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
                      <Check size={12} color={COLORS_SEMANTIC.white} strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer - Save button */}
      <View
        className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 px-4 py-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSave}
          className="w-full py-3 bg-gray-800 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-sm">保存</Text>
        </TouchableOpacity>
      </View>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="カテゴリを削除"
        message="このカテゴリを削除しますか？この操作は取り消せません。"
        confirmVariant="danger"
      />
    </View>
  );
};

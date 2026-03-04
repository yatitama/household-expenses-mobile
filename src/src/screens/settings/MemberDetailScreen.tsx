import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { memberService } from '../../services/storage';
import { COLORS } from '../../components/accounts/constants';
import { COLORS_GRAY } from '../../constants/colors';
import type { Member, MemberInput } from '../../types';
import type { MemberDetailScreenProps } from '../../navigation/types/navigation';

export const MemberDetailScreen = ({ navigation, route }: MemberDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const memberId = route.params?.memberId;
  const isEditMode = !!memberId;

  const [member, setMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load member data if editing
  useFocusEffect(
    useCallback(() => {
      if (isEditMode && memberId) {
        const data = memberService.getById(memberId);
        if (data) {
          setMember(data);
          setName(data.name);
          setColor(data.color);
        }
        setIsLoading(false);
      }
    }, [memberId, isEditMode])
  );

  // Update header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'メンバーを編集' : 'メンバーを追加',
      headerRight: () =>
        member && !member.isDefault ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="pr-4">
            <Trash2 size={18} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isEditMode, member]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: '名前を入力してください' });
      return;
    }

    const input: MemberInput = {
      name: name.trim(),
      color,
      isDefault: member?.isDefault,
    };

    try {
      if (isEditMode && member) {
        memberService.update(member.id, input);
        Toast.show({ type: 'success', text1: 'メンバーを更新しました' });
      } else {
        memberService.create(input);
        Toast.show({ type: 'success', text1: 'メンバーを追加しました' });
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
    if (!member) return;
    try {
      memberService.delete(member.id);
      Toast.show({ type: 'success', text1: 'メンバーを削除しました' });
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
                placeholder="例: 夫"
                placeholderTextColor={COLORS_GRAY[400]}
              />
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
                      <Check size={12} color="white" strokeWidth={2.5} />
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
        title="メンバーを削除"
        message="このメンバーを削除しますか？この操作は取り消せません。"
        confirmVariant="danger"
      />
    </View>
  );
};

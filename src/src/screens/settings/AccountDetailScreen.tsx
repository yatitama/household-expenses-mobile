import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Check, User } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { accountService, memberService } from '../../services/storage';
import { ACCOUNT_TYPE_LABELS, COLORS } from '../../components/accounts/constants';
import { ACCOUNT_TYPE_ICONS } from '../../components/accounts/AccountIcons';
import { COLORS_GRAY } from '../../constants/colors';
import type { Account, AccountType, AccountInput, Member } from '../../types';
import type { AccountDetailScreenProps } from '../../navigation/types/navigation';

export const AccountDetailScreen = ({ navigation, route }: AccountDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const accountId = route.params?.accountId;
  const isEditMode = !!accountId;

  const [account, setAccount] = useState<Account | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const gridItemWidth = (windowWidth - 40) / 3;

  // Load account and members data
  useFocusEffect(
    useCallback(() => {
      try {
        const loadedMembers = memberService.getAll();
        setMembers(loadedMembers);

        if (isEditMode && accountId) {
          const data = accountService.getById(accountId);
          if (data) {
            setAccount(data);
            setName(data.name);
            setMemberId(data.memberId);
            setAccountType(data.type);
            setBalance(data.balance.toString());
            setColor(data.color);
          }
        }
        setIsLoading(false);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'データ読み込みエラー',
          text2: error instanceof Error ? error.message : '不明なエラーが発生しました',
        });
        setIsLoading(false);
      }
    }, [accountId, isEditMode])
  );

  // Update header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? '口座を編集' : '口座を追加',
      headerRight: () =>
        account ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="pr-4">
            <Trash2 size={18} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isEditMode, account]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: '名前を入力してください' });
      return;
    }

    if (!memberId) {
      Toast.show({ type: 'error', text1: '所有者を選択してください' });
      return;
    }

    const input: AccountInput = {
      name: name.trim(),
      memberId,
      type: accountType,
      balance: parseInt(balance, 10) || 0,
      color,
    };

    try {
      if (isEditMode && account) {
        accountService.update(account.id, input);
        Toast.show({ type: 'success', text1: '口座を更新しました' });
      } else {
        accountService.create(input);
        Toast.show({ type: 'success', text1: '口座を追加しました' });
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
    if (!account) return;
    try {
      accountService.delete(account.id);
      Toast.show({ type: 'success', text1: '口座を削除しました' });
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
                placeholder="例: メイン銀行"
                placeholderTextColor={COLORS_GRAY[400]}
              />
            </View>
          </View>

          {/* 所有者 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              所有者
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => setMemberId(member.id)}
                  style={{ width: gridItemWidth }}
                  className={`relative items-center p-2 rounded-lg ${
                    memberId === member.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center mb-1"
                    style={{ backgroundColor: `${member.color}30` }}
                  >
                    <User size={14} color={member.color} />
                  </View>
                  <Text className="text-xs text-gray-900 dark:text-gray-200 text-center">
                    {member.name}
                  </Text>
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
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              種類
            </Text>
            <View className="flex-row gap-2">
              {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(
                ([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setAccountType(value)}
                    className={`relative flex-col items-center p-2 rounded-lg flex-1 ${
                      accountType === value ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <View className="w-8 h-8 rounded-full bg-gray-400 dark:bg-slate-600 items-center justify-center mb-1">
                      {ACCOUNT_TYPE_ICONS[value]}
                    </View>
                    <Text className="text-xs text-gray-900 dark:text-gray-200 text-center">
                      {label}
                    </Text>
                    {accountType === value && (
                      <View className="absolute top-0 right-0">
                        <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* 残高 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              残高
            </Text>
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
        title="口座を削除"
        message="この口座を削除しますか？この操作は取り消せません。"
        confirmVariant="danger"
      />
    </View>
  );
};

import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Check, User } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { paymentMethodService, memberService, accountService } from '../../services/storage';
import { PM_TYPE_LABELS, BILLING_TYPE_LABELS, COLORS } from '../../components/accounts/constants';
import { COLORS_GRAY } from '../../constants/colors';
import type {
  PaymentMethod,
  PaymentMethodType,
  PaymentMethodInput,
  BillingType,
  Member,
  Account,
} from '../../types';
import type { PaymentMethodDetailScreenProps } from '../../navigation/types/navigation';

export const PaymentMethodDetailScreen = ({
  navigation,
  route,
}: PaymentMethodDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const paymentMethodId = route.params?.paymentMethodId;
  const isEditMode = !!paymentMethodId;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [pmType, setPmType] = useState<PaymentMethodType>('credit_card');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('monthly');
  const [closingDay, setClosingDay] = useState('15');
  const [paymentDay, setPaymentDay] = useState('10');
  const [paymentMonthOffset, setPaymentMonthOffset] = useState('1');
  const [color, setColor] = useState(COLORS[5]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const gridItemWidth = (windowWidth - 40) / 3;

  // Load payment method, members and accounts data
  useFocusEffect(
    useCallback(() => {
      try {
        const loadedMembers = memberService.getAll();
        const loadedAccounts = accountService.getAll();
        setMembers(loadedMembers);
        setAccounts(loadedAccounts);

        if (isEditMode && paymentMethodId) {
          const data = paymentMethodService.getById(paymentMethodId);
          if (data) {
            setPaymentMethod(data);
            setName(data.name);
            setMemberId(data.memberId);
            setPmType(data.type);
            setLinkedAccountId(data.linkedAccountId || '');
            setBillingType(data.billingType);
            setClosingDay(data.closingDay?.toString() || '15');
            setPaymentDay(data.paymentDay?.toString() || '10');
            setPaymentMonthOffset(data.paymentMonthOffset?.toString() || '1');
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
    }, [paymentMethodId, isEditMode])
  );

  // Update header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? '支払い手段を編集' : '支払い手段を追加',
      headerRight: () =>
        paymentMethod ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="pr-4">
            <Trash2 size={18} color={COLORS_GRAY[400]} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isEditMode, paymentMethod]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: '名前を入力してください' });
      return;
    }

    if (!memberId) {
      Toast.show({ type: 'error', text1: '所有者を選択してください' });
      return;
    }

    const input: PaymentMethodInput = {
      name: name.trim(),
      memberId,
      type: pmType,
      linkedAccountId: linkedAccountId || undefined,
      billingType,
      closingDay: billingType === 'monthly' ? parseInt(closingDay, 10) || 15 : undefined,
      paymentDay: billingType === 'monthly' ? parseInt(paymentDay, 10) || 10 : undefined,
      paymentMonthOffset: billingType === 'monthly' ? parseInt(paymentMonthOffset, 10) || 1 : undefined,
      color,
    };

    try {
      if (isEditMode && paymentMethod) {
        paymentMethodService.update(paymentMethod.id, input);
        Toast.show({ type: 'success', text1: '支払い手段を更新しました' });
      } else {
        paymentMethodService.create(input);
        Toast.show({ type: 'success', text1: '支払い手段を追加しました' });
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
    if (!paymentMethod) return;
    try {
      paymentMethodService.delete(paymentMethod.id);
      Toast.show({ type: 'success', text1: '支払い手段を削除しました' });
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
                placeholder="例: クレジットカード"
                placeholderTextColor={COLORS_GRAY[400]}
              />
            </View>
          </View>

          {/* 種類 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              種類
            </Text>
            <View className="flex-row gap-2">
              {(Object.entries(PM_TYPE_LABELS) as [PaymentMethodType, string][]).map(
                ([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setPmType(value)}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      pmType === value ? 'bg-gray-800' : 'bg-gray-100 dark:bg-slate-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        pmType === value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              )}
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

          {/* 引き落とし口座 */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              引き落とし口座
            </Text>
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => setLinkedAccountId('')}
                className={`py-2 px-3 rounded-lg border ${
                  !linkedAccountId
                    ? 'border-gray-800 bg-gray-50 dark:bg-slate-700'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <Text className="text-sm text-gray-700 dark:text-gray-300">未設定</Text>
              </TouchableOpacity>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => setLinkedAccountId(acc.id)}
                  className={`py-2 px-3 rounded-lg border ${
                    linkedAccountId === acc.id
                      ? 'border-gray-800 bg-gray-50 dark:bg-slate-700'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Text className="text-sm text-gray-700 dark:text-gray-300">{acc.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 精算タイプ */}
          <View>
            <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
              精算タイプ
            </Text>
            <View className="flex-row gap-2">
              {(Object.entries(BILLING_TYPE_LABELS) as [BillingType, string][]).map(
                ([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setBillingType(value)}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      billingType === value ? 'bg-gray-800' : 'bg-gray-100 dark:bg-slate-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        billingType === value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* 月次設定 */}
          {billingType === 'monthly' && (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  締め日
                </Text>
                <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
                  <DismissibleTextInput
                    className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                    value={closingDay}
                    onChangeText={setClosingDay}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor={COLORS_GRAY[400]}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  支払い日
                </Text>
                <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
                  <DismissibleTextInput
                    className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                    value={paymentDay}
                    onChangeText={setPaymentDay}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={COLORS_GRAY[400]}
                  />
                </View>
              </View>
            </View>
          )}

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
        title="支払い手段を削除"
        message="この支払い手段を削除しますか？この操作は取り消せません。"
        confirmVariant="danger"
      />
    </View>
  );
};

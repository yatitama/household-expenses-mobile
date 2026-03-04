import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, CreditCard, Trash2, Wallet } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { DismissibleTextInput } from '../../components/inputs/DismissibleTextInput';
import { accountService, categoryService, paymentMethodService, quickAddTemplateService } from '../../services/storage';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { COLORS_GRAY, COLORS_SEMANTIC } from '../../constants/colors';
import type { QuickAddTemplate, QuickAddTemplateInput, TransactionType } from '../../types';
import type { QuickAddTemplateDetailScreenProps } from '../../navigation/types/navigation';

type TemplateType = TransactionType | 'transfer';

export const QuickAddTemplateDetailScreen = ({ navigation, route }: QuickAddTemplateDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth = (windowWidth - 48) / 3;

  const templateId = route.params?.templateId;
  const [template, setTemplate] = useState<QuickAddTemplate | null>(null);
  const [loading, setLoading] = useState(!templateId);

  const allAccounts = accountService.getAll();
  const allPaymentMethods = paymentMethodService.getAll();
  const categories = categoryService.getAll();

  const [name, setName] = useState('');
  const [type, setType] = useState<TemplateType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [transferFromAccountId, setTransferFromAccountId] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load template data on focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (templateId) {
        const tmpl = quickAddTemplateService.getById(templateId);
        if (tmpl) {
          setTemplate(tmpl);
          setName(tmpl.name);
          setType(tmpl.type);
          setAmount(tmpl.amount ? String(tmpl.amount) : '');
          setCategoryId(tmpl.categoryId ?? '');
          setSelectedSourceId(tmpl.accountId ?? tmpl.paymentMethodId ?? '');
          setTransferFromAccountId(tmpl.fromAccountId ?? '');
          setTransferFee(tmpl.fee ? String(tmpl.fee) : '');
        } else {
          Toast.show({ type: 'error', text1: 'テンプレートが見つかりません' });
          navigation.goBack();
        }
      } else {
        setTemplate(null);
        setName('');
        setType('expense');
        setAmount('');
        setCategoryId('');
        setSelectedSourceId('');
        setTransferFromAccountId('');
        setTransferFee('');
      }
      setLoading(false);
    }, [templateId, navigation])
  );

  // Set header title and delete button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: template ? 'テンプレートを編集' : 'テンプレートを作成',
      headerRight: template ? () => (
        <TouchableOpacity
          onPress={() => setShowDeleteConfirm(true)}
          className="p-2 mr-2"
        >
          <Trash2 size={18} color={COLORS_GRAY[400]} />
        </TouchableOpacity>
      ) : undefined,
    });
  }, [navigation, template]);

  const transactionType: TransactionType = type === 'transfer' ? 'income' : type;
  const filteredCategories = categories.filter((c) => c.type === transactionType);

  const handleSubmit = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'テンプレート名を入力してください' });
      return;
    }

    try {
      if (type === 'transfer') {
        const input: QuickAddTemplateInput = {
          name: name.trim(),
          type: 'transfer',
          amount: amount ? parseInt(amount, 10) : undefined,
          fromAccountId: transferFromAccountId || undefined,
          accountId: selectedSourceId || undefined,
          fee: transferFee ? parseInt(transferFee, 10) : undefined,
        };

        if (template) {
          quickAddTemplateService.update(template.id, input);
          Toast.show({ type: 'success', text1: 'テンプレートを更新しました' });
        } else {
          quickAddTemplateService.create(input);
          Toast.show({ type: 'success', text1: 'テンプレートを作成しました' });
        }
      } else {
        const input: QuickAddTemplateInput = {
          name: name.trim(),
          type: type as TransactionType,
          amount: amount ? parseInt(amount, 10) : undefined,
          categoryId: categoryId || undefined,
          accountId: selectedSourceId || undefined,
        };

        if (template) {
          quickAddTemplateService.update(template.id, input);
          Toast.show({ type: 'success', text1: 'テンプレートを更新しました' });
        } else {
          quickAddTemplateService.create(input);
          Toast.show({ type: 'success', text1: 'テンプレートを作成しました' });
        }
      }

      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: '保存に失敗しました' });
    }
  };

  const handleDelete = () => {
    if (template) {
      try {
        quickAddTemplateService.delete(template.id);
        Toast.show({ type: 'success', text1: 'テンプレートを削除しました' });
        navigation.goBack();
      } catch (error) {
        Toast.show({ type: 'error', text1: '削除に失敗しました' });
      }
    }
  };

  const isValid = name.trim();

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500">読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-4 py-4" style={{ paddingTop: insets.top + 16 }}>
            {/* テンプレート名 */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">テンプレート名</Text>
              <View className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
                <DismissibleTextInput
                  className="flex-1 py-3 text-gray-900 dark:text-gray-100"
                  value={name}
                  onChangeText={setName}
                  placeholder="例: コンビニ"
                  placeholderTextColor={COLORS_GRAY[400]}
                />
              </View>
            </View>

            {/* 種類 */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">種類</Text>
              <View className="flex-row rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {(['expense', 'income', 'transfer'] as TemplateType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => {
                      setType(t);
                      setCategoryId('');
                      setSelectedSourceId('');
                      setTransferFromAccountId('');
                    }}
                    className={`flex-1 py-3 items-center ${type === t ? 'bg-gray-800 dark:bg-gray-700' : ''}`}
                  >
                    <Text className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {t === 'expense' ? '支出' : t === 'income' ? '収入' : '振替'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 金額 */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">金額</Text>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
                <Text className="text-gray-500 mr-1 text-base">¥</Text>
                <DismissibleTextInput
                  className="flex-1 py-3 text-gray-900 dark:text-gray-100"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS_GRAY[400]}
                />
              </View>
            </View>

            {type !== 'transfer' ? (
              <>
                {/* カテゴリ */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">カテゴリ</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {filteredCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        style={{ width: gridItemWidth }}
                        className={`relative items-center p-2 rounded-lg ${categoryId === cat.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <View className="mb-1">
                          {getCategoryIcon(cat.icon ?? '', 24, cat.color)}
                        </View>
                        <Text
                          className="text-xs text-gray-900 dark:text-gray-100 text-center"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {cat.name}
                        </Text>
                        {categoryId === cat.id && (
                          <View className="absolute top-0 right-0">
                            <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 支払い元 */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">支払い元</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      ...allAccounts.map((acc) => ({ id: acc.id, name: acc.name, color: acc.color, isAccount: true as const })),
                      ...allPaymentMethods.map((pm) => ({ id: pm.id, name: pm.name, color: pm.color, isAccount: false as const })),
                    ].map((src) => (
                      <TouchableOpacity
                        key={src.id}
                        onPress={() => setSelectedSourceId(src.id)}
                        style={{ width: gridItemWidth }}
                        className={`relative items-center p-2 rounded-lg ${selectedSourceId === src.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <View
                          className="w-8 h-8 rounded-full items-center justify-center mb-1"
                          style={{ backgroundColor: src.color }}
                        >
                          {src.isAccount ? <Wallet size={16} color={COLORS_SEMANTIC.white} /> : <CreditCard size={16} color={COLORS_SEMANTIC.white} />}
                        </View>
                        <Text
                          className="text-xs text-gray-900 dark:text-gray-100 text-center"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {src.name}
                        </Text>
                        {selectedSourceId === src.id && (
                          <View className="absolute top-0 right-0">
                            <Check size={12} color={COLORS_GRAY[700]} strokeWidth={2.5} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* 振替: 入金元 */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">入金元</Text>
                  <View className="gap-2">
                    {allAccounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setTransferFromAccountId(acc.id)}
                        className={`flex-row items-center gap-2 px-3 py-3 rounded-lg border ${
                          transferFromAccountId === acc.id
                            ? 'border-gray-800 bg-gray-50 dark:bg-gray-800'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: acc.color }}>
                          <Wallet size={12} color={COLORS_SEMANTIC.white} />
                        </View>
                        <Text className="text-sm text-gray-900 dark:text-gray-100 flex-1">{acc.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 振替: 入金先 */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">入金先</Text>
                  <View className="gap-2">
                    {allAccounts
                      .filter((a) => a.id !== transferFromAccountId)
                      .map((acc) => (
                        <TouchableOpacity
                          key={acc.id}
                          onPress={() => setSelectedSourceId(acc.id)}
                          className={`flex-row items-center gap-2 px-3 py-3 rounded-lg border ${
                            selectedSourceId === acc.id
                              ? 'border-gray-800 bg-gray-50 dark:bg-gray-800'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: acc.color }}>
                            <Wallet size={12} color={COLORS_SEMANTIC.white} />
                          </View>
                          <Text className="text-sm text-gray-900 dark:text-gray-100 flex-1">{acc.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>

                {/* 振替手数料 */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">振替手数料（任意）</Text>
                  <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
                    <Text className="text-gray-500 mr-1 text-base">¥</Text>
                    <DismissibleTextInput
                      className="flex-1 py-3 text-gray-900 dark:text-gray-100"
                      value={transferFee}
                      onChangeText={setTransferFee}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={COLORS_GRAY[400]}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Bottom padding for footer */}
            <View className="h-20" />
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View
        className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3 rounded-lg items-center ${isValid ? 'bg-gray-800 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <Text className={`font-semibold text-sm ${isValid ? 'text-white' : 'text-gray-500'}`}>
            {template ? '更新' : '作成'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="テンプレートを削除"
        message="このテンプレートを削除してもよろしいですか？"
        confirmText="削除"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

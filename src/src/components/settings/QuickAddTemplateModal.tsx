import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Trash2, Check } from 'lucide-react-native';
import { ModalWrapper } from '../accounts/modals/ModalWrapper';
import { DismissibleTextInput } from '../inputs/DismissibleTextInput';
import { ConfirmDialog } from '../feedback/ConfirmDialog';
import { getCategoryIcon } from '../../utils/categoryIcons';
import {
  accountService, paymentMethodService, categoryService,
} from '../../services/storage';
import { Wallet, CreditCard } from 'lucide-react-native';
import type { QuickAddTemplate, QuickAddTemplateInput, TransactionType } from '../../types';

interface QuickAddTemplateModalProps {
  template: QuickAddTemplate | null;
  onSave: (input: QuickAddTemplateInput) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
  defaultType?: TransactionType | 'transfer';
}

type TemplateType = TransactionType | 'transfer';

export const QuickAddTemplateModal = ({
  template,
  onSave,
  onClose,
  onDelete,
  defaultType = 'expense',
}: QuickAddTemplateModalProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth = (windowWidth - 48) / 3;

  const allAccounts = accountService.getAll();
  const allPaymentMethods = paymentMethodService.getAll();
  const categories = categoryService.getAll();

  const [name, setName] = useState(template?.name ?? '');
  const [type, setType] = useState<TemplateType>(template?.type ?? defaultType);
  const [amount, setAmount] = useState(template?.amount ? String(template.amount) : '');
  const [categoryId, setCategoryId] = useState(template?.categoryId ?? '');
  const [selectedSourceId, setSelectedSourceId] = useState(template?.accountId ?? template?.paymentMethodId ?? '');
  const [transferFromAccountId, setTransferFromAccountId] = useState(template?.fromAccountId ?? '');
  const [transferFee, setTransferFee] = useState(template?.fee ? String(template.fee) : '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const transactionType: TransactionType = type === 'transfer' ? 'income' : type;
  const filteredCategories = categories.filter((c) => c.type === transactionType);

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (type === 'transfer') {
      const input: QuickAddTemplateInput = {
        name: name.trim(),
        type: 'transfer',
        amount: amount ? parseInt(amount, 10) : undefined,
        fromAccountId: transferFromAccountId || undefined,
        accountId: selectedSourceId || undefined,
        fee: transferFee ? parseInt(transferFee, 10) : undefined,
      };
      onSave(input);
      return;
    }

    const input: QuickAddTemplateInput = {
      name: name.trim(),
      type: type as TransactionType,
      amount: amount ? parseInt(amount, 10) : undefined,
      categoryId: categoryId || undefined,
      accountId: selectedSourceId || undefined,
    };
    onSave(input);
  };

  const isValid = name.trim();

  return (
    <ModalWrapper
      title={template ? 'クイック入力を編集' : 'クイック入力を作成'}
      onClose={onClose}
      isForm
      headerAction={
        template && onDelete ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="p-1">
            <Trash2 size={15} color="#9ca3af" />
          </TouchableOpacity>
        ) : undefined
      }
      footer={
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3 rounded-lg items-center ${isValid ? 'bg-gray-800' : 'bg-gray-300'}`}
        >
          <Text className={`font-semibold text-sm ${isValid ? 'text-white' : 'text-gray-500'}`}>保存</Text>
        </TouchableOpacity>
      }
    >
      <ScrollView contentContainerStyle={{ gap: 20 }} scrollEnabled={false}>
        {/* 名前 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">テンプレート名</Text>
          <View className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 flex-row items-center">
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={name}
              onChangeText={setName}
              placeholder="例: コンビニ"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 種類 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">種類</Text>
          <View className="flex-row rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
            {(['expense', 'income', 'transfer'] as TemplateType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setType(t);
                  setCategoryId('');
                  setSelectedSourceId('');
                  setTransferFromAccountId('');
                }}
                className={`flex-1 py-2.5 items-center ${type === t ? 'bg-gray-800 dark:bg-gray-600' : ''}`}
              >
                <Text className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {t === 'expense' ? '支出' : t === 'income' ? '収入' : '振替'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 金額 */}
        <View>
          <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">金額</Text>
          <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
            <Text className="text-gray-500 mr-1 text-base">¥</Text>
            <DismissibleTextInput
              className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {type !== 'transfer' ? (
          <>
            {/* カテゴリ */}
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">カテゴリ</Text>
              <View className="flex-row flex-wrap gap-2 mx-0">
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
                        <Check size={12} color="#374151" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 支払い元 */}
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">支払い元</Text>
              <View className="flex-row flex-wrap gap-2 mx-0">
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
                      {src.isAccount ? <Wallet size={16} color="#fff" /> : <CreditCard size={16} color="#fff" />}
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
                        <Check size={12} color="#374151" strokeWidth={2.5} />
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
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">入金元</Text>
              <View className="gap-2">
                {allAccounts.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setTransferFromAccountId(acc.id)}
                    className={`flex-row items-center gap-2 px-3 py-2.5 rounded-lg border ${
                      transferFromAccountId === acc.id
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: acc.color }}>
                      <Wallet size={12} color="#fff" />
                    </View>
                    <Text className="text-sm text-gray-900 flex-1">{acc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 振替: 入金先 */}
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">入金先</Text>
              <View className="gap-2">
                {allAccounts
                  .filter((a) => a.id !== transferFromAccountId)
                  .map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setSelectedSourceId(acc.id)}
                      className={`flex-row items-center gap-2 px-3 py-2.5 rounded-lg border ${
                        selectedSourceId === acc.id
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: acc.color }}>
                        <Wallet size={12} color="#fff" />
                      </View>
                      <Text className="text-sm text-gray-900 flex-1">{acc.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            {/* 振替手数料 */}
            <View>
              <Text className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">振替手数料（任意）</Text>
              <View className="flex-row items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3">
                <Text className="text-gray-500 mr-1 text-base">¥</Text>
                <DismissibleTextInput
                  className="flex-1 py-2.5 text-gray-900 dark:text-gray-100"
                  value={transferFee}
                  onChangeText={setTransferFee}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* 削除確認ダイアログ */}
      {template && onDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="テンプレートを削除"
          message="このテンプレートを削除してもよろしいですか？"
          confirmText="削除"
          confirmVariant="danger"
          onConfirm={() => {
            onDelete(template.id);
            onClose();
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </ModalWrapper>
  );
};

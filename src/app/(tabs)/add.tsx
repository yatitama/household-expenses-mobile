import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useAppContext } from '@/context/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FormField } from '@/components/household/form-field';
import { PickerModal } from '@/components/household/picker-modal';
import { generateId } from '@/utils/id';

export default function AddScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState<'cash' | 'card' | 'account'>('cash');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [pickerType, setPickerType] = useState<'category' | 'payment' | null>(null);

  const categories = state.categories.filter((c) => c.type === type);
  const categoryOptions = categories.map((c) => ({ id: c.id, label: c.name }));
  const categoryName = categories.find((c) => c.id === categoryId)?.name || 'カテゴリを選択';

  const paymentOptions =
    paymentMethodType === 'card'
      ? state.cards.map((c) => ({ id: c.id, label: c.name }))
      : paymentMethodType === 'account'
      ? state.accounts.map((a) => ({ id: a.id, label: a.name }))
      : [];

  const paymentName =
    paymentMethodType === 'cash'
      ? '現金'
      : paymentOptions.find((p) => p.id === paymentMethodId)?.label || '支払い方法を選択';

  const handleAdd = () => {
    if (!amount.trim()) {
      Alert.alert('入力してください', '金額を入力してください');
      return;
    }
    if (!categoryId) {
      Alert.alert('入力してください', 'カテゴリを選択してください');
      return;
    }
    if (paymentMethodType !== 'cash' && !paymentMethodId) {
      Alert.alert('入力してください', '支払い方法を選択してください');
      return;
    }

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: generateId(),
        type,
        amount: parseInt(amount, 10),
        categoryId,
        paymentMethodType,
        paymentMethodId: paymentMethodType === 'cash' ? undefined : paymentMethodId,
        date,
        memo: memo.trim() || undefined,
      },
    });

    setAmount('');
    setCategoryId('');
    setPaymentMethodId('');
    setMemo('');
    Alert.alert('成功', '記録しました');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>収支記録</Text>

        <View style={styles.typeSelector}>
          <Text style={[styles.label, { color: colors.text }]}>種類*</Text>
          <View style={styles.typeButtons}>
            <Pressable
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: colors.tint },
              ]}
              onPress={() => {
                setType('expense');
                setCategoryId('');
              }}>
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && { color: '#fff' },
                ]}>
                支出
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeButton,
                type === 'income' && { backgroundColor: colors.tint },
              ]}
              onPress={() => {
                setType('income');
                setCategoryId('');
              }}>
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && { color: '#fff' },
                ]}>
                収入
              </Text>
            </Pressable>
          </View>
        </View>

        <FormField
          label="金額"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="decimal-pad"
          required
        />

        <Pressable
          style={[
            styles.pickerButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.icon,
            },
          ]}
          onPress={() => setPickerType('category')}>
          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            カテゴリ*
          </Text>
          <Text style={[styles.pickerValue, { color: colors.tint }]}>
            {categoryName}
          </Text>
        </Pressable>

        <View style={styles.paymentSelector}>
          <Text style={[styles.label, { color: colors.text }]}>支払い方法*</Text>
          <View style={styles.paymentButtons}>
            <Pressable
              style={[
                styles.paymentButton,
                paymentMethodType === 'cash' && { backgroundColor: colors.tint },
              ]}
              onPress={() => {
                setPaymentMethodType('cash');
                setPaymentMethodId('');
              }}>
              <Text
                style={[
                  styles.paymentButtonText,
                  paymentMethodType === 'cash' && { color: '#fff' },
                ]}>
                現金
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.paymentButton,
                paymentMethodType === 'card' && { backgroundColor: colors.tint },
              ]}
              onPress={() => {
                setPaymentMethodType('card');
                setPaymentMethodId('');
              }}>
              <Text
                style={[
                  styles.paymentButtonText,
                  paymentMethodType === 'card' && { color: '#fff' },
                ]}>
                カード
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.paymentButton,
                paymentMethodType === 'account' && { backgroundColor: colors.tint },
              ]}
              onPress={() => {
                setPaymentMethodType('account');
                setPaymentMethodId('');
              }}>
              <Text
                style={[
                  styles.paymentButtonText,
                  paymentMethodType === 'account' && { color: '#fff' },
                ]}>
                口座
              </Text>
            </Pressable>
          </View>
        </View>

        {paymentMethodType !== 'cash' && (
          <Pressable
            style={[
              styles.pickerButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.icon,
              },
            ]}
            onPress={() => setPickerType('payment')}>
            <Text style={[styles.pickerLabel, { color: colors.text }]}>
              {paymentMethodType === 'card' ? 'カード' : '口座'}*
            </Text>
            <Text style={[styles.pickerValue, { color: colors.tint }]}>
              {paymentName}
            </Text>
          </Pressable>
        )}

        <FormField
          label="日付"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          required
        />

        <FormField
          label="メモ"
          value={memo}
          onChangeText={setMemo}
          placeholder="メモを入力（任意）"
          multiline
        />

        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleAdd}>
          <Text style={styles.buttonText}>記録する</Text>
        </Pressable>
      </View>

      <PickerModal
        visible={pickerType === 'category'}
        items={categoryOptions}
        selectedId={categoryId}
        onSelect={(item) => setCategoryId(item.id)}
        onClose={() => setPickerType(null)}
        title="カテゴリを選択"
      />

      <PickerModal
        visible={pickerType === 'payment'}
        items={paymentOptions}
        selectedId={paymentMethodId}
        onSelect={(item) => setPaymentMethodId(item.id)}
        onClose={() => setPickerType(null)}
        title={paymentMethodType === 'card' ? 'カードを選択' : '口座を選択'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 14,
  },
  paymentSelector: {
    marginBottom: 16,
  },
  paymentButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

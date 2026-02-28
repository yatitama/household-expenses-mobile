import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FormField } from '@/components/household/form-field';
import { ColorPicker } from '@/components/household/color-picker';
import { PickerModal } from '@/components/household/picker-modal';
import { generateId } from '@/utils/id';

export default function AddCardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [billingAccountId, setBillingAccountId] = useState('');
  const [color, setColor] = useState('#0a7ea4');
  const [pickerType, setPickerType] = useState<'owner' | 'account' | null>(null);

  const memberOptions = state.members.map((m) => ({ id: m.id, label: m.name }));
  const accountOptions = state.accounts
    .filter((a) => a.ownerId === ownerId)
    .map((a) => ({ id: a.id, label: a.name }));

  const ownerName = state.members.find((m) => m.id === ownerId)?.name || 'オーナーを選択';
  const accountName = state.accounts.find((a) => a.id === billingAccountId)?.name || '口座を選択';

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('入力してください', 'カード名を入力してください');
      return;
    }
    if (!ownerId) {
      Alert.alert('入力してください', 'オーナーを選択してください');
      return;
    }
    if (!billingAccountId) {
      Alert.alert('入力してください', '請求口座を選択してください');
      return;
    }

    dispatch({
      type: 'ADD_CARD',
      payload: {
        id: generateId(),
        name: name.trim(),
        ownerId,
        billingAccountId,
        color,
      },
    });

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>
          カードを追加
        </Text>
        <FormField
          label="カード名"
          value={name}
          onChangeText={setName}
          placeholder="カード名を入力"
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
          onPress={() => setPickerType('owner')}>
          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            オーナー*
          </Text>
          <Text style={[styles.pickerValue, { color: colors.tint }]}>
            {ownerName}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.pickerButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.icon,
            },
          ]}
          disabled={!ownerId}
          onPress={() => setPickerType('account')}>
          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            請求口座*
          </Text>
          <Text
            style={[
              styles.pickerValue,
              {
                color: !ownerId ? colors.icon : colors.tint,
              },
            ]}>
            {accountName}
          </Text>
        </Pressable>

        <ColorPicker selectedColor={color} onColorSelect={setColor} />

        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleAdd}>
          <Text style={styles.buttonText}>追加</Text>
        </Pressable>
      </View>

      <PickerModal
        visible={pickerType === 'owner'}
        items={memberOptions}
        selectedId={ownerId}
        onSelect={(item) => {
          setOwnerId(item.id);
          setBillingAccountId('');
        }}
        onClose={() => setPickerType(null)}
        title="オーナーを選択"
      />

      <PickerModal
        visible={pickerType === 'account'}
        items={accountOptions}
        selectedId={billingAccountId}
        onSelect={(item) => setBillingAccountId(item.id)}
        onClose={() => setPickerType(null)}
        title="請求口座を選択"
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
    marginBottom: 16,
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

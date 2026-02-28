import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/context/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FormField } from '@/components/household/form-field';
import { ColorPicker } from '@/components/household/color-picker';
import { PickerModal } from '@/components/household/picker-modal';

export default function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [color, setColor] = useState('#0a7ea4');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    const account = state.accounts.find((a) => a.id === id);
    if (account) {
      setName(account.name);
      setOwnerId(account.ownerId);
      setColor(account.color || '#0a7ea4');
    }
  }, [id, state.accounts]);

  const memberOptions = state.members.map((m) => ({ id: m.id, label: m.name }));
  const ownerName =
    state.members.find((m) => m.id === ownerId)?.name || 'オーナーを選択';

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('入力してください', '口座名を入力してください');
      return;
    }
    if (!ownerId) {
      Alert.alert('入力してください', 'オーナーを選択してください');
      return;
    }

    dispatch({
      type: 'UPDATE_ACCOUNT',
      payload: { id: id!, name: name.trim(), ownerId, color },
    });

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>
          口座を編集
        </Text>
        <FormField
          label="口座名"
          value={name}
          onChangeText={setName}
          placeholder="口座名を入力"
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
          onPress={() => setPickerVisible(true)}>
          <Text style={[styles.pickerLabel, { color: colors.text }]}>
            オーナー*
          </Text>
          <Text style={[styles.pickerValue, { color: colors.tint }]}>
            {ownerName}
          </Text>
        </Pressable>

        <ColorPicker selectedColor={color} onColorSelect={setColor} />

        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleSave}>
          <Text style={styles.buttonText}>保存</Text>
        </Pressable>
      </View>

      <PickerModal
        visible={pickerVisible}
        items={memberOptions}
        selectedId={ownerId}
        onSelect={(item) => setOwnerId(item.id)}
        onClose={() => setPickerVisible(false)}
        title="オーナーを選択"
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

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
import { generateId } from '@/utils/id';

export default function AddMemberScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { dispatch } = useAppContext();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#0a7ea4');

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('入力してください', 'メンバー名を入力してください');
      return;
    }

    dispatch({
      type: 'ADD_MEMBER',
      payload: { id: generateId(), name: name.trim(), color },
    });

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>
          メンバーを追加
        </Text>
        <FormField
          label="メンバー名"
          value={name}
          onChangeText={setName}
          placeholder="メンバー名を入力"
          required
        />
        <ColorPicker selectedColor={color} onColorSelect={setColor} />
        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleAdd}>
          <Text style={styles.buttonText}>追加</Text>
        </Pressable>
      </View>
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

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

export default function EditMemberScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#0a7ea4');

  useEffect(() => {
    const member = state.members.find((m) => m.id === id);
    if (member) {
      setName(member.name);
      setColor(member.color || '#0a7ea4');
    }
  }, [id, state.members]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('入力してください', 'メンバー名を入力してください');
      return;
    }

    dispatch({
      type: 'UPDATE_MEMBER',
      payload: { id: id!, name: name.trim(), color },
    });

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>
          メンバーを編集
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
          onPress={handleSave}>
          <Text style={styles.buttonText}>保存</Text>
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

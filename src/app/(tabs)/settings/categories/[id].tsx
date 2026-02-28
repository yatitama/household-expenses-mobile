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
import { IconPicker } from '@/components/household/icon-picker';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [color, setColor] = useState('#FF6B6B');
  const [icon, setIcon] = useState('folder.fill');

  useEffect(() => {
    const category = state.categories.find((c) => c.id === id);
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color || '#FF6B6B');
      setIcon(category.icon || 'folder.fill');
    }
  }, [id, state.categories]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('入力してください', 'カテゴリ名を入力してください');
      return;
    }

    dispatch({
      type: 'UPDATE_CATEGORY',
      payload: { id: id!, name: name.trim(), type, color, icon },
    });

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>
          カテゴリを編集
        </Text>
        <FormField
          label="カテゴリ名"
          value={name}
          onChangeText={setName}
          placeholder="カテゴリ名を入力"
          required
        />
        <View style={styles.typeSelector}>
          <Text style={[styles.label, { color: colors.text }]}>種類*</Text>
          <View style={styles.typeButtons}>
            <Pressable
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: colors.tint },
              ]}
              onPress={() => setType('expense')}>
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
              onPress={() => setType('income')}>
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
        <ColorPicker selectedColor={color} onColorSelect={setColor} />
        <IconPicker selectedIcon={icon} onIconSelect={setIcon} />
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

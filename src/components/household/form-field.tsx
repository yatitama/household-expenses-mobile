import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  required = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.icon,
            backgroundColor: colors.background,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ColorPickerProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
}

const PRESET_COLORS = [
  '#FF6B6B', // Red
  '#FF8E72', // Orange
  '#FFA94D', // Light Orange
  '#FFD43B', // Yellow
  '#69DB7C', // Green
  '#4CAF50', // Dark Green
  '#00D9FF', // Cyan
  '#748EF6', // Blue
  '#9775FA', // Purple
  '#F06595', // Pink
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor = '#0a7ea4',
  onColorSelect,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>色を選択</Text>
      <View style={styles.grid}>
        {PRESET_COLORS.map((color, index) => (
          <Pressable
            key={color}
            style={[
              styles.colorButton,
              {
                backgroundColor: color,
                borderWidth: selectedColor?.toUpperCase() === color.toUpperCase() ? 3 : 0,
                borderColor: colors.text,
              },
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 12,
  },
});

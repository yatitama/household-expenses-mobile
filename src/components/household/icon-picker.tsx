import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
}

const PRESET_ICONS = [
  'fork.knife' as const,
  'car.fill' as const,
  'airplane' as const,
  'house.fill' as const,
  'building.2.fill' as const,
  'heart.fill' as const,
  'book.fill' as const,
  'briefcase.fill' as const,
  'pills.fill' as const,
  'person.fill' as const,
  'bag.fill' as const,
  'film.fill' as const,
  'gamecontroller.fill' as const,
  'music.note' as const,
  'paintpalette.fill' as const,
  'graduationcap.fill' as const,
  'dollarsign.circle.fill' as const,
  'creditcard.fill' as const,
  'iphone' as const,
  'laptopcomputer' as const,
  'gift.fill' as const,
  'globe' as const,
  'camera.fill' as const,
  'star.fill' as const,
];

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon = 'folder.fill',
  onIconSelect,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>アイコンを選択</Text>
      <FlatList
        scrollEnabled={false}
        numColumns={8}
        data={PRESET_ICONS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor:
                  selectedIcon === item
                    ? colors.tint + '20'
                    : colors.background,
                borderWidth: selectedIcon === item ? 2 : 1,
                borderColor: selectedIcon === item ? colors.tint : '#e0e0e0',
              },
            ]}
            onPress={() => onIconSelect(item)}>
            <IconSymbol size={32} name={item} color={colors.text} />
          </Pressable>
        )}
        columnWrapperStyle={styles.row}
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
  row: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  iconButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    margin: 4,
  },
});

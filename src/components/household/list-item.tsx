import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ListItemProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  onDelete?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  label,
  subtitle,
  onPress,
  onDelete,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: '#f0f0f0',
        },
      ]}
      onPress={onPress}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.icon }]}>{subtitle}</Text>}
      </View>
      {onDelete && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={styles.deleteButton}>
          <Text style={styles.deleteText}>削除</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

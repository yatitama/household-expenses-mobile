import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PickerItem {
  id: string;
  label: string;
}

interface PickerModalProps {
  visible: boolean;
  items: PickerItem[];
  selectedId?: string;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
  title: string;
}

export const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  items,
  selectedId,
  onSelect,
  onClose,
  title,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSelect = (item: PickerItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.tint }]}>キャンセル</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.item,
                {
                  backgroundColor:
                    selectedId === item.id
                      ? colors.tint + '20'
                      : colors.background,
                },
              ]}
              onPress={() => handleSelect(item)}>
              <Text
                style={[
                  styles.itemLabel,
                  {
                    color: colors.text,
                    fontWeight: selectedId === item.id ? '600' : '400',
                  },
                ]}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 60,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLabel: {
    fontSize: 16,
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/app-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CategoriesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, dispatch } = useAppContext();

  const handleDelete = (id: string) => {
    Alert.alert('削除してもよろしいですか？', '削除すると復元できません', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
      },
    ]);
  };

  const expenseCategories = state.categories.filter((c) => c.type === 'expense');
  const incomeCategories = state.categories.filter((c) => c.type === 'income');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          カテゴリ一覧
        </Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/settings/categories/add')}>
          <Text style={styles.addButtonText}>+ カテゴリ追加</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        <Text style={[styles.listTitle, { color: colors.text }]}>支出 ({expenseCategories.length})</Text>
        {expenseCategories.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            カテゴリがありません
          </Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={expenseCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItemWrapper}>
                <IconSymbol
                  size={20}
                  name={(item.icon || 'folder.fill') as any}
                  color={item.color || '#FF6B6B'}
                />
                <Pressable
                  style={styles.listItemContent}
                  onPress={() => router.push(`/settings/categories/${item.id}`)}>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>
                    {item.name}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}>
                  <Text style={styles.deleteText}>削除</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        <Text style={[styles.listTitle, { color: colors.text, marginTop: 16 }]}>収入 ({incomeCategories.length})</Text>
        {incomeCategories.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            カテゴリがありません
          </Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={incomeCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItemWrapper}>
                <IconSymbol
                  size={20}
                  name={(item.icon || 'folder.fill') as any}
                  color={item.color || '#FF6B6B'}
                />
                <Pressable
                  style={styles.listItemContent}
                  onPress={() => router.push(`/settings/categories/${item.id}`)}>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>
                    {item.name}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}>
                  <Text style={styles.deleteText}>削除</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 24,
  },
  listItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
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

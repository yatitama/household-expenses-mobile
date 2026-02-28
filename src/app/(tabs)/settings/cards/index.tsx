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

export default function CardsListScreen() {
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
        onPress: () => dispatch({ type: 'DELETE_CARD', payload: id }),
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          カード一覧 ({state.cards.length})
        </Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/settings/cards/add')}>
          <Text style={styles.addButtonText}>+ カード追加</Text>
        </Pressable>
      </View>

      {state.cards.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          カードがありません
        </Text>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={state.cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItemWrapper}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: item.color || '#0a7ea4' },
                ]}
              />
              <Pressable
                style={styles.listItemContent}
                onPress={() => router.push(`/settings/cards/${item.id}`)}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemSubtitle, { color: colors.icon }]}>
                  {state.members.find((m) => m.id === item.ownerId)?.name} - {state.accounts.find((a) => a.id === item.billingAccountId)?.name}
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 24,
  },
  listItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
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

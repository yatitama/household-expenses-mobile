import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MenuItem = ({
  title,
  href,
  colors,
}: {
  title: string;
  href: string;
  colors: typeof Colors['light'];
}) => {
  const router = useRouter();

  return (
    <Pressable
      style={{
        ...styles.menuItem,
        backgroundColor: colors.background,
        borderBottomColor: '#f0f0f0',
      }}
      onPress={() => router.push(href)}>
      <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.arrow, { color: colors.icon }]}>›</Text>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>管理</Text>
        <MenuItem title="メンバー" href="/settings/members" colors={colors} />
        <MenuItem title="カテゴリ" href="/settings/categories" colors={colors} />
        <MenuItem title="口座" href="/settings/accounts" colors={colors} />
        <MenuItem title="カード" href="/settings/cards" colors={colors} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
  },
});

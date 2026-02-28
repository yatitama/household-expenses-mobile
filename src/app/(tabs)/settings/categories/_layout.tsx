import { Stack } from 'expo-router';

export default function CategoriesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'カテゴリ管理',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'カテゴリを追加',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'カテゴリを編集',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

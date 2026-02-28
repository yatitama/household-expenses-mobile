import { Stack } from 'expo-router';

export default function CardsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'カード管理',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'カードを追加',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'カードを編集',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

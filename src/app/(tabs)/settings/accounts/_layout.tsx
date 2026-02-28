import { Stack } from 'expo-router';

export default function AccountsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '口座管理',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: '口座を追加',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '口座を編集',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

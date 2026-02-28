import { Stack } from 'expo-router';

export default function MembersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'メンバー管理',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'メンバーを追加',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'メンバーを編集',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

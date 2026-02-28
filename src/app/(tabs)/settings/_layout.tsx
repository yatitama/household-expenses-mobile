import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '設定',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="accounts"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cards"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

import '../lib/location';
import { Stack } from 'expo-router';
import { Provider } from '../lib/provider';
export default function Layout() {
  return <Provider><Stack screenOptions={{ headerShadowVisible: false, headerTintColor: '#222', contentStyle: { backgroundColor: '#fff' } }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="login" options={{ title: 'ログイン', headerBackVisible: false }} />
    <Stack.Screen name="register" options={{ title: '新規登録' }} />
    <Stack.Screen name="account" options={{ title: 'アカウント' }} />
    <Stack.Screen name="logout" options={{ title: 'ログアウト' }} />
    <Stack.Screen name="delete-account" options={{ title: 'アカウント削除' }} />
    <Stack.Screen name="scan" options={{ title: '街をスキャン' }} />
  </Stack></Provider>;
}

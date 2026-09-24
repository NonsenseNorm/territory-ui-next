import { View, Text } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useApp } from '../lib/provider';
import { Button, ui } from '../components/ui';
export default function Account() {
  const { auth } = useApp();
  if (!auth) return <Redirect href="/login" />;
  return <View style={ui.page}>
    <Text style={ui.title}>アカウント</Text><Text style={ui.text}>{auth.user.email}</Text>
    <Button title="ログアウト" secondary onPress={() => router.push('/logout')} />
    <Button title="アカウントを削除" secondary onPress={() => router.push('/delete-account')} />
  </View>;
}

import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, ui } from './ui';
import { useApp } from '../lib/provider';
import { api, supabase } from '../lib/supabase';
import { pauseSharing, stopBackground } from '../lib/location';
export function EndAccount({ deleting = false }: { deleting?: boolean }) {
  const { auth, setSharing } = useApp();
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!auth) return <Redirect href="/login" />;
  async function submit() {
    setBusy(true); pauseSharing(true);
    try {
      await api(deleting ? '/account' : '/auth/logout', deleting ? 'DELETE' : 'POST');
      setSharing(null);
      await stopBackground().catch(() => undefined);
      await AsyncStorage.multiRemove(['territory-pending-exit', 'territory-nfc-operation']);
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/login');
    } catch (e) { pauseSharing(false); setError(e instanceof Error ? e.message : '処理に失敗しました。'); }
    finally { setBusy(false); }
  }
  return <View style={ui.page}>
    <Text style={ui.title}>{deleting ? 'アカウントを削除' : 'ログアウト'}</Text>
    <Text style={ui.text}>{deleting ? 'アカウント、公開セッション、関連するスキャンと位置情報を削除します。この操作は取り消せません。確認のため「削除」と入力してください。' : '公開セッションを終了し、位置情報の共有を停止してログアウトします。'}</Text>
    {deleting && <TextInput accessibilityLabel="削除の確認" style={ui.input} value={confirmation} onChangeText={setConfirmation} placeholder="削除" editable={!busy} />}
    {!!error && <Text style={ui.error}>{error}</Text>}
    <Button title={busy ? '処理中…' : deleting ? '完全に削除する' : 'ログアウトする'} disabled={busy || (deleting && confirmation !== '削除')} onPress={submit} />
    <Button title="戻る" secondary disabled={busy} onPress={() => router.back()} />
  </View>;
}

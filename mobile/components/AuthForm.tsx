import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, ui } from './ui';
import { supabase, configured } from '../lib/supabase';
import { useApp } from '../lib/provider';
export function AuthForm({ register = false }: { register?: boolean }) {
  const { auth } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (auth) return <Redirect href="/" />;
  async function submit() {
    setBusy(true); setMessage('');
    try {
      if (!configured) throw new Error('Supabaseの接続設定が必要です。');
      const credentials = { email: email.trim(), password };
      const { error, data } = register ? await supabase.auth.signUp(credentials) : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (data.session) router.replace('/');
      else setMessage('確認メールを送信しました。メール内のリンクで認証してからログインしてください。');
    } catch (e) { setMessage(e instanceof Error ? e.message : '認証に失敗しました。'); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[ui.page, { flexGrow: 1, justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
      <Text style={ui.title}>{register ? 'アカウントを作成' : 'おかえりなさい'}</Text>
      <Text style={ui.text}>NFCタグにタッチして、街の場所に参加します。</Text>
      <TextInput accessibilityLabel="メールアドレス" placeholder="メールアドレス" style={ui.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!busy} />
      <TextInput accessibilityLabel="パスワード" placeholder={register ? 'パスワード（8文字以上）' : 'パスワード'} style={ui.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={register ? 'new-password' : 'current-password'} editable={!busy} />
      {!!message && <Text accessibilityLiveRegion="polite" style={ui.error}>{message}</Text>}
      <Button title={busy ? '処理中…' : register ? '新規登録' : 'ログイン'} disabled={busy || !email.trim() || password.length < (register ? 8 : 1)} onPress={submit} />
      <Button secondary title={register ? 'ログインへ' : '新規登録へ'} disabled={busy} onPress={() => router.replace(register ? '/login' : '/register')} />
    </ScrollView>
  </KeyboardAvoidingView>;
}

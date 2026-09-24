import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionScreen, type ConnectionStatus } from '../components/ConnectionScreen';
import { Button } from '../components/ui';
import { useApp } from '../lib/provider';
import { api, configured, ApiError } from '../lib/supabase';
import { readTag } from '../lib/nfc';
import { position, startBackground, pauseSharing, stopBackground } from '../lib/location';
import type { Sharing } from '../lib/types';

const PENDING = 'territory-nfc-operation';
export default function Home() {
  const { auth, ready, sharing, setSharing, error, setError } = useApp();
  const [phase, setPhase] = useState<ConnectionStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const completion = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if(completion.current) clearTimeout(completion.current); }, []);
  async function touch() {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    pauseSharing(true);
    try {
      // Preserve an operation UUID until acknowledged: retry cannot toggle twice.
      const saved = await AsyncStorage.getItem(PENDING);
      let body;
      if (saved) body = JSON.parse(saved);
      else {
        const tag_number = await readTag();
        setPhase('loading');
        // Re-tapping to leave works even if GPS permission was revoked.
        const gps = sharing ? {} : await position();
        body = { tag_number, operation_id: Crypto.randomUUID(), ...gps };
        await AsyncStorage.setItem(PENDING, JSON.stringify(body));
      }
      setPhase('loading');
      const { session } = await api<{ session: Sharing | null }>('/nfc/toggle', 'POST', body);
      await AsyncStorage.removeItem(PENDING);
      setSharing(session); setPhase('complete');
      completion.current = setTimeout(() => setPhase(null), 900);
      if (session) {
        try { if (!(await startBackground())) setError('バックグラウンド位置情報が未許可です。画面を開いている間のみ応答します。'); }
        catch { setError('バックグラウンド位置情報を開始できませんでした。端末の設定を確認してください。'); }
      } else await stopBackground();
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400 && e.status < 500) await AsyncStorage.removeItem(PENDING);
      setPhase(null); setError(e instanceof Error ? e.message : 'NFC処理に失敗しました。');
    }
    finally { pauseSharing(false); locked.current = false; setBusy(false); }
  }
  async function ghost(value: boolean) {
    if (!sharing || locked.current) return;
    locked.current = true; setBusy(true); pauseSharing(true);
    try { const result = await api<{ session: Sharing | null }>(`/sessions/${sharing.id}/ghost`, 'PATCH', { ghost: value }); setSharing(result.session); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : '変更できませんでした。'); }
    finally { pauseSharing(false); setBusy(false); locked.current = false; }
  }
  if (!ready) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!configured) return <SafeAreaView style={styles.page}><Text style={styles.setup}>Supabaseの接続設定が必要です。mobile/.envにURLと公開キーを設定してください。</Text></SafeAreaView>;
  if (!auth) return <Redirect href="/login" />;
  return <SafeAreaView style={styles.page}>
    <View style={styles.top}><Text style={styles.place}>{sharing?.places.name ?? ''}</Text><Button title="アカウント" secondary onPress={() => router.push('/account')} /></View>
    <ConnectionScreen status={phase ?? (sharing ? 'online' : 'offline')} ghost={sharing?.ghost ?? false} busy={busy} onGhostChange={ghost} onTouch={touch} />
    <View style={styles.bottom}>
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <Button title="街をスキャン" secondary disabled={!sharing || busy} onPress={() => router.push('/scan')} />
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  top: { position: 'absolute', top: 48, left: 24, right: 24, zIndex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  place: { color: '#777', fontSize: 13 },
  bottom: { position: 'absolute', bottom: 32, left: 32, right: 32 },
  error: { fontSize: 12, color: '#b42318', textAlign: 'center', marginBottom: 12 },
  setup: { padding: 32, fontSize: 16, lineHeight: 26 },
});

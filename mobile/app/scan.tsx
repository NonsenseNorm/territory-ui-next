import { useEffect, useRef, useState } from 'react';
import { AppState, FlatList, Text, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../lib/provider';
import { api } from '../lib/supabase';
import type { Scan } from '../lib/types';
import { Button, ui } from '../components/ui';
export default function ScanPage() {
  const { auth, sharing } = useApp();
  const [scan, setScan] = useState<Scan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const activeId = useRef<string | null>(null);
  const scanning = !!scan && now < Date.parse(scan.expires_at);
  useEffect(() => { if (!sharing) { activeId.current=null; setScan(null); } }, [sharing?.id]);
  useEffect(() => {
    const id = scan?.id;
    if (!id) return;
    let alive = true, inFlight = false;
    const update = async () => {
      setNow(Date.now());
      if (!alive || inFlight || AppState.currentState !== 'active') return;
      inFlight = true;
      try {
        const result = await api<Scan>(`/scans/${id}`);
        if (alive && activeId.current === id) { setScan(result); setError(''); }
      } catch(e) {
        if (alive) { setScan(current => current ? { ...current, results: [] } : null); setError(e instanceof Error ? e.message : '取得できませんでした。'); }
      } finally { inFlight = false; }
    };
    void update();
    const timer = setInterval(update, 2000);
    const listener = AppState.addEventListener('change', state => {
      if(state !== 'active') setScan(current => current ? { ...current, results: [] } : null);
      else void update();
    });
    return () => { alive = false; clearInterval(timer); listener.remove(); };
  }, [scan?.id]);
  async function start() {
    if (!sharing || busy) return;
    setBusy(true); setError(''); setScan(null); activeId.current=null;
    try { const result = await api<Scan>('/scans', 'POST', { city_id: sharing.places.city_id }); activeId.current=result.id; setNow(Date.now()); setScan(result); }
    catch(e) { setError(e instanceof Error ? e.message : 'スキャンできませんでした。'); }
    finally { setBusy(false); }
  }
  if (!auth) return <Redirect href="/login" />;
  return <View style={ui.page}>
    <Text style={ui.title}>街をスキャン</Text>
    <Text style={ui.text}>{sharing ? `${sharing.places.name}が属する街のすべての場所を対象に、現在位置を要求します。` : 'NFCタグにタッチして場所に参加してください。'}</Text>
    <Button title={busy ? '開始中…' : scanning ? '位置情報の応答を待っています…' : 'スキャンする'} disabled={busy || scanning || !sharing} onPress={start} />
    {!!error && <Text style={ui.error}>{error}</Text>}
    <Text style={ui.text}>{scan ? `${scan.results.length}件の応答${scanning ? `・残り${Math.max(0,Math.ceil((Date.parse(scan.expires_at)-now)/1000))}秒` : '・受付終了'}` : '位置情報はスキャンへの回答が届くと表示されます。'}</Text>
    <FlatList data={sharing ? scan?.results ?? [] : []} keyExtractor={item => item.session_id}
      ListEmptyComponent={<Text style={styles.empty}>{scan && !scanning ? '応答はありませんでした。ゴーストモード中や通信できない端末は表示されません。' : '表示できる位置情報はまだありません。'}</Text>}
      renderItem={({item}) => <View style={styles.row}>
        <Text style={styles.name}>{item.place_name}</Text>
        <Text style={styles.detail}>ユーザー {item.user_id.slice(0,8)}</Text>
        <Text selectable style={styles.coordinates}>{item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</Text>
        <Text style={styles.detail}>精度 ±{Math.round(item.accuracy)}m ・ {new Date(item.recorded_at).toLocaleTimeString('ja-JP')}</Text>
      </View>} />
  </View>;
}
const styles = StyleSheet.create({ row: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 18 }, name: { fontSize: 16, fontWeight: '600', marginBottom: 5 }, coordinates: { fontSize: 18, marginVertical: 8, color: '#222' }, detail: { fontSize: 12, color: '#777' }, empty: { color: '#888', fontSize: 13, lineHeight: 22, marginTop: 32 } });

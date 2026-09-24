import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
export type ConnectionStatus = 'offline' | 'loading' | 'complete' | 'online';
const states = {
  offline: { source: require('../../public/radiowave-offline.svg'), width: 147, height: 133, label: 'ステッカーにタッチ' },
  loading: { source: require('../../public/loading.svg'), width: 140, height: 140, label: '読み込み中' },
  complete: { source: require('../../public/complete.svg'), width: 144, height: 144, label: '完了' },
  online: { source: require('../../public/radiowave-online.svg'), width: 163, height: 139, label: 'オンラインです' },
};
export function ConnectionScreen({ status, ghost, busy, onGhostChange, onTouch }: { status: ConnectionStatus; ghost: boolean; busy: boolean; onGhostChange: (value: boolean) => void; onTouch: () => void }) {
  const state = states[status];
  return <View style={styles.screen}>
    <View style={styles.center}>
      <Pressable accessibilityRole="button" accessibilityLabel={status === 'online' ? 'NFCタグを読み取って退出' : 'NFCタグを読み取って参加'} disabled={busy} onPress={onTouch} style={styles.antenna}>
        <Image source={state.source} style={{ width: state.width, height: state.height }} contentFit="contain" />
        <Text accessibilityLiveRegion="polite" style={styles.caption}>{status === 'offline' || status === 'online' ? (ghost && status === 'online' ? '位置情報を隠しています' : state.label) : ''}</Text>
      </Pressable>
      <View style={styles.toggle}>
        <Switch accessibilityLabel="ゴーストモード" value={ghost} disabled={busy || status !== 'online'} onValueChange={onGhostChange} trackColor={{ false: '#ddd', true: '#33f940' }} />
        <Text style={styles.toggleLabel}>ゴーストモード</Text>
      </View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', width: 220, height: 156 },
  antenna: { height: 156, alignItems: 'center', justifyContent: 'flex-end' },
  caption: { height: 16, fontSize: 12, lineHeight: 16, color: '#000' },
  toggle: { position: 'absolute', top: 174, alignItems: 'center', gap: 6 },
  toggleLabel: { fontSize: 11, color: '#555' },
});

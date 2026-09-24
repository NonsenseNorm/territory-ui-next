import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { api } from './supabase';
import { insideBoundary } from './geometry';
import type { Sharing, Coordinates } from './types';

const TASK = 'territory-location';
const EXIT_KEY = 'territory-pending-exit';
let worker: Promise<Sharing | null> | null = null;
let paused = false;
export function pauseSharing(value: boolean) { paused = value; }
export async function position(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new Error('位置情報の利用を許可してください。');
  let timer: ReturnType<typeof setTimeout> | undefined;
  const point = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error('位置情報の取得がタイムアウトしました。')), 12000); }),
  ]).finally(() => { if (timer) clearTimeout(timer); });
  if (point.coords.accuracy === null || point.coords.accuracy > 100) throw new Error('位置情報の精度が不足しています。屋外などで再試行してください。');
  return { latitude: point.coords.latitude, longitude: point.coords.longitude, accuracy: point.coords.accuracy, recorded_at: new Date(point.timestamp).toISOString() };
}
export async function leave(sessionId: string) {
  // Persist before networking: an offline exit must never resume sharing on reconnect.
  await AsyncStorage.setItem(EXIT_KEY, sessionId);
  await api(`/sessions/${sessionId}`, 'DELETE');
  await AsyncStorage.removeItem(EXIT_KEY);
}
async function run(point?: Coordinates): Promise<Sharing | null> {
  const pending = await AsyncStorage.getItem(EXIT_KEY);
  if (pending) await leave(pending);
  let { session } = await api<{ session: Sharing | null }>('/session');
  if (!session) { await stopBackground(); return null; }
  if (paused) return session;
  const current = point ?? await position();
  if (!insideBoundary(session.places.boundary, current.latitude, current.longitude)) {
    await leave(session.id);
    return null;
  }
  // Ghost mode still checks exits; no coordinates are uploaded by heartbeat.
  ({ session } = await api<{ session: Sharing | null }>(`/sessions/${session.id}/heartbeat`, 'POST'));
  if (!session || session.ghost || paused) return session;
  const requests = await api<{ id: string; created_at: string }[]>('/location-requests');
  if (requests.length) {
    const fresh = await position();
    if (!insideBoundary(session.places.boundary, fresh.latitude, fresh.longitude)) { await leave(session.id); return null; }
    for (const request of requests) {
      if (paused) break;
      const response = await api<{ session?: null }>(`/location-requests/${request.id}/response`, 'POST', fresh);
      if (response.session === null) return null;
    }
  }
  return session;
}
export function synchronize(point?: Coordinates) {
  if (!worker) worker = run(point).finally(() => { worker = null; });
  return worker;
}
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(TASK, async ({ data, error }) => {
  if (error || !data?.locations.length) return;
  const p = data.locations[data.locations.length - 1];
  if (p.coords.accuracy === null || p.coords.accuracy > 100 || Date.now() - p.timestamp > 30000) return;
  try { await synchronize({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, recorded_at: new Date(p.timestamp).toISOString() }); }
  catch { /* Pending exits stay persisted; server leases expire if connectivity is lost. */ }
});
export async function startBackground() {
  if (Platform.OS === 'web') return false;
  const { granted } = await Location.requestBackgroundPermissionsAsync();
  if (!granted) return false;
  if (!(await Location.hasStartedLocationUpdatesAsync(TASK))) await Location.startLocationUpdatesAsync(TASK, {
    accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 10000,
    pausesUpdatesAutomatically: false, showsBackgroundLocationIndicator: true,
    foregroundService: { notificationTitle: '場所への参加中', notificationBody: '退出を検知し、許可されたスキャンに応答します。' },
  });
  return true;
}
export async function stopBackground() {
  if (Platform.OS !== 'web' && await Location.hasStartedLocationUpdatesAsync(TASK)) await Location.stopLocationUpdatesAsync(TASK);
}

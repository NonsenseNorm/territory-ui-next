import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
export const configured = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    const count = Number(await SecureStore.getItemAsync(key + '.count'));
    if (!count) return null;
    const parts = await Promise.all(Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(key + '.' + i)));
    return parts.some(x => x === null) ? null : parts.join('');
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    const parts = value.match(/[\s\S]{1,1000}/g) ?? [];
    await Promise.all(parts.map((part, i) => SecureStore.setItemAsync(key + '.' + i, part)));
    await SecureStore.setItemAsync(key + '.count', String(parts.length));
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    const count = Number(await SecureStore.getItemAsync(key + '.count'));
    await SecureStore.deleteItemAsync(key + '.count');
    await Promise.all(Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(key + '.' + i)));
  },
};
export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://unconfigured.supabase.co', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'unconfigured', {
  auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock },
});
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('ログインしてください。');
  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/api${path}`, {
    method, headers: { Authorization: `Bearer ${session.access_token}`, apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok) throw new ApiError(result.error || '通信に失敗しました。', response.status);
  return result as T;
}

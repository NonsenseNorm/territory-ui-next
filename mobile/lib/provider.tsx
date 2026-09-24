import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase, configured } from './supabase';
import { synchronize, pauseSharing, stopBackground } from './location';
import type { Sharing } from './types';

type State = { auth: Session | null; ready: boolean; sharing: Sharing | null; error: string; setError: (error: string) => void; refresh: () => Promise<void>; setSharing: (sharing: Sharing | null) => void };
const Context = createContext<State | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [sharing, setSharing] = useState<Sharing | null>(null);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const setCurrent = (value: Sharing | null) => { generation.current++; setSharing(value); };
  async function refresh() {
    const version = generation.current;
    const value = await synchronize();
    if (version === generation.current) { setSharing(value); setError(''); }
  }
  useEffect(() => {
    if (!configured) { setReady(true); return; }
    supabase.auth.getSession().then(({ data, error }) => { if(error) setError(error.message); setAuth(data.session); setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session); setReady(true);
      if (!session) { generation.current++; setSharing(null); pauseSharing(true); void stopBackground().catch(() => undefined); }
      else pauseSharing(false);
    });
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh();
    });
    return () => { subscription.unsubscribe(); listener.remove(); };
  }, []);
  useEffect(() => {
    if (!auth) return;
    let active = true;
    const tick = async () => {
      if (!active || AppState.currentState !== 'active') return;
      try { await refresh(); } catch (e) {
        if (active) { setError(e instanceof Error ? e.message : '同期に失敗しました。'); setSharing(null); }
      }
    };
    void tick();
    const interval = setInterval(tick, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [auth?.user.id]);
  useEffect(() => {
    if (!sharing) return;
    const timer = setTimeout(() => { generation.current++; setSharing(null); }, Math.max(0, Date.parse(sharing.expires_at) - Date.now()));
    return () => clearTimeout(timer);
  }, [sharing?.id, sharing?.expires_at]);
  return <Context.Provider value={{ auth, ready, sharing, error, setError, refresh, setSharing: setCurrent }}>{children}</Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('Provider required'); return value; }

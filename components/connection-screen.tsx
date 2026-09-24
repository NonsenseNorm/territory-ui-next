'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Frame } from './ui';
import { useDemo } from './demo-provider';
import { demoPlace } from '@/lib/demo';
type Status = 'offline' | 'loading' | 'complete' | 'online';
const states = {
  offline: { asset: 'radiowave-offline', width: 147, height: 133, label: 'ステッカーにタッチ' },
  loading: { asset: 'loading', width: 140, height: 140, label: '読み込み中' },
  complete: { asset: 'complete', width: 144, height: 144, label: '完了' },
  online: { asset: 'radiowave-online', width: 163, height: 139, label: 'オンラインです' },
};
export function ConnectionScreen({ fixture }: { fixture?: string }) {
  const router = useRouter(); const demo = useDemo();
  const [override, setOverride] = useState<boolean | null>(fixture ? ['online', 'ghost'].includes(fixture) : null);
  const [ghostOverride, setGhostOverride] = useState<boolean | null>(fixture ? fixture === 'ghost' : null);
  const [phase, setPhase] = useState<Status | null>(fixture === 'loading' || fixture === 'complete' ? fixture : null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const joined = override ?? demo.joined;
  const ghost = ghostOverride ?? demo.ghost;
  const status = phase ?? (joined ? 'online' : 'offline');
  const busy = !!phase;
  const state = states[status];
  function touch() {
    if (busy) return;
    setPhase('loading');
    timers.current.push(setTimeout(() => {
      const next = !joined; demo.setJoined(next); setOverride(next);
      if (!next) { demo.setGhost(false); setGhostOverride(false); }
      setPhase('complete');
      timers.current.push(setTimeout(() => setPhase(null), 900));
    }, 800));
  }
  function toggleGhost() { demo.setGhost(!ghost); setGhostOverride(!ghost); }
  return <Frame className="home">
    <div className="home-top"><span className="place-name">{joined ? demoPlace : ''}</span><Button secondary onClick={() => router.push('/account')}>アカウント</Button></div>
    <main className="connection"><div className="connection-center">
      <button className="antenna" aria-label={status === 'online' ? 'NFCタグを読み取って退出' : 'NFCタグを読み取って参加'} onClick={touch} disabled={busy}>
        {/* Original vector assets are intentionally rendered at their React Native dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/${state.asset}.svg`} width={state.width} height={state.height} alt={state.label} />
        <span className="caption" aria-live="polite">{status === 'offline' || status === 'online' ? (ghost && status === 'online' ? '位置情報を隠しています' : state.label) : ''}</span>
      </button>
      <div className="ghost-control"><button className="switch" role="switch" aria-label="ゴーストモード" aria-checked={ghost} disabled={busy || status !== 'online'} onClick={toggleGhost}><span /></button><span className="toggle-label">ゴーストモード</span></div>
    </div></main>
    <div className="home-bottom">{fixture === 'error' && <p className="error centered" role="alert">通信に失敗しました。</p>}<Button secondary disabled={!joined || busy} onClick={() => router.push(fixture ? '/scan?state=ready' : '/scan')}>街をスキャン</Button></div>
  </Frame>;
}


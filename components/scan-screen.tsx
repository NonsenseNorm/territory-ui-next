'use client';
import { useEffect, useState } from 'react';
import { Button, Frame } from './ui';
import { useDemo } from './demo-provider';
import { demoPlace, demoResults } from '@/lib/demo';
type Stage = 'idle' | 'starting' | 'waiting' | 'results' | 'empty' | 'error';
export function ScanScreen({ fixture }: { fixture?: string }) {
  const demo = useDemo();
  const joined = fixture ? fixture !== 'unjoined' : demo.joined;
  const initial = (['starting','waiting','results','empty','error'] as string[]).includes(fixture ?? '') ? fixture as Stage : 'idle';
  const [stage, setStage] = useState<Stage>(initial);
  const [remaining, setRemaining] = useState(30);
  const [responses, setResponses] = useState(initial === 'results' ? demoResults : []);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!run) return;
    const started = Date.now();
    const starting = setTimeout(() => setStage('waiting'), 500);
    const answer = setTimeout(() => setResponses(demoResults), 2000);
    const ticker = setInterval(() => {
      const left = Math.max(0, 30 - Math.floor((Date.now() - started) / 1000));
      setRemaining(left);
      if (!left) { setStage('results'); clearInterval(ticker); }
    }, 1000);
    return () => { clearTimeout(starting); clearTimeout(answer); clearInterval(ticker); };
  }, [run]);
  const busy = stage === 'starting'; const scanning = stage === 'waiting';
  const hasScan = scanning || stage === 'results' || stage === 'empty';
  function start() { setResponses([]); setRemaining(30); setStage('starting'); setRun(value => value + 1); }
  return <Frame title="街をスキャン" back="/"><main className="page scan-page">
    <h1>街をスキャン</h1><p className="body-text">{joined ? `${demoPlace}が属する街のすべての場所を対象に、現在位置を要求します。` : 'NFCタグにタッチして場所に参加してください。'}</p>
    <Button disabled={busy || scanning || !joined} onClick={start}>{busy ? '開始中…' : scanning ? '位置情報の応答を待っています…' : 'スキャンする'}</Button>
    {stage === 'error' && <p className="error" role="alert">取得できませんでした。</p>}
    <p className="body-text" aria-live="polite">{hasScan ? `${responses.length}件の応答${scanning ? `・残り${remaining}秒` : '・受付終了'}` : '位置情報はスキャンへの回答が届くと表示されます。'}</p>
    {responses.length && joined ? <ul className="scan-results">{responses.map(item => <li key={item.id} className="scan-row"><h2>{item.place}</h2><p className="detail">ユーザー {item.user}</p><p className="coordinates">{item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</p><p className="detail">精度 ±{item.accuracy}m ・ {item.time}</p></li>)}</ul> : <p className="empty">{hasScan && !scanning ? '応答はありませんでした。ゴーストモード中や通信できない端末は表示されません。' : '表示できる位置情報はまだありません。'}</p>}
  </main></Frame>;
}


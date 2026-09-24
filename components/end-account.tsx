'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Frame } from './ui';
import { useDemo } from './demo-provider';
export function EndAccount({ deleting = false, fixture }: { deleting?: boolean; fixture?: string }) {
  const router = useRouter(); const demo = useDemo();
  const [confirmation, setConfirmation] = useState(''); const [busy, setBusy] = useState(fixture === 'busy');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function submit() { setBusy(true); timer.current = setTimeout(() => { demo.reset(); router.replace('/login'); }, 600); }
  return <Frame title={deleting ? 'アカウント削除' : 'ログアウト'} back="/account"><main className="page">
    <h1>{deleting ? 'アカウントを削除' : 'ログアウト'}</h1>
    <p className="body-text">{deleting ? 'アカウント、公開セッション、関連するスキャンと位置情報を削除します。この操作は取り消せません。確認のため「削除」と入力してください。' : '公開セッションを終了し、位置情報の共有を停止してログアウトします。'}</p>
    {deleting && <input aria-label="削除の確認" placeholder="削除" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} />}
    {fixture === 'error' && <p className="error" role="alert">処理に失敗しました。</p>}
    <Button disabled={busy || (deleting && confirmation !== '削除')} onClick={submit}>{busy ? '処理中…' : deleting ? '完全に削除する' : 'ログアウトする'}</Button>
    <Button secondary disabled={busy} onClick={() => router.push('/account')}>戻る</Button>
  </main></Frame>;
}


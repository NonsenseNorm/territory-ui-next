'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Frame } from './ui';
import { useDemo } from './demo-provider';
export function AuthForm({ register = false, fixture }: { register?: boolean; fixture?: string }) {
  const router = useRouter(); const demo = useDemo();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(fixture === 'busy');
  const [message, setMessage] = useState(fixture === 'error' ? 'メールアドレスまたはパスワードが正しくありません。' : fixture === 'sent' ? '確認メールを送信しました。メール内のリンクで認証してからログインしてください。' : '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage('');
    timer.current = setTimeout(() => {
      setBusy(false); setPassword('');
      if (register) setMessage('確認メールを送信しました。メール内のリンクで認証してからログインしてください。');
      else { demo.setEmail(email.trim()); router.replace('/'); }
    }, 600);
  }
  return <Frame title={register ? '新規登録' : 'ログイン'}>
    <main className="page auth-page"><form onSubmit={submit}>
      <h1>{register ? 'アカウントを作成' : 'おかえりなさい'}</h1>
      <p className="body-text">NFCタグにタッチして、街の場所に参加します。</p>
      <input aria-label="メールアドレス" placeholder="メールアドレス" type="email" autoCapitalize="none" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} disabled={busy} required />
      <input aria-label="パスワード" placeholder={register ? 'パスワード（8文字以上）' : 'パスワード'} type="password" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} minLength={register ? 8 : 1} required />
      {message && <p className="error" role="status">{message}</p>}
      <Button type="submit" disabled={busy || !email.trim() || password.length < (register ? 8 : 1)}>{busy ? '処理中…' : register ? '新規登録' : 'ログイン'}</Button>
      <Button type="button" secondary disabled={busy} onClick={() => router.replace(register ? '/login' : '/register')}>{register ? 'ログインへ' : '新規登録へ'}</Button>
    </form></main>
  </Frame>;
}


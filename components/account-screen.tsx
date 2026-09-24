'use client';
import { useRouter } from 'next/navigation';
import { Button, Frame } from './ui';
import { useDemo } from './demo-provider';
export function AccountScreen() {
  const router = useRouter(); const { email } = useDemo();
  return <Frame title="アカウント" back="/"><main className="page"><h1>アカウント</h1><p className="body-text">{email}</p><Button secondary onClick={() => router.push('/logout')}>ログアウト</Button><Button secondary onClick={() => router.push('/delete-account')}>アカウントを削除</Button></main></Frame>;
}


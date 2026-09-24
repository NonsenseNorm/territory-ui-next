import type { Metadata, Viewport } from 'next';
import { DemoProvider } from '@/components/demo-provider';
import './globals.css';
export const metadata: Metadata = { title: 'なわばり · UIプレビュー', description: 'React Native版「なわばり」のデザイン確認用UI。すべての操作はデモです。', robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body><DemoProvider>{children}</DemoProvider></body></html>; }


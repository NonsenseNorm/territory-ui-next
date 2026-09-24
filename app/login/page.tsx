import { AuthForm } from '@/components/auth-form';
import { readState, type QueryProps } from '@/lib/demo';
export default async function Page({ searchParams }: QueryProps) { const fixture = await readState(searchParams); return <AuthForm key={fixture ?? 'default'}  fixture={fixture} />; }


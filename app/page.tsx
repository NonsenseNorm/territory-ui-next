import { ConnectionScreen } from '@/components/connection-screen';
import { readState, type QueryProps } from '@/lib/demo';
export default async function Page({ searchParams }: QueryProps) { const fixture = await readState(searchParams); return <ConnectionScreen key={fixture ?? 'default'} fixture={fixture} />; }


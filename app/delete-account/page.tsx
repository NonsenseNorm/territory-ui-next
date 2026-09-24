import { EndAccount } from '@/components/end-account';
import { readState, type QueryProps } from '@/lib/demo';
export default async function Page({ searchParams }: QueryProps) { const fixture = await readState(searchParams); return <EndAccount key={fixture ?? 'default'} deleting fixture={fixture} />; }


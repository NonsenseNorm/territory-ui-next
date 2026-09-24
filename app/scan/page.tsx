import { ScanScreen } from '@/components/scan-screen';
import { readState, type QueryProps } from '@/lib/demo';
export default async function Page({ searchParams }: QueryProps) { const fixture = await readState(searchParams); return <ScanScreen key={fixture ?? 'default'}  fixture={fixture} />; }


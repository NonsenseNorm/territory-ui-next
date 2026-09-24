export type QueryProps = { searchParams: Promise<{ state?: string | string[] }> };
export async function readState(searchParams: QueryProps['searchParams']) { const value = (await searchParams).state; return typeof value === 'string' ? value : undefined; }
export const demoPlace = 'サンプル広場';
export const demoEmail = 'designer@example.test';
// Fictional preview data only. No location services or backend are used.
export const demoResults = [
  { id: '1', place: 'サンプル広場', user: 'a12bc345', latitude: 35.680400, longitude: 139.700800, accuracy: 8, time: '14:32:05' },
  { id: '2', place: 'サンプルカフェ', user: 'd67ef890', latitude: 35.681200, longitude: 139.701300, accuracy: 12, time: '14:32:08' },
];


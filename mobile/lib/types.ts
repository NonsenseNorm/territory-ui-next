export type Polygon = { type: 'Polygon'; coordinates: [number, number][][] };
export type Place = { id: string; city_id: string; name: string; boundary: Polygon };
export type Sharing = { id: string; user_id: string; ghost: boolean; expires_at: string; places: Place };
export type Coordinates = { latitude: number; longitude: number; accuracy: number; recorded_at: string };
export type ScanResult = Coordinates & { session_id: string; place_name: string; user_id: string };
export type Scan = { id: string; expires_at: string; results: ScanResult[] };

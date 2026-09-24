import type { Polygon } from './types';

// GeoJSON uses longitude, latitude. Boundary points are inside, matching ST_Covers.
function ringPosition(ring: [number, number][], x: number, y: number): 'edge' | 'inside' | 'outside' {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j];
    const [bx, by] = ring[i];
    const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
    if (Math.abs(cross) < 1e-12 && x >= Math.min(ax,bx) && x <= Math.max(ax,bx) && y >= Math.min(ay,by) && y <= Math.max(ay,by)) return 'edge';
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside ? 'inside' : 'outside';
}
export function insideBoundary(polygon: Polygon, latitude: number, longitude: number): boolean {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !polygon.coordinates.length) return false;
  const outer = ringPosition(polygon.coordinates[0], longitude, latitude);
  if (outer === 'outside') return false;
  if (outer === 'edge') return true;
  for (const hole of polygon.coordinates.slice(1)) {
    const position = ringPosition(hole, longitude, latitude);
    if (position === 'edge') return true;
    if (position === 'inside') return false;
  }
  return true;
}

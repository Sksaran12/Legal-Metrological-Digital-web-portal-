export interface ValidatedLocation {
  type: 'Point';
  coordinates: [number, number];
  accuracyMeters?: number;
  source: 'device_gps' | 'manual_pin' | 'address' | 'ip';
}

export function parseCoordinates(value: unknown): [number, number] | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  let lat: number;
  let lng: number;

  // Accept the map's display format, for example:
  // "19.07600° N, 72.87770° E"
  const directional = normalized.match(
    /^(-?\d+(?:\.\d+)?)\s*°?\s*([NS])\s*[,;]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])$/i
  );

  if (directional) {
    lat = Number(directional[1]);
    lng = Number(directional[3]);
    if (directional[2].toUpperCase() === 'S') lat = -Math.abs(lat);
    if (directional[4].toUpperCase() === 'W') lng = -Math.abs(lng);
  } else {
    const decimal = normalized.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
    if (!decimal) return undefined;
    lat = Number(decimal[1]);
    lng = Number(decimal[2]);
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return undefined;
  }
  return [lng, lat];
}

export function buildLocation(value: unknown, source: ValidatedLocation['source'] = 'manual_pin', accuracyMeters?: unknown) {
  const coordinates = parseCoordinates(value);
  if (!coordinates) return undefined;
  const accuracy = Number(accuracyMeters);
  return {
    type: 'Point' as const,
    coordinates,
    ...(Number.isFinite(accuracy) && accuracy >= 0 ? { accuracyMeters: accuracy } : {}),
    source
  };
}

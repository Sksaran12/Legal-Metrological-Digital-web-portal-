export interface ValidatedLocation {
  type: 'Point';
  coordinates: [number, number];
  accuracyMeters?: number;
  source: 'device_gps' | 'manual_pin' | 'address' | 'ip';
}

export function parseCoordinates(value: unknown): [number, number] | undefined {
  if (typeof value !== 'string') return undefined;
  const decimal = value.match(/(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)/);
  if (!decimal) return undefined;

  const lat = Number(decimal[1]);
  const lng = Number(decimal[2]);
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

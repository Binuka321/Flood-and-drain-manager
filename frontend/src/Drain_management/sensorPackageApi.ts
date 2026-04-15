import type { SensorPackage } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` } as const;
}

function jsonAuth(token: string) {
  return { ...bearer(token), 'Content-Type': 'application/json' } as const;
}

export type CreateSensorPackageInput = Omit<
  SensorPackage,
  'id' | 'status' | 'lastUpdate' | 'currentReadings'
>;

export function mapApiPackage(raw: Record<string, unknown>): SensorPackage {
  const lu = raw.lastUpdate;
  const lastUpdate =
    lu instanceof Date ? lu : new Date(typeof lu === 'string' || typeof lu === 'number' ? lu : Date.now());

  const cr = raw.currentReadings;
  const readings =
    cr && typeof cr === 'object' && !Array.isArray(cr)
      ? (cr as SensorPackage['currentReadings'])
      : {};

  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    location: raw.location as SensorPackage['location'],
    sensors: raw.sensors as SensorPackage['sensors'],
    boards: raw.boards as SensorPackage['boards'],
    status: (raw.status as SensorPackage['status']) || 'active',
    lastUpdate,
    currentReadings: readings
  };
}

export async function fetchSensorPackages(token: string): Promise<SensorPackage[]> {
  const res = await fetch(`${API_BASE}/sensor-packages`, {
    headers: bearer(token)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : res.statusText || 'Failed to load packages');
  }
  return (Array.isArray(data) ? data : []).map((row) => mapApiPackage(row as Record<string, unknown>));
}

export async function createSensorPackage(token: string, body: CreateSensorPackageInput): Promise<SensorPackage> {
  const res = await fetch(`${API_BASE}/sensor-packages`, {
    method: 'POST',
    headers: jsonAuth(token),
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : res.statusText || 'Failed to create package');
  }
  return mapApiPackage(data as Record<string, unknown>);
}


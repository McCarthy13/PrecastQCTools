import type { CustomStrandPattern, StrandCoordinate, StrandSize } from '@/state/strandPatternStore';

type StrandPosition = CustomStrandPattern['position'];

const API_KEY = process.env.NEXT_PUBLIC_STRAND_PATTERNS_API_KEY;

export interface StrandPatternPayload {
  patternId: string;
  position: StrandPosition;
  strand_3_8: number;
  strand_1_2: number;
  strand_0_6: number;
  pullingForcePercent?: number;
  totalArea?: number;
  strandGradeCounts?: Partial<Record<StrandSize, Record<string, number>>>;
  strandCoordinates?: StrandCoordinate[];
  strandSizes?: StrandSize[];
}

async function parseResponse(response: Response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body && body.error) || response.statusText || 'Request failed';
    throw new Error(message);
  }
  return response.json();
}

function normalizePattern(raw: any): CustomStrandPattern {
  return {
    id: raw.id,
    patternId: raw.patternId,
    position: raw.position,
    strand_3_8: raw.strand_3_8 ?? 0,
    strand_1_2: raw.strand_1_2 ?? 0,
    strand_0_6: raw.strand_0_6 ?? 0,
    pullingForcePercent: raw.pullingForcePercent ?? undefined,
    totalArea: raw.totalArea ?? undefined,
    strandGradeCounts: raw.strandGradeCounts ?? undefined,
    strandCoordinates: Array.isArray(raw.strandCoordinates)
      ? raw.strandCoordinates.map((coord: any) => ({
          size: coord.size,
          order: coord.order,
          x: coord.x,
          y: coord.y,
        }))
      : undefined,
    strandSizes: Array.isArray(raw.strandSizes) ? raw.strandSizes : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : undefined,
  };
}

function buildRequestBody(payload: StrandPatternPayload) {
  return JSON.stringify({
    patternId: payload.patternId,
    position: payload.position,
    pullingForcePercent: payload.pullingForcePercent,
    totalArea: payload.totalArea,
    strandGradeCounts: payload.strandGradeCounts,
    strandCoordinates: (payload.strandCoordinates ?? []).map((coordinate, index) => ({
      size: coordinate.size,
      order: coordinate.order ?? index,
      x: coordinate.x,
      y: coordinate.y,
    })),
  });
}

export async function listStrandPatterns(): Promise<CustomStrandPattern[]> {
  const response = await fetch('/api/strand-patterns', {
    cache: 'no-store',
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
  });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data.map(normalizePattern) : [];
}

export async function createStrandPattern(payload: StrandPatternPayload): Promise<CustomStrandPattern> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

  const response = await fetch('/api/strand-patterns', {
    method: 'POST',
    headers,
    body: buildRequestBody(payload),
  });
  const data = await parseResponse(response);
  return normalizePattern(data);
}

export async function updateStrandPattern(
  id: string,
  payload: StrandPatternPayload
): Promise<CustomStrandPattern> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

  const response = await fetch(`/api/strand-patterns/${id}`, {
    method: 'PUT',
    headers,
    body: buildRequestBody(payload),
  });
  const data = await parseResponse(response);
  return normalizePattern(data);
}

export async function deleteStrandPattern(id: string): Promise<void> {
  const response = await fetch(`/api/strand-patterns/${id}`, {
    method: 'DELETE',
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
  });
  await parseResponse(response);
}

export async function deleteAllStrandPatterns(): Promise<void> {
  const response = await fetch('/api/strand-patterns', {
    method: 'DELETE',
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
  });
  await parseResponse(response);
}

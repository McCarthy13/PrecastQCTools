import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StrandPosition, StrandSize } from '@prisma/client';

const SIZE_TO_ENUM: Record<'3/8' | '1/2' | '0.6', StrandSize> = {
  '3/8': 'SIZE_3_8',
  '1/2': 'SIZE_1_2',
  '0.6': 'SIZE_0_6',
};

const ENUM_TO_SIZE: Record<StrandSize, '3/8' | '1/2' | '0.6'> = {
  SIZE_3_8: '3/8',
  SIZE_1_2: '1/2',
  SIZE_0_6: '0.6',
};

const POSITION_TO_ENUM: Record<'Top' | 'Bottom' | 'Both', StrandPosition> = {
  Top: 'TOP',
  Bottom: 'BOTTOM',
  Both: 'BOTH',
};

const ENUM_TO_POSITION: Record<StrandPosition, 'Top' | 'Bottom' | 'Both'> = {
  TOP: 'Top',
  BOTTOM: 'Bottom',
  BOTH: 'Both',
};

type RouteContext = { params: Promise<{ id: string }> };

interface StrandPatternPayload {
  patternId: string;
  position: 'Top' | 'Bottom' | 'Both';
  pullingForcePercent?: number | null;
  totalArea?: number | null;
  strandGradeCounts?: Record<string, Record<string, number>>;
  strandCoordinates?: Array<{
    size: '3/8' | '1/2' | '0.6';
    order?: number;
    x: number;
    y: number;
  }>;
}

function validatePayload(data: unknown): StrandPatternPayload {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid payload.');
  }

  const payload = data as Record<string, unknown>;
  const patternId = typeof payload.patternId === 'string' ? payload.patternId.trim() : '';
  if (!patternId) {
    throw new Error('Pattern ID is required.');
  }

  const positionInput = typeof payload.position === 'string' ? (payload.position.trim() as 'Top' | 'Bottom' | 'Both') : 'Bottom';
  if (!POSITION_TO_ENUM[positionInput]) {
    throw new Error('Position must be Top, Bottom, or Both.');
  }

  const pullingForcePercent =
    typeof payload.pullingForcePercent === 'number'
      ? payload.pullingForcePercent
      : payload.pullingForcePercent === null || payload.pullingForcePercent === undefined
      ? null
      : Number(payload.pullingForcePercent);

  if (
    pullingForcePercent !== null &&
    (Number.isNaN(pullingForcePercent) || pullingForcePercent <= 0 || pullingForcePercent > 100)
  ) {
    throw new Error('Pulling force must be between 0 and 100.');
  }

  const totalArea =
    typeof payload.totalArea === 'number'
      ? payload.totalArea
      : payload.totalArea === null || payload.totalArea === undefined
      ? null
      : Number(payload.totalArea);

  if (totalArea !== null && Number.isNaN(totalArea)) {
    throw new Error('Total area must be a valid number.');
  }

  const strandGradeCounts: Record<string, Record<string, number>> = {};
  if (payload.strandGradeCounts && typeof payload.strandGradeCounts === 'object') {
    for (const [sizeKey, grades] of Object.entries(payload.strandGradeCounts as Record<string, unknown>)) {
      if (!(sizeKey in SIZE_TO_ENUM)) continue;
      if (typeof grades !== 'object' || grades === null) continue;
      const normalizedGrades: Record<string, number> = {};
      for (const [gradeKey, countValue] of Object.entries(grades as Record<string, unknown>)) {
        if (typeof gradeKey !== 'string' || gradeKey.trim().length === 0) continue;
        const parsedCount = Number(countValue);
        if (!Number.isFinite(parsedCount) || parsedCount < 0) continue;
        if (parsedCount === 0) continue;
        normalizedGrades[gradeKey.trim()] = Math.floor(parsedCount);
      }
      if (Object.keys(normalizedGrades).length > 0) {
        strandGradeCounts[sizeKey] = normalizedGrades;
      }
    }
  }

  const strandCoordinates: Array<{ size: '3/8' | '1/2' | '0.6'; order: number; x: number; y: number }> = [];
  if (Array.isArray(payload.strandCoordinates)) {
    payload.strandCoordinates.forEach((coordinate, index) => {
      if (!coordinate || typeof coordinate !== 'object') return;
      const coord = coordinate as Record<string, unknown>;
      const sizeRaw = typeof coord.size === 'string' ? coord.size.trim() : '';
      if (!(sizeRaw in SIZE_TO_ENUM)) return;
      const parsedX = Number(coord.x);
      const parsedY = Number(coord.y);
      if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) return;
      const order = Number.isInteger(coord.order) ? Number(coord.order) : index;
      strandCoordinates.push({
        size: sizeRaw as '3/8' | '1/2' | '0.6',
        order,
        x: parsedX,
        y: parsedY,
      });
    });
  }

  return {
    patternId,
    position: positionInput,
    pullingForcePercent: pullingForcePercent ?? undefined,
    totalArea: totalArea ?? undefined,
    strandGradeCounts,
    strandCoordinates,
  };
}

function computeAggregateCounts(strandGradeCounts: Record<string, Record<string, number>>): {
  threeEight: number;
  oneHalf: number;
  zeroSix: number;
} {
  let threeEight = 0;
  let oneHalf = 0;
  let zeroSix = 0;

  for (const [sizeKey, grades] of Object.entries(strandGradeCounts)) {
    const total = Object.values(grades).reduce((sum, count) => sum + count, 0);
    if (sizeKey === '3/8') threeEight += total;
    if (sizeKey === '1/2') oneHalf += total;
    if (sizeKey === '0.6') zeroSix += total;
  }

  return { threeEight, oneHalf, zeroSix };
}

function serializePattern(pattern: Awaited<ReturnType<typeof prisma.strandPattern.findUnique>> & {
  grades: { size: StrandSize; grade: string; count: number }[];
  coordinates: { size: StrandSize; order: number; xInches: number; yInches: number }[];
}) {
  if (!pattern) return null;
  const gradeCounts: Record<'3/8' | '1/2' | '0.6', Record<string, number>> = {
    '3/8': {},
    '1/2': {},
    '0.6': {},
  };

  pattern.grades.forEach((grade) => {
    const size = ENUM_TO_SIZE[grade.size];
    if (!gradeCounts[size]) gradeCounts[size] = {};
    gradeCounts[size][grade.grade] = grade.count;
  });

  const coordinates = pattern.coordinates
    .sort((a, b) => a.order - b.order)
    .map((coordinate) => ({
      size: ENUM_TO_SIZE[coordinate.size],
      order: coordinate.order,
      x: coordinate.xInches,
      y: coordinate.yInches,
    }));

  const strandSizes: ('3/8' | '1/2' | '0.6')[] = [];
  strandSizes.push(
    ...Array.from({ length: pattern.strandCountThreeEight }, () => '3/8' as const),
    ...Array.from({ length: pattern.strandCountOneHalf }, () => '1/2' as const),
    ...Array.from({ length: pattern.strandCountZeroSix }, () => '0.6' as const)
  );

  return {
    id: pattern.id,
    patternId: pattern.patternId,
    position: ENUM_TO_POSITION[pattern.position],
    strand_3_8: pattern.strandCountThreeEight,
    strand_1_2: pattern.strandCountOneHalf,
    strand_0_6: pattern.strandCountZeroSix,
    pullingForcePercent: pattern.pullingForcePercent ?? undefined,
    totalArea: pattern.totalArea ?? undefined,
    strandGradeCounts: gradeCounts,
    strandCoordinates: coordinates,
    strandSizes,
    createdAt: pattern.createdAt.getTime(),
    updatedAt: pattern.updatedAt.getTime(),
  };
}

function authorize(request: NextRequest) {
  const apiKey = process.env.STRAND_PATTERNS_API_KEY;
  if (!apiKey) return;
  const auth = request.headers.get('authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = auth.slice(7).trim();
  if (token !== apiKey) {
    throw new Error('Unauthorized');
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const pattern = await prisma.strandPattern.findUnique({
    where: { id },
    include: {
      grades: true,
      coordinates: true,
    },
  });

  if (!pattern) {
    return NextResponse.json({ error: 'Strand pattern not found.' }, { status: 404 });
  }

  return NextResponse.json(serializePattern(pattern));
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const payload = validatePayload(await request.json());
    const { threeEight, oneHalf, zeroSix } = computeAggregateCounts(payload.strandGradeCounts ?? {});

    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.strandPattern.findUnique({ where: { id } });
      if (!exists) {
        throw new Error('NOT_FOUND');
      }

      await tx.strandPattern.update({
        where: { id },
        data: {
          patternId: payload.patternId,
          position: POSITION_TO_ENUM[payload.position],
          strandCountThreeEight: threeEight,
          strandCountOneHalf: oneHalf,
          strandCountZeroSix: zeroSix,
          pullingForcePercent: payload.pullingForcePercent ?? undefined,
          totalArea: payload.totalArea ?? undefined,
        },
      });

      await tx.strandPatternGrade.deleteMany({ where: { patternId: id } });
      await tx.strandPatternCoordinate.deleteMany({ where: { patternId: id } });

      const gradeEntries = Object.entries(payload.strandGradeCounts ?? {}).flatMap(([sizeKey, grades]) => {
        if (!(sizeKey in SIZE_TO_ENUM)) return [];
        const sizeEnum = SIZE_TO_ENUM[sizeKey as '3/8' | '1/2' | '0.6'];
        return Object.entries(grades).map(([grade, count]) => ({
          patternId: id,
          size: sizeEnum,
          grade,
          count,
        }));
      });

      if (gradeEntries.length > 0) {
        await tx.strandPatternGrade.createMany({ data: gradeEntries });
      }

      const coordinateEntries = (payload.strandCoordinates ?? []).map((coordinate, index) => ({
        patternId: id,
        size: SIZE_TO_ENUM[coordinate.size],
        order: Number.isInteger(coordinate.order) ? (coordinate.order as number) : index,
        xInches: coordinate.x,
        yInches: coordinate.y,
      }));

      if (coordinateEntries.length > 0) {
        await tx.strandPatternCoordinate.createMany({ data: coordinateEntries });
      }

      return tx.strandPattern.findUnique({
        where: { id },
        include: {
          grades: true,
          coordinates: true,
        },
      });
    });

    if (!result) {
      return NextResponse.json({ error: 'Strand pattern not found.' }, { status: 404 });
    }

    return NextResponse.json(serializePattern(result));
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Strand pattern not found.' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Unable to update strand pattern.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    authorize(request);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.strandPattern.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete strand pattern.' }, { status: 400 });
  }
}

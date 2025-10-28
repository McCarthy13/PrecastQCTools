import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultAggregates, mapRecordToClient, normalizeAggregateType } from '@/lib/gradation-service';

type RecordSievePayload = {
  name: string;
  size?: number;
  weightRetained?: number;
  percentRetained?: number;
  cumulativeRetained?: number;
  percentPassing?: number;
  c33Lower?: number | null;
  c33Upper?: number | null;
};

type RecordPayload = {
  aggregateId?: string | null;
  aggregateName: string;
  aggregateType: string;
  date: string;
  totalWeight: number;
  washedWeight?: number | null;
  finenessModulus?: number | null;
  decant?: number | null;
  notes?: string | null;
  tester?: string | null;
  fullSieveData: RecordSievePayload[];
};

export async function GET() {
  await ensureDefaultAggregates();
  const records = await prisma.gradationRecord.findMany({
    orderBy: { createdAt: 'desc' },
    include: { sieveResults: true },
  });
  return NextResponse.json(records.map(mapRecordToClient));
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<RecordPayload>;

  if (!payload?.aggregateName || !payload?.aggregateType || !payload?.date || !Array.isArray(payload?.fullSieveData)) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const type = normalizeAggregateType(payload.aggregateType);
  const date = new Date(payload.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: 'Invalid date' }, { status: 400 });
  }

  const aggregate = payload.aggregateId
    ? await prisma.aggregate.findUnique({ where: { id: payload.aggregateId } })
    : await prisma.aggregate.findUnique({ where: { name: payload.aggregateName } });

  const created = await prisma.gradationRecord.create({
    data: {
      aggregateId: aggregate?.id,
      aggregateName: payload.aggregateName,
      aggregateType: type,
      date,
      totalWeight: Number(payload.totalWeight ?? 0),
      washedWeight: payload.washedWeight !== undefined ? Number(payload.washedWeight) : null,
      finenessModulus: payload.finenessModulus !== undefined ? Number(payload.finenessModulus) : null,
      decant: payload.decant !== undefined ? Number(payload.decant) : null,
      notes: payload.notes ?? null,
      tester: payload.tester ?? null,
      sieveResults: {
        create: payload.fullSieveData.map((sieve, index) => ({
          name: sieve.name,
          size: Number(sieve.size ?? 0),
          weightRetained: Number(sieve.weightRetained ?? 0),
          percentRetained: Number(sieve.percentRetained ?? 0),
          cumulativeRetained: Number(sieve.cumulativeRetained ?? 0),
          percentPassing: Number(sieve.percentPassing ?? 0),
          c33Lower: sieve.c33Lower !== undefined && sieve.c33Lower !== null ? Number(sieve.c33Lower) : null,
          c33Upper: sieve.c33Upper !== undefined && sieve.c33Upper !== null ? Number(sieve.c33Upper) : null,
          order: index,
        })),
      },
    },
    include: { sieveResults: true },
  });

  return NextResponse.json(mapRecordToClient(created), { status: 201 });
}

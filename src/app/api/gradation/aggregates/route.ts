import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultAggregates, mapAggregateToClient, normalizeAggregateType } from '@/lib/gradation-service';

type SievePayload = {
  name: string;
  size?: number;
  order?: number;
  c33Lower?: number | null;
  c33Upper?: number | null;
};

type AggregatePayload = {
  name: string;
  type: string;
  maxDecant?: number | null;
  isDefault?: boolean;
  order?: number;
  sieves: SievePayload[];
};

export async function GET() {
  await ensureDefaultAggregates();
  const aggregates = await prisma.aggregate.findMany({
    orderBy: { order: 'asc' },
    include: { sieves: true },
  });
  return NextResponse.json(aggregates.map(mapAggregateToClient));
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<AggregatePayload>;

  if (!payload?.name || !payload?.type || !Array.isArray(payload?.sieves)) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const type = normalizeAggregateType(payload.type);
  const existing = await prisma.aggregate.findUnique({ where: { name: payload.name } });
  if (existing) {
    return NextResponse.json({ message: 'Aggregate with that name already exists.' }, { status: 409 });
  }

  const aggregatesCount = await prisma.aggregate.count();

  const created = await prisma.aggregate.create({
    data: {
      name: payload.name,
      type,
      maxDecant: payload.maxDecant !== undefined && payload.maxDecant !== null ? Number(payload.maxDecant) : null,
      isDefault: Boolean(payload.isDefault),
      order: typeof payload.order === 'number' ? payload.order : aggregatesCount,
      sieves: {
        create: payload.sieves.map((sieve, index) => ({
          name: sieve.name,
          size: Number(sieve.size ?? 0),
          order: typeof sieve.order === 'number' ? sieve.order : index,
          c33Lower: sieve.c33Lower ?? null,
          c33Upper: sieve.c33Upper ?? null,
        })),
      },
    },
    include: { sieves: true },
  });

  return NextResponse.json(mapAggregateToClient(created), { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapAggregateToClient, normalizeAggregateType } from '@/lib/gradation-service';

type SievePayload = {
  name: string;
  size?: number;
  order?: number;
  c33Lower?: number | null;
  c33Upper?: number | null;
};

type AggregatePayload = {
  name?: string;
  type?: string;
  maxDecant?: number | null;
  isDefault?: boolean;
  order?: number;
  sieves?: SievePayload[];
};

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const aggregate = await prisma.aggregate.findUnique({
    where: { id },
    include: { sieves: true },
  });
  if (!aggregate) {
    return NextResponse.json({ message: 'Aggregate not found' }, { status: 404 });
  }
  return NextResponse.json(mapAggregateToClient(aggregate));
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json()) as AggregatePayload;
  const aggregate = await prisma.aggregate.findUnique({ where: { id } });
  if (!aggregate) {
    return NextResponse.json({ message: 'Aggregate not found' }, { status: 404 });
  }

  if (payload?.name && payload.name !== aggregate.name) {
    const duplicate = await prisma.aggregate.findUnique({ where: { name: payload.name } });
    if (duplicate) {
      return NextResponse.json({ message: 'Aggregate with that name already exists.' }, { status: 409 });
    }
  }

  const type = payload?.type ? normalizeAggregateType(payload.type) : aggregate.type;

  const updated = await prisma.aggregate.update({
    where: { id },
    data: {
      name: payload?.name ?? aggregate.name,
      type,
      maxDecant:
        payload?.maxDecant !== undefined && payload?.maxDecant !== null
          ? Number(payload.maxDecant)
          : aggregate.maxDecant,
      isDefault: typeof payload?.isDefault === 'boolean' ? payload.isDefault : aggregate.isDefault,
      order: typeof payload?.order === 'number' ? payload.order : aggregate.order,
      sieves: payload?.sieves
        ? {
            deleteMany: {},
            create: payload.sieves.map((sieve, index) => ({
              name: sieve.name,
              size: Number(sieve.size ?? 0),
              order: typeof sieve.order === 'number' ? sieve.order : index,
              c33Lower: sieve.c33Lower ?? null,
              c33Upper: sieve.c33Upper ?? null,
            })),
          }
        : undefined,
    },
    include: { sieves: true },
  });

  return NextResponse.json(mapAggregateToClient(updated));
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  await prisma.aggregate.delete({ where: { id } });
  return NextResponse.json({ success: true }, { status: 204 });
}

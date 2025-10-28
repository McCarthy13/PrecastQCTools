import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  const payload = await request.json();
  if (!Array.isArray(payload?.aggregateIds)) {
    return NextResponse.json({ message: 'aggregateIds array required' }, { status: 400 });
  }

  const aggregateIds: string[] = payload.aggregateIds;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.aggregate.updateMany({ data: { isDefault: false } });
    await Promise.all(
      aggregateIds.map((id, index) =>
        tx.aggregate.update({
          where: { id },
          data: {
            isDefault: true,
            order: index,
          },
        }),
      ),
    );
  });

  return NextResponse.json({ success: true });
}

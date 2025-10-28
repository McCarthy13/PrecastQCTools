import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapRecordToClient } from '@/lib/gradation-service';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const record = await prisma.gradationRecord.findUnique({
    where: { id },
    include: { sieveResults: true },
  });
  if (!record) {
    return NextResponse.json({ message: 'Record not found' }, { status: 404 });
  }
  return NextResponse.json(mapRecordToClient(record));
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  await prisma.gradationRecord.delete({ where: { id } });
  return NextResponse.json({ success: true }, { status: 204 });
}

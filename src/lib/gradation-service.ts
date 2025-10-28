import { AggregateType, Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { DEFAULT_AGGREGATES } from './gradation-defaults';

export async function ensureDefaultAggregates() {
  const count = await prisma.aggregate.count();
  if (count > 0) {
    return;
  }

  await Promise.all(
    DEFAULT_AGGREGATES.map(async (aggregate, index) => {
      await prisma.aggregate.create({
        data: {
          name: aggregate.name,
          type: aggregate.type,
          maxDecant: aggregate.maxDecant ?? null,
          isDefault: true,
          order: index,
          sieves: {
            create: aggregate.sieves.map((sieve, sieveIndex) => ({
              name: sieve.name,
              size: sieve.size,
              c33Lower: sieve.c33Lower ?? null,
              c33Upper: sieve.c33Upper ?? null,
              order: sieveIndex,
            })),
          },
        },
      });
    }),
  );
}

type AggregateWithSieves = Prisma.AggregateGetPayload<{ include: { sieves: true } }>;

export function mapAggregateToClient(aggregate: AggregateWithSieves) {
  return {
    id: aggregate.id,
    name: aggregate.name,
    type: aggregate.type,
    maxDecant: aggregate.maxDecant,
    isDefault: aggregate.isDefault,
    order: aggregate.order,
    sieves: aggregate.sieves
      .sort((a, b) => a.order - b.order)
      .map((sieve) => ({
        id: sieve.id,
        name: sieve.name,
        size: sieve.size,
        c33Lower: sieve.c33Lower,
        c33Upper: sieve.c33Upper,
        order: sieve.order,
      })),
  };
}

type RecordWithSieveResults = Prisma.GradationRecordGetPayload<{ include: { sieveResults: true } }>;

export function mapRecordToClient(record: RecordWithSieveResults) {
  return {
    id: record.id,
    aggregateId: record.aggregateId,
    aggregateName: record.aggregateName,
    aggregateType: record.aggregateType,
    date: record.date.toISOString(),
    totalWeight: record.totalWeight,
    washedWeight: record.washedWeight,
    finenessModulus: record.finenessModulus,
    decant: record.decant,
    notes: record.notes,
    tester: record.tester,
    sieveResults: record.sieveResults
      .sort((a, b) => a.order - b.order)
      .map((result) => ({
        id: result.id,
        name: result.name,
        size: result.size,
        weightRetained: result.weightRetained,
        percentRetained: result.percentRetained,
        cumulativeRetained: result.cumulativeRetained,
        percentPassing: result.percentPassing,
        c33Lower: result.c33Lower,
        c33Upper: result.c33Upper,
        order: result.order,
      })),
    createdAt: record.createdAt.toISOString(),
  };
}

export function normalizeAggregateType(type: string): AggregateType {
  if (type.toLowerCase() === 'fine') return AggregateType.FINE;
  if (type.toLowerCase() === 'coarse') return AggregateType.COARSE;
  throw new Error(`Unsupported aggregate type: ${type}`);
}

import { AggregateType } from '@prisma/client';

type DefaultAggregate = {
  name: string;
  type: AggregateType;
  maxDecant?: number | null;
  sieves: Array<{
    name: string;
    size: number;
    c33Lower?: number | null;
    c33Upper?: number | null;
  }>;
};

export const DEFAULT_AGGREGATES: DefaultAggregate[] = [
  {
    name: 'Keystone #7',
    type: AggregateType.COARSE,
    sieves: [
      { name: '1"', size: 25.0, c33Lower: 100, c33Upper: 100 },
      { name: '3/4"', size: 19.0, c33Lower: 90, c33Upper: 100 },
      { name: '1/2"', size: 12.5 },
      { name: '3/8"', size: 9.5, c33Lower: 20, c33Upper: 55 },
      { name: '#4', size: 4.75, c33Lower: 0, c33Upper: 10 },
      { name: '#8', size: 2.36, c33Lower: 0, c33Upper: 5 },
      { name: '#16', size: 1.18 },
      { name: '#30', size: 0.6 },
      { name: '#50', size: 0.3 },
      { name: '#100', size: 0.15 },
      { name: '#200', size: 0.075 },
      { name: 'Pan', size: 0 },
    ],
  },
  {
    name: 'Kraemer 9/16"',
    type: AggregateType.COARSE,
    sieves: [
      { name: '1"', size: 25.0, c33Lower: 100, c33Upper: 100 },
      { name: '3/4"', size: 19.0, c33Lower: 100, c33Upper: 100 },
      { name: '1/2"', size: 12.5, c33Lower: 85, c33Upper: 100 },
      { name: '3/8"', size: 9.5, c33Lower: 10, c33Upper: 30 },
      { name: '#4', size: 4.75, c33Lower: 0, c33Upper: 10 },
      { name: '#8', size: 2.36, c33Lower: 0, c33Upper: 5 },
      { name: '#16', size: 1.18 },
      { name: '#30', size: 0.6 },
      { name: '#50', size: 0.3 },
      { name: '#100', size: 0.15 },
      { name: '#200', size: 0.075 },
      { name: 'Pan', size: 0 },
    ],
  },
  {
    name: '#9 Gravel (St. Croix)',
    type: AggregateType.COARSE,
    sieves: [
      { name: '1"', size: 25.0, c33Lower: 100, c33Upper: 100 },
      { name: '3/4"', size: 19.0, c33Lower: 100, c33Upper: 100 },
      { name: '1/2"', size: 12.5, c33Lower: 100, c33Upper: 100 },
      { name: '3/8"', size: 9.5, c33Lower: 85, c33Upper: 100 },
      { name: '#4', size: 4.75, c33Lower: 10, c33Upper: 30 },
      { name: '#8', size: 2.36, c33Lower: 0, c33Upper: 10 },
      { name: '#16', size: 1.18, c33Lower: 0, c33Upper: 5 },
      { name: '#30', size: 0.6 },
      { name: '#50', size: 0.3 },
      { name: '#100', size: 0.15 },
      { name: '#200', size: 0.075 },
      { name: 'Pan', size: 0 },
    ],
  },
  {
    name: 'Concrete Sand',
    type: AggregateType.FINE,
    maxDecant: 3,
    sieves: [
      { name: '3/8"', size: 9.5, c33Lower: 100, c33Upper: 100 },
      { name: '#4', size: 4.75, c33Lower: 95, c33Upper: 100 },
      { name: '#8', size: 2.36, c33Lower: 80, c33Upper: 100 },
      { name: '#16', size: 1.18, c33Lower: 50, c33Upper: 85 },
      { name: '#30', size: 0.6, c33Lower: 25, c33Upper: 60 },
      { name: '#50', size: 0.3, c33Lower: 5, c33Upper: 30 },
      { name: '#100', size: 0.15, c33Lower: 0, c33Upper: 10 },
      { name: '#200', size: 0.075, c33Lower: 0, c33Upper: 3 },
      { name: 'Pan', size: 0 },
    ],
  },
];

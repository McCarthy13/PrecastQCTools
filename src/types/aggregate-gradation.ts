export interface SieveData {
  name: string;
  size: number;
  weightRetained: string | number;
  percentRetained?: string;
  cumulativeRetained?: string;
  percentPassing?: string;
  c33Lower?: number | '-';
  c33Upper?: number | '-';
}

export interface AggregateConfig {
  type: 'Fine' | 'Coarse';
  sieves: SieveData[];
  maxDecant?: number | null;
  maxFinenessModulus?: number | null;
}

export interface GradationRecord {
  id: string;
  aggregateName: string;
  aggregateType: 'Fine' | 'Coarse' | 'No Production';
  date: string;
  sieveData: SieveData[];
  sieveResults?: Record<string, number>;
  washedWeight?: number;
  finenessModulus?: string;
  decant?: string;
  totalWeight: number;
  passC33?: boolean;
  isNoProduction?: boolean;
  noProductionRange?: {
    start: string;
    end: string;
    display: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface ChartDataPoint {
  size: number;
  sieve: string;
  percentPassing: number;
  c33Lower?: number;
  c33Upper?: number;
}

export interface GradationTestDraft {
  id: string;
  aggregateName: string;
  date: string;
  sieveData: SieveData[];
  washedWeight: string;
}

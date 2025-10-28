import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';
import { AggregateConfig, GradationRecord } from '../types/aggregate-gradation';
import { DEFAULT_AGGREGATES } from '../utils/aggregate-gradation-constants';

interface AggregateGradationState {
  // Data
  aggregates: Record<string, AggregateConfig>;
  records: GradationRecord[];
  defaultAggregates: string[];
  
  // Aggregate management actions
  addAggregate: (name: string, config: AggregateConfig) => void;
  updateAggregate: (name: string, config: AggregateConfig) => void;
  deleteAggregate: (name: string) => void;
  
  // Test management actions
  addRecord: (record: GradationRecord) => void;
  updateRecord: (id: string, updates: Partial<GradationRecord>) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  addNoProductionRecord: (payload: { start: string; end: string; display: string }) => void;
  
  // Default aggregates management
  setDefaultAggregates: (names: string[]) => void;
  
  // Utility actions
  getAggregate: (name: string) => AggregateConfig | undefined;
  getRecord: (id: string) => GradationRecord | undefined;
}

export const useAggregateGradationStore = create<AggregateGradationState>()(
  persist(
    (set, get) => ({
      // Initial state
      aggregates: DEFAULT_AGGREGATES,
      records: [],
      defaultAggregates: ['Concrete Sand', 'Keystone #7'],
      
      // Aggregate management
      addAggregate: (name, config) =>
        set((state) => ({
          aggregates: { ...state.aggregates, [name]: config },
        })),
      
      updateAggregate: (name, config) =>
        set((state) => ({
          aggregates: { ...state.aggregates, [name]: config },
        })),
      
      deleteAggregate: (name) =>
        set((state) => {
          const { [name]: deleted, ...remaining } = state.aggregates;
          return {
            aggregates: remaining,
            defaultAggregates: state.defaultAggregates.filter(n => n !== name),
          };
        }),
      
      // Record management
      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records].slice(0, 200), // Keep last 200 records
        })),
      
      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id ? { ...record, ...updates, updatedAt: Date.now() } : record
          ),
        })),
      
      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        })),
      
      clearRecords: () => set({ records: [] }),

      addNoProductionRecord: ({ start, end, display }) =>
        set((state) => {
          const id = `no-production-${Date.now()}`;
          const record: GradationRecord = {
            id,
            aggregateName: display,
            aggregateType: 'No Production',
            date: start,
            sieveData: [],
            totalWeight: 0,
            passC33: undefined,
            decant: undefined,
            finenessModulus: undefined,
            isNoProduction: true,
            noProductionRange: { start, end, display },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return {
            records: [record, ...state.records],
          };
        }),
      
      // Default aggregates
      setDefaultAggregates: (names) =>
        set({ defaultAggregates: names.slice(0, 8) }), // Max 8 defaults
      
      // Utilities
      getAggregate: (name) => get().aggregates[name],
      getRecord: (id) => get().records.find((record) => record.id === id),
    }),
    {
      name: 'aggregate-gradation-storage',
      storage: persistStorage,
    }
  )
);

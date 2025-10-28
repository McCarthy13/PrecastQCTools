import { create } from 'zustand';
import {
  listStrandPatterns,
  createStrandPattern,
  updateStrandPattern,
  deleteStrandPattern,
  deleteAllStrandPatterns,
  type StrandPatternPayload,
} from '@/lib/api/strand-patterns';

export type StrandSize = '3/8' | '1/2' | '0.6';

export interface StrandCoordinate {
  size?: StrandSize; // Strand size this coordinate belongs to
  x: number; // Horizontal distance from left edge (inches)
  y: number; // Vertical distance from bottom (inches)
  order?: number;
}

export interface CustomStrandPattern {
  id: string;
  patternId: string; // Format: "101-75" (pattern number - pulling force %)
  position: 'Top' | 'Bottom' | 'Both'; // Where strands are positioned
  strand_3_8: number; // Count of 3/8" strands
  strand_1_2: number; // Count of 1/2" strands
  strand_0_6: number; // Count of 0.6" strands
  strandSizes?: StrandSize[]; // Size of each strand by position (left to right)
  strandGradeCounts?: Partial<Record<StrandSize, Record<string, number>>>; // Counts by strand size & grade (e.g., 250, 270)
  strandCoordinates?: StrandCoordinate[]; // (x,y) position of each strand from bottom-left corner
  totalArea?: number; // Total strand area in in² (optional)
  pullingForcePercent?: number; // % of minimum break strength used for stressing
  createdAt?: number;
  updatedAt?: number;
}

interface StrandPatternState {
  customPatterns: CustomStrandPattern[];
  isLoading: boolean;
  error?: string;
  hasLoaded: boolean;
  fetchPatterns: () => Promise<void>;
  ensurePatterns: () => Promise<void>;
  addPattern: (payload: StrandPatternPayload) => Promise<CustomStrandPattern>;
  updatePattern: (id: string, payload: StrandPatternPayload) => Promise<CustomStrandPattern>;
  removePattern: (id: string) => Promise<void>;
  clearAllPatterns: () => Promise<void>;
  getPatternById: (id: string) => CustomStrandPattern | undefined;
  getPatternByPatternId: (patternId: string) => CustomStrandPattern | undefined;
  getPatternsByPosition: (position: 'Top' | 'Bottom' | 'Both') => CustomStrandPattern[];
}

function mergeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unexpected error occurred.';
}

export const useStrandPatternStore = create<StrandPatternState>((set, get) => ({
  customPatterns: [],
  isLoading: false,
  error: undefined,
  hasLoaded: false,

  async fetchPatterns() {
    set({ isLoading: true, error: undefined });
    try {
      const patterns = await listStrandPatterns();
      set({ customPatterns: patterns, isLoading: false, hasLoaded: true });
    } catch (error) {
      set({ error: mergeError(error), isLoading: false });
      throw error;
    }
  },

  async ensurePatterns() {
    if (get().hasLoaded) {
      return;
    }
    await get().fetchPatterns();
  },

  async addPattern(payload) {
    set({ error: undefined });
    try {
      const created = await createStrandPattern(payload);
      set((state) => ({ customPatterns: [created, ...state.customPatterns], hasLoaded: true }));
      return created;
    } catch (error) {
      set({ error: mergeError(error) });
      throw error;
    }
  },

  async updatePattern(id, payload) {
    set({ error: undefined });
    try {
      const updated = await updateStrandPattern(id, payload);
      set((state) => ({
        customPatterns: state.customPatterns.map((pattern) => (pattern.id === id ? updated : pattern)),
      }));
      return updated;
    } catch (error) {
      set({ error: mergeError(error) });
      throw error;
    }
  },

  async removePattern(id) {
    set({ error: undefined });
    try {
      await deleteStrandPattern(id);
      set((state) => ({
        customPatterns: state.customPatterns.filter((pattern) => pattern.id !== id),
      }));
    } catch (error) {
      set({ error: mergeError(error) });
      throw error;
    }
  },

  async clearAllPatterns() {
    set({ error: undefined });
    try {
      await deleteAllStrandPatterns();
      set({ customPatterns: [], hasLoaded: true });
    } catch (error) {
      set({ error: mergeError(error) });
      throw error;
    }
  },

  getPatternById(id) {
    return get().customPatterns.find((pattern) => pattern.id === id);
  },

  getPatternByPatternId(patternId) {
    return get().customPatterns.find((pattern) => pattern.patternId === patternId);
  },

  getPatternsByPosition(position) {
    return get().customPatterns.filter(
      (pattern) => pattern.position === position || pattern.position === 'Both'
    );
  },
}));

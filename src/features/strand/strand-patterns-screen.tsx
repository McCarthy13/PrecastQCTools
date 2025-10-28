'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStrandPatternStore, CustomStrandPattern, StrandCoordinate, StrandSize } from '@/state/strandPatternStore';
import { useStrandLibraryStore, StrandDefinition } from '@/state/strandLibraryStore';
import { parseMeasurementInput } from '@/utils/cn';
import type { StrandPatternPayload } from '@/lib/api/strand-patterns';

type GradeOptions = Record<StrandSize, Array<{ grade: string; area: number }>>;
type GradeCountDraft = Record<StrandSize, Record<string, string>>;
type GradeCountMap = Record<StrandSize, Record<string, number>>;
type AggregateCounts = Record<StrandSize, number>;

interface CoordinateDraft {
  x: string;
  y: string;
}

type CoordinateDraftMap = Record<StrandSize, CoordinateDraft[]>;

interface PatternDraft {
  id?: string;
  patternId: string;
  position: CustomStrandPattern['position'];
  strandCounts: GradeCountDraft;
  coordinates: CoordinateDraftMap;
  pullingForce: string;
}

const STRAND_ORDER: StrandSize[] = ['3/8', '1/2', '0.6'];
const DIAMETER_BY_SIZE: Record<StrandSize, number> = {
  '3/8': 0.375,
  '1/2': 0.5,
  '0.6': 0.6,
};
const SIZE_LABELS: Record<StrandSize, string> = {
  '3/8': '3/8″',
  '1/2': '1/2″',
  '0.6': '0.6″',
};
const SIZE_PATTERN_FIELD_MAP: Record<StrandSize, 'strand_3_8' | 'strand_1_2' | 'strand_0_6'> = {
  '3/8': 'strand_3_8',
  '1/2': 'strand_1_2',
  '0.6': 'strand_0_6',
};

function createEmptyCoordinate(): CoordinateDraft {
  return { x: '', y: '' };
}

function ensureCoordinateSlots(entries: CoordinateDraft[], count: number): CoordinateDraft[] {
  const normalizedCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const existing = entries.slice(0, normalizedCount);
  while (existing.length < normalizedCount) {
    existing.push(createEmptyCoordinate());
  }
  return existing;
}

function findSizeByDiameter(diameter: number): StrandSize | null {
  return STRAND_ORDER.find((size) => Math.abs(DIAMETER_BY_SIZE[size] - diameter) < 0.0001) ?? null;
}

function buildGradeOptions(strands: StrandDefinition[]): GradeOptions {
  const options: GradeOptions = {
    '3/8': [],
    '1/2': [],
    '0.6': [],
  };

  const seen: Record<StrandSize, Set<string>> = {
    '3/8': new Set(),
    '1/2': new Set(),
    '0.6': new Set(),
  };

  strands.forEach((strand) => {
    const size = findSizeByDiameter(strand.diameter);
    if (!size) return;
    const grade = strand.grade ?? 'default';
    if (seen[size].has(grade)) return;
    seen[size].add(grade);
    options[size].push({ grade, area: strand.area });
  });

  STRAND_ORDER.forEach((size) => {
    if (options[size].length === 0) {
      options[size].push({ grade: 'default', area: 0 });
    } else {
      options[size].sort((a, b) => {
        const gradeA = Number(a.grade);
        const gradeB = Number(b.grade);
        if (!Number.isNaN(gradeA) && !Number.isNaN(gradeB) && gradeA !== gradeB) {
          return gradeB - gradeA;
        }
        return b.area - a.area;
      });
    }
  });

  return options;
}

function buildAreaLookup(options: GradeOptions): Record<StrandSize, Record<string, number>> {
  const lookup: Record<StrandSize, Record<string, number>> = {
    '3/8': {},
    '1/2': {},
    '0.6': {},
  };

  STRAND_ORDER.forEach((size) => {
    options[size].forEach(({ grade, area }) => {
      lookup[size][grade] = area;
    });
  });

  return lookup;
}

function convertDraftCountsToNumbers(strandCounts: GradeCountDraft): GradeCountMap {
  const result: GradeCountMap = {
    '3/8': {},
    '1/2': {},
    '0.6': {},
  };

  STRAND_ORDER.forEach((size) => {
    const grades = strandCounts[size] ?? {};
    Object.entries(grades).forEach(([grade, value]) => {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) {
        result[size][grade] = Math.floor(parsed);
      }
    });
  });

  return result;
}

function aggregateCountsFromNumbers(counts: GradeCountMap): AggregateCounts {
  const totals: AggregateCounts = {
    '3/8': 0,
    '1/2': 0,
    '0.6': 0,
  };

  STRAND_ORDER.forEach((size) => {
    const grades = counts[size];
    totals[size] = grades
      ? Object.values(grades).reduce((sum, value) => sum + value, 0)
      : 0;
  });

  return totals;
}

function calculateTotalArea(
  countsByGrade: GradeCountMap,
  lookup: Record<StrandSize, Record<string, number>>
): number {
  return STRAND_ORDER.reduce((sum, size) => {
    const grades = countsByGrade[size];
    if (!grades) return sum;
    const sizeAreas = lookup[size] ?? {};
    const defaultArea = Object.values(sizeAreas)[0] ?? 0;
    const sizeSum = Object.entries(grades).reduce((subtotal, [grade, count]) => {
      const area = sizeAreas[grade] ?? defaultArea;
      return subtotal + count * area;
    }, 0);
    return sum + sizeSum;
  }, 0);
}

function createEmptyDraft(gradeOptions: GradeOptions): PatternDraft {
  const strandCounts: GradeCountDraft = {
    '3/8': {},
    '1/2': {},
    '0.6': {},
  };

  STRAND_ORDER.forEach((size) => {
    const grades = gradeOptions[size];
    if (grades.length === 0) {
      strandCounts[size]['default'] = '';
    } else {
      grades.forEach(({ grade }) => {
        strandCounts[size][grade] = '';
      });
    }
  });

  return {
    patternId: '',
    position: 'Bottom',
    strandCounts,
    coordinates: {
      '3/8': [],
      '1/2': [],
      '0.6': [],
    },
    pullingForce: '',
  };
}

function createDraftFromPattern(
  pattern: CustomStrandPattern,
  gradeOptions: GradeOptions
): PatternDraft {
  const draft = createEmptyDraft(gradeOptions);
  draft.id = pattern.id;
  draft.patternId = pattern.patternId;
  draft.position = pattern.position;
  draft.pullingForce =
    pattern.pullingForcePercent !== undefined ? pattern.pullingForcePercent.toString() : '';

  const gradeCounts = pattern.strandGradeCounts ?? {};

  STRAND_ORDER.forEach((size) => {
    const gradeMap = gradeCounts[size];
    if (gradeMap) {
      Object.entries(gradeMap).forEach(([grade, count]) => {
        draft.strandCounts[size][grade] = count.toString();
      });
    } else {
      const total = pattern[SIZE_PATTERN_FIELD_MAP[size]];
      if (total > 0) {
        const fallbackGrade = gradeOptions[size][0]?.grade ?? 'default';
        draft.strandCounts[size][fallbackGrade] = total.toString();
      }
    }
  });

  const numericCounts = convertDraftCountsToNumbers(draft.strandCounts);
  const aggregateCounts = aggregateCountsFromNumbers(numericCounts);

  const sourceCoordinates = pattern.strandCoordinates ?? [];
  const coordinatesBySize = new Map<StrandSize, StrandCoordinate[]>();

  STRAND_ORDER.forEach((size) => {
    coordinatesBySize.set(
      size,
      sourceCoordinates
        .filter((coord) => coord.size === size)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );
  });

  STRAND_ORDER.forEach((size) => {
    const count = aggregateCounts[size];
    const sizeCoordinates = coordinatesBySize.get(size) ?? [];
    const entries: CoordinateDraft[] = [];
    for (let index = 0; index < count; index += 1) {
      const existing = sizeCoordinates[index];
      entries.push({
        x:
          existing && typeof existing.x === 'number' && Number.isFinite(existing.x)
            ? existing.x.toString()
            : '',
        y:
          existing && typeof existing.y === 'number' && Number.isFinite(existing.y)
            ? existing.y.toString()
            : '',
      });
    }
    draft.coordinates[size] = entries;
  });

  return draft;
}

function formatGradeLabel(grade: string): string {
  if (!grade || grade === 'default') return '—';
  return grade;
}

function formatPatternGradeCounts(
  gradeCounts?: Partial<Record<StrandSize, Record<string, number>>>
): string | null {
  if (!gradeCounts) return null;

  const parts: string[] = [];
  STRAND_ORDER.forEach((size) => {
    const grades = gradeCounts[size];
    if (!grades || Object.keys(grades).length === 0) return;
    const gradeList = Object.entries(grades)
      .map(([grade, count]) => `${count} @ ${formatGradeLabel(grade)}`)
      .join(', ');
    parts.push(`${SIZE_LABELS[size]} (${gradeList})`);
  });

  return parts.length > 0 ? parts.join(' • ') : null;
}

interface PatternFormProps {
  draft: PatternDraft;
  setDraft: (draft: PatternDraft) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  gradeOptions: GradeOptions;
  areaLookup: Record<StrandSize, Record<string, number>>;
  isSaving: boolean;
}

function PatternForm({
  draft,
  setDraft,
  onClose,
  onSubmit,
  gradeOptions,
  areaLookup,
  isSaving,
}: PatternFormProps) {
  const [error, setError] = useState<string | null>(null);

  const numericGradeCounts = useMemo(
    () => convertDraftCountsToNumbers(draft.strandCounts),
    [draft.strandCounts]
  );
  const aggregateCounts = useMemo(
    () => aggregateCountsFromNumbers(numericGradeCounts),
    [numericGradeCounts]
  );
  const computedTotalArea = useMemo(
    () => calculateTotalArea(numericGradeCounts, areaLookup),
    [numericGradeCounts, areaLookup]
  );

  const handleGradeCountChange = (size: StrandSize, grade: string, rawValue: string) => {
    const sanitized = rawValue.replace(/[^0-9]/g, '');
    const existingSizeCounts = draft.strandCounts[size] ?? {};
    const nextSizeCounts = {
      ...existingSizeCounts,
      [grade]: sanitized,
    };
    const nextStrandCounts: GradeCountDraft = {
      ...draft.strandCounts,
      [size]: nextSizeCounts,
    };
    const nextNumericCounts = convertDraftCountsToNumbers(nextStrandCounts);
    const nextAggregateCounts = aggregateCountsFromNumbers(nextNumericCounts);
    const currentCoordinates = draft.coordinates[size] ?? [];

    setDraft({
      ...draft,
      strandCounts: nextStrandCounts,
      coordinates: {
        ...draft.coordinates,
        [size]: ensureCoordinateSlots(currentCoordinates, nextAggregateCounts[size]),
      },
    });
    setError(null);
  };

  const updateCoordinate = (size: StrandSize, index: number, axis: 'x' | 'y', value: string) => {
    const currentEntries = draft.coordinates[size] ?? [];
    const nextEntries = currentEntries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [axis]: value } : entry
    );
    setDraft({
      ...draft,
      coordinates: {
        ...draft.coordinates,
        [size]: nextEntries,
      },
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (!draft.patternId.trim()) {
      setError('Pattern ID is required.');
      return;
    }
    const pullingForceRaw = draft.pullingForce.trim();
    if (!pullingForceRaw) {
      setError('Pulling force percentage is required.');
      return;
    }
    const pullingForceValue = Number(pullingForceRaw);
    if (!Number.isFinite(pullingForceValue) || pullingForceValue <= 0 || pullingForceValue > 100) {
      setError('Pulling force must be a percentage between 0 and 100.');
      return;
    }

    for (const size of STRAND_ORDER) {
      const count = aggregateCounts[size];
      const entries = draft.coordinates[size] ?? [];
      for (let index = 0; index < count; index += 1) {
        const entry = entries[index] ?? createEmptyCoordinate();
        const xValue = parseMeasurementInput(entry.x);
        const yValue = parseMeasurementInput(entry.y);
        if (xValue === null || yValue === null) {
          setError(`Enter valid coordinates (ft′-in″ or decimal inches) for ${SIZE_LABELS[size]} strand #${index + 1}.`);
          return;
        }
      }
    }

    setError(null);
    try {
      await onSubmit();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to save pattern.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {draft.id ? 'Edit Strand Pattern' : 'New Strand Pattern'}
            </h2>
            <p className="text-sm text-slate-500">Specify strand counts, per-strand coordinates, and pulling force.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </header>
        <div className="grid max-h-[75vh] gap-6 overflow-y-auto px-6 py-6 md:grid-cols-[2fr_1fr]">
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Pattern ID"
                value={draft.patternId}
                onChange={(event) => {
                  setDraft({ ...draft, patternId: event.target.value });
                  setError(null);
                }}
                placeholder="E.g. 101-75"
              />
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Position
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={draft.position}
                  onChange={(event) => {
                    setDraft({ ...draft, position: event.target.value as CustomStrandPattern['position'] });
                    setError(null);
                  }}
                >
                  <option value="Top">Top</option>
                  <option value="Bottom">Bottom</option>
                  <option value="Both">Both</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              {STRAND_ORDER.map((size) => {
                const optionGrades = gradeOptions[size];
                const existingGrades = Object.keys(draft.strandCounts[size] ?? {});
                const availableGrades = Array.from(
                  new Set([...optionGrades.map((option) => option.grade), ...existingGrades])
                );

                if (availableGrades.length === 0) {
                  return (
                    <div key={size} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold text-slate-900">{SIZE_LABELS[size]} strands</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        No strand definitions configured for this size in the strand library.
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={size} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{SIZE_LABELS[size]} strands</h3>
                      <span className="text-xs text-slate-500">Total {aggregateCounts[size]}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {availableGrades.map((grade) => {
                        const value = draft.strandCounts[size]?.[grade] ?? '';
                        const sizeAreas = areaLookup[size] ?? {};
                        const area = sizeAreas[grade] ?? Object.values(sizeAreas)[0] ?? 0;
                        return (
                          <div
                            key={`${size}-${grade}`}
                            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <Input
                              label={`Grade ${formatGradeLabel(grade)}`}
                              value={value}
                              onChange={(event) => handleGradeCountChange(size, grade, event.target.value)}
                              inputMode="numeric"
                              placeholder="0"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              Area {area > 0 ? `${area.toFixed(3)} in²` : '—'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <Input
              label="Pulling force (% of min break strength)"
              value={draft.pullingForce}
              onChange={(event) => {
                setDraft({ ...draft, pullingForce: event.target.value });
                setError(null);
              }}
              inputMode="decimal"
              placeholder="e.g. 75"
            />

            {STRAND_ORDER.map((size) => {
              const count = aggregateCounts[size];
              if (count === 0) {
                return null;
              }

              const entries = ensureCoordinateSlots(draft.coordinates[size], count);
              const sizeLabel = SIZE_LABELS[size];

              return (
                <div key={size} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{sizeLabel} strand coordinates</h3>
                    <span className="text-xs text-slate-500">
                      {count} {count === 1 ? 'strand' : 'strands'}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {entries.map((entry, index) => (
                      <div key={`${size}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {sizeLabel} strand #{index + 1}
                        </p>
                        <div className="mt-3 grid gap-3">
                          <Input
                            label="X (in)"
                            value={entry.x}
                            onChange={(event) => updateCoordinate(size, index, 'x', event.target.value)}
                            inputMode="decimal"
                            placeholder="e.g. 12.5"
                          />
                          <Input
                            label="Y (in)"
                            value={entry.y}
                            onChange={(event) => updateCoordinate(size, index, 'y', event.target.value)}
                            inputMode="decimal"
                            placeholder="e.g. 2.75"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Pattern ID:</span> {draft.patternId || '—'}</p>
              <p><span className="font-semibold text-slate-900">Position:</span> {draft.position}</p>
              <p>
                <span className="font-semibold text-slate-900">Strands:</span>{' '}
                {aggregateCounts['3/8']}/{aggregateCounts['1/2']}/{aggregateCounts['0.6']}
              </p>
              <div className="mt-2 space-y-1 text-xs text-slate-500">
                {STRAND_ORDER.map((size) => {
                  const grades = numericGradeCounts[size];
                  if (!grades || Object.keys(grades).length === 0) {
                    return null;
                  }
                  const gradeSummary = Object.entries(grades)
                    .map(([grade, count]) => `${count} @ ${formatGradeLabel(grade)}`)
                    .join(', ');
                  return (
                    <p key={size}>
                      {SIZE_LABELS[size]}: {gradeSummary}
                    </p>
                  );
                })}
              </div>
              <p><span className="font-semibold text-slate-900">Total area:</span> {computedTotalArea > 0 ? `${computedTotalArea.toFixed(3)} in²` : '—'}</p>
              <p><span className="font-semibold text-slate-900">Pulling force:</span> {draft.pullingForce ? `${draft.pullingForce}%` : '—'}</p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving…' : draft.id ? 'Save changes' : 'Create pattern'}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

export function StrandPatternsScreen() {
  const customPatterns = useStrandPatternStore((state) => state.customPatterns);
  const ensurePatterns = useStrandPatternStore((state) => state.ensurePatterns);
  const addPattern = useStrandPatternStore((state) => state.addPattern);
  const updatePattern = useStrandPatternStore((state) => state.updatePattern);
  const removePattern = useStrandPatternStore((state) => state.removePattern);
  const clearAllPatterns = useStrandPatternStore((state) => state.clearAllPatterns);
  const storeError = useStrandPatternStore((state) => state.error);
  const isLoading = useStrandPatternStore((state) => state.isLoading);
  const strands = useStrandLibraryStore((state) => state.strands);
  const gradeOptions = useMemo(() => buildGradeOptions(strands), [strands]);
  const areaLookup = useMemo(() => buildAreaLookup(gradeOptions), [gradeOptions]);

  const [draft, setDraft] = useState<PatternDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedPatterns = useMemo(
    () => [...customPatterns].sort((a, b) => a.patternId.localeCompare(b.patternId)),
    [customPatterns]
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    ensurePatterns().catch((error) => {
      showToast(error instanceof Error ? error.message : 'Unable to load strand patterns.');
    });
  }, [ensurePatterns]);

  useEffect(() => {
    if (!storeError) return;
    showToast(storeError);
  }, [storeError]);

  const handleSubmitDraft = async () => {
    if (!draft) return;

    const numericGradeCounts = convertDraftCountsToNumbers(draft.strandCounts);
    const aggregateCounts = aggregateCountsFromNumbers(numericGradeCounts);
    const pullingForceValue = Number(draft.pullingForce.trim());
    const pullingForcePercent = Number.isFinite(pullingForceValue) ? pullingForceValue : 0;

    const strandCoordinates: StrandCoordinate[] = [];
    const strandSizes: StrandSize[] = [];

    for (const size of STRAND_ORDER) {
      const count = aggregateCounts[size];
      const entries = draft.coordinates[size] ?? [];
      for (let index = 0; index < count; index += 1) {
        const entry = entries[index] ?? createEmptyCoordinate();
        const xValue = parseMeasurementInput(entry.x);
        const yValue = parseMeasurementInput(entry.y);
        if (xValue === null || yValue === null) {
          const error = `Enter valid coordinates for ${SIZE_LABELS[size]} strand #${index + 1}.`;
          showToast(error);
          throw new Error(error);
        }
        strandCoordinates.push({ size, order: index, x: xValue, y: yValue });
        strandSizes.push(size);
      }
    }

    const nonEmptyGradeCounts = STRAND_ORDER.reduce(
      (acc, size) => {
        const grades = numericGradeCounts[size];
        if (grades && Object.keys(grades).length > 0) {
          acc[size] = grades;
        }
        return acc;
      },
      {} as Partial<Record<StrandSize, Record<string, number>>>
    );

    const totalArea = calculateTotalArea(numericGradeCounts, areaLookup);
    const normalizedTotalArea = Number.isFinite(totalArea) ? Number(totalArea.toFixed(3)) : 0;

    const payload: StrandPatternPayload = {
      patternId: draft.patternId.trim(),
      position: draft.position,
      strand_3_8: aggregateCounts['3/8'],
      strand_1_2: aggregateCounts['1/2'],
      strand_0_6: aggregateCounts['0.6'],
      pullingForcePercent,
      ...(strandSizes.length > 0 ? { strandSizes } : {}),
      ...(strandCoordinates.length > 0 ? { strandCoordinates } : {}),
      ...(Object.keys(nonEmptyGradeCounts).length > 0 ? { strandGradeCounts: nonEmptyGradeCounts } : {}),
      ...(normalizedTotalArea > 0 ? { totalArea: normalizedTotalArea } : {}),
    };

    try {
      setIsSaving(true);
      if (draft.id) {
        await updatePattern(draft.id, payload);
        showToast('Pattern updated.');
      } else {
        await addPattern(payload);
        showToast('Pattern created.');
      }
      setDraft(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save strand pattern.';
      showToast(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Strand Patterns</h2>
          <p className="text-sm text-slate-600">Manage saved strand configurations used by the camber calculator.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setDraft(createEmptyDraft(gradeOptions))} disabled={isSaving}>
            Add pattern
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={async () => {
              if (customPatterns.length === 0) {
                showToast('No patterns to clear.');
                return;
              }
              if (window.confirm('Clear all strand patterns?')) {
                try {
                  setIsSaving(true);
                  await clearAllPatterns();
                  showToast('All patterns removed.');
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Unable to clear patterns.');
                } finally {
                  setIsSaving(false);
                }
              }
            }}
            disabled={isSaving}
          >
            Clear all
          </Button>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          {toast}
        </div>
      )}

      {sortedPatterns.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{isLoading ? 'Loading strand patterns…' : 'No strand patterns saved'}</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Fetching your saved patterns from the server.'
                : 'Add a pattern to accelerate camber calculations across members.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading && (
              <Button onClick={() => setDraft(createEmptyDraft(gradeOptions))}>Create first pattern</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedPatterns.map((pattern) => {
            const gradeSummary = formatPatternGradeCounts(pattern.strandGradeCounts);
            return (
              <Card key={pattern.id} className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{pattern.patternId}</CardTitle>
                  <Badge variant="outline">{pattern.position}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-900">Pulling force:</span> {pattern.pullingForcePercent !== undefined ? `${pattern.pullingForcePercent}%` : '—'}</p>
                  {pattern.totalArea !== undefined && (
                    <p><span className="font-semibold text-slate-900">Total strand area:</span> {pattern.totalArea.toFixed(3)} in²</p>
                  )}
                  <p><span className="font-semibold text-slate-900">Strands:</span> 3/8″ {pattern.strand_3_8} • 1/2″ {pattern.strand_1_2} • 0.6″ {pattern.strand_0_6}</p>
                  {gradeSummary && (
                    <p>
                      <span className="font-semibold text-slate-900">Grades:</span>{' '}
                      {gradeSummary}
                    </p>
                  )}
                  {pattern.strandSizes && pattern.strandSizes.length > 0 && (
                    <p>Strand sizes: {pattern.strandSizes.join(', ')}</p>
                  )}
                  {pattern.strandCoordinates && pattern.strandCoordinates.length > 0 && (
                    <p>Coordinates: {pattern.strandCoordinates.length} points</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    {(() => {
                      const lastUpdated = pattern.updatedAt ?? pattern.createdAt;
                      if (!lastUpdated) {
                        return 'Saved —';
                      }
                      return `Saved ${formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}`;
                    })()}
                  </span>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setDraft(createDraftFromPattern(pattern, gradeOptions))}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={async () => {
                      if (window.confirm(`Delete pattern ${pattern.patternId}?`)) {
                        try {
                          setIsSaving(true);
                          await removePattern(pattern.id);
                          showToast('Pattern deleted.');
                        } catch (error) {
                          showToast(error instanceof Error ? error.message : 'Unable to delete pattern.');
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }}
                    disabled={isSaving}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {draft && (
        <PatternForm
          draft={draft}
          setDraft={setDraft}
          onClose={() => setDraft(null)}
          onSubmit={handleSubmitDraft}
          gradeOptions={gradeOptions}
          areaLookup={areaLookup}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

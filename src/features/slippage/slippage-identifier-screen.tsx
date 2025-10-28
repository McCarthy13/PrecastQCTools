'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CrossSection8048 } from '@/components/cross-section-8048';
import { useNavigationStore } from '@/state/navigationStore';
import { useStrandPatternStore, type CustomStrandPattern } from '@/state/strandPatternStore';
import type { RootStackParamList } from '@/navigation/types';

interface SlippageEntry {
  strandId: string;
  leftSlippage: string;
  rightSlippage: string;
  leftExceedsOne: boolean;
  rightExceedsOne: boolean;
  size?: '3/8' | '1/2' | '0.6';
}

type SlippageConfig = RootStackParamList['SlippageIdentifier']['config'];

function calculateActiveIndices(
  strandCoordinates: { x: number; y: number }[] | undefined,
  productWidth: number | undefined,
  offcutSide: 'L1' | 'L2' | undefined
) {
  if (!strandCoordinates || !productWidth || !offcutSide) {
    return null;
  }

  const fullWidth = Math.max(...strandCoordinates.map((coord) => coord.x));

  return strandCoordinates.reduce<number[]>((acc, coord, index) => {
    const keep = offcutSide === 'L1'
      ? coord.x >= fullWidth - productWidth
      : coord.x <= productWidth;

    if (keep) {
      acc.push(index);
    }
    return acc;
  }, []);
}

function buildInitialSlippages(
  pattern: CustomStrandPattern | undefined,
  activeIndices: number[] | null
): SlippageEntry[] {
  if (!pattern) return [];

  const totalStrands = pattern.strand_3_8 + pattern.strand_1_2 + pattern.strand_0_6;
  const activeStrands = activeIndices === null
    ? Array.from({ length: totalStrands }, (_, index) => index + 1)
    : activeIndices.map((index) => index + 1);

  return activeStrands.map((id) => ({
    strandId: String(id),
    leftSlippage: '0',
    rightSlippage: '0',
    leftExceedsOne: false,
    rightExceedsOne: false,
    size: pattern.strandSizes?.[id - 1],
  }));
}

function SlippageInfoBanner({
  pattern,
  config,
  activeCount,
}: {
  pattern: CustomStrandPattern;
  config: SlippageConfig;
  activeCount: number;
}) {
  const total = pattern.strand_3_8 + pattern.strand_1_2 + pattern.strand_0_6;
  const offcutLabel = config.offcutSide === 'L1' ? 'Left removed' : 'Right removed';

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <p className="font-semibold text-emerald-900">Cut-width product</p>
      <p>{`${config.productWidth ?? ''}″ • ${config.offcutSide ?? '—'} (${offcutLabel}) • ${activeCount}/${total} active strands`}</p>
    </div>
  );
}

export function SlippageIdentifierScreen({ params }: { params: RootStackParamList['SlippageIdentifier'] }) {
  const push = useNavigationStore((state) => state.push);
  const customPatterns = useStrandPatternStore((state) => state.customPatterns);
  const ensurePatterns = useStrandPatternStore((state) => state.ensurePatterns);
  const storeError = useStrandPatternStore((state) => state.error);

  useEffect(() => {
    ensurePatterns().catch(() => {
      /* errors handled via storeError */
    });
  }, [ensurePatterns]);

  useEffect(() => {
    if (storeError) {
      console.error(storeError);
    }
  }, [storeError]);

  const { config } = params;
  const selectedPattern = customPatterns.find((pattern) => pattern.id === config.strandPattern);

  const activeIndices = useMemo(
    () => calculateActiveIndices(selectedPattern?.strandCoordinates, config.productWidth, config.offcutSide),
    [selectedPattern?.strandCoordinates, config.productWidth, config.offcutSide]
  );

  const initialSlippages = useMemo(
    () => buildInitialSlippages(selectedPattern, activeIndices),
    [selectedPattern, activeIndices]
  );

  const [slippages, setSlippages] = useState<SlippageEntry[]>(initialSlippages);

  useEffect(() => {
    setSlippages(initialSlippages);
  }, [initialSlippages]);

  const updateSlippage = (strandId: string, side: 'left' | 'right', value: string) => {
    setSlippages((prev) =>
      prev.map((entry) =>
        entry.strandId === strandId
          ? {
              ...entry,
              [side === 'left' ? 'leftSlippage' : 'rightSlippage']: value,
            }
          : entry
      )
    );
  };

  const handleFocus = (strandId: string, side: 'left' | 'right') => {
    setSlippages((prev) =>
      prev.map((entry) => {
        if (entry.strandId !== strandId) return entry;
        const field = side === 'left' ? entry.leftSlippage : entry.rightSlippage;
        if (field === '0') {
          return {
            ...entry,
            [side === 'left' ? 'leftSlippage' : 'rightSlippage']: '',
          };
        }
        return entry;
      })
    );
  };

  const handleBlur = (strandId: string, side: 'left' | 'right') => {
    setSlippages((prev) =>
      prev.map((entry) => {
        if (entry.strandId !== strandId) return entry;
        const field = side === 'left' ? entry.leftSlippage : entry.rightSlippage;
        if (!field.trim()) {
          return {
            ...entry,
            [side === 'left' ? 'leftSlippage' : 'rightSlippage']: '0',
          };
        }
        return entry;
      })
    );
  };

  const toggleExceedsOne = (strandId: string, side: 'left' | 'right') => {
    setSlippages((prev) =>
      prev.map((entry) => {
        if (entry.strandId !== strandId) return entry;
        const key = side === 'left' ? 'leftExceedsOne' : 'rightExceedsOne';
        const value = !entry[key];
        return {
          ...entry,
          [key]: value,
          [side === 'left' ? 'leftSlippage' : 'rightSlippage']: value
            ? entry[side === 'left' ? 'leftSlippage' : 'rightSlippage']
            : entry[side === 'left' ? 'leftSlippage' : 'rightSlippage'] || '0',
        };
      })
    );
  };

  const activeStrandNumbers = useMemo(() => {
    if (activeIndices === null) return undefined;
    return activeIndices.map((index) => index + 1);
  }, [activeIndices]);

  const handleSubmit = () => {
    push('SlippageSummary', {
      slippages: slippages.map((entry) => ({
        strandId: entry.strandId,
        leftSlippage: entry.leftSlippage || '0',
        rightSlippage: entry.rightSlippage || '0',
        leftExceedsOne: entry.leftExceedsOne,
        rightExceedsOne: entry.rightExceedsOne,
        size: entry.size,
      })),
      config,
    });
  };

  const totalStrands = selectedPattern
    ? selectedPattern.strand_3_8 + selectedPattern.strand_1_2 + selectedPattern.strand_0_6
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Slippage Identifier</h2>
            <p className="text-sm text-slate-600">Enter measured strand slippage at each end.</p>
          </div>
          <div className="text-xs text-slate-500">
            {selectedPattern ? (
              <p>
                Pattern {selectedPattern.patternId} • {totalStrands} strands
              </p>
            ) : (
              <p>No strand pattern selected</p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cross Section</CardTitle>
          <CardDescription>Visualize active strands and cut-width adjustments.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-center">
            <CrossSection8048
              scale={6}
              activeStrands={activeStrandNumbers}
              offcutSide={config.offcutSide ?? null}
              productWidth={config.productWidth}
              strandCoordinates={selectedPattern?.strandCoordinates}
            />
          </div>
          {activeIndices !== null && selectedPattern && config.offcutSide && config.productWidth && (
            <SlippageInfoBanner
              pattern={selectedPattern}
              config={config}
              activeCount={slippages.length}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slippage Values</CardTitle>
          <CardDescription>
            {activeIndices === null
              ? 'All strands are active for full-width product.'
              : 'Only strands remaining after cut-width are shown.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {slippages.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No active strands for the selected configuration. Adjust the strand pattern or product width.
            </div>
          )}

          {slippages.map((strand) => (
            <div key={strand.strandId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                    {strand.strandId}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Strand {strand.strandId}</p>
                    {strand.size && <p className="text-xs text-slate-500">{`${strand.size}″ diameter`}</p>}
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>End 1</span>
                    <button
                      type="button"
                      className={`flex items-center gap-2 text-xs font-medium ${
                        strand.leftExceedsOne ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      onClick={() => toggleExceedsOne(strand.strandId, 'left')}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          strand.leftExceedsOne
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {strand.leftExceedsOne ? '✓' : ''}
                      </span>
                      &gt;1″
                    </button>
                  </div>
                  <Input
                    value={strand.leftExceedsOne ? '\u003e1″' : strand.leftSlippage}
                    onChange={(event) => updateSlippage(strand.strandId, 'left', event.target.value)}
                    onFocus={() => handleFocus(strand.strandId, 'left')}
                    onBlur={() => handleBlur(strand.strandId, 'left')}
                    disabled={strand.leftExceedsOne}
                    placeholder="0.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>End 2</span>
                    <button
                      type="button"
                      className={`flex items-center gap-2 text-xs font-medium ${
                        strand.rightExceedsOne ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      onClick={() => toggleExceedsOne(strand.strandId, 'right')}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          strand.rightExceedsOne
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {strand.rightExceedsOne ? '✓' : ''}
                      </span>
                      &gt;1″
                    </button>
                  </div>
                  <Input
                    value={strand.rightExceedsOne ? '\u003e1″' : strand.rightSlippage}
                    onChange={(event) => updateSlippage(strand.strandId, 'right', event.target.value)}
                    onFocus={() => handleFocus(strand.strandId, 'right')}
                    onBlur={() => handleBlur(strand.strandId, 'right')}
                    disabled={strand.rightExceedsOne}
                    placeholder="0.5"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={slippages.length === 0}>
              Calculate Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

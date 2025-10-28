'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CrossSection8048 } from '@/components/cross-section-8048';
import { useNavigationStore } from '@/state/navigationStore';
import { useStrandPatternStore } from '@/state/strandPatternStore';
import { useSlippageHistoryStore, SlippageData, SlippageRecord } from '@/state/slippageHistoryStore';
import { useAuthStore } from '@/state/authStore';
import { decimalToFraction, parseMeasurementInput } from '@/utils/cn';
import type { RootStackParamList } from '@/navigation/types';

interface Props {
  params: RootStackParamList['SlippageSummary'];
}

interface StrandStats {
  strandId: string;
  sizeLabel: string;
  end1Display: string;
  end2Display: string;
  totalDisplay: string;
  exceeds: boolean;
}

interface SummaryStats {
  totalSlippage: number;
  averageSlippage: number;
  totalEnd1: number;
  averageEnd1: number;
  totalEnd2: number;
  averageEnd2: number;
  anyExceeds: boolean;
  anyEnd1Exceeds: boolean;
  anyEnd2Exceeds: boolean;
}

const GREATER_THAN_LABEL = '\u003e1″';

function calculateSummary(slippages: SlippageData[]): SummaryStats {
  const parsed = slippages.map((entry) => {
    const end1 = parseMeasurementInput(entry.leftSlippage) ?? 0;
    const end2 = parseMeasurementInput(entry.rightSlippage) ?? 0;
    return {
      end1,
      end2,
      end1Exceeds: entry.leftExceedsOne,
      end2Exceeds: entry.rightExceedsOne,
    };
  });

  const allValues = parsed.flatMap((item) => [item.end1, item.end2]);
  const end1Values = parsed.map((item) => item.end1);
  const end2Values = parsed.map((item) => item.end2);

  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  const avg = (values: number[]) => (values.length ? sum(values) / values.length : 0);

  return {
    totalSlippage: sum(allValues),
    averageSlippage: avg(allValues),
    totalEnd1: sum(end1Values),
    averageEnd1: avg(end1Values),
    totalEnd2: sum(end2Values),
    averageEnd2: avg(end2Values),
    anyExceeds: parsed.some((item) => item.end1Exceeds || item.end2Exceeds),
    anyEnd1Exceeds: parsed.some((item) => item.end1Exceeds),
    anyEnd2Exceeds: parsed.some((item) => item.end2Exceeds),
  };
}

function buildStrandStats(slippages: SlippageData[], patternSizes?: Array<'3/8' | '1/2' | '0.6'>): StrandStats[] {
  return slippages.map((entry) => {
    const end1Value = parseMeasurementInput(entry.leftSlippage) ?? 0;
    const end2Value = parseMeasurementInput(entry.rightSlippage) ?? 0;
    const total = end1Value + end2Value;
    const index = Number(entry.strandId) - 1;
    const strandSize = patternSizes?.[index];

    return {
      strandId: entry.strandId,
      sizeLabel: strandSize ? `${strandSize}″` : '—',
      end1Display: entry.leftExceedsOne ? GREATER_THAN_LABEL : `${end1Value.toFixed(3)}″ (≈${decimalToFraction(end1Value)})`,
      end2Display: entry.rightExceedsOne ? GREATER_THAN_LABEL : `${end2Value.toFixed(3)}″ (≈${decimalToFraction(end2Value)})`,
      totalDisplay: entry.leftExceedsOne || entry.rightExceedsOne
        ? GREATER_THAN_LABEL
        : `${total.toFixed(3)}″ (≈${decimalToFraction(total)})`,
      exceeds: entry.leftExceedsOne || entry.rightExceedsOne,
    };
  });
}

export function SlippageSummaryScreen({ params }: Props) {
  const { slippages, config } = params;
  const currentUser = useAuthStore((state) => state.currentUser);
  const addUserRecord = useSlippageHistoryStore((state) => state.addUserRecord);
  const push = useNavigationStore((state) => state.push);
  const reset = useNavigationStore((state) => state.reset);
  const back = useNavigationStore((state) => state.back);

  const customPatterns = useStrandPatternStore((state) => state.customPatterns);
  const ensurePatterns = useStrandPatternStore((state) => state.ensurePatterns);
  const storeError = useStrandPatternStore((state) => state.error);
  const pattern = useMemo(
    () => customPatterns.find((item) => item.id === config.strandPattern),
    [customPatterns, config.strandPattern]
  );

  const summary = useMemo(() => calculateSummary(slippages), [slippages]);
  const strandDetails = useMemo(
    () => buildStrandStats(slippages, pattern?.strandSizes),
    [slippages, pattern?.strandSizes]
  );

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    ensurePatterns().catch(() => {
      /* handled via store error */
    });
  }, [ensurePatterns]);

  useEffect(() => {
    if (!storeError) return;
    setToast(storeError);
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [storeError]);

  const handleSave = () => {
    const timestamp = Date.now();
    const record: SlippageRecord = {
      id: `slippage-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp,
      slippages,
      config,
      createdBy: currentUser?.email ?? 'unknown@precast.com',
    };
    addUserRecord(record);
    setToast('Saved to history');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Slippage Summary</h2>
          <p className="text-sm text-slate-500">
            {config.projectName ?? 'Unnamed project'} • Calculated {formatDistanceToNow(new Date(), { addSuffix: true })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleSave}>
            Save to history
          </Button>
          <Button variant="outline" onClick={() => push('SlippageHistory', undefined)}>
            View history
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Context</CardTitle>
          <CardDescription>Information carried forward from the identifier screen.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {config.projectNumber && <p className="text-sm text-slate-600">Project #: {config.projectNumber}</p>}
          {config.markNumber && <p className="text-sm text-slate-600">Mark #: {config.markNumber}</p>}
          {config.idNumber && <p className="text-sm text-slate-600">ID #: {config.idNumber}</p>}
          {config.span && <p className="text-sm text-slate-600">Span: {config.span.toFixed(2)}″</p>}
          <p className="text-sm text-slate-600">Product: {config.productType}</p>
          {pattern && (
            <p className="text-sm text-slate-600">Pattern: {pattern.patternId}</p>
          )}
          {config.productWidth && (
            <p className="text-sm text-slate-600">
              Cut width: {config.productWidth.toFixed(2)}″ {config.offcutSide ? `(offcut ${config.offcutSide})` : ''}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cross Section</CardTitle>
          <CardDescription>Active strands and cut width preview.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <CrossSection8048
              scale={6}
              offcutSide={config.offcutSide ?? null}
              productWidth={config.productWidth}
              strandCoordinates={pattern?.strandCoordinates}
              showSlippageValues
              slippages={slippages.map((entry) => ({
                strandId: entry.strandId,
                leftSlippage: entry.leftSlippage,
                rightSlippage: entry.rightSlippage,
                leftExceedsOne: entry.leftExceedsOne,
                rightExceedsOne: entry.rightExceedsOne,
              }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Aggregated values across all strands.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total slippage</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {summary.anyExceeds ? GREATER_THAN_LABEL : `${summary.totalSlippage.toFixed(3)}″`}
            </p>
            <p className="text-xs text-slate-500">≈{summary.anyExceeds ? GREATER_THAN_LABEL : decimalToFraction(summary.totalSlippage)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average slippage</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {summary.anyExceeds ? GREATER_THAN_LABEL : `${summary.averageSlippage.toFixed(3)}″`}
            </p>
            <p className="text-xs text-slate-500">≈{summary.anyExceeds ? GREATER_THAN_LABEL : decimalToFraction(summary.averageSlippage)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Warnings</p>
            <p className="mt-1 text-xl font-semibold text-red-600">
              {summary.anyExceeds ? 'Values over 1″' : 'Within tolerance'}
            </p>
            {summary.anyExceeds && (
              <p className="text-xs text-red-500">Review strands flagged below.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-Strand Slippage</CardTitle>
          <CardDescription>Detailed values for each strand end.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {strandDetails.map((strand) => (
            <div
              key={strand.strandId}
              className={`rounded-2xl border p-4 ${strand.exceeds ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                    {strand.strandId}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Strand {strand.strandId}</p>
                    <p className="text-xs text-slate-500">Size {strand.sizeLabel}</p>
                  </div>
                </div>
                {strand.exceeds && <Badge variant="warning">Over 1″</Badge>}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">End 1</p>
                  <p>{strand.end1Display}</p>
                </div>
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">End 2</p>
                  <p>{strand.end2Display}</p>
                </div>
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">Total</p>
                  <p>{strand.totalDisplay}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => back()}>
            Back
          </Button>
          <Button variant="outline" onClick={() => reset('Dashboard', undefined)}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}

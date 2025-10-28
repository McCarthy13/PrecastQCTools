'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalculatorStore } from '@/state/calculatorStore';
import { useNavigationStore } from '@/state/navigationStore';
import { formatSpanDisplay } from '@/utils/cn';
import { formatNumber, formatTimestamp } from './utils';
import { useShallow } from 'zustand/react/shallow';

interface ResultsProps {
  params: { calculationId: string };
}

export function CamberResultsScreen({ params }: ResultsProps) {
  const { calculation, historyLength, removeCalculation } = useCalculatorStore(
    useShallow((state) => ({
      calculation: state.history.find((item) => item.id === params.calculationId),
      historyLength: state.history.length,
      removeCalculation: state.removeCalculation,
    }))
  );
  const { reset, back } = useNavigationStore(
    useShallow((state) => ({
      reset: state.reset,
      back: state.back,
    }))
  );

  const notFound = !calculation;

  const outputRows = useMemo(() => {
    if (!calculation) {
      return [];
    }

    const { results } = calculation;
    return [
      { label: 'Recommended camber', value: `${formatNumber(results.recommendedCamber)} in` },
      { label: 'Initial camber', value: `${formatNumber(results.initialCamber)} in` },
      { label: 'Net initial camber', value: `${formatNumber(results.netInitialCamber)} in` },
      { label: 'Final camber', value: `${formatNumber(results.finalCamber)} in` },
      { label: 'Dead load deflection', value: `${formatNumber(results.deadLoadDeflection)} in` },
      results.liveLoadDeflection !== undefined
        ? { label: 'Live load deflection', value: `${formatNumber(results.liveLoadDeflection)} in` }
        : null,
      { label: 'Long-term deflection', value: `${formatNumber(results.longTermDeflection)} in` },
      { label: 'Release Ec', value: `${formatNumber(results.releaseModulusOfElasticity, 0)} psi` },
      { label: '28-day Ec', value: `${formatNumber(results.modulusOfElasticity, 0)} psi` },
      { label: 'Creep factor', value: formatNumber(results.creepFactor, 2) },
      { label: 'Shrinkage factor', value: formatNumber(results.shrinkageFactor, 2) },
    ].filter(Boolean) as Array<{ label: string; value: string }>;
  }, [calculation]);

  if (notFound) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Calculation not found</h2>
        <p className="max-w-md text-sm text-slate-600">
          The requested calculation could not be located. It may have been removed from history.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => reset('Calculator', undefined)}>Go to calculator</Button>
          <Button variant="outline" onClick={() => reset('History', undefined)}>
            View history
          </Button>
        </div>
      </div>
    );
  }

  const { inputs, results, projectName, timestamp, notes } = calculation;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Camber Results</h2>
          <p className="text-sm text-slate-600">
            Calculated on {formatTimestamp(timestamp)}
            {projectName ? ` • ${projectName}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => reset('Calculator', undefined)}>
            Run another calculation
          </Button>
          <Button variant="outline" onClick={() => reset('History', undefined)}>
            History ({historyLength})
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              if (window.confirm('Remove this calculation from history?')) {
                removeCalculation(calculation.id);
                back();
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Camber Summary</CardTitle>
            <CardDescription>PCI Design Handbook recommendations based on provided section data.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {outputRows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{row.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{row.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Input Snapshot</CardTitle>
            <CardDescription>Values used for this calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Span</p>
              <p className="font-medium text-slate-900">{formatSpanDisplay(inputs.span)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Member type</p>
              <p className="font-medium text-slate-900">{inputs.memberType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Strengths</p>
              <p>{`f′ci ${inputs.releaseStrength.toLocaleString()} psi`}</p>
              <p>{`f′c ${inputs.concreteStrength.toLocaleString()} psi`}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Section properties</p>
              <p>Moment of inertia {inputs.momentOfInertia.toLocaleString()} in⁴</p>
              <p>Dead load {inputs.deadLoad.toLocaleString()} lb/ft</p>
              {inputs.liveLoad && <p>Live load {inputs.liveLoad.toLocaleString()} lb/ft</p>}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Strand patterns</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {inputs.strandPattern ? <Badge>Bottom: {inputs.strandPattern}</Badge> : <Badge variant="outline">Bottom: manual</Badge>}
                {inputs.topStrandPattern ? <Badge>Top: {inputs.topStrandPattern}</Badge> : null}
              </div>
            </div>
            {inputs.productWidth && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Product width</p>
                <p>{`${inputs.productWidth.toFixed(2)}″ ${inputs.offcutSide ? `(offcut ${inputs.offcutSide})` : ''}`}</p>
              </div>
            )}
            {notes && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Notes</p>
                <p className="text-slate-600">{notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Deflection Breakdown</CardTitle>
          <CardDescription>Use these values to compare field measurements and forecast long-term behavior.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Initial camber</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(results.initialCamber)} in</p>
            <p className="mt-2 text-xs text-slate-500">Built into the form prior to release.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Net at release</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(results.netInitialCamber)} in</p>
            <p className="mt-2 text-xs text-slate-500">After self-weight deflection immediately upon detensioning.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Service camber</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(results.finalCamber)} in</p>
            <p className="mt-2 text-xs text-slate-500">After long-term creep and shrinkage losses.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

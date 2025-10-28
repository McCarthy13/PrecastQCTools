'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/state/navigationStore';
import { useStrandLibraryStore } from '@/state/strandLibraryStore';
import { calculateTheoreticalElongation, formatValue } from '@/utils/stressing-calculations';
import type { RootStackParamList } from '@/navigation/types';

interface Props {
  params: RootStackParamList['StressingResults'];
}

export function StressingResultsScreen({ params }: Props) {
  const back = useNavigationStore((state) => state.back);
  const reset = useNavigationStore((state) => state.reset);
  const strand = useStrandLibraryStore((state) => state.getStrandById(params.strandId));

  const results = useMemo(() => {
    if (!strand) {
      return null;
    }

    const bedLengthInches = params.bedLength * 12;
    const forcePerStrand = params.jackingForce / params.numberOfStrands;
    const stressPerStrand = forcePerStrand / strand.area;

    const theoreticalElongation = calculateTheoreticalElongation(
      forcePerStrand,
      bedLengthInches,
      strand.area,
      strand.elasticModulus
    );

    const bedShortening = params.bedShortening ?? 0;
    const frictionLossPercent = params.frictionLoss ?? 0;
    const frictionLoss = (frictionLossPercent / 100) * theoreticalElongation;
    const anchorSetLoss = params.anchorSetLoss ?? 0;

    const totalElongation = theoreticalElongation + bedShortening - frictionLoss - anchorSetLoss;

    return {
      theoreticalElongation,
      bedShortening,
      frictionLoss,
      anchorSetLoss,
      totalElongation,
      forcePerStrand,
      stressPerStrand,
    };
  }, [params, strand]);

  if (!strand || !results) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-slate-900">Strand definition not found</p>
        <p className="text-sm text-slate-600">The strand referenced by this calculation is no longer available.</p>
        <div className="flex gap-2">
          <Button onClick={() => back()}>Back</Button>
          <Button variant="outline" onClick={() => reset('Dashboard', undefined)}>Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Elongation Results</h2>
        <p className="text-sm text-slate-500">
          {strand.name} • {params.numberOfStrands} strands • Bed length {params.bedLength.toFixed(2)} ft
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gauge Reading</CardTitle>
          <CardDescription>Expected elongation per strand.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-center">
            <p className="text-xs uppercase tracking-wide text-blue-500">Expected elongation</p>
            <p className="mt-1 text-4xl font-semibold text-blue-700">
              {formatValue(results.totalElongation, 3, '″')}
            </p>
            <p className="mt-2 text-sm text-blue-600">
              Theoretical + bed shortening − friction − anchor set
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Breakdown</CardTitle>
          <CardDescription>Components contributing to the final elongation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Theoretical elongation</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">+{formatValue(results.theoreticalElongation, 3, '″')}</p>
            <p className="text-xs text-slate-500">Elastic elongation before adjustments</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Bed shortening</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">+{formatValue(results.bedShortening, 3, '″')}</p>
            <p className="text-xs text-slate-500">Compression of the bed during stressing</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Friction loss</p>
            <p className="mt-2 text-xl font-semibold text-rose-600">-{formatValue(results.frictionLoss, 3, '″')}</p>
            <p className="text-xs text-slate-500">Bed friction reduction</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Anchor set loss</p>
            <p className="mt-2 text-xl font-semibold text-rose-600">-{formatValue(results.anchorSetLoss, 3, '″')}</p>
            <p className="text-xs text-slate-500">Slip during lock-off</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strand details</CardTitle>
          <CardDescription>Properties used for the calculation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm text-slate-600">
          <Badge variant="outline">Diameter {strand.diameter.toFixed(3)}″</Badge>
          <Badge variant="outline">Area {strand.area.toFixed(3)} in²</Badge>
          <Badge variant="outline">Elastic modulus {strand.elasticModulus.toFixed(0)} ksi</Badge>
          <Badge variant="outline">Breaking strength {strand.breakingStrength.toFixed(1)} kips</Badge>
          {strand.grade && <Badge variant="outline">Grade {strand.grade}</Badge>}
          <Badge variant="outline">Force per strand {results.forcePerStrand.toFixed(2)} kips</Badge>
          <Badge variant="outline">Stress per strand {results.stressPerStrand.toFixed(1)} ksi</Badge>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => back()}>
            Back
          </Button>
          <Button variant="outline" onClick={() => reset('Dashboard', undefined)}>
            Home
          </Button>
        </div>
        <Button onClick={() => reset('StressingCalculator', undefined)}>
          New calculation
        </Button>
      </div>
    </div>
  );
}

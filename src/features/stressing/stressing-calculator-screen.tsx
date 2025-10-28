'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/state/navigationStore';
import { useStrandLibraryStore } from '@/state/strandLibraryStore';

const REQUIRED_FIELDS = {
  jackingForce: 'Total jacking force is required',
  bedLength: 'Bed length is required',
  numberOfStrands: 'Enter number of strands',
  strandId: 'Select a strand from the library',
} as const;

export function StressingCalculatorScreen() {
  const push = useNavigationStore((state) => state.push);
  const reset = useNavigationStore((state) => state.reset);
  const seedDefaultStrands = useStrandLibraryStore((state) => state.seedDefaultStrands);
  const strands = useStrandLibraryStore((state) => state.strands);

  const [jackingForce, setJackingForce] = useState('');
  const [bedLength, setBedLength] = useState('');
  const [selectedStrand, setSelectedStrand] = useState<string>();
  const [numberOfStrands, setNumberOfStrands] = useState('');
  const [bedShortening, setBedShortening] = useState('');
  const [frictionLoss, setFrictionLoss] = useState('');
  const [anchorSetLoss, setAnchorSetLoss] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    seedDefaultStrands();
  }, [seedDefaultStrands]);

  const strandOptions = useMemo(
    () =>
      strands.map((strand) => ({
        value: strand.id,
        label: `${strand.name} (${strand.diameter.toFixed(3)}″ • ${strand.area.toFixed(3)} in²)`,
      })),
    [strands]
  );

  const activeStrandId = selectedStrand ?? strands[0]?.id ?? '';

  const validate = () => {
    const issues: string[] = [];
    if (!jackingForce.trim()) issues.push(REQUIRED_FIELDS.jackingForce);
    if (!bedLength.trim()) issues.push(REQUIRED_FIELDS.bedLength);
    if (!numberOfStrands.trim()) issues.push(REQUIRED_FIELDS.numberOfStrands);
    if (!activeStrandId) issues.push(REQUIRED_FIELDS.strandId);
    setErrors(issues);
    return issues.length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) {
      return;
    }

    push('StressingResults', {
      jackingForce: Number(jackingForce),
      bedLength: Number(bedLength),
      strandId: activeStrandId,
      numberOfStrands: Number(numberOfStrands),
      bedShortening: bedShortening ? Number(bedShortening) : undefined,
      frictionLoss: frictionLoss ? Number(frictionLoss) : undefined,
      anchorSetLoss: anchorSetLoss ? Number(anchorSetLoss) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Stressing Force &amp; Elongation</h2>
        <p className="text-sm text-slate-600">
          Estimate expected elongation measurements for prestressing beds using strand properties from the library.
        </p>
      </div>

      {errors.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent>
            <p className="text-sm font-semibold text-amber-800">Please correct the following:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Required information</CardTitle>
          <CardDescription>Minimum inputs needed for the elongation calculation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Total jacking force (kips)"
            required
            value={jackingForce}
            onChange={(event) => setJackingForce(event.target.value)}
            placeholder="e.g. 120.5"
            inputMode="decimal"
          />
          <Input
            label="Bed length (feet)"
            required
            value={bedLength}
            onChange={(event) => setBedLength(event.target.value)}
            placeholder="e.g. 400"
            inputMode="decimal"
          />
          <Select
            label="Strand type"
            value={activeStrandId}
            onChange={(event) => setSelectedStrand(event.target.value)}
            options={strandOptions}
            hint={strands.length === 0 ? 'Add strands in the Strand Library before calculating.' : undefined}
            disabled={strands.length === 0}
          />
          <Input
            label="Number of strands"
            required
            value={numberOfStrands}
            onChange={(event) => setNumberOfStrands(event.target.value)}
            placeholder="e.g. 7"
            inputMode="numeric"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optional adjustments</CardTitle>
          <CardDescription>Refine elongation estimates with field adjustments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            label="Bed shortening (inches)"
            value={bedShortening}
            onChange={(event) => setBedShortening(event.target.value)}
            placeholder="Elastic bed compression"
            inputMode="decimal"
          />
          <Input
            label="Friction loss (%)"
            value={frictionLoss}
            onChange={(event) => setFrictionLoss(event.target.value)}
            placeholder="0.5 — 2"
            inputMode="decimal"
          />
          <Input
            label="Anchor set loss (inches)"
            value={anchorSetLoss}
            onChange={(event) => setAnchorSetLoss(event.target.value)}
            placeholder="Lock-off slip"
            inputMode="decimal"
          />
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => reset('Dashboard', undefined)}>
            Home
          </Button>
        </div>
        <Button onClick={handleCalculate} disabled={strands.length === 0}>
          Calculate elongation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strand library snapshot</CardTitle>
          <CardDescription>Available strand definitions for quick reference.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {strands.map((strand) => (
            <div
              key={strand.id}
              className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600"
            >
              <p className="text-sm font-semibold text-slate-900">{strand.name}</p>
              <p>{strand.diameter.toFixed(3)}″ • {strand.area.toFixed(3)} in² • {strand.elasticModulus.toFixed(0)} ksi</p>
              <p>Breaking strength: {strand.breakingStrength.toFixed(1)} kips</p>
              {strand.isDefault && <Badge variant="outline">Default</Badge>}
            </div>
          ))}
          {strands.length === 0 && (
            <p className="text-sm text-slate-500">
              No strands available. Add strand definitions in the Strand Library before calculating.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

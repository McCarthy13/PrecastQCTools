'use client';

import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAggregateLibraryStore } from '@/state/aggregateLibraryStore';
import { useNavigationStore } from '@/state/navigationStore';
import type { RootStackParamList } from '@/navigation/types';
import type { AggregateLibraryItem } from '@/types/aggregate-library';

interface Props {
  params: RootStackParamList['AggregateLibraryAddEdit'];
}

type FormState = {
  name: string;
  type: 'Fine' | 'Coarse';
  finenessModulus: string;
  dryRoddedUnitWeight: string;
  percentVoids: string;
  absorption: string;
  moistureContent: string;
  maxSize: string;
  specificGravityBulkSSD: string;
  specificGravityBulkDry: string;
  specificGravityApparent: string;
  colorFamily: AggregateLibraryItem['colorFamily'];
  source: string;
  stockpileNumber: string;
  laAbrasion: string;
  soundness: string;
  deleteriousMaterials: string;
  organicImpurities: string;
  clayLumps: string;
  asrReactivity: AggregateLibraryItem['asrReactivity'];
  chlorideContent: string;
  sulfateContent: string;
  costPerTon: string;
  costPerYard: string;
  lastTestDate: string;
  certifications: string;
  notes: string;
};

const emptyForm: FormState = {
  name: '',
  type: 'Fine',
  finenessModulus: '',
  dryRoddedUnitWeight: '',
  percentVoids: '',
  absorption: '',
  moistureContent: '',
  maxSize: '',
  specificGravityBulkSSD: '',
  specificGravityBulkDry: '',
  specificGravityApparent: '',
  colorFamily: null,
  source: '',
  stockpileNumber: '',
  laAbrasion: '',
  soundness: '',
  deleteriousMaterials: '',
  organicImpurities: '',
  clayLumps: '',
  asrReactivity: null,
  chlorideContent: '',
  sulfateContent: '',
  costPerTon: '',
  costPerYard: '',
  lastTestDate: '',
  certifications: '',
  notes: '',
};

const numberOrUndefined = (value: string) => {
  const parsed = Number(value);
  return value.trim() === '' || Number.isNaN(parsed) ? undefined : parsed;
};

const requiresNumericValue = (label: string, value: string, issues: string[]) => {
  if (!value.trim()) {
    return;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    issues.push(`${label} must be a valid number.`);
  }
};

const colorOptions: Array<NonNullable<AggregateLibraryItem['colorFamily']>> = [
  'Brown',
  'Red',
  'Black',
  'Grey',
  'White',
  'Mixed',
];

const asrOptions: Array<NonNullable<AggregateLibraryItem['asrReactivity']>> = [
  'Low',
  'Moderate',
  'High',
  'Not Tested',
];

export function AggregateLibraryAddEditScreen({ params }: Props) {
  const { back, reset } = useNavigationStore(
    useShallow((state) => ({
      back: state.back,
      reset: state.reset,
    }))
  );

  const {
    aggregate,
    addAggregate,
    updateAggregate,
  } = useAggregateLibraryStore(
    useShallow((state) => ({
      aggregate: params.aggregateId ? state.getAggregate(params.aggregateId) : undefined,
      addAggregate: state.addAggregate,
      updateAggregate: state.updateAggregate,
    }))
  );

  const [form, setForm] = useState<FormState>(() => {
    if (!aggregate) {
      return emptyForm;
    }
    return {
      name: aggregate.name ?? '',
      type: aggregate.type,
      finenessModulus: aggregate.finenessModulus?.toString() ?? '',
      dryRoddedUnitWeight: aggregate.dryRoddedUnitWeight?.toString() ?? '',
      percentVoids: aggregate.percentVoids?.toString() ?? '',
      absorption: aggregate.absorption?.toString() ?? '',
      moistureContent: aggregate.moistureContent?.toString() ?? '',
      maxSize: aggregate.maxSize?.toString() ?? '',
      specificGravityBulkSSD: aggregate.specificGravityBulkSSD?.toString() ?? '',
      specificGravityBulkDry: aggregate.specificGravityBulkDry?.toString() ?? '',
      specificGravityApparent: aggregate.specificGravityApparent?.toString() ?? '',
      colorFamily: aggregate.colorFamily ?? null,
      source: aggregate.source ?? '',
      stockpileNumber: aggregate.stockpileNumber ?? '',
      laAbrasion: aggregate.laAbrasion?.toString() ?? '',
      soundness: aggregate.soundness?.toString() ?? '',
      deleteriousMaterials: aggregate.deleteriousMaterials?.toString() ?? '',
      organicImpurities: aggregate.organicImpurities ?? '',
      clayLumps: aggregate.clayLumps?.toString() ?? '',
      asrReactivity: aggregate.asrReactivity ?? null,
      chlorideContent: aggregate.chlorideContent?.toString() ?? '',
      sulfateContent: aggregate.sulfateContent?.toString() ?? '',
      costPerTon: aggregate.costPerTon?.toString() ?? '',
      costPerYard: aggregate.costPerYard?.toString() ?? '',
      lastTestDate: aggregate.lastTestDate ?? '',
      certifications: aggregate.certifications ?? '',
      notes: aggregate.notes ?? '',
    };
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const issues: string[] = [];
    if (!form.name.trim()) {
      issues.push('Name is required.');
    }
    if (!form.dryRoddedUnitWeight.trim()) {
      issues.push('Dry rodded unit weight is required.');
    }
    requiresNumericValue('Dry rodded unit weight', form.dryRoddedUnitWeight, issues);
    if (!form.percentVoids.trim()) {
      issues.push('Percent voids is required.');
    }
    requiresNumericValue('Percent voids', form.percentVoids, issues);
    if (!form.absorption.trim()) {
      issues.push('Absorption is required.');
    }
    requiresNumericValue('Absorption', form.absorption, issues);
    if (!form.specificGravityBulkSSD.trim()) {
      issues.push('Specific gravity bulk SSD is required.');
    }
    requiresNumericValue('Specific gravity bulk SSD', form.specificGravityBulkSSD, issues);
    if (!form.specificGravityBulkDry.trim()) {
      issues.push('Specific gravity bulk dry is required.');
    }
    requiresNumericValue('Specific gravity bulk dry', form.specificGravityBulkDry, issues);
    if (!form.specificGravityApparent.trim()) {
      issues.push('Specific gravity apparent is required.');
    }
    requiresNumericValue('Specific gravity apparent', form.specificGravityApparent, issues);
    if (form.type === 'Fine' && !form.finenessModulus.trim()) {
      issues.push('Fineness modulus is required for fine aggregates.');
    }
    if (form.type === 'Fine') {
      requiresNumericValue('Fineness modulus', form.finenessModulus, issues);
    }
    return issues;
  };

  const handleSubmit = () => {
    const validation = validate();
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    setErrors([]);

    const payload: AggregateLibraryItem = {
      id: aggregate?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      type: form.type,
      finenessModulus: form.type === 'Fine' ? numberOrUndefined(form.finenessModulus) : undefined,
      dryRoddedUnitWeight: numberOrUndefined(form.dryRoddedUnitWeight),
      percentVoids: numberOrUndefined(form.percentVoids),
      absorption: numberOrUndefined(form.absorption),
      moistureContent: numberOrUndefined(form.moistureContent),
      maxSize: numberOrUndefined(form.maxSize),
      specificGravityBulkSSD: numberOrUndefined(form.specificGravityBulkSSD),
      specificGravityBulkDry: numberOrUndefined(form.specificGravityBulkDry),
      specificGravityApparent: numberOrUndefined(form.specificGravityApparent),
      colorFamily: form.colorFamily ?? null,
      source: form.source.trim() || undefined,
      stockpileNumber: form.stockpileNumber.trim() || undefined,
      laAbrasion: numberOrUndefined(form.laAbrasion),
      soundness: numberOrUndefined(form.soundness),
      deleteriousMaterials: numberOrUndefined(form.deleteriousMaterials),
      organicImpurities: form.organicImpurities.trim() || undefined,
      clayLumps: numberOrUndefined(form.clayLumps),
      asrReactivity: form.asrReactivity ?? null,
      chlorideContent: numberOrUndefined(form.chlorideContent),
      sulfateContent: numberOrUndefined(form.sulfateContent),
      costPerTon: numberOrUndefined(form.costPerTon),
      costPerYard: numberOrUndefined(form.costPerYard),
      lastTestDate: form.lastTestDate || undefined,
      certifications: form.certifications.trim() || undefined,
      notes: form.notes.trim() || undefined,
      isFavorite: aggregate?.isFavorite ?? false,
      lastAccessedAt: aggregate?.lastAccessedAt,
      photoUris: aggregate?.photoUris ?? [],
      createdAt: aggregate?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    if (aggregate) {
      updateAggregate(aggregate.id, payload);
    } else {
      addAggregate(payload);
    }

    reset('AggregateLibrary', undefined);
  };

  const title = aggregate ? 'Edit Aggregate' : 'Add Aggregate';
  const description = aggregate
    ? 'Update stored properties and testing history for this material.'
    : 'Capture physical properties, supplier info, and QC notes for a new material.';

  const typeButtons = useMemo(
    () => (
      <div className="flex gap-2">
        <Button
          type="button"
          variant={form.type === 'Fine' ? 'secondary' : 'outline'}
          onClick={() => handleChange('type', 'Fine')}
        >
          Fine
        </Button>
        <Button
          type="button"
          variant={form.type === 'Coarse' ? 'secondary' : 'outline'}
          onClick={() => handleChange('type', 'Coarse')}
        >
          Coarse
        </Button>
      </div>
    ),
    [form.type]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      {errors.length > 0 && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-700">
            <p className="font-semibold">Please resolve the following:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>General information</CardTitle>
          <CardDescription>Name, type, and sourcing details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Aggregate name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g. Concrete Sand"
          />
          <div>{typeButtons}</div>
          <Input
            label="Source / supplier"
            value={form.source}
            onChange={(event) => handleChange('source', event.target.value)}
            placeholder="Quarry or supplier name"
          />
          <Input
            label="Stockpile number"
            value={form.stockpileNumber}
            onChange={(event) => handleChange('stockpileNumber', event.target.value)}
            placeholder="Optional"
          />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Color family</p>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant={form.colorFamily === color ? 'secondary' : 'outline'}
                  onClick={() => handleChange('colorFamily', form.colorFamily === color ? null : color)}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>
          <Input
            label="Last test date"
            type="date"
            value={form.lastTestDate}
            onChange={(event) => handleChange('lastTestDate', event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical properties</CardTitle>
          <CardDescription>Values used in mix design calculations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {form.type === 'Fine' && (
            <Input
              label="Fineness modulus"
              value={form.finenessModulus}
              onChange={(event) => handleChange('finenessModulus', event.target.value)}
              inputMode="decimal"
            />
          )}
          <Input
            label="Dry rodded unit weight (lb/ft³)"
            value={form.dryRoddedUnitWeight}
            onChange={(event) => handleChange('dryRoddedUnitWeight', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Percent voids (%)"
            value={form.percentVoids}
            onChange={(event) => handleChange('percentVoids', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Absorption (%)"
            value={form.absorption}
            onChange={(event) => handleChange('absorption', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Moisture content (%)"
            value={form.moistureContent}
            onChange={(event) => handleChange('moistureContent', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Maximum size (in)"
            value={form.maxSize}
            onChange={(event) => handleChange('maxSize', event.target.value)}
            inputMode="decimal"
            placeholder="Optional"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specific gravity</CardTitle>
          <CardDescription>Required for mix design calculations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            label="Bulk SSD"
            value={form.specificGravityBulkSSD}
            onChange={(event) => handleChange('specificGravityBulkSSD', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Bulk dry"
            value={form.specificGravityBulkDry}
            onChange={(event) => handleChange('specificGravityBulkDry', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Apparent"
            value={form.specificGravityApparent}
            onChange={(event) => handleChange('specificGravityApparent', event.target.value)}
            inputMode="decimal"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance & chemical</CardTitle>
          <CardDescription>Optional testing data for QC teams.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            label="LA abrasion (%)"
            value={form.laAbrasion}
            onChange={(event) => handleChange('laAbrasion', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Soundness (%)"
            value={form.soundness}
            onChange={(event) => handleChange('soundness', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Deleterious materials (%)"
            value={form.deleteriousMaterials}
            onChange={(event) => handleChange('deleteriousMaterials', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Organic impurities"
            value={form.organicImpurities}
            onChange={(event) => handleChange('organicImpurities', event.target.value)}
            placeholder="Pass / Fail or description"
          />
          <Input
            label="Clay lumps (%)"
            value={form.clayLumps}
            onChange={(event) => handleChange('clayLumps', event.target.value)}
            inputMode="decimal"
          />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">ASR reactivity</p>
            <div className="flex flex-wrap gap-2">
              {asrOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={form.asrReactivity === option ? 'secondary' : 'outline'}
                  onClick={() =>
                    handleChange('asrReactivity', form.asrReactivity === option ? null : option)
                  }
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          <Input
            label="Chloride content (%)"
            value={form.chlorideContent}
            onChange={(event) => handleChange('chlorideContent', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Sulfate content (%)"
            value={form.sulfateContent}
            onChange={(event) => handleChange('sulfateContent', event.target.value)}
            inputMode="decimal"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Costing & notes</CardTitle>
          <CardDescription>Optional production costing and certification info.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Cost per ton (USD)"
            value={form.costPerTon}
            onChange={(event) => handleChange('costPerTon', event.target.value)}
            inputMode="decimal"
          />
          <Input
            label="Cost per yard (USD)"
            value={form.costPerYard}
            onChange={(event) => handleChange('costPerYard', event.target.value)}
            inputMode="decimal"
          />
          <Textarea
            label="Certifications"
            value={form.certifications}
            onChange={(event) => handleChange('certifications', event.target.value)}
            placeholder="e.g. ASTM C33, AASHTO M6"
            rows={2}
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            placeholder="QC notes, mix design considerations, delivery info..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => back()}>
            Back
          </Button>
          <Button type="button" variant="outline" onClick={() => reset('AggregateLibrary', undefined)}>
            Cancel
          </Button>
        </div>
        <Button type="button" onClick={handleSubmit}>
          {aggregate ? 'Save changes' : 'Create aggregate'}
        </Button>
      </div>
    </div>
  );
}

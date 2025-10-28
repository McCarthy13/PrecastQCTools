'use client';

import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  IoArrowBackOutline,
  IoCopyOutline,
  IoHeartOutline,
  IoHeartSharp,
  IoHomeOutline,
  IoPencilOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/state/navigationStore';
import { useAggregateLibraryStore } from '@/state/aggregateLibraryStore';
import type { RootStackParamList } from '@/navigation/types';

interface Props {
  params: RootStackParamList['AggregateLibraryDetail'];
}

const numberValue = (value?: number, digits = 2) =>
  value === undefined || Number.isNaN(value) ? '—' : Number(value).toFixed(digits);

const Section = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
  </Card>
);

const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value ?? '—'}</p>
  </div>
);

export function AggregateLibraryDetailScreen({ params }: Props) {
  const { back, reset, push } = useNavigationStore(
    useShallow((state) => ({
      back: state.back,
      reset: state.reset,
      push: state.push,
    }))
  );

  const {
    aggregate,
    toggleFavorite,
    deleteAggregate,
    duplicateAggregate,
    isAggregateComplete,
    trackAccess,
  } = useAggregateLibraryStore(
    useShallow((state) => ({
      aggregate: state.getAggregate(params.aggregateId),
      toggleFavorite: state.toggleFavorite,
      deleteAggregate: state.deleteAggregate,
      duplicateAggregate: state.duplicateAggregate,
      isAggregateComplete: state.isAggregateComplete,
      trackAccess: state.trackAccess,
    }))
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (params.aggregateId) {
      trackAccess(params.aggregateId);
    }
  }, [params.aggregateId, trackAccess]);

  const completenessBadge = useMemo(() => {
    if (!aggregate) return null;
    const complete = isAggregateComplete(aggregate.id);
    return (
      <Badge variant={complete ? 'success' : 'warning'}>
        {complete ? 'Complete data set' : 'Missing required fields'}
      </Badge>
    );
  }, [aggregate, isAggregateComplete]);

  if (!aggregate) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-slate-900">Aggregate not found</p>
        <div className="flex gap-2">
          <Button onClick={() => back()}>
            <IoArrowBackOutline className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => reset('AggregateLibrary', undefined)}>
            Library home
          </Button>
        </div>
      </div>
    );
  }

  const handleDuplicate = () => {
    const copy = duplicateAggregate(aggregate.id);
    if (copy) {
      push('AggregateLibraryAddEdit', { aggregateId: copy.id });
    }
  };

  const handleDelete = () => {
    deleteAggregate(aggregate.id);
    reset('AggregateLibrary', undefined);
  };

  const photoCount = aggregate.photoUris?.length ?? 0;

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  const optionalNotes = aggregate.notes?.trim() ? aggregate.notes : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">{aggregate.name}</h2>
            <Badge variant="outline">{aggregate.type} aggregate</Badge>
            {aggregate.stockpileNumber && (
              <Badge variant="outline">Stockpile {aggregate.stockpileNumber}</Badge>
            )}
            {completenessBadge}
          </div>
          <p className="text-sm text-slate-600">
            {aggregate.source ? `Supplied by ${aggregate.source}.` : 'No supplier assigned yet.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => back()} className="flex items-center gap-2">
            <IoArrowBackOutline className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => reset('AggregateLibrary', undefined)}
            className="flex items-center gap-2"
          >
            <IoHomeOutline className="h-4 w-4" />
            Library
          </Button>
          <Button
            variant="outline"
            onClick={() => toggleFavorite(aggregate.id)}
            className="flex items-center gap-2"
          >
            {aggregate.isFavorite ? (
              <IoHeartSharp className="h-4 w-4 text-rose-500" />
            ) : (
              <IoHeartOutline className="h-4 w-4" />
            )}
            Favorite
          </Button>
          <Button
            variant="outline"
            onClick={handleDuplicate}
            className="flex items-center gap-2"
          >
            <IoCopyOutline className="h-4 w-4" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            onClick={() => push('AggregateLibraryAddEdit', { aggregateId: aggregate.id })}
            className="flex items-center gap-2"
          >
            <IoPencilOutline className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700"
            onClick={() => setConfirmDelete(true)}
          >
            <IoTrashOutline className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Section title="Key properties" description="Physical characteristics and performance thresholds.">
        <Field label="Fineness modulus" value={aggregate.type === 'Fine' ? numberValue(aggregate.finenessModulus) : 'N/A'} />
        <Field label="Dry rodded unit weight (lb/ft³)" value={numberValue(aggregate.dryRoddedUnitWeight)} />
        <Field label="Percent voids (%)" value={numberValue(aggregate.percentVoids)} />
        <Field label="Absorption (%)" value={numberValue(aggregate.absorption)} />
        <Field label="Moisture content (%)" value={numberValue(aggregate.moistureContent)} />
        <Field label="Maximum size (in)" value={numberValue(aggregate.maxSize)} />
      </Section>

      <Section title="Specific gravity" description="Bulk density values used for mix designs.">
        <Field label="Bulk SSD" value={numberValue(aggregate.specificGravityBulkSSD)} />
        <Field label="Bulk dry" value={numberValue(aggregate.specificGravityBulkDry)} />
        <Field label="Apparent" value={numberValue(aggregate.specificGravityApparent)} />
      </Section>

      <Section title="Performance & chemical" description="Abrasion, soundness, and chemical testing.">
        <Field label="LA abrasion (%)" value={numberValue(aggregate.laAbrasion)} />
        <Field label="Soundness (%)" value={numberValue(aggregate.soundness)} />
        <Field label="Deleterious materials (%)" value={numberValue(aggregate.deleteriousMaterials)} />
        <Field label="Organic impurities" value={aggregate.organicImpurities ?? '—'} />
        <Field label="Clay lumps (%)" value={numberValue(aggregate.clayLumps)} />
        <Field label="ASR reactivity" value={aggregate.asrReactivity ?? '—'} />
        <Field label="Chloride content (%)" value={numberValue(aggregate.chlorideContent)} />
        <Field label="Sulfate content (%)" value={numberValue(aggregate.sulfateContent)} />
      </Section>

      <Section title="Production & costing" description="Financial details and certification notes.">
        <Field label="Cost per ton" value={aggregate.costPerTon ? `$${numberValue(aggregate.costPerTon)}` : '—'} />
        <Field label="Cost per yard" value={aggregate.costPerYard ? `$${numberValue(aggregate.costPerYard)}` : '—'} />
        <Field label="Last test date" value={formatDate(aggregate.lastTestDate)} />
        <Field label="Certifications" value={aggregate.certifications ?? '—'} />
        <Field label="Color family" value={aggregate.colorFamily ?? '—'} />
        <Field label="Photos stored" value={photoCount ? `${photoCount} file${photoCount === 1 ? '' : 's'}` : '—'} />
      </Section>

      {optionalNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Internal remarks shared with QC and production.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{optionalNotes}</p>
          </CardContent>
        </Card>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete aggregate?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will remove {aggregate.name} and cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

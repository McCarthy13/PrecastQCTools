'use client';

import { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCalculatorStore } from '@/state/calculatorStore';
import { useStrandPatternStore } from '@/state/strandPatternStore';
import { useNavigationStore } from '@/state/navigationStore';
import {
  calculateCamber,
  CamberInputs,
  validateInputs,
} from '@/utils/camber-calculations';
import { parseMeasurementInput } from '@/utils/cn';
import { FRACTIONS, FractionOption, splitSpanToParts, combineSpanParts } from './utils';

const MEMBER_TYPES: Array<{ label: string; value: CamberInputs['memberType'] }> = [
  { value: 'beam', label: 'Beam' },
  { value: 'double-tee', label: 'Double Tee' },
  { value: 'hollow-core', label: 'Hollow Core' },
  { value: 'single-tee', label: 'Single Tee' },
  { value: 'solid-slab', label: 'Solid Slab' },
  { value: 'wall-panel', label: 'Wall Panel' },
  { value: 'stadia', label: 'Stadia' },
];

interface PatternListProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function PatternPicker({ selectedId, onSelect, onClose }: PatternListProps) {
  const patterns = useStrandPatternStore((state) => state.customPatterns);
  const ensurePatterns = useStrandPatternStore((state) => state.ensurePatterns);

  useEffect(() => {
    ensurePatterns().catch(() => {
      /* noop - errors handled globally */
    });
  }, [ensurePatterns]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Select Strand Pattern</h2>
            <p className="text-sm text-slate-500">Pick a saved pattern to reuse strand layout details.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {patterns.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600">
              <p>No strand patterns saved yet.</p>
              <p>Use the Strand Patterns module to create custom layouts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((pattern) => {
                const isSelected = pattern.id === selectedId;
                return (
                  <button
                    type="button"
                    key={pattern.id}
                    onClick={() => {
                      onSelect(pattern.id);
                      onClose();
                    }}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                      isSelected
                        ? 'border-violet-300 bg-violet-50 shadow-sm'
                        : 'border-slate-200 hover:border-violet-200 hover:bg-violet-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          Pattern {pattern.patternId}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Strands: 3/8″ {pattern.strand_3_8} • 1/2″ {pattern.strand_1_2} • 0.6″ {pattern.strand_0_6}</span>
                          {pattern.pullingForcePercent !== undefined && (
                            <span>Pulling force: {pattern.pullingForcePercent}%</span>
                          )}
                          {pattern.totalArea !== undefined && (
                            <span>Total area: {pattern.totalArea.toFixed(3)} in²</span>
                          )}
                          {pattern.strandCoordinates && pattern.strandCoordinates.length > 0 && (
                            <span>Coordinates: {pattern.strandCoordinates.length}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={isSelected ? 'success' : 'outline'}>
                        {pattern.position}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CamberCalculatorScreen() {
  const { currentInputs, addCalculation, updateCurrentInputs, resetCurrentInputs } =
    useCalculatorStore(
      useShallow((state) => ({
        currentInputs: state.currentInputs,
        addCalculation: state.addCalculation,
        updateCurrentInputs: state.updateCurrentInputs,
        resetCurrentInputs: state.resetCurrentInputs,
      }))
    );
  const customPatterns = useStrandPatternStore((state) => state.customPatterns);
  const { push, reset } = useNavigationStore(
    useShallow((state) => ({
      push: state.push,
      reset: state.reset,
    }))
  );

  const defaultSpanParts = splitSpanToParts(currentInputs.span);

  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [markNumber, setMarkNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const [memberType, setMemberType] = useState<CamberInputs['memberType']>(
    currentInputs.memberType ?? 'hollow-core'
  );

  const [spanFeet, setSpanFeet] = useState(defaultSpanParts.feet);
  const [spanInches, setSpanInches] = useState(defaultSpanParts.inches);
  const [spanFraction, setSpanFraction] = useState<FractionOption>(defaultSpanParts.fraction);

  const [releaseStrength, setReleaseStrength] = useState(
    currentInputs.releaseStrength?.toString() ?? '3500'
  );
  const [concreteStrength, setConcreteStrength] = useState(
    currentInputs.concreteStrength?.toString() ?? '9000'
  );
  const [liveLoad, setLiveLoad] = useState(currentInputs.liveLoad?.toString() ?? '');

  const [momentOfInertia, setMomentOfInertia] = useState(
    currentInputs.momentOfInertia ? currentInputs.momentOfInertia.toString() : ''
  );
  const [deadLoad, setDeadLoad] = useState(
    currentInputs.deadLoad ? currentInputs.deadLoad.toString() : ''
  );

  const [productWidth, setProductWidth] = useState('');
  const [offcutSide, setOffcutSide] = useState<'L1' | 'L2' | ''>('');

  const [strandPatternId, setStrandPatternId] = useState('');
  const [topStrandPatternId, setTopStrandPatternId] = useState('');
  const [showPatternModal, setShowPatternModal] = useState<'bottom' | 'top' | null>(null);

  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const selectedPattern = useMemo(
    () => customPatterns.find((pattern) => pattern.id === strandPatternId),
    [customPatterns, strandPatternId]
  );

  const selectedTopPattern = useMemo(
    () => customPatterns.find((pattern) => pattern.id === topStrandPatternId),
    [customPatterns, topStrandPatternId]
  );

  const spanValue = combineSpanParts(spanFeet, spanInches, spanFraction);

  const parsedProductWidth = productWidth.trim() ? parseMeasurementInput(productWidth) : null;
  const patternFullWidth = selectedPattern?.strandCoordinates?.length
    ? Math.max(...selectedPattern.strandCoordinates.map((coord) => coord.x))
    : undefined;

  const isCutWidth = Boolean(
    parsedProductWidth &&
    patternFullWidth &&
    Math.abs(parsedProductWidth - patternFullWidth) > 0.01 &&
    parsedProductWidth < patternFullWidth
  );

  const handlePatternSelect = (id: string) => {
    setStrandPatternId(id);
  };

  const handleSubmit = () => {
    const moment = Number(momentOfInertia);
    const dead = Number(deadLoad);

    const inputs: Partial<CamberInputs> = {
      span: spanValue,
      memberType,
      releaseStrength: Number(releaseStrength),
      concreteStrength: Number(concreteStrength),
      momentOfInertia: moment,
      deadLoad: dead,
      liveLoad: liveLoad ? Number(liveLoad) : undefined,
      strandPattern: strandPatternId || undefined,
      topStrandPattern: topStrandPatternId || undefined,
      productWidth: parsedProductWidth ?? undefined,
      offcutSide: isCutWidth ? offcutSide || undefined : undefined,
      projectNumber: projectNumber || undefined,
      markNumber: markNumber || undefined,
      idNumber: idNumber || undefined,
    };

    const validationErrors = validateInputs(inputs);
    if (isCutWidth && !offcutSide) {
      validationErrors.push('Select which side was removed for cut-width products.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    updateCurrentInputs({
      span: inputs.span,
      memberType: inputs.memberType,
      releaseStrength: inputs.releaseStrength,
      concreteStrength: inputs.concreteStrength,
      momentOfInertia: inputs.momentOfInertia,
      deadLoad: inputs.deadLoad,
      liveLoad: inputs.liveLoad,
      productWidth: inputs.productWidth,
      offcutSide: inputs.offcutSide,
      strandPattern: inputs.strandPattern,
      topStrandPattern: inputs.topStrandPattern,
    });

    const camberInputs = inputs as CamberInputs;
    const results = calculateCamber(camberInputs);

    const calculationId = uuid();

    const timestamp = new Date().getTime();

    addCalculation({
      id: calculationId,
      timestamp,
      inputs: camberInputs,
      results,
      projectName: projectName || undefined,
      notes: notes || undefined,
      actualMeasuredCamber: undefined,
      variance: undefined,
      measurementDate: undefined,
    });

    push('Results', { calculationId });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Camber Calculator</h2>
          <p className="text-sm text-slate-600">
            Calculate recommended prestress camber using PCI design handbook assumptions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => push('History', undefined)}>
            View History
          </Button>
          <Button variant="secondary" onClick={() => reset('StrandPatterns', undefined)}>
            Manage Strand Patterns
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Please correct the following:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Context</CardTitle>
              <CardDescription>Optional identifiers carried into history and reports.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input label="Project name" value={projectName} onChange={(event) => setProjectName(event.target.value)} />
              <Input label="Project #" value={projectNumber} onChange={(event) => setProjectNumber(event.target.value)} />
              <Input label="Mark #" value={markNumber} onChange={(event) => setMarkNumber(event.target.value)} />
              <Input label="ID #" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} />
              <Textarea
                className="md:col-span-2"
                label="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geometry & Mix</CardTitle>
              <CardDescription>Span, section properties, and design strengths.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Select
                label="Member type"
                value={memberType}
                onChange={(event) => setMemberType(event.target.value as CamberInputs['memberType'])}
                options={MEMBER_TYPES}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Span (ft)"
                  value={spanFeet}
                  onChange={(event) => setSpanFeet(event.target.value)}
                  placeholder="40"
                  inputMode="decimal"
                />
                <Input
                  label="Span (in)"
                  value={spanInches}
                  onChange={(event) => setSpanInches(event.target.value)}
                  placeholder="0"
                  inputMode="decimal"
                />
                <Select
                  label="Fraction"
                  value={spanFraction}
                  onChange={(event) => setSpanFraction(event.target.value as FractionOption)}
                  options={FRACTIONS.map((fraction) => ({ label: fraction === '0' ? '0' : fraction, value: fraction }))}
                />
              </div>
              <Input
                label="Release strength f'ci (psi)"
                value={releaseStrength}
                onChange={(event) => setReleaseStrength(event.target.value)}
                inputMode="decimal"
              />
              <Input
                label="28-day strength f'c (psi)"
                value={concreteStrength}
                onChange={(event) => setConcreteStrength(event.target.value)}
                inputMode="decimal"
              />
              <Input
                label="Moment of inertia (in⁴)"
                value={momentOfInertia}
                onChange={(event) => setMomentOfInertia(event.target.value)}
                inputMode="decimal"
                placeholder="e.g. 12000"
              />
              <Input
                label="Dead load (lb/ft)"
                value={deadLoad}
                onChange={(event) => setDeadLoad(event.target.value)}
                inputMode="decimal"
                placeholder="e.g. 450"
              />
              <Input
                label="Live load (lb/ft)"
                value={liveLoad}
                onChange={(event) => setLiveLoad(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strand Patterns</CardTitle>
              <CardDescription>Select saved patterns for bottom and optional top strands.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => setShowPatternModal('bottom')}
              >
                {selectedPattern ? (
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-900">
                      Pattern {selectedPattern.patternId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Strands 3/8″ {selectedPattern.strand_3_8} • 1/2″ {selectedPattern.strand_1_2} • 0.6″ {selectedPattern.strand_0_6}
                    </span>
                    {selectedPattern.pullingForcePercent !== undefined && (
                      <span className="text-xs text-slate-500">
                        Pulling force {selectedPattern.pullingForcePercent}% of min break strength
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-600">Select bottom strand pattern</span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => setShowPatternModal('top')}
              >
                {selectedTopPattern ? (
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-900">
                      Pattern {selectedTopPattern.patternId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Position {selectedTopPattern.position}
                    </span>
                    {selectedTopPattern.pullingForcePercent !== undefined && (
                      <span className="text-xs text-slate-500">
                        Pulling force {selectedTopPattern.pullingForcePercent}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-600">Select optional top strands</span>
                )}
              </Button>

              <Input
                className="md:col-span-2"
                label="Product width (inches)"
                value={productWidth}
                onChange={(event) => setProductWidth(event.target.value)}
                placeholder="e.g. 48 or 42 1/2"
              />

              {isCutWidth && (
                <div className="md:col-span-2 space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Cut-width detected</span>
                    <span className="text-xs text-amber-600">
                      {`${parsedProductWidth?.toFixed(2) ?? ''}″ vs full width ${patternFullWidth?.toFixed(2) ?? ''}″`}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={offcutSide === 'L1' ? 'primary' : 'outline'}
                      onClick={() => setOffcutSide('L1')}
                    >
                      L1 (Left removed)
                    </Button>
                    <Button
                      variant={offcutSide === 'L2' ? 'primary' : 'outline'}
                      onClick={() => setOffcutSide('L2')}
                    >
                      L2 (Right removed)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Review key inputs before running the calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Span:</span> {spanValue.toFixed(3)} ft</p>
              <p><span className="font-semibold text-slate-900">Release strength:</span> {releaseStrength || '—'} psi</p>
              <p><span className="font-semibold text-slate-900">28-day strength:</span> {concreteStrength || '—'} psi</p>
              <p><span className="font-semibold text-slate-900">Moment of inertia:</span> {momentOfInertia || '—'} in⁴</p>
              <p><span className="font-semibold text-slate-900">Dead load:</span> {deadLoad || '—'} lb/ft</p>
              <p><span className="font-semibold text-slate-900">Live load:</span> {liveLoad || '—'} lb/ft</p>
            </div>
            <Button onClick={handleSubmit} size="lg" className="w-full">
              Calculate Camber
            </Button>
            <Button
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-700"
              onClick={() => {
                setProjectName('');
                setProjectNumber('');
                setMarkNumber('');
                setIdNumber('');
                setNotes('');
                setSpanFeet('');
                setSpanInches('');
                setSpanFraction('0');
                setReleaseStrength('3500');
                setConcreteStrength('9000');
                setLiveLoad('');
                setMomentOfInertia('');
                setDeadLoad('');
                setProductWidth('');
                setOffcutSide('');
                setStrandPatternId('');
                setTopStrandPatternId('');
                resetCurrentInputs();
              }}
            >
              Clear form
            </Button>
          </CardContent>
        </Card>
      </div>

      {showPatternModal && (
        <PatternPicker
          selectedId={showPatternModal === 'bottom' ? strandPatternId : topStrandPatternId}
          onSelect={(id) => {
            if (showPatternModal === 'bottom') {
              handlePatternSelect(id);
            } else {
              setTopStrandPatternId(id);
            }
          }}
          onClose={() => setShowPatternModal(null)}
        />
      )}
    </div>
  );
}

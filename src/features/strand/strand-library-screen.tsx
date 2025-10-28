'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/state/navigationStore';
import { StrandDefinition, useStrandLibraryStore } from '@/state/strandLibraryStore';

interface StrandFormState {
  name: string;
  diameter: string;
  area: string;
  elasticModulus: string;
  breakingStrength: string;
  grade: string;
}

const initialForm: StrandFormState = {
  name: '',
  diameter: '',
  area: '',
  elasticModulus: '28500',
  breakingStrength: '',
  grade: '270',
};

export function StrandLibraryScreen() {
  const push = useNavigationStore((state) => state.push);
  const back = useNavigationStore((state) => state.back);
  const reset = useNavigationStore((state) => state.reset);

  const strands = useStrandLibraryStore((state) => state.strands);
  const addStrand = useStrandLibraryStore((state) => state.addStrand);
  const updateStrand = useStrandLibraryStore((state) => state.updateStrand);
  const removeStrand = useStrandLibraryStore((state) => state.removeStrand);
  const seedDefaultStrands = useStrandLibraryStore((state) => state.seedDefaultStrands);

  useEffect(() => {
    seedDefaultStrands();
  }, [seedDefaultStrands]);

  const [form, setForm] = useState<StrandFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const defaultStrands = strands.filter((strand) => strand.isDefault);
  const customStrands = strands.filter((strand) => !strand.isDefault);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setErrors([]);
  };

  const startEditing = (strand: StrandDefinition) => {
    setEditingId(strand.id);
    setForm({
      name: strand.name,
      diameter: String(strand.diameter),
      area: String(strand.area),
      elasticModulus: String(strand.elasticModulus),
      breakingStrength: String(strand.breakingStrength),
      grade: strand.grade ?? '',
    });
  };

  const validate = () => {
    const issues: string[] = [];
    if (!form.name.trim()) issues.push('Name is required.');
    if (!form.diameter.trim()) issues.push('Diameter is required.');
    if (!form.area.trim()) issues.push('Area is required.');
    if (!form.elasticModulus.trim()) issues.push('Elastic modulus is required.');
    if (!form.breakingStrength.trim()) issues.push('Breaking strength is required.');
    setErrors(issues);
    return issues.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const data = {
      name: form.name.trim(),
      diameter: Number(form.diameter),
      area: Number(form.area),
      elasticModulus: Number(form.elasticModulus),
      breakingStrength: Number(form.breakingStrength),
      grade: form.grade.trim() || undefined,
      isDefault: false,
    };

    if (editingId) {
      updateStrand(editingId, data);
    } else {
      addStrand(data);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    const strand = strands.find((item) => item.id === id);
    if (!strand) return;
    if (strand.isDefault) {
      return;
    }
    if (window.confirm(`Delete ${strand.name}?`)) {
      removeStrand(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Strand Library</h2>
        <p className="text-sm text-slate-600">Manage prestressing strand definitions for all calculators.</p>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => back()}>
            Back
          </Button>
          <Button variant="outline" onClick={() => reset('Dashboard', undefined)}>
            Home
          </Button>
        </div>
        <Button onClick={resetForm} variant={editingId ? 'outline' : 'secondary'}>
          {editingId ? 'Cancel edit' : 'New custom strand'}
        </Button>
      </div>

      {(editingId !== null || form !== initialForm) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit strand' : 'Add custom strand'}</CardTitle>
            <CardDescription>Provide strand geometry and mechanical properties.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder='e.g. "1/2 in Grade 270"'
              required
            />
            <Input
              label="Diameter (inches)"
              value={form.diameter}
              onChange={(event) => setForm((prev) => ({ ...prev, diameter: event.target.value }))}
              placeholder="0.500"
              inputMode="decimal"
              required
            />
            <Input
              label="Area (in²)"
              value={form.area}
              onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
              placeholder="0.153"
              inputMode="decimal"
              required
            />
            <Input
              label="Elastic modulus (ksi)"
              value={form.elasticModulus}
              onChange={(event) => setForm((prev) => ({ ...prev, elasticModulus: event.target.value }))}
              placeholder="28500"
              inputMode="decimal"
              required
            />
            <Input
              label="Breaking strength (kips)"
              value={form.breakingStrength}
              onChange={(event) => setForm((prev) => ({ ...prev, breakingStrength: event.target.value }))}
              placeholder="41.3"
              inputMode="decimal"
              required
            />
            <Input
              label="Grade (optional)"
              value={form.grade}
              onChange={(event) => setForm((prev) => ({ ...prev, grade: event.target.value }))}
              placeholder="270"
            />
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleSubmit}>{editingId ? 'Update strand' : 'Add strand'}</Button>
              <Button variant="outline" onClick={resetForm}>
                Clear
              </Button>
            </div>
            {errors.length > 0 && (
              <ul className="md:col-span-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
                {errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Standard strands</CardTitle>
          <CardDescription>Seeded ASTM defaults available to every project.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {defaultStrands.map((strand) => (
            <div key={strand.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold text-slate-900">{strand.name}</p>
                <Badge variant="outline">Default</Badge>
              </div>
              <p>Diameter {strand.diameter.toFixed(3)}″ • Area {strand.area.toFixed(3)} in²</p>
              <p>Elastic modulus {strand.elasticModulus.toLocaleString()} ksi</p>
              <p>Breaking strength {strand.breakingStrength.toFixed(1)} kips</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom strands</CardTitle>
          <CardDescription>Your plant-specific strand definitions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {customStrands.length === 0 && (
            <p className="text-sm text-slate-500">No custom strands yet. Use the form above to add new definitions.</p>
          )}
          {customStrands.map((strand) => (
            <div key={strand.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-900">{strand.name}</p>
                  {strand.grade && <p className="text-xs text-slate-500">Grade {strand.grade}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(strand)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(strand.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p>Diameter {strand.diameter.toFixed(3)}″ • Area {strand.area.toFixed(3)} in²</p>
              <p>Elastic modulus {strand.elasticModulus.toLocaleString()} ksi</p>
              <p>Breaking strength {strand.breakingStrength.toFixed(1)} kips</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => push('StressingCalculator', undefined)}>
          Open stressing calculator
        </Button>
      </div>
    </div>
  );
}

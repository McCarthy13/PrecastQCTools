'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/state/navigationStore';
import { useSlippageHistoryStore, SlippageRecord, PublishedSlippageRecord } from '@/state/slippageHistoryStore';
import { useStrandPatternStore } from '@/state/strandPatternStore';
import { useAuthStore } from '@/state/authStore';
import { decimalToFraction, parseMeasurementInput } from '@/utils/cn';

const GREATER_THAN_LABEL = '\u003e1″';

const EMPTY_MESSAGE = {
  'my-records': {
    title: 'No saved records',
    description: 'Your saved slippage reports will appear here.',
  },
  published: {
    title: 'No published records',
    description: 'Published slippage reports will appear here when available.',
  },
} as const;

export function SlippageHistoryScreen() {
  const push = useNavigationStore((state) => state.push);
  const reset = useNavigationStore((state) => state.reset);
  const back = useNavigationStore((state) => state.back);

  const userRecords = useSlippageHistoryStore((state) => state.userRecords);
  const publishedRecords = useSlippageHistoryStore((state) => state.publishedRecords);
  const removeUserRecord = useSlippageHistoryStore((state) => state.removeUserRecord);
  const removePublishedRecord = useSlippageHistoryStore((state) => state.removePublishedRecord);
  const clearUserRecords = useSlippageHistoryStore((state) => state.clearUserRecords);
  const clearPublishedRecords = useSlippageHistoryStore((state) => state.clearPublishedRecords);

  const customPatterns = useStrandPatternStore((state) => state.customPatterns);
  const ensurePatterns = useStrandPatternStore((state) => state.ensurePatterns);
  const storeError = useStrandPatternStore((state) => state.error);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [activeTab, setActiveTab] = useState<'my-records' | 'published'>('my-records');
  const records = activeTab === 'my-records' ? userRecords : publishedRecords;
  const canManagePublished = currentUser?.role === 'admin';

  useEffect(() => {
    ensurePatterns().catch(() => {
      /* errors handled separately */
    });
  }, [ensurePatterns]);

  useEffect(() => {
    if (storeError) {
      console.error(storeError);
    }
  }, [storeError]);

  const getPatternLabel = (patternId: string) => {
    const pattern = customPatterns.find((item) => item.id === patternId);
    return pattern ? pattern.patternId : patternId;
  };

  const calculateTotal = (record: SlippageRecord | PublishedSlippageRecord) => {
    let total = 0;
    let exceeds = false;
    record.slippages.forEach((strand) => {
      const end1 = parseMeasurementInput(strand.leftSlippage) ?? 0;
      const end2 = parseMeasurementInput(strand.rightSlippage) ?? 0;
      total += end1 + end2;
      if (strand.leftExceedsOne || strand.rightExceedsOne) {
        exceeds = true;
      }
    });
    return { total, exceeds };
  };

  const handleViewRecord = (record: SlippageRecord | PublishedSlippageRecord) => {
    push('SlippageSummary', {
      slippages: record.slippages,
      config: record.config,
    });
  };

  const handleDeleteRecord = (id: string) => {
    if (activeTab === 'my-records') {
      removeUserRecord(id);
    } else if (canManagePublished) {
      removePublishedRecord(id);
    }
  };

  const handleClearAll = () => {
    if (activeTab === 'my-records') {
      clearUserRecords();
    } else if (canManagePublished) {
      clearPublishedRecords();
    }
  };

  const headerTitle = activeTab === 'my-records' ? 'My Records' : 'Published Records';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Slippage History</h2>
          <p className="text-sm text-slate-500">
            {records.length} {records.length === 1 ? 'record' : 'records'} in {headerTitle.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'my-records' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('my-records')}
          >
            My records
          </Button>
          <Button
            variant={activeTab === 'published' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('published')}
          >
            Published
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{EMPTY_MESSAGE[activeTab].title}</CardTitle>
            <CardDescription>{EMPTY_MESSAGE[activeTab].description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => reset('Dashboard', undefined)}>
              Go to dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => {
            const { total, exceeds } = calculateTotal(record);
            const isPublished = 'publishedAt' in record;

            return (
              <Card key={record.id} className="border border-slate-200">
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">
                        {record.config.projectName ?? 'Unnamed project'}
                      </p>
                      {isPublished && <Badge variant="info">Published</Badge>}
                      {exceeds && <Badge variant="warning">Contains &gt;1″</Badge>}
                    </div>
                    <p className="text-sm text-slate-600">
                      Created {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {record.config.projectNumber && <Badge variant="outline">Proj {record.config.projectNumber}</Badge>}
                      {record.config.markNumber && <Badge variant="outline">Mark {record.config.markNumber}</Badge>}
                      {record.config.idNumber && <Badge variant="outline">ID {record.config.idNumber}</Badge>}
                      <Badge variant="outline">Pattern {getPatternLabel(record.config.strandPattern)}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Total slippage {exceeds ? GREATER_THAN_LABEL : `${total.toFixed(3)}″`} (≈{exceeds ? GREATER_THAN_LABEL : decimalToFraction(total)})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleViewRecord(record)}>
                      View summary
                    </Button>
                    {(activeTab === 'my-records' || canManagePublished) && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => back()}>
            Back
          </Button>
          <Button variant="outline" onClick={() => reset('Dashboard', undefined)}>
            Home
          </Button>
        </div>
        {records.length > 0 && (activeTab === 'my-records' || canManagePublished) && (
          <Button
            variant="ghost"
            className="text-sm text-red-600 hover:text-red-700"
            onClick={handleClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}

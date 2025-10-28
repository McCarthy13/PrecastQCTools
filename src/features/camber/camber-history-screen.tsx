'use client';

import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalculatorStore } from '@/state/calculatorStore';
import { useNavigationStore } from '@/state/navigationStore';
import { formatSpanDisplay } from '@/utils/cn';
import { formatNumber } from './utils';
import { useShallow } from 'zustand/react/shallow';

export function CamberHistoryScreen() {
  const { history, clearHistory, removeCalculation } = useCalculatorStore(
    useShallow((state) => ({
      history: state.history,
      clearHistory: state.clearHistory,
      removeCalculation: state.removeCalculation,
    }))
  );
  const push = useNavigationStore((state) => state.push);

  const hasHistory = history.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Camber History</h2>
          <p className="text-sm text-slate-600">Stored locally in your browser for quick reference.</p>
        </div>
        {hasHistory && (
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              if (window.confirm('Clear all camber calculations?')) {
                clearHistory();
              }
            }}
          >
            Clear all
          </Button>
        )}
      </div>

      {!hasHistory ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No calculations yet</CardTitle>
            <CardDescription>
              Run a camber calculation and results will appear here for future comparison.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => push('Calculator', undefined)}>Go to calculator</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">
                      {entry.projectName ?? 'Untitled project'}
                    </p>
                    <Badge variant="outline">{entry.inputs.memberType}</Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>Span {formatSpanDisplay(entry.inputs.span)}</p>
                    <p>Recommended camber {formatNumber(entry.results.recommendedCamber)} in</p>
                    {entry.notes && <p className="text-xs text-slate-500">Notes: {entry.notes}</p>}
                  </div>
                  <p className="text-xs text-slate-400">
                    Calculated {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => push('Results', { calculationId: entry.id })}>
                    View results
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      if (window.confirm('Remove this calculation?')) {
                        removeCalculation(entry.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

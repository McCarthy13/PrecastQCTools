'use client';

import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  IoAddOutline,
  IoFunnelOutline,
  IoHeartOutline,
  IoHeartSharp,
  IoSearchOutline,
} from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAggregateLibraryStore } from '@/state/aggregateLibraryStore';
import { useNavigationStore } from '@/state/navigationStore';
import type { AggregateLibraryItem } from '@/types/aggregate-library';

type TypeFilter = 'all' | 'Fine' | 'Coarse';

const formatNumber = (value?: number, digits = 2) => {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return Number(value).toFixed(digits);
};

const emptyStateText = `No aggregates saved yet. Add your first template to centralize plant material data.`;

export function AggregateLibraryScreen() {
  const { push } = useNavigationStore(
    useShallow((state) => ({
      push: state.push,
    }))
  );

  const {
    aggregates,
    favorites,
    recentlyUsed,
    toggleFavorite,
    searchAggregates,
    isAggregateComplete,
  } = useAggregateLibraryStore(
    useShallow((state) => ({
      aggregates: state.getAllAggregates(),
      favorites: state.getFavorites(),
      recentlyUsed: state.getRecentlyUsed(4),
      toggleFavorite: state.toggleFavorite,
      searchAggregates: state.searchAggregates,
      isAggregateComplete: state.isAggregateComplete,
    }))
  );

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filteredAggregates = useMemo(() => {
    const baseList = query.trim() ? searchAggregates(query.trim()) : aggregates;
    if (typeFilter === 'all') {
      return baseList;
    }
    return baseList.filter((item) => item.type === typeFilter);
  }, [aggregates, query, searchAggregates, typeFilter]);

  const stats = useMemo(() => {
    const total = aggregates.length;
    const fine = aggregates.filter((item) => item.type === 'Fine').length;
    const coarse = total - fine;
    const complete = aggregates.filter((item) => isAggregateComplete(item.id)).length;
    const incomplete = total - complete;
    return { total, fine, coarse, complete, incomplete, favorites: favorites.length };
  }, [aggregates, favorites.length, isAggregateComplete]);

  const renderAggregateRow = (aggregate: AggregateLibraryItem) => {
    const complete = isAggregateComplete(aggregate.id);
    return (
      <Card key={aggregate.id} className="border-slate-200 bg-white">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-900">{aggregate.name}</p>
              <Badge variant="outline">{aggregate.type}</Badge>
              {complete ? (
                <Badge variant="success">Complete</Badge>
              ) : (
                <Badge variant="warning">Needs data</Badge>
              )}
              {aggregate.stockpileNumber && (
                <Badge variant="outline">Stockpile {aggregate.stockpileNumber}</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {aggregate.source && <span>Source: {aggregate.source}</span>}
              {aggregate.maxSize !== undefined && (
                <span>Max Size: {formatNumber(aggregate.maxSize, 2)} in</span>
              )}
              {aggregate.dryRoddedUnitWeight !== undefined && (
                <span>Unit Wt: {formatNumber(aggregate.dryRoddedUnitWeight)} lb/ft³</span>
              )}
              {aggregate.finenessModulus !== undefined && (
                <span>FM: {formatNumber(aggregate.finenessModulus)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
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
              type="button"
              variant="outline"
              onClick={() => push('AggregateLibraryDetail', { aggregateId: aggregate.id })}
            >
              View
            </Button>
            <Button
              type="button"
              onClick={() => push('AggregateLibraryAddEdit', { aggregateId: aggregate.id })}
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Aggregate Library</h2>
          <p className="text-sm text-slate-600">
            Manage physical properties, suppliers, and testing notes for plant materials.
          </p>
        </div>
        <Button
          type="button"
          className="flex items-center gap-2"
          onClick={() => push('AggregateLibraryAddEdit', {})}
        >
          <IoAddOutline className="h-5 w-5" />
          Add aggregate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library overview</CardTitle>
          <CardDescription>Track completeness and favorites at a glance.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fine agg.</p>
            <p className="text-xl font-semibold text-slate-900">{stats.fine}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Coarse agg.</p>
            <p className="text-xl font-semibold text-slate-900">{stats.coarse}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Complete</p>
            <p className="text-xl font-semibold text-slate-900">{stats.complete}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Favorites</p>
            <p className="text-xl font-semibold text-slate-900">{stats.favorites}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search & filter</CardTitle>
          <CardDescription>Look up aggregates by name, source, stockpile, or color.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <IoSearchOutline className="h-4 w-4 text-slate-400" />
            <Input
              aria-label="Search aggregates"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, source, stockpile..."
              className="border-none px-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <IoFunnelOutline />
            Filter
          </div>
          <div className="flex gap-2">
            {(['all', 'Fine', 'Coarse'] as TypeFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={typeFilter === filter ? 'secondary' : 'outline'}
                onClick={() => setTypeFilter(filter)}
              >
                {filter === 'all' ? 'All' : filter}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Favorites</CardTitle>
            <CardDescription>Pinned aggregates appear at the top for quick access.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {favorites.map((aggregate) => renderAggregateRow(aggregate))}
          </CardContent>
        </Card>
      )}

      {recentlyUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently accessed</CardTitle>
            <CardDescription>Automatically tracked whenever an aggregate is opened.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {recentlyUsed.map((aggregate) => renderAggregateRow(aggregate))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredAggregates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-slate-500">
              {aggregates.length === 0 ? emptyStateText : 'No aggregates match your filters.'}
            </CardContent>
          </Card>
        ) : (
          filteredAggregates.map((aggregate) => renderAggregateRow(aggregate))
        )}
      </div>
    </div>
  );
}

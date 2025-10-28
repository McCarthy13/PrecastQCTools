'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/state/navigationStore';
import { IoHammerOutline } from 'react-icons/io5';

export const createPlaceholderScreen = (title: string, blurb?: string) => {
  const PlaceholderScreen = () => {
    const navigate = useNavigationStore((state) => state.reset);
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <div className="flex items-center gap-3">
          <Badge variant="warning">In progress</Badge>
          <IoHammerOutline className="h-8 w-8 text-slate-400" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            {blurb || 'This module is being ported from the Quality Control mobile app. It will be available shortly.'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('Dashboard', undefined)}>
          Back to dashboard
        </Button>
      </div>
    );
  };

  PlaceholderScreen.displayName = `${title.replace(/\s+/g, '')}Placeholder`;
  return PlaceholderScreen;
};

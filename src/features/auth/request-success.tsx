'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FiCheckCircle } from 'react-icons/fi';

interface RequestSuccessProps {
  onBackToLogin: () => void;
}

export function RequestSuccessScreen({ onBackToLogin }: RequestSuccessProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-600 px-4 py-16 text-white">
      <Card className="w-full max-w-lg border-none bg-white text-slate-900">
        <CardContent className="items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <FiCheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold">Request Submitted</h1>
          <p className="text-sm text-slate-600">
            Your access request has been sent to the QC administrator. You will receive credentials via email once approved.
          </p>
          <Button variant="primary" className="mt-2" onClick={onBackToLogin}>
            Return to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

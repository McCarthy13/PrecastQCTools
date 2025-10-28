'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/state/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiArrowLeft, FiCheck, FiLoader, FiShieldOff, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface AdminApprovalProps {
  onBack: () => void;
}

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export function AdminApprovalScreen({ onBack }: AdminApprovalProps) {
  const approveRequest = useAuthStore((state) => state.approveRequest);
  const denyRequest = useAuthStore((state) => state.denyRequest);
  const pendingRequests = useAuthStore((state) => state.getPendingRequests());
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  const enrichedRequests = useMemo(
    () =>
      pendingRequests.map((request) => ({
        ...request,
        relativeTime: formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true }),
      })),
    [pendingRequests]
  );

  const resetToast = () => {
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (requestId: string) => {
    const tempPassword = passwords[requestId] || generateTempPassword();
    setProcessingId(requestId);

    try {
      const result = await approveRequest(requestId, tempPassword);
      if (result.success) {
        setToast({ message: 'Access granted and credentials dispatched.', tone: 'success' });
        setPasswords((prev) => ({ ...prev, [requestId]: tempPassword }));
      } else {
        setToast({ message: 'Unable to approve request.', tone: 'error' });
      }
    } catch (error) {
      console.error('Approval error', error);
      setToast({ message: 'Unexpected error while approving request.', tone: 'error' });
    } finally {
      setProcessingId(null);
      resetToast();
    }
  };

  const handleDeny = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await denyRequest(requestId);
      if (result.success) {
        setToast({ message: 'Request marked as denied.', tone: 'success' });
      } else {
        setToast({ message: 'Unable to deny request.', tone: 'error' });
      }
    } catch (error) {
      console.error('Deny error', error);
      setToast({ message: 'Unexpected error while denying request.', tone: 'error' });
    } finally {
      setProcessingId(null);
      resetToast();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between px-6 py-4 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">QC Admin Console</span>
          <Badge variant="outline" className="border-white/30 text-white">
            Restricted
          </Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16">
        {toast && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.tone === 'success'
                ? 'bg-emerald-500/15 text-emerald-200'
                : 'bg-red-500/15 text-red-200'
            }`}
          >
            {toast.tone === 'success' ? <FiCheck className="h-4 w-4" /> : <FiShieldOff className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        <Card className="bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Pending Access Requests</CardTitle>
            <CardDescription>
              Review plant personnel awaiting access to quality control tools. Temporary credentials are logged to the console for record keeping.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            {enrichedRequests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <FiCheck className="h-10 w-10 text-emerald-500" />
                <p className="text-sm text-slate-600">No pending approvals. All requests have been processed.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {enrichedRequests.map((request) => {
                  const tempPassword = passwords[request.id] || generateTempPassword();
                  return (
                    <div
                      key={request.id}
                      className="grid gap-4 rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md md:grid-cols-[1fr_240px]"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {request.firstName} {request.lastName}
                          </h3>
                          <Badge variant="info">{request.company}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span>{request.email}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span>Requested {request.relativeTime}</span>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <Input
                          label="Temporary password"
                          value={tempPassword}
                          onChange={(event) =>
                            setPasswords((prev) => ({ ...prev, [request.id]: event.target.value }))
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            loading={processingId === request.id}
                            onClick={() => handleApprove(request.id)}
                          >
                            {processingId === request.id ? (
                              <FiLoader className="h-4 w-4 animate-spin" />
                            ) : (
                              <FiCheck className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={processingId === request.id}
                            onClick={() => handleDeny(request.id)}
                          >
                            <FiX className="h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

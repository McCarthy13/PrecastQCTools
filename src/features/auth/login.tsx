'use client';

import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/state/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiCheckCircle, FiLogIn, FiShield } from 'react-icons/fi';

interface LoginProps {
  onLoginSuccess: (requiresPasswordChange: boolean) => void;
  onRequestAccess: () => void;
  onAdminApproval: () => void;
}

export function LoginScreen({ onLoginSuccess, onRequestAccess, onAdminApproval }: LoginProps) {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (!result.success) {
        setError(result.error || 'Unable to sign in.');
        return;
      }
      onLoginSuccess(Boolean(result.requiresPasswordChange));
    } catch (err) {
      console.error('Login error', err);
      setError('Unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Precast Quality Tools
          </CardTitle>
          <CardDescription>
            Sign in with your plant credentials to access camber calculators, quality logs, and production tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              required
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@precast.com"
            />
            <Input
              type="password"
              required
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" size="lg" loading={loading} className="w-full">
              <FiLogIn className="h-4 w-4" />
              Sign In
            </Button>
          </form>

          <div className="grid gap-3 rounded-xl bg-slate-100 p-4">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="text-sm text-slate-600">
                New to the app? Request access and an administrator will review your submission.
              </p>
            </div>
            <Button variant="outline" onClick={onRequestAccess}>
              Request Access
            </Button>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FiShield className="h-4 w-4" />
              <span className="font-medium">Plant Admins</span>
            </div>
            <p className="mt-2 text-sm">
              Review pending access requests and issue temporary passwords directly from the approval console.
            </p>
            <Button
              variant="ghost"
              className="mt-3 text-blue-600 hover:bg-blue-50"
              onClick={onAdminApproval}
            >
              Open Admin Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

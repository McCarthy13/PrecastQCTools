'use client';

import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/state/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiSave } from 'react-icons/fi';

interface ChangePasswordProps {
  onComplete: () => void;
  onLogout: () => void;
}

export function ChangePasswordScreen({ onComplete, onLogout }: ChangePasswordProps) {
  const changePassword = useAuthStore((state) => state.changePassword);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return 'Use at least one uppercase letter, number, and special character.';
    }
    if (password !== confirm) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await changePassword(password);
      if (!result.success) {
        setError(result.error || 'Unable to update password.');
        return;
      }
      onComplete();
    } catch (err) {
      console.error('Change password error', err);
      setError('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900">Update Temporary Password</CardTitle>
          <CardDescription>
            {currentUser ? `Welcome ${currentUser.firstName}. Set a permanent password to continue.` : 'Set a permanent password to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" loading={loading}>
              <FiSave className="h-4 w-4" />
              Save Password
            </Button>
          </form>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-700"
          >
            Sign in with a different account
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/state/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

interface RegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function RegistrationScreen({ onBack, onSuccess }: RegistrationProps) {
  const requestAccess = useAuthStore((state) => state.requestAccess);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await requestAccess({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        company: form.company.trim(),
      });

      if (result.success) {
        onSuccess();
      } else {
        setError('Unable to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Registration error', err);
      setError('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <Card className="w-full max-w-3xl">
        <CardHeader className="gap-3">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 self-start text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <FiArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Back to sign in
          </button>
          <div>
            <CardTitle className="text-2xl font-semibold text-slate-900">Request Access</CardTitle>
            <CardDescription>
              Tell us who you are and the plant you represent. A QC administrator will review the request and send login credentials if approved.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="gap-6">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="First name" required value={form.firstName} onChange={handleChange('firstName')} />
            <Input label="Last name" required value={form.lastName} onChange={handleChange('lastName')} />
            <Input
              label="Work email"
              type="email"
              className="md:col-span-2"
              required
              value={form.email}
              onChange={handleChange('email')}
            />
            <Input
              label="Company / Plant"
              className="md:col-span-2"
              required
              value={form.company}
              onChange={handleChange('company')}
              placeholder="Example: Midwest Precast Plant 2"
            />
            {error && (
              <p className="md:col-span-2 text-sm font-medium text-red-600">{error}</p>
            )}
            <div className="md:col-span-2">
              <Button type="submit" size="lg" loading={loading} className="w-full md:w-auto">
                <FiSend className="h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </form>
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">What happens next?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>A plant administrator receives your request immediately.</li>
              <li>If approved, you&apos;ll receive an email with a temporary password.</li>
              <li>Temporary passwords must be changed at first login.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

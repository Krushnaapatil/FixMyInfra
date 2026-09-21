import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fixmyinfra/ui-kit';
import { login, logout } from '@fixmyinfra/auth';

function getApiError(error: unknown): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Login failed. Check your credentials.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSubmitting(true);
    try {
      const response = await login(String(form.get('email')), String(form.get('password')));
      if (response.user.role !== 'ADMIN') {
        logout();
        setError('This dashboard is for administrators only.');
        setSubmitting(false);
        return;
      }
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
      setSubmitting(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5"><form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">InfraFix administration</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Admin sign in</h1><p className="mt-2 text-sm text-slate-500">Monitor complaints and municipal operations.</p><label className="mt-8 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Email</span><input name="email" required type="email" className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label><label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Password</span><input name="password" required type="password" className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label>{error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{error}</div>}<Button type="submit" disabled={submitting} className="mt-6 w-full !rounded-lg !bg-slate-900 !py-3 font-bold">{submitting ? 'Signing in...' : 'Open dashboard'}</Button></form></main>;
}

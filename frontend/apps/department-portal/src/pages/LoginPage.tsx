import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@fixmyinfra/ui-kit';
import { login, logout } from '@fixmyinfra/auth';

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'Login failed. Check your details and try again.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSubmitting(true);

    try {
      const response = await login(String(form.get('email')), String(form.get('password')));
      if (!['OFFICER', 'ADMIN'].includes(response.user.role)) {
        logout();
        setError('This portal is for department officers.');
        setSubmitting(false);
        return;
      }
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
      setSubmitting(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#eaf2f0] px-5 py-10"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(22,54,56,0.12)] md:grid-cols-[1.05fr_.95fr]"><section className="hidden bg-[#173f42] px-10 py-12 text-white md:block lg:px-14"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9bd4c8]">InfraFix Operations</p><h1 className="mt-24 max-w-md text-5xl font-bold leading-[1.04] tracking-[-0.05em]">Keep the city moving.</h1><p className="mt-6 max-w-sm text-sm leading-6 text-[#bdd7d2]">Review evidence, prioritize field work, and keep residents informed from one focused queue.</p><div className="mt-12 h-1 w-20 rounded-full bg-[#65b9aa]" /></section><section className="px-5 py-10 sm:px-10 sm:py-14"><div className="mx-auto max-w-md"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D7A6E]">Officer access</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#163638]">Sign in to your queue</h2><p className="mt-2 text-sm text-[#78908e]">Use your department account to review assigned complaints.</p><form className="mt-8 space-y-5" onSubmit={handleSubmit}><label className="block"><span className="mb-2 block text-sm font-semibold text-[#315250]">Email</span><input name="email" required type="email" autoComplete="email" className="w-full rounded-xl border border-[#dce9e6] px-3.5 py-3 text-sm outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-[#315250]">Password</span><input name="password" required type="password" autoComplete="current-password" className="w-full rounded-xl border border-[#dce9e6] px-3.5 py-3 text-sm outline-none focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label>{error && <div role="alert" className="rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#b84d4d]">{error}</div>}<Button type="submit" disabled={submitting} className="!w-full !rounded-xl !bg-[#173f42] !py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Signing in...' : 'Open department queue'}</Button></form><p className="mt-6 text-center text-sm text-[#78908e]">Need a citizen account? <Link to="/login" className="font-semibold text-[#0D7A6E]">Use the citizen portal</Link></p>{location.state && <p className="mt-3 text-center text-xs text-[#78908e]">Your session is required to continue.</p>}</div></section></div></main>;
}

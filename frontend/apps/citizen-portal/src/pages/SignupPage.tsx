import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@fixmyinfra/ui-kit';
import { register } from '@fixmyinfra/auth';
import { AuthDecor } from '../components/AuthDecor';
import { Brand } from '../components/Brand';
import { Card } from '../components/StyledCard';

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'We could not create your account. Please try again.';
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));
    const confirmPassword = String(form.get('confirmPassword'));

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/login', { replace: true, state: { message: 'Account created. You can now log in.' } });
    } catch (requestError) {
      setError(getApiError(requestError));
      setSubmitting(false);
    }
  }

  return <main className="flex min-h-screen bg-white"><AuthDecor /><section className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#f7fafa] md:w-[45%]"><div className="mb-8 flex w-full items-center justify-between px-6 md:hidden"><Link to="/login"><Brand /></Link><Link to="/login" className="text-sm font-semibold text-[#0D7A6E]">Log in</Link></div><div className="flex w-full max-w-md flex-col justify-center px-5 py-10 sm:px-8"><Card className="!rounded-2xl !border-0 !p-7 !shadow-lg sm:!p-9"><div className="mb-8"><h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F2A2E]">Create your account</h2><p className="mt-2 text-sm text-[#819795]">Join your neighborhood in making Nashik better.</p></div><form className="space-y-5" onSubmit={handleSubmit}><label className="block"><span className="mb-2 block text-xs font-semibold text-[#315250]">Full name</span><input name="name" required type="text" autoComplete="name" placeholder="Enter your full name" className="w-full rounded-xl border border-[#dce9e6] bg-[#fbfdfd] px-3.5 py-3.5 text-sm text-[#17393b] outline-none transition placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-[#315250]">Email</span><input name="email" required type="email" autoComplete="email" placeholder="Enter your email" className="w-full rounded-xl border border-[#dce9e6] bg-[#fbfdfd] px-3.5 py-3.5 text-sm text-[#17393b] outline-none transition placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-[#315250]">Password</span><input name="password" required minLength={8} type="password" autoComplete="new-password" placeholder="At least 8 characters" className="w-full rounded-xl border border-[#dce9e6] bg-[#fbfdfd] px-3.5 py-3.5 text-sm text-[#17393b] outline-none transition placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-[#315250]">Confirm password</span><input name="confirmPassword" required minLength={8} type="password" autoComplete="new-password" placeholder="Repeat your password" className="w-full rounded-xl border border-[#dce9e6] bg-[#fbfdfd] px-3.5 py-3.5 text-sm text-[#17393b] outline-none transition placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></label>{error && <div role="alert" className="rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#b84d4d]">{error}</div>}<Button type="submit" disabled={submitting} className="!w-full !rounded-xl !bg-[#0D7A6E] !py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Creating account...' : 'Create account'}</Button></form><p className="mt-6 text-center text-sm text-[#819795]">Already have an account? <Link to="/login" className="font-bold text-[#0D7A6E]">Log in</Link></p></Card></div></section></main>;
}

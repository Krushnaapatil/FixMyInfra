import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Button } from '@fixmyinfra/ui-kit';
import { Card } from './StyledCard';
import { Link, useNavigate } from 'react-router-dom';
import { login, logout } from '@fixmyinfra/auth';

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'Login failed. Check your details and try again.';
}

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSubmitting(true);

    try {
      const response = await login(String(form.get('email')), String(form.get('password')));
      if (response.user.role !== 'CITIZEN') {
        logout();
        setError('This portal is for citizens. Use the department portal for officer accounts.');
        setSubmitting(false);
        return;
      }
      navigate('/home', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
      setSubmitting(false);
    }
  }

  return <div className="flex w-full max-w-md flex-col justify-center px-5 py-10 sm:px-8"><Card className="!rounded-2xl !border-0 !p-7 !shadow-lg sm:!p-9"><div className="mb-8"><h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0F2A2E]">Welcome Back</h2><p className="mt-2 text-sm text-[#819795]">Login to continue to InfraFix</p></div><form className="space-y-5" onSubmit={handleSubmit}><label className="block"><span className="mb-2 block text-xs font-semibold text-[#315250]">Email</span><span className="relative block"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94aaa8]" size={17} /><input name="email" required type="email" autoComplete="email" placeholder="Enter your email" className="w-full rounded-xl border border-[#dce9e6] bg-[#fbfdfd] py-3.5 pl-11 pr-3 text-sm text-[#17393b] outline-none transition placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold text-[#315250]">Password</span><span className="relative block"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94aaa8]" size={17} /><input name="password" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border border-[#dce9e6] bg-[#fbfdfd] py-3.5 pl-11 pr-11 text-sm text-[#17393b] outline-none transition placeholder:text-[#a9bbba] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94aaa8]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{error && <div role="alert" className="rounded-xl border border-[#f2c9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#b84d4d]">{error}</div>}<Button type="submit" disabled={submitting} className="!w-full !rounded-xl !bg-[#0D7A6E] !py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Signing in...' : 'Log in'}</Button></form><p className="mt-6 text-center text-sm text-[#819795]">Don&apos;t have an account? <Link to="/signup" className="font-bold text-[#0D7A6E]">Sign up</Link></p></Card></div>;
}

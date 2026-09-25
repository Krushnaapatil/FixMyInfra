import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthBanner,
  AuthCard,
  AuthField,
  AuthHeader,
  AuthInput,
  AuthLayout,
  AuthPasswordInput,
  AuthSubmit,
  AuthTerms
} from '@fixmyinfra/ui-kit';
import { register } from '@fixmyinfra/auth';
import brandLogo from '../assets/brand-logo.png';
import cityIllustration from '../assets/city-illustration.png';
import featureIcons from '../assets/feature-icons.png';

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

  return (
    <AuthLayout
      assets={{ brandLogo, cityIllustration, featureIcons }}
      topHint={
        <>
          Already have an Account?{' '}
          <Link to="/login" className="font-semibold text-[#0D7A6E] hover:underline">
            Log in
          </Link>
        </>
      }
      mobileAction={
        <Link to="/login" className="text-sm font-semibold text-[#0D7A6E]">
          Log in
        </Link>
      }
    >
      <AuthCard>
        <AuthHeader title="Create Account" subtitle="Sign up to start reporting issues" />
        <form className="space-y-5" onSubmit={handleSubmit}>
          <AuthField label="Full Name">
            <AuthInput name="name" required type="text" autoComplete="name" placeholder="Enter your Full Name" icon="user" />
          </AuthField>
          <AuthField label="Email">
            <AuthInput name="email" required type="email" autoComplete="email" placeholder="Enter your Email" icon="mail" />
          </AuthField>
          <AuthField label="Password">
            <AuthPasswordInput name="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          </AuthField>
          <AuthField label="Confirm Password">
            <AuthInput name="confirmPassword" required minLength={8} type="password" autoComplete="new-password" placeholder="Repeat your Password" icon="lock" />
          </AuthField>
          {error && <AuthBanner tone="error">{error}</AuthBanner>}
          <AuthSubmit pending={submitting} pendingLabel="Creating account...">Sign Up</AuthSubmit>
        </form>
        <AuthTerms />
      </AuthCard>
    </AuthLayout>
  );
}

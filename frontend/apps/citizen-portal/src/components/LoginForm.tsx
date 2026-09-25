import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthBanner,
  AuthCard,
  AuthDivider,
  AuthField,
  AuthGoogleButton,
  AuthHeader,
  AuthInput,
  AuthPasswordInput,
  AuthSubmit,
  AuthTerms
} from '@fixmyinfra/ui-kit';
import { login, logout } from '@fixmyinfra/auth';

function getApiError(error: unknown): string {
  const responseError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  return responseError ?? 'Login failed. Check your details and try again.';
}

export function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setNotice('');
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

  return (
    <AuthCard>
      <AuthHeader title="Welcome Back" subtitle="Login to continue to InfraFix" />
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField label="Email">
          <AuthInput name="email" required type="email" autoComplete="email" placeholder="Enter your Email" icon="mail" />
        </AuthField>
        <AuthField label="Password">
          <AuthPasswordInput name="password" required autoComplete="current-password" placeholder="Enter your Password" />
        </AuthField>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setNotice('Password reset is not available yet — contact your administrator.')}
            className="text-xs font-semibold text-[#0D7A6E] hover:underline"
          >
            Forget Password?
          </button>
        </div>
        {error && <AuthBanner tone="error">{error}</AuthBanner>}
        {notice && <AuthBanner tone="info">{notice}</AuthBanner>}
        <AuthSubmit pending={submitting} pendingLabel="Signing in...">Log In</AuthSubmit>
      </form>
      <AuthDivider />
      <AuthGoogleButton onClick={() => setNotice('Google sign-in is not connected yet — please use email login.')} />
      <AuthTerms />
    </AuthCard>
  );
}

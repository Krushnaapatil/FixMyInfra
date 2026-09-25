import { Link, useLocation } from 'react-router-dom';
import { AuthBanner, AuthLayout } from '@fixmyinfra/ui-kit';
import { LoginForm } from '../components/LoginForm';
import brandLogo from '../assets/brand-logo.png';
import cityIllustration from '../assets/city-illustration.png';
import featureIcons from '../assets/feature-icons.png';

export default function LoginPage() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  return (
    <AuthLayout
      assets={{ brandLogo, cityIllustration, featureIcons }}
      topHint={
        <>
          Don&apos;t have an Account?{' '}
          <Link to="/signup" className="font-semibold text-[#0D7A6E] hover:underline">
            Sign up
          </Link>
        </>
      }
      mobileAction={
        <Link to="/signup" className="text-sm font-semibold text-[#0D7A6E]">
          Sign up
        </Link>
      }
      notice={message ? <AuthBanner tone="success">{message}</AuthBanner> : undefined}
    >
      <LoginForm />
    </AuthLayout>
  );
}

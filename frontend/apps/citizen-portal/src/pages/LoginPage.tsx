import { Link, useLocation } from 'react-router-dom';
import { AuthDecor } from '../components/AuthDecor';
import { Brand } from '../components/Brand';
import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  return <main className="flex min-h-screen bg-white"><AuthDecor /><section className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#f7fafa] md:w-[45%]"><div className="mb-8 self-start px-6 md:hidden"><Link to="/login"><Brand /></Link></div>{message && <div role="status" className="mb-4 w-full max-w-md rounded-xl border border-[#bfe8dd] bg-[#effbf8] px-4 py-3 text-sm font-medium text-[#0D7A6E]">{message}</div>}<LoginForm /></section></main>;
}

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

// Shared authentication design system for the Citizen, Officer and Admin
// portals. Visual language follows the InfraFix reference: white showcase
// panel with brand headline + feature chips + city illustration on the left,
// centered card with bordered inputs, teal primary action, Google secondary
// action and terms footer on the right. Purely presentational: portals keep
// their own submit handlers, role guards and redirects.

export interface AuthAssets {
  brandLogo: string;
  cityIllustration: string;
  featureIcons: string;
}

const features = [
  { label: ['Report', 'Issues'], offset: 0 },
  { label: ['Auto', 'Location'], offset: 155 },
  { label: ['Faster', 'Resolution'], offset: 310 }
];

// The icon strip is three 72px cells; render each cell scaled into a 56px window.
const cellSize = 72;
const displaySize = 56;

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c1.4-3.4 4-5 7-5s5.6 1.6 7 5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l16 16" />
      <path d="M10.6 6c.5-.1.9-.1 1.4-.1 6 0 9.5 6.1 9.5 6.1a17 17 0 0 1-3.3 3.7M6.6 6.9A16.4 16.4 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.2-.2 3.1-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.7-.1-1.4-.2-2H9v3.4h4.8c-.2 1.1-.9 2-1.9 2.6v2.2h3c1.8-1.6 2.7-4 2.7-6.2z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.7H.9v2.3C2.4 15.9 5.5 18 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V4.9H.9C.3 6.2 0 7.6 0 9s.3 2.8.9 4.1l3-2.3z" />
      <path fill="#EA4335" d="M9 3.5c1.3 0 2.5.5 3.4 1.4l2.6-2.6C13.5.8 11.4 0 9 0 5.5 0 2.4 2.1.9 4.9l3 2.3c.7-2.1 2.7-3.7 5.1-3.7z" />
    </svg>
  );
}

const fieldIcons = {
  mail: <MailIcon />,
  lock: <LockIcon />,
  user: <UserIcon />
};

export type AuthFieldIcon = keyof typeof fieldIcons;

interface AuthLayoutProps {
  assets: AuthAssets;
  /** Top-right hint on desktop, e.g. "Don't have an Account? Sign up". */
  topHint?: ReactNode;
  /** Compact action shown next to the logo on mobile. */
  mobileAction?: ReactNode;
  /** Session / status banners rendered above the card. */
  notice?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ assets, topHint, mobileAction, notice, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen bg-white">
      <section className="relative hidden min-h-screen w-[55%] flex-col overflow-hidden bg-white px-10 pt-9 md:flex lg:px-16">
        <img src={assets.brandLogo} alt="InfraFix — Solutions for your Infrastructure" className="h-12 w-auto self-start" />
        <div className="relative z-10 mt-12 max-w-xl">
          <span className="block h-1.5 w-24 rounded-full bg-[#0D7A6E]" />
          <h1 className="mt-6 max-w-md text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-[#16303a] lg:text-[56px]">
            Report Today<br />for a <span className="text-[#0D7A6E]">Better Tomorrow</span>
          </h1>
          <p className="mt-5 max-w-sm text-[15px] font-medium leading-6 text-[#43586c]">
            A smarter way to report and resolve infrastructure issues in your city
          </p>
          <div className="mt-8 flex gap-9">
            {features.map(({ label, offset }) => (
              <div key={label.join(' ')} className="flex flex-col items-center text-center">
                <span
                  className="block overflow-hidden rounded-full"
                  style={{ width: displaySize, height: displaySize }}
                  role="img"
                  aria-label={label.join(' ')}
                >
                  <img
                    src={assets.featureIcons}
                    alt=""
                    style={{
                      width: `${(382 * displaySize) / cellSize}px`,
                      maxWidth: 'none',
                      marginLeft: `${(-offset * displaySize) / cellSize}px`
                    }}
                  />
                </span>
                <span className="mt-2.5 text-[13px] font-semibold leading-5 text-[#33475c]">
                  {label[0]}<br />{label[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <img
          src={assets.cityIllustration}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] w-full object-cover object-top"
        />
        <div className="absolute bottom-24 left-10 z-10 w-44 rounded-xl border border-white/70 bg-white/60 p-3 shadow-sm backdrop-blur-sm lg:left-16">
          <p className="text-[11px] font-semibold leading-4 text-[#43586c]">Cleaner Cities<br />Stronger Communities</p>
          <span className="mt-2 block h-1 w-10 rounded-full bg-[#5b6b7c]" />
        </div>
      </section>
      <section className="relative flex min-h-screen flex-1 flex-col items-center justify-center bg-white px-5 py-10">
        {topHint && (
          <div className="absolute right-6 top-6 hidden text-sm text-[#4f716e] md:block lg:right-10">{topHint}</div>
        )}
        <div className="mb-6 flex w-full max-w-[420px] items-center justify-between md:hidden">
          <img src={assets.brandLogo} alt="InfraFix" className="h-9 w-auto" />
          {mobileAction}
        </div>
        {notice && <div className="mb-4 w-full max-w-[420px] space-y-3">{notice}</div>}
        {children}
      </section>
    </main>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-[#e7efec] bg-white p-7 shadow-[0_18px_50px_rgba(23,63,66,0.10)] sm:p-8">
      {children}
    </div>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[26px] font-bold leading-8 tracking-[-0.02em] text-[#0F2A2E]">{title}</h2>
      <p className="mt-1.5 text-sm text-[#6b8583]">{subtitle}</p>
    </div>
  );
}

export function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#33484a]">{label}</span>
      {children}
    </label>
  );
}

const authInputClass =
  'w-full rounded-[10px] border border-[#dfe9e7] bg-white py-3 pl-11 pr-3 text-sm text-[#17393b] outline-none transition placeholder:text-[#a3b8b6] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: AuthFieldIcon;
}

export function AuthInput({ icon, ...props }: AuthInputProps) {
  return (
    <span className="relative block">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94aaa8]">{fieldIcons[icon]}</span>
      <input {...props} className={authInputClass} />
    </span>
  );
}

export function AuthPasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94aaa8]"><LockIcon /></span>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className="w-full rounded-[10px] border border-[#dfe9e7] bg-white py-3 pl-11 pr-11 text-sm text-[#17393b] outline-none transition placeholder:text-[#a3b8b6] focus:border-[#0D7A6E] focus:ring-4 focus:ring-[#0D7A6E]/10"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94aaa8] transition hover:text-[#0D7A6E]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
}

export function AuthSubmit({
  pending,
  children,
  pendingLabel
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[10px] bg-[#0D7A6E] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0b6a5d] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-medium text-[#819795]">
      <span className="h-px flex-1 bg-[#e3edeb]" />
      OR
      <span className="h-px flex-1 bg-[#e3edeb]" />
    </div>
  );
}

export function AuthGoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#dfe9e7] bg-white py-3 text-sm font-semibold text-[#294746] transition hover:border-[#0D7A6E]"
    >
      <GoogleMark /> Continue with Google
    </button>
  );
}

export function AuthTerms() {
  return (
    <p className="mt-6 text-center text-xs leading-5 text-[#819795]">
      By Continuing, you agree to our <span className="font-semibold text-[#0D7A6E]">Terms and Conditions</span>
      <br />and <span className="font-semibold text-[#0D7A6E]">Privacy Policy</span>
    </p>
  );
}

type AuthBannerTone = 'error' | 'success' | 'info';

const bannerTones: Record<AuthBannerTone, string> = {
  error: 'border-[#f2c9c9] bg-[#fff5f5] text-[#b84d4d]',
  success: 'border-[#bfe8dd] bg-[#effbf8] text-[#0D7A6E]',
  info: 'border-[#bfe8dd] bg-[#effbf8] text-[#0D7A6E]'
};

export function AuthBanner({ tone, children }: { tone: AuthBannerTone; children: ReactNode }) {
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <div role={role} className={`rounded-[10px] border px-4 py-3 text-sm font-medium ${bannerTones[tone]}`}>
      {children}
    </div>
  );
}

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from '@iconify/react';

type LoginMethod = 'username' | 'qr';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [method, setMethod] = useState<LoginMethod>('username');

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#FF6115] flex items-center justify-center">
            <span className="text-white text-base font-bold">PS</span>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-[#1A1A1A] leading-tight">PEEP SHARE</div>
            <div className="text-xs text-[#6B7280]">Event Dashboard</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E7EB] px-2 flex">
            <MethodTab active={method === 'username'} onClick={() => setMethod('username')}>
              Username Login
            </MethodTab>
            <MethodTab active={method === 'qr'} onClick={() => setMethod('qr')}>
              QR Code Login
            </MethodTab>
          </div>

          <div className="p-6 sm:p-7">
            {method === 'username' ? <UsernameLoginForm onLogin={onLogin} /> : <QRLogin onLogin={onLogin} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-[#FF6115] text-[#FF6115]' : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
      }`}
    >
      {children}
    </button>
  );
}

function UsernameLoginForm({ onLogin }: { onLogin: () => void }) {
  const [countryCode, setCountryCode] = useState('+66');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A]">Welcome</h1>
        <p className="text-sm text-[#6B7280] mt-1">Please enter your phone number &amp; password to log in.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-medium text-[#374151]">
          Phone number
        </label>
        <div className="flex gap-2">
          <div className="relative flex-shrink-0">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label="Country code"
              className="h-[42px] pl-3 pr-7 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] appearance-none"
            >
              <option value="+66">🇹🇭 +66</option>
            </select>
            <Icon
              icon="solar:alt-arrow-down-linear"
              width={12}
              height={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
          </div>
          <div className="relative flex-1 min-w-0">
            <Icon
              icon="solar:phone-linear"
              width={15}
              height={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="81 234 5678"
              className="w-full h-[42px] pl-9 pr-3 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-[#374151]">
          Password
        </label>
        <div className="relative">
          <Icon
            icon="solar:lock-password-linear"
            width={15}
            height={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full h-[42px] pl-9 pr-10 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            <Icon icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={16} height={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
        <label className="flex items-center gap-2 text-[#4B5563] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-[#E5E7EB] text-[#FF6115] focus:ring-[#FF6115]/30"
          />
          Remember me
        </label>
        <button type="button" className="text-[#FF6115] hover:text-[#E5540F] font-medium transition-colors">
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        className="w-full h-11 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium rounded-lg transition-colors"
      >
        Log In
      </button>
    </form>
  );
}

function QRLogin({ onLogin }: { onLogin: () => void }) {
  const [showVerification, setShowVerification] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A1A]">Scan QR Code</h1>
        <p className="text-sm text-[#6B7280] mt-1">Open PEEP SHARE on your smartphone and scan to continue.</p>
      </div>

      <div className="flex justify-center">
        <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center">
          <Icon icon="solar:qr-code-linear" width={96} height={96} className="text-[#9CA3AF]" />
        </div>
      </div>

      <p className="text-xs text-[#6B7280] text-center leading-relaxed">
        Scan this QR code by opening PEEP SHARE on your smartphone, then tap the QR code scanner icon in the search
        bar to proceed.
      </p>

      <button
        type="button"
        onClick={() => setShowVerification(true)}
        className="w-full h-11 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] text-sm font-medium rounded-lg transition-colors"
      >
        Simulate Scan
      </button>

      {showVerification && (
        <VerificationModal
          onCancel={() => setShowVerification(false)}
          onVerify={() => {
            setShowVerification(false);
            onLogin();
          }}
        />
      )}
    </div>
  );
}

function VerificationModal({ onCancel, onVerify }: { onCancel: () => void; onVerify: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF0E8] flex items-center justify-center">
            <Icon icon="solar:shield-check-linear" width={24} height={24} className="text-[#FF6115]" />
          </div>
          <div>
            <h2 id="verification-title" className="text-base font-semibold text-[#1A1A1A]">
              Verification Required
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Enter this code on your mobile device to sign in to PEEP SHARE Desktop.
            </p>
          </div>
          <div className="text-3xl font-bold tracking-[0.3em] text-[#1A1A1A] py-2">831106</div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onVerify}
            className="flex-1 h-11 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors"
          >
            Verify &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

const QR_COLORS = { dark: '#1A1A1A', light: '#FFFFFF' };

// Loaded on first use so the QR library stays out of the main bundle.
const toDataUrl = async (value: string, options: { margin: number; width: number }) =>
  (await import('qrcode')).default.toDataURL(value, { ...options, color: QR_COLORS });

/** Renders a QR code for `value` as an image. */
export function QrCodeImage({ value, size = 48, label }: { value: string; size?: number; label: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    toDataUrl(value, { margin: 1, width: size * 4 })
      .then((url) => !cancelled && setSrc(url))
      .catch(() => !cancelled && setSrc(null));
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return src ? (
    <img src={src} alt={label} width={size} height={size} className="rounded-md border border-[#E5E7EB] bg-white" />
  ) : (
    <span style={{ width: size, height: size }} className="block rounded-md bg-[#F3F4F6]" aria-hidden="true" />
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr-code';
}

/** Downloads a print-quality PNG of the QR code. */
export async function downloadQrPng(value: string, name: string) {
  const url = await toDataUrl(value, { margin: 2, width: 1024 });
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(name)}-qr.png`;
  a.click();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API can be blocked (e.g. insecure context) — fall back to a hidden textarea.
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        await copyText(text);
        setCopied(true);
      }}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      className={`inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        copied ? 'text-[#16A34A] bg-[#F0FDF4]' : 'text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8]'
      }`}
    >
      <Icon icon={copied ? 'solar:check-linear' : 'solar:copy-linear'} width={16} height={16} />
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

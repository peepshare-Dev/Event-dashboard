import { useEffect, useState } from 'react';

// "#1234" in orange: shows the event ID and copies it on click.
export default function CopyIdButton({ id }: { id: number }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopied(true);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); leave the ID visible to copy by hand.
    }
  };

  return (
    <span className="relative flex-shrink-0">
      <button
        type="button"
        onClick={copy}
        title="Copy event ID"
        aria-label={`Copy event ID ${id}`}
        className="text-[#FF6115] underline underline-offset-4 decoration-1 hover:text-[#E5540F] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
      >
        #{id}
      </button>
      <span
        role="status"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap px-2 py-1 text-xs font-normal text-white bg-[#1A1A1A] rounded-md transition-opacity ${
          copied ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {copied ? 'Copied!' : ''}
      </span>
    </span>
  );
}

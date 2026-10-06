import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

export interface ActionMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionMenuProps {
  /** Accessible name, e.g. "Actions for Zumba Fitness 2026". */
  label: string;
  items: ActionMenuItem[];
}

// "⋯" row menu. The list is `fixed` (so table scroll containers can't clip it) and follows its button.
export default function ActionMenu({ label, items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number; up: boolean }>({ top: 0, right: 0, up: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Keeps the fixed menu attached to its button, including while the page scrolls.
  const place = useCallback(() => {
    if (!buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const up = window.innerHeight - r.bottom < items.length * 40 + 24;
    setPos({ top: up ? r.top - 4 : r.bottom + 4, right: window.innerWidth - r.right, up });
  }, [items.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const list = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
        const i = list.indexOf(document.activeElement as HTMLButtonElement);
        list[(i + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length]?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title="More actions"
        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
          open ? 'bg-[#F3F4F6] text-[#1A1A1A]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'
        }`}
      >
        <Icon icon="solar:menu-dots-bold" width={20} height={20} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={{ right: pos.right, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
            className="fixed z-50 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 h-10 text-sm text-left transition-colors focus:outline-none ${
                  item.destructive ? 'text-[#DC2626] hover:bg-[#FEF2F2] focus-visible:bg-[#FEF2F2]' : 'text-[#374151] hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB]'
                }`}
              >
                <Icon icon={item.icon} width={18} height={18} className="flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

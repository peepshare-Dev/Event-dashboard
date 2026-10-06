import Button from '../../ui/Button';

export interface ActionBarAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface StickyActionBarProps {
  /** Left side: the required-fields note, or a validation summary. */
  note: React.ReactNode;
  /** Least prominent action (Cancel). */
  tertiary?: ActionBarAction;
  secondary?: ActionBarAction;
  primary: ActionBarAction;
  /** Matches the page content's max width so the buttons line up with the cards. */
  maxWidth?: string;
}

// Stays pinned to the bottom of the scrolling page while the form scrolls behind it.
// Being `sticky` (not `fixed`) it keeps its own space at the end, so it never covers the last field.
export default function StickyActionBar({ note, tertiary, secondary, primary, maxWidth = 'max-w-[960px]' }: StickyActionBarProps) {
  const others = [tertiary && { ...tertiary, variant: 'ghost' as const }, secondary && { ...secondary, variant: 'secondary' as const }].filter(
    (a): a is ActionBarAction & { variant: 'ghost' | 'secondary' } => Boolean(a),
  );
  return (
    <div data-action-bar className="sticky bottom-0 z-20 px-4 sm:px-6 lg:px-8 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-4 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_16px_rgba(16,24,40,0.06)]">
      <div className={`${maxWidth} mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="text-xs sm:text-sm text-[#6B7280] min-w-0">{note}</div>
        {/* Phones: primary on its own full-width row, the rest share the row below. */}
        <div className={`grid gap-2 sm:flex sm:items-center sm:gap-3 flex-shrink-0 ${others.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {others.map((a) => (
            <Button key={a.label} variant={a.variant} onClick={a.onClick} disabled={a.disabled} className="h-11 sm:h-10 sm:px-5">
              {a.label}
            </Button>
          ))}
          <Button onClick={primary.onClick} disabled={primary.disabled} className={`h-11 sm:h-10 sm:px-5 order-first sm:order-none ${others.length > 1 ? 'col-span-2' : ''}`}>
            {primary.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

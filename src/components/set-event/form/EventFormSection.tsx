import { Icon } from '@iconify/react';

interface EventFormSectionProps {
  /** Anchor id, so other sections (or validation) can scroll here. */
  id: string;
  icon: string;
  title: string;
  description: string;
  /** Extra controls on the right of the section header. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

// One card per group of related fields on the Create / Edit Event page.
export default function EventFormSection({ id, icon, title, description, actions, children }: EventFormSectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <header className="flex flex-wrap items-start gap-3 px-4 sm:px-6 pt-5 pb-4 border-b border-[#F0F0F0]">
        <span className="w-10 h-10 rounded-[10px] bg-[#FFF0E8] text-[#FF6115] flex items-center justify-center flex-shrink-0">
          <Icon icon={icon} width={22} height={22} />
        </span>
        <div className="flex-1 min-w-[180px]">
          <h2 id={headingId} className="text-[17px] font-semibold text-[#1A1A1A] leading-snug">
            {title}
          </h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>
        </div>
        {actions && <div className="flex items-center gap-1 sm:gap-2 ml-auto">{actions}</div>}
      </header>
      <div className="px-4 sm:px-6 py-5 sm:py-6">{children}</div>
    </section>
  );
}

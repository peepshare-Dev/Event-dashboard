interface StatusTabsProps<T extends string> {
  tabs: readonly T[];
  active: T;
  counts?: Partial<Record<T, number>>;
  onChange: (tab: T) => void;
  className?: string;
}

// Pill tabs: the active tab gets a soft orange pill, inactive counts sit in a gray circle.
export default function StatusTabs<T extends string>({ tabs, active, counts, onChange, className = '' }: StatusTabsProps<T>) {
  return (
    <div className={`overflow-x-auto -mx-1 px-1 ${className}`}>
      <div role="tablist" className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = tab === active;
          const count = counts?.[tab];
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-[15px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
                isActive ? 'bg-[#FFF0E8] text-[#FF6115] font-semibold' : 'text-[#9CA3AF] hover:text-[#4B5563]'
              }`}
            >
              {tab}
              {count !== undefined &&
                (isActive ? (
                  <span className="text-sm font-semibold">{count}</span>
                ) : (
                  <span className="min-w-6 h-6 px-1.5 rounded-full bg-[#F3F4F6] text-[10px] text-[#9CA3AF] flex items-center justify-center">
                    {count}
                  </span>
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

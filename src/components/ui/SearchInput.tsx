import { Icon } from '@iconify/react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Icon
        icon="solar:magnifer-linear"
        width={16}
        height={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 pl-9 pr-9 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#6B7280]"
        >
          <Icon icon="solar:close-linear" width={14} height={14} />
        </button>
      )}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]/40 ${
          checked ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-3.5' : ''
          }`}
        />
      </button>
      <span className="text-sm text-[#374151]">{label}</span>
    </label>
  );
}

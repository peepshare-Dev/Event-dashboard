interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Keep the label for screen readers only (e.g. in a table row). */
  hideLabel?: boolean;
  /** Id of text explaining why it's disabled. */
  describedBy?: string;
}

export default function Toggle({ checked, onChange, label, disabled, hideLabel, describedBy }: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-3 select-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        aria-describedby={describedBy}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-3.5' : ''
          }`}
        />
      </button>
      <span className={hideLabel ? 'sr-only' : 'text-sm text-[#374151]'}>{label}</span>
    </label>
  );
}

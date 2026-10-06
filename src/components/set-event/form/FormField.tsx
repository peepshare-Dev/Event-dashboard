import { useId } from 'react';
import { Icon } from '@iconify/react';

export const inputClass = (invalid?: boolean) =>
  `w-full h-12 px-3 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${
    invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
  }`;

export const textareaClass = (invalid?: boolean) =>
  `w-full px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-white border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${
    invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
  }`;

interface FormFieldProps {
  label: string;
  required?: boolean;
  /** Short helper text under the label. */
  hint?: string;
  error?: string;
  className?: string;
  /** Use a fieldset/legend for multi-control fields. */
  asGroup?: boolean;
  /** Heading-style label with an icon, for a group of related controls inside a section. */
  icon?: string;
  children: (id: string) => React.ReactNode;
}

// Label (with * for required), control, then the inline error.
export default function FormField({ label, required, hint, error, className = '', asGroup, icon, children }: FormFieldProps) {
  const id = useId();
  const labelText = (
    <>
      {icon && <Icon icon={icon} width={18} height={18} className="inline-block align-[-4px] mr-2 text-[#6B7280]" aria-hidden="true" />}
      {label}
      {required && (
        <>
          <span className="text-[#DC2626] ml-0.5" aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </>
  );
  const labelClass = `block text-[#1A1A1A] ${icon ? 'text-[15px] font-semibold' : 'text-sm font-medium'}`;
  const body = (
    <>
      {hint && <p className={`-mt-1 mb-3 text-xs text-[#6B7280] ${icon ? 'pl-[26px]' : ''}`}>{hint}</p>}
      {children(id)}
      {error && (
        <p className="mt-2 flex items-start gap-1 text-xs text-[#DC2626]">
          {error}
        </p>
      )}
    </>
  );
  return asGroup ? (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className={`${labelClass} mb-2`}>{labelText}</legend>
      {body}
    </fieldset>
  ) : (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className={`${labelClass} mb-2`}>
        {labelText}
      </label>
      {body}
    </div>
  );
}

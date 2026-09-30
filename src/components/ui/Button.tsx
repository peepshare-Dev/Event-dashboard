import { Icon } from '@iconify/react';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-[#FF6115] hover:bg-[#E5540F] text-white',
  secondary: 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]',
  destructive: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  /** Fully rounded, as used for page-level CTAs like Create Event. */
  pill?: boolean;
}

export default function Button({ variant = 'primary', icon, pill, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 h-10 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 disabled:opacity-40 disabled:cursor-not-allowed ${
        pill ? 'rounded-full px-5' : 'rounded-[10px] px-4'
      } ${VARIANT_STYLES[variant]} ${className}`}
    >
      {icon && <Icon icon={icon} width={16} height={16} />}
      {children}
    </button>
  );
}

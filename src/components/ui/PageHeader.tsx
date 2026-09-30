import { Icon } from '@iconify/react';

interface PageHeaderProps {
  title: string;
  icon?: string;
  description?: string;
  actions?: React.ReactNode;
}

// Card-level title row: outline icon + title on the left, primary action on the right.
export default function PageHeader({ title, icon, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <Icon icon={icon} width={24} height={24} className="text-[#374151] flex-shrink-0" />}
        <div className="min-w-0">
          <h1 className="text-lg font-medium text-[#1A1A1A] leading-tight truncate">{title}</h1>
          {description && <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

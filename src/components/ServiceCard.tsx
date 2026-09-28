import { Icon } from '@iconify/react';
import type { ServiceConfig } from '../data/mock';

interface ServiceCardProps {
  service: ServiceConfig;
  onOpen: (id: string) => void;
}

export default function ServiceCard({ service, onOpen }: ServiceCardProps) {
  const isStaging = service.environment === 'Staging';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isStaging ? 'bg-amber-50' : 'bg-[#FFF0E8]'
          }`}
        >
          <Icon icon={service.icon} width={22} height={22} className={isStaging ? 'text-amber-600' : 'text-[#FF6115]'} />
        </div>
        {isStaging && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide flex-shrink-0">
            <Icon icon="solar:test-tube-linear" width={11} height={11} />
            Staging
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-[#1A1A1A]">{service.name}</h3>
        <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">{service.description}</p>
      </div>

      <button
        onClick={() => onOpen(service.id)}
        className={`w-full h-10 text-sm font-medium rounded-lg transition-colors ${
          isStaging ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-[#FF6115] hover:bg-[#E5540F] text-white'
        }`}
      >
        Open Service
      </button>
    </div>
  );
}

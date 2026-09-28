import { Icon } from '@iconify/react';
import Header from '../components/Header';
import type { ServiceConfig } from '../data/mock';

interface ServicePlaceholderProps {
  service: ServiceConfig;
  onSwitchService: () => void;
  onLogout: () => void;
}

export default function ServicePlaceholder({ service, onSwitchService, onLogout }: ServicePlaceholderProps) {
  const isStaging = service.environment === 'Staging';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header showLogo onSwitchService={onSwitchService} onLogout={onLogout} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center space-y-4">
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
              isStaging ? 'bg-amber-50' : 'bg-[#FFF0E8]'
            }`}
          >
            <Icon icon={service.icon} width={28} height={28} className={isStaging ? 'text-amber-600' : 'text-[#FF6115]'} />
          </div>

          {isStaging && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              <Icon icon="solar:test-tube-linear" width={11} height={11} />
              Staging
            </span>
          )}

          <div>
            <h1 className="text-xl font-semibold text-[#1A1A1A]">{service.name}</h1>
            <p className="text-sm text-[#6B7280] mt-2">You are now accessing {service.name}.</p>
          </div>

          <button
            onClick={onSwitchService}
            className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors font-medium"
          >
            Switch Service
          </button>
        </div>
      </main>
    </div>
  );
}

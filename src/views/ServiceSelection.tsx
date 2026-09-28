import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import type { ServiceConfig } from '../data/mock';

interface ServiceSelectionProps {
  services: ServiceConfig[];
  onOpenService: (id: string) => void;
  onSwitchService: () => void;
  onLogout: () => void;
}

export default function ServiceSelection({ services, onOpenService, onSwitchService, onLogout }: ServiceSelectionProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header showLogo onSwitchService={onSwitchService} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Select Service</h1>
            <p className="text-sm text-[#6B7280] mt-1">Choose a service to continue.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onOpen={onOpenService} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

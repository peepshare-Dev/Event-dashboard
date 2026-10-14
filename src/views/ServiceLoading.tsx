import { useEffect } from 'react';
import type { ServiceConfig } from '../data/mock';
import { useT } from '@/i18n';

interface ServiceLoadingProps {
  service: ServiceConfig;
  onComplete: () => void;
}

export default function ServiceLoading({ service, onComplete }: ServiceLoadingProps) {
  const t = useT();
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FF6115] flex items-center justify-center">
          <span className="text-white text-lg font-bold">PS</span>
        </div>
        <div className="w-8 h-8 border-[3px] border-[#FFD9C2] border-t-[#FF6115] rounded-full animate-spin" />
        <div>
          <div className="font-bold text-base text-[#1A1A1A]">PEEP SHARE</div>
          <p className="text-sm text-[#6B7280] mt-1">{t('Opening {name}...', { name: t(service.name) })}</p>
        </div>
      </div>
    </div>
  );
}

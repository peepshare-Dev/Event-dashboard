import { useState } from 'react';
import LoginPage from './views/LoginPage';
import ServiceSelection from './views/ServiceSelection';
import ServiceLoading from './views/ServiceLoading';
import ServicePlaceholder from './views/ServicePlaceholder';
import EventDashboardApp from './views/EventDashboardApp';
import PeepSyncApp from './views/PeepSyncApp';
import { services } from './data/mock';

type Screen =
  | { name: 'services' }
  | { name: 'loading'; serviceId: string }
  | { name: 'service'; serviceId: string };

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: 'services' });

  const handleLogin = () => {
    setIsAuthenticated(true);
    setScreen({ name: 'services' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setScreen({ name: 'services' });
  };

  const handleSwitchService = () => setScreen({ name: 'services' });

  const handleOpenService = (serviceId: string) => setScreen({ name: 'loading', serviceId });

  // Unauthenticated users always see the login screen, regardless of screen state.
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (screen.name === 'loading') {
    const service = services.find((s) => s.id === screen.serviceId);
    if (service) {
      return (
        <ServiceLoading
          service={service}
          onComplete={() => setScreen({ name: 'service', serviceId: service.id })}
        />
      );
    }
  }

  if (screen.name === 'service') {
    const service = services.find((s) => s.id === screen.serviceId);
    if (service) {
      if (service.id === 'event-dashboard') {
        return <EventDashboardApp onSwitchService={handleSwitchService} onLogout={handleLogout} />;
      }
      if (service.id === 'peep-sync') {
        return <PeepSyncApp onSwitchService={handleSwitchService} onLogout={handleLogout} />;
      }
      return (
        <ServicePlaceholder service={service} onSwitchService={handleSwitchService} onLogout={handleLogout} />
      );
    }
  }

  return (
    <ServiceSelection
      services={services}
      onOpenService={handleOpenService}
      onSwitchService={handleSwitchService}
      onLogout={handleLogout}
    />
  );
}

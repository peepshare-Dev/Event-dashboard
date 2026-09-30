import MembersAccess from '../../MembersAccess';
import SectionShell from './SectionShell';
import type { SetEvent } from '../../../data/setEvents';

// Reuses the Event Dashboard's Members & Access screen (mock members, not yet per event).
export default function EventUsers({ event, onBack }: { event: SetEvent; onBack: () => void }) {
  return (
    <SectionShell event={event} title="User management" onBack={onBack} flush>
      <MembersAccess />
    </SectionShell>
  );
}

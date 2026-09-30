import { useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import NewLinkModal from '../../../components/set-event/NewLinkModal';
import { CopyButton, QrCodeImage, downloadQrPng } from '../../../components/set-event/qr';
import SectionShell from './SectionShell';
import { formatEventDateTime, type QrLink, type SetEvent } from '../../../data/setEvents';

interface EventQrLinksProps {
  event: SetEvent;
  onBack: () => void;
  onChange: (links: QrLink[], message: string) => void;
}

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const COLUMNS = ['Link name', 'URL', 'QR Code', 'Date added'];
const cellClass = 'px-5 first:pl-6 text-[13px] text-[#1A1A1A] border-r border-[#F0F0F0]';

export default function EventQrLinks({ event, onBack, onChange }: EventQrLinksProps) {
  const links = event.details?.qrLinks ?? [];
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<QrLink | null>(null);

  const newLinkButton = (
    <Button pill icon="solar:add-linear" onClick={() => setCreating(true)} className="w-full sm:w-auto">
      New link
    </Button>
  );

  return (
    <SectionShell event={event} title="QR Code / Scanner" onBack={onBack} actions={newLinkButton} flush>
      {links.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 px-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
            <Icon icon="solar:qr-code-linear" width={24} height={24} className="text-[#FF6115]" />
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A]">No links yet</p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            Create a link to get a QR code attendees can scan — for registration, check-in, or a survey.
          </p>
          <div className="mt-4">{newLinkButton}</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {COLUMNS.map((col) => (
                  <th key={col} scope="col" className="h-11 px-5 first:pl-6 text-left text-xs font-medium text-[#374151] whitespace-nowrap border-r border-[#F0F0F0]">
                    {col}
                  </th>
                ))}
                <th scope="col" className="w-16">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {links.map((link) => (
                <tr key={link.id} className="h-[76px] hover:bg-[#FAFAFA] transition-colors">
                  <td className={`${cellClass} font-medium whitespace-nowrap`}>{link.name}</td>
                  <td className={`${cellClass} max-w-[340px]`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[#1A1A1A] hover:text-[#FF6115] hover:underline"
                        title={link.url}
                      >
                        {link.url}
                      </a>
                      <CopyButton text={link.url} label={`Copy URL for ${link.name}`} />
                    </div>
                  </td>
                  <td className={cellClass}>
                    <div className="flex items-center gap-3">
                      <QrCodeImage value={link.url} label={`QR code for ${link.name}`} />
                      <button
                        type="button"
                        onClick={() => downloadQrPng(link.url, `${event.name}-${link.name}`)}
                        aria-label={`Download QR code for ${link.name}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-[#FF6115] bg-[#FFF0E8] hover:bg-[#FFE4D4] rounded-full transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                      >
                        <Icon icon="solar:download-linear" width={14} height={14} />
                        Download
                      </button>
                    </div>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>{formatEventDateTime(link.createdAt)}</td>
                  <td className="px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setRemoving(link)}
                      aria-label={`Delete ${link.name}`}
                      title={`Delete ${link.name}`}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" width={20} height={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <NewLinkModal
          baseUrl={`https://peepshare.com/e/${event.id}/`}
          existingNames={links.map((l) => l.name)}
          onCreate={({ name, url }) => {
            const link: QrLink = { id: `qr-${event.id}-${Date.now()}`, name, url, createdAt: nowLocal() };
            onChange([link, ...links], `Link “${name}” created`);
            setCreating(false);
          }}
          onClose={() => setCreating(false)}
        />
      )}
      {removing && (
        <DeleteConfirmationModal
          title="Delete link?"
          confirmLabel="Delete link"
          message={
            <>
              <span className="font-semibold text-[#1A1A1A]">{removing.name}</span> will be removed. Printed QR codes for this
              link will stop being listed here.
            </>
          }
          onConfirm={() => {
            onChange(links.filter((l) => l.id !== removing.id), `Link “${removing.name}” deleted`);
            setRemoving(null);
          }}
          onClose={() => setRemoving(null)}
        />
      )}
    </SectionShell>
  );
}

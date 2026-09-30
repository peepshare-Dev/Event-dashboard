import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { QrCodeImage } from './qr';

interface NewLinkModalProps {
  /** Suggested base URL for this event, e.g. `https://peepshare.com/e/4827/` */
  baseUrl: string;
  existingNames: string[];
  onCreate: (link: { name: string; url: string }) => void;
  onClose: () => void;
}

function validUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const fieldClass = (invalid: boolean) =>
  `w-full h-11 px-3 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${
    invalid ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
  }`;

export default function NewLinkModal({ baseUrl, existingNames, onCreate, onClose }: NewLinkModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState(baseUrl);
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const nameError = !trimmedName
    ? 'Enter a link name.'
    : existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())
      ? 'A link with this name already exists.'
      : '';
  const urlError = validUrl(url) ? '' : 'Enter a full URL starting with https://';
  const canCreate = !nameError && !urlError;

  const create = () => {
    setTouched(true);
    if (canCreate) onCreate({ name: trimmedName, url: url.trim() });
  };

  return (
    <Modal
      title="New link"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="solar:add-linear" onClick={create}>
            Create link
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
        className="space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[#374151]">Link name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Registration page"
            aria-invalid={touched && Boolean(nameError)}
            className={fieldClass(touched && Boolean(nameError))}
          />
          {touched && nameError && <span className="block text-xs text-[#DC2626]">{nameError}</span>}
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[#374151]">URL</span>
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            aria-invalid={touched && Boolean(urlError)}
            className={fieldClass(touched && Boolean(urlError))}
          />
          {touched && urlError ? (
            <span className="block text-xs text-[#DC2626]">{urlError}</span>
          ) : (
            <span className="block text-xs text-[#6B7280]">Registration page, check-in scanner, survey or any web page.</span>
          )}
        </label>
        {/* Hidden submit so Enter creates the link. */}
        <button type="submit" hidden />

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] border border-[#F0F0F0]">
          {validUrl(url) ? (
            <QrCodeImage value={url.trim()} size={64} label="QR code preview" />
          ) : (
            <span className="w-16 h-16 rounded-md bg-[#F3F4F6] flex-shrink-0" aria-hidden="true" />
          )}
          <p className="text-xs text-[#6B7280]">A QR code is generated from the URL and can be downloaded from the table.</p>
        </div>
      </form>
    </Modal>
  );
}

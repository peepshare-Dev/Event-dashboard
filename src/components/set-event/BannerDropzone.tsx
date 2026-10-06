import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';

export interface BannerFile {
  url: string;
  name: string;
}

interface BannerDropzoneProps {
  value: BannerFile | null;
  onChange: (banner: BannerFile | null) => void;
  /** Heading inside the drop area, e.g. which placement this banner is for. */
  title?: string;
  /** Suggested size, shown under the formats. */
  suggestedSize?: string;
  /** Preview shape once a file is chosen: 1:1, 2:1, the app banner's 1432 × 480, or a 3:4 portrait. */
  aspect?: 'square' | 'wide' | 'banner' | 'portrait';
  /** Uploads the file (shows progress and upload errors). Without it the file is used locally. */
  onUpload?: (file: File) => Promise<BannerFile>;
  invalid?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_BYTES = 50 * 1024 * 1024;

export default function BannerDropzone({
  value,
  onChange,
  title = 'Choose a file or drag & drop it here',
  suggestedSize = '1200 × 1200 px (1:1)',
  aspect = 'square',
  onUpload,
  invalid,
}: BannerDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return setError('Only JPEG and PNG images are supported.');
    if (file.size > MAX_BYTES) return setError('The file is larger than 50MB.');
    setError('');
    if (!onUpload) return onChange({ url: URL.createObjectURL(file), name: file.name });
    setUploading(true);
    onUpload(file)
      .then(onChange)
      .catch(() => setError('Upload failed. Check your connection and try again.'))
      .finally(() => setUploading(false));
  };

  const browse = () => inputRef.current?.click();

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {uploading ? (
        <div role="status" className="h-full rounded-2xl border-2 border-dashed border-[#FFB38F] bg-[#FFF5EF] px-4 py-10 flex flex-col items-center justify-center text-center">
          <Icon icon="solar:refresh-linear" width={28} height={28} className="text-[#FF6115] animate-spin" />
          <p className="mt-3 text-sm font-medium text-[#1A1A1A]">Uploading image…</p>
        </div>
      ) : value ? (
        <div className="h-full border border-[#E5E7EB] rounded-2xl p-4 flex flex-col items-center gap-3">
          <img
            src={value.url}
            alt={`${title} preview`}
            className={`w-full object-cover rounded-xl bg-[#F9FAFB] ${
              aspect === 'banner' ? 'aspect-[1432/480]' : aspect === 'portrait' ? 'aspect-[3/4] max-w-[200px]' : aspect === 'wide' ? 'aspect-[2/1] max-w-[320px]' : 'aspect-square max-w-[160px]'
            }`}
          />
          <div className="w-full min-w-0 text-center">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{value.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{title}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={browse} className="h-9 px-4 text-sm text-[#374151] border border-[#D1D5DB] rounded-full hover:bg-[#F9FAFB]">
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="h-9 px-4 text-sm text-[#DC2626] border border-[#FECACA] rounded-full hover:bg-[#FEF2F2]"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={`h-full rounded-2xl border-2 border-dashed px-4 py-8 flex flex-col items-center text-center transition-colors ${
            dragging ? 'border-[#FF6115] bg-[#FFF5EF]' : error || invalid ? 'border-[#FCA5A5]' : 'border-[#E5E7EB]'
          }`}
        >
          <Icon icon="solar:gallery-wide-linear" width={48} height={48} className="text-[#374151]" />
          <p className="mt-4 text-[15px] text-[#1A1A1A]">{title}</p>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            JPEG, PNG formats, up to 50MB,
            <br />
            Suggested: {suggestedSize}
          </p>
          <button
            type="button"
            onClick={browse}
            className="mt-5 h-10 w-full max-w-[280px] text-[15px] text-[#1A1A1A] bg-white border border-[#D1D5DB] rounded-full hover:bg-[#F9FAFB] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            Browse File
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}

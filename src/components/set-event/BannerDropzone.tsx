import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';

export interface BannerFile {
  url: string;
  name: string;
}

interface BannerDropzoneProps {
  value: BannerFile | null;
  onChange: (banner: BannerFile | null) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_BYTES = 50 * 1024 * 1024;

export default function BannerDropzone({ value, onChange }: BannerDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return setError('Only JPEG and PNG images are supported.');
    if (file.size > MAX_BYTES) return setError('The file is larger than 50MB.');
    setError('');
    onChange({ url: URL.createObjectURL(file), name: file.name });
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

      {value ? (
        <div className="border border-[#E5E7EB] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <img src={value.url} alt="Banner preview" className="w-full sm:w-40 aspect-square object-cover rounded-xl bg-[#F9FAFB]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{value.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Banner image</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={browse} className="h-9 px-4 text-sm text-[#374151] border border-[#D1D5DB] rounded-full hover:bg-[#F9FAFB]">
              Change
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
          className={`rounded-2xl border-2 border-dashed px-4 py-10 flex flex-col items-center text-center transition-colors ${
            dragging ? 'border-[#FF6115] bg-[#FFF5EF]' : error ? 'border-[#FCA5A5]' : 'border-[#E5E7EB]'
          }`}
        >
          <Icon icon="solar:gallery-wide-linear" width={48} height={48} className="text-[#374151]" />
          <p className="mt-4 text-[15px] text-[#1A1A1A]">Choose a file or drag &amp; drop it here</p>
          <p className="mt-2 text-sm sm:text-[15px] text-[#9CA3AF]">JPEG, PNG formats, up to 50MB, Suggested: 1200 × 1200 px (1:1)</p>
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

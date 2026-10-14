import { useEffect, useMemo, useRef, useState } from 'react';
import { events, users } from '../data/mock';
import { Icon } from '@iconify/react';
import SearchInput from '../components/ui/SearchInput';
import FilterButton from '../components/ui/FilterButton';
import FilterSelect from '../components/ui/FilterSelect';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import ActionMenu from '../components/ui/ActionMenu';
import DeleteConfirmationModal from '../components/ui/DeleteConfirmationModal';
import { downloadQrPng } from '../components/set-event/qr';
import { useT } from '@/i18n';

export type SharingType = 'Public Link' | 'Private' | 'Restricted' | 'Expired';

export interface Collection {
  id: number;
  name: string;
  owner: string;
  ownerAvatar: string;
  linkedEvent: string;
  files: number;
  storageGb: number;
  /** Display label, e.g. "Today", "2 days ago". */
  lastUpdated: string;
  /** Local date-time of the last change, `YYYY-MM-DDTHH:mm` — what the list sorts by. */
  updatedAt: string;
  sharing: SharingType;
  status: 'Active' | 'Archived';
  description: string;
}

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const SHARING_COLORS: Record<SharingType, string> = {
  'Public Link': 'bg-green-50 text-green-700',
  'Private': 'bg-gray-100 text-gray-600',
  'Restricted': 'bg-[#FFF0E8] text-[#FF6115]',
  'Expired': 'bg-red-50 text-red-600',
};

const FILE_TYPES = ['Photos', 'Videos', 'Documents', 'Audio', 'Other'] as const;
type FileType = typeof FILE_TYPES[number];
const FILE_TYPE_OPTIONS = ['All', ...FILE_TYPES] as const;
const FILE_STATUSES = ['Uploaded', 'Processing', 'Failed'] as const;
type FileStatus = typeof FILE_STATUSES[number];
const FILE_STATUS_OPTIONS = ['All', ...FILE_STATUSES] as const;
const FILES_PER_PAGE = 24;

export const mockCollections: Collection[] = [
  { id: 1, name: 'MONOMAX Event Photos', owner: 'Aom Siriporn', ownerAvatar: 'AS', linkedEvent: 'MONOMAX Event', files: 8520, storageGb: 18.2, lastUpdated: 'Today', updatedAt: '2026-10-13T09:30', sharing: 'Public Link', status: 'Active', description: 'All photos from MONOMAX Event 5-6 Sep 2026' },
  { id: 2, name: 'Pattaya Countdown Photos', owner: 'Beam Natthawut', ownerAvatar: 'BN', linkedEvent: 'Pattaya Countdown 2027', files: 12820, storageGb: 24.5, lastUpdated: 'Yesterday', updatedAt: '2026-10-12T16:40', sharing: 'Private', status: 'Active', description: 'Photos for Pattaya Countdown event' },
  { id: 3, name: 'PEEP Sport Day Album', owner: 'Mint Wanida', ownerAvatar: 'MW', linkedEvent: 'PEEP Sport Day', files: 3240, storageGb: 8.4, lastUpdated: '2 days ago', updatedAt: '2026-10-11T11:05', sharing: 'Restricted', status: 'Active', description: 'Sport Day photos and videos' },
  { id: 4, name: 'Event Documents', owner: 'Admin', ownerAvatar: 'ST', linkedEvent: 'MONOMAX Event', files: 42, storageGb: 0.85, lastUpdated: '3 days ago', updatedAt: '2026-10-10T14:20', sharing: 'Restricted', status: 'Active', description: 'Contracts, schedules and documents' },
  { id: 5, name: 'Songkran Walk Photos', owner: 'Beam Natthawut', ownerAvatar: 'BN', linkedEvent: 'Songkran Photo Walk', files: 5100, storageGb: 10.2, lastUpdated: '5 days ago', updatedAt: '2026-10-08T10:00', sharing: 'Expired', status: 'Archived', description: 'Songkran 2026 walk event photos' },
  { id: 6, name: 'Behind the Scenes', owner: 'Aom Siriporn', ownerAvatar: 'AS', linkedEvent: 'MONOMAX Event', files: 240, storageGb: 1.4, lastUpdated: 'Today', updatedAt: '2026-10-13T08:15', sharing: 'Private', status: 'Active', description: 'BTS footage and candid shots' },
];

interface CollectionFile {
  id: number;
  name: string;
  type: FileType;
  sizeMb: number;
  date: string;
  uploader: string;
  status: FileStatus;
  color: string;
}

const FILE_COLORS = ['#FFE4D6', '#D6E8FF', '#D6FFE8', '#EDD6FF', '#FFF9D6', '#FFD6D6', '#D6FFF9', '#FFD6F9'];
const FILE_EXT: Record<FileType, string> = { Photos: 'jpg', Videos: 'mp4', Documents: 'pdf', Audio: 'mp3', Other: 'zip' };
const FILE_ICON: Record<FileType, string> = {
  Photos: '📷',
  Videos: '🎬',
  Documents: '📄',
  Audio: '🎵',
  Other: '📦',
};

/** Mock files for a collection: mostly photos, a few other types; same result every time. */
function mockFiles(collection: Collection): CollectionFile[] {
  return Array.from({ length: collection.files }, (_, i) => {
    const type: FileType = i % 131 === 130 ? 'Other' : i % 97 === 96 ? 'Audio' : i % 50 === 49 ? 'Documents' : i % 20 === 19 ? 'Videos' : 'Photos';
    const seed = (i * 7919 + collection.id * 104729) % 1000;
    return {
      id: i + 1,
      name: `DSC_${String(1000 + i).padStart(4, '0')}.${FILE_EXT[type]}`,
      type,
      sizeMb: Math.round((type === 'Videos' ? 40 + seed / 10 : 2 + (seed / 1000) * 5) * 10) / 10,
      date: '5 Sep 2026',
      uploader: i % 3 === 0 ? 'Mint Wanida' : 'Beam Natthawut',
      status: i % 53 === 52 ? 'Failed' : i % 37 === 36 ? 'Processing' : 'Uploaded',
      color: FILE_COLORS[i % FILE_COLORS.length],
    };
  });
}

const STATUS_STYLE: Record<FileStatus, string> = {
  Uploaded: 'bg-green-50 text-green-700',
  Processing: 'bg-amber-50 text-amber-700',
  Failed: 'bg-red-50 text-red-600',
};


export default function Collections({ onPhotoSync }: { onPhotoSync?: () => void }) {
  const t = useT();
  const [collections, setCollections] = useState(mockCollections);
  const [search, setSearch] = useState('');
  const [sharingFilter, setSharingFilter] = useState<SharingType | 'All'>('All');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [shareCollection, setShareCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const [accessCollection, setAccessCollection] = useState<Collection | null>(null);
  // People each collection is shared with (besides its owner), by collection id.
  const [accessById, setAccessById] = useState<Record<number, AccessEntry[]>>(() =>
    Object.fromEntries(mockCollections.map((c) => [c.id, sampleAccess(c)])),
  );
  const accessOf = (c: Collection) => accessById[c.id] ?? [];

  const updateCollection = (id: number, patch: Partial<Collection>) => {
    const apply = (c: Collection) => (c.id === id ? { ...c, ...patch, lastUpdated: 'Just now', updatedAt: nowLocal() } : c);
    setCollections((list) => list.map(apply));
    setSelectedCollection((c) => (c ? apply(c) : c));
  };

  // Sharing changes the collection's Sharing badge, adds the chosen people, and counts as an update.
  const saveSharing = (sharing: SharingType, people: AccessEntry[]) => {
    if (!shareCollection) return;
    const id = shareCollection.id;
    setAccessById((all) => {
      const current = all[id] ?? [];
      const added = people.filter((p) => !current.some((x) => x.id === p.id) && p.name !== shareCollection.owner);
      return { ...all, [id]: [...current.map((x) => people.find((p) => p.id === x.id) ?? x), ...added] };
    });
    updateCollection(id, { sharing });
    setShareCollection(null);
  };

  const saveAccess = (collection: Collection, people: AccessEntry[]) => {
    setAccessById((all) => ({ ...all, [collection.id]: people }));
    // With nobody left, a restricted collection is just private.
    if (people.length === 0 && collection.sharing === 'Restricted') updateCollection(collection.id, { sharing: 'Private' });
  };

  // Most recently updated first; equal times keep their list order (new collections are added at the top).
  const filtered = [...collections].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')).filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.linkedEvent.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase());
    const matchSharing = sharingFilter === 'All' || c.sharing === sharingFilter;
    return matchSearch && matchSharing;
  });

  if (selectedCollection) {
    return (
      <>
        <CollectionDetail
          collection={selectedCollection}
          onBack={() => setSelectedCollection(null)}
          onShare={() => setShareCollection(selectedCollection)}
          onDelete={() => setDeletingCollection(selectedCollection)}
          onPeopleWithAccess={() => setAccessCollection(selectedCollection)}
          onPhotoSync={onPhotoSync}
        />
        {accessCollection && (
          <PeopleAccessModal
            collection={accessCollection}
            people={accessOf(accessCollection)}
            onChange={(people) => saveAccess(accessCollection, people)}
            onClose={() => setAccessCollection(null)}
          />
        )}
        {deletingCollection && (
          <DeleteConfirmationModal
            title={t('Delete this collection?')}
            confirmLabel={t('Delete Collection')}
            message={
              <>
                <span className="font-semibold text-[#1A1A1A]">{deletingCollection.name}</span>{' '}
                {t('and its {count} files will be deleted. This cannot be undone.', { count: deletingCollection.files.toLocaleString() })}
              </>
            }
            onConfirm={() => {
              setCollections((list) => list.filter((c) => c.id !== deletingCollection.id));
              setSelectedCollection(null);
              setDeletingCollection(null);
            }}
            onClose={() => setDeletingCollection(null)}
          />
        )}
        {/* The detail view returns early, so it needs its own Share modal. */}
        {shareCollection && <ShareModal collection={shareCollection} onClose={() => setShareCollection(null)} onShare={saveSharing} />}
      </>
    );
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{t('Collections')}</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{t('Manage and organize files stored in your PEEP SHARE Cloud')}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium px-4 py-2.5 sm:py-2 rounded-lg transition-colors"
        >
          <Icon icon="solar:add-linear" width={14} height={14} />
          {t('Create Collection')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:min-w-52">
          <Icon icon="solar:magnifer-linear" width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder={t('Search collections...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', 'Public Link', 'Private', 'Restricted', 'Expired'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSharingFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${sharingFilter === s ? 'bg-[#FF6115] border-[#FF6115] text-white' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6115] hover:text-[#FF6115]'}`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table (tablet & desktop) */}
      <div className="hidden sm:block bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Collection Name', 'Owner', 'Linked Event', 'Files', 'Storage', 'Last Updated', 'Sharing', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-[#9CA3AF] text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="solar:folder-linear" width={32} height={32} color="#D1D5DB" />
                      <span>{t('No collections found')}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:folder-linear" width={15} height={15} color="#FF6115" />
                      </div>
                      <button
                        onClick={() => setSelectedCollection(c)}
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors text-left"
                      >
                        {c.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#FF6115]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-[#FF6115]">{c.ownerAvatar}</span>
                      </div>
                      <span className="text-sm text-[#4B5563]">{c.owner}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280]">{c.linkedEvent}</td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563]">{c.files.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563]">{c.storageGb >= 1 ? `${c.storageGb} GB` : `${Math.round(c.storageGb * 1000)} MB`}</td>
                  <td className="px-4 py-3.5 text-sm text-[#9CA3AF]">{t(c.lastUpdated)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SHARING_COLORS[c.sharing]}`}>{t(c.sharing)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t(c.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedCollection(c)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">{t('View')}</button>
                      <button onClick={() => setShareCollection(c)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">{t('Share')}</button>
                      <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">{t('Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards (mobile) */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] text-center py-12 text-[#9CA3AF] text-sm">
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:folder-linear" width={28} height={28} color="#D1D5DB" />
              <span>{t('No collections found')}</span>
            </div>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:folder-linear" width={16} height={16} color="#FF6115" />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setSelectedCollection(c)}
                  className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors text-left"
                >
                  {c.name}
                </button>
                <div className="text-xs text-[#9CA3AF]">{c.linkedEvent}</div>
              </div>
              <span className={`inline-flex flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${SHARING_COLORS[c.sharing]}`}>{t(c.sharing)}</span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-[#4B5563]">
              <span>{t('{count} files', { count: c.files.toLocaleString() })}</span>
              <span>{c.storageGb >= 1 ? `${c.storageGb} GB` : `${Math.round(c.storageGb * 1000)} MB`}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t(c.status)}
              </span>
            </div>

            <div className="text-xs text-[#9CA3AF] mt-2">{t('Updated {date}', { date: t(c.lastUpdated) })}</div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-1">
                <button onClick={() => setSelectedCollection(c)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">{t('View')}</button>
                <button onClick={() => setShareCollection(c)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">{t('Share')}</button>
              </div>
              <button className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">{t('Delete')}</button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateCollectionModal
          onClose={() => setShowCreate(false)}
          onCreate={(c) => {
            setCollections(prev => [c, ...prev]);
            setShowCreate(false);
          }}
        />
      )}

      {shareCollection && (
        <ShareModal collection={shareCollection} onClose={() => setShareCollection(null)} onShare={saveSharing} />
      )}
    </div>
  );
}

function CollectionDetail({ collection, onBack, onShare, onDelete, onPeopleWithAccess, onPhotoSync }: {
  collection: Collection;
  onBack: () => void;
  onShare: () => void;
  onDelete: () => void;
  onPeopleWithAccess: () => void;
  onPhotoSync?: () => void;
}) {
  const t = useT();
  const [view, setView] = useState<'list' | 'gallery'>('gallery');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [fileType, setFileType] = useState<(typeof FILE_TYPE_OPTIONS)[number]>('All');
  const [fileStatus, setFileStatus] = useState<(typeof FILE_STATUS_OPTIONS)[number]>('All');
  const [page, setPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const allFiles = useMemo(() => mockFiles(collection), [collection]);

  const term = search.trim().toLowerCase();
  const files = allFiles.filter(
    (f) => (fileType === 'All' || f.type === fileType) && (fileStatus === 'All' || f.status === fileStatus) && (!term || f.name.toLowerCase().includes(term)),
  );
  const totalPages = Math.max(1, Math.ceil(files.length / FILES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageFiles = files.slice((currentPage - 1) * FILES_PER_PAGE, currentPage * FILES_PER_PAGE);
  const activeFilterCount = (fileType !== 'All' ? 1 : 0) + (fileStatus !== 'All' ? 1 : 0);
  const hasQuery = activeFilterCount > 0 || term !== '';
  // Any change to what's shown goes back to page 1.
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const clearAll = () => {
    setSearch('');
    setFileType('All');
    setFileStatus('All');
    setPage(1);
  };
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showPhotoSync, setShowPhotoSync] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showUploadMenu) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!uploadMenuRef.current?.contains(event.target as Node)) setShowUploadMenu(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowUploadMenu(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showUploadMenu]);

  // Header checkbox (List) and "Select all" (Gallery) select / clear this page.
  const pageIds = pageFiles.map((f) => f.id);
  const pageSelected = pageIds.filter((id) => selectedFiles.includes(id)).length;
  const pageState: CheckState = pageSelected === 0 ? 'off' : pageSelected === pageIds.length ? 'on' : 'mixed';
  const togglePage = () =>
    setSelectedFiles((list) => (pageState === 'on' ? list.filter((id) => !pageIds.includes(id)) : [...new Set([...list, ...pageIds])]));
  const unselectAll = () => setSelectedFiles([]);

  const toggleFile = (id: number) => {
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">{t('Collections')}</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{collection.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:folder-linear" width={24} height={24} color="#FF6115" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">{collection.name}</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">{collection.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div ref={uploadMenuRef} className="relative flex-1 sm:flex-none">
            {/* Split button: Upload opens the file picker; the arrow offers the other ways to upload. */}
            <div className="flex h-9 rounded-lg bg-[#FF6115] text-white">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 pl-3 pr-3 text-sm font-medium rounded-l-lg transition-colors hover:bg-[#E5540F]"
              >
                <Icon icon="solar:add-linear" width={16} height={16} />
                {t('Upload')}
              </button>
              <button
                type="button"
                aria-label={t('More upload options')}
                aria-haspopup="menu"
                aria-expanded={showUploadMenu}
                onClick={() => setShowUploadMenu(open => !open)}
                className="flex w-9 items-center justify-center border-l border-white/30 rounded-r-lg transition-colors hover:bg-[#E5540F]"
              >
                <Icon icon="solar:alt-arrow-down-linear" width={16} height={16} />
              </button>
            </div>

            {showUploadMenu && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+12px)] z-30 w-[calc(100vw-32px)] max-w-[320px] overflow-hidden rounded-2xl border border-[#EEF0F3] bg-white shadow-[0_10px_24px_rgba(17,24,39,0.14)]"
              >
                <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-5">
                  <span className="text-base font-semibold text-[#1A1A1A]">{t('Choose upload method')}</span>
                  <button
                    type="button"
                    aria-label={t('Close upload menu')}
                    onClick={() => setShowUploadMenu(false)}
                    className="flex h-8 w-8 items-center justify-center text-[#98A2B3] transition-colors hover:text-[#4B5563]"
                  >
                    <span aria-hidden="true" className="text-2xl font-light leading-none">×</span>
                  </button>
                </div>
                <div className="px-3 py-2">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUploadMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex h-14 w-full items-center gap-3 rounded-lg px-2 text-left text-base text-[#667085] transition-colors hover:bg-[#FFF7F2] hover:text-[#1A1A1A]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF6115] text-white">
                      <Icon icon="solar:calendar-linear" width={14} height={14} />
                    </span>
                    {t('Upload photos manually')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowUploadMenu(false);
                      setShowPhotoSync(true);
                    }}
                    className="flex h-14 w-full items-center gap-3 rounded-lg px-2 text-left text-base text-[#667085] transition-colors hover:bg-[#FFF7F2] hover:text-[#1A1A1A]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF6115] text-white">
                      <Icon icon="solar:calendar-linear" width={14} height={14} />
                    </span>
                    Photo Sync
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" />
          </div>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Linked Event', value: collection.linkedEvent },
          { label: 'Owner', value: collection.owner },
          { label: 'Files', value: collection.files.toLocaleString() },
          { label: 'Storage', value: `${collection.storageGb} GB` },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="text-xs text-[#9CA3AF] mb-0.5">{t(m.label)}</div>
            <div className="text-sm font-semibold text-[#1A1A1A] truncate">{m.value}</div>
          </div>
        ))}
      </div>

      {/* File browser */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#1A1A1A]">{t('Uploads')}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors"
            >
              <Icon icon="solar:share-linear" width={16} height={16} />
              {t('Share')}
            </button>
            <div role="group" aria-label={t('View')} className="inline-flex rounded-lg border border-[#E5E7EB] overflow-hidden">
              {([
                { value: 'gallery', label: 'Gallery', icon: 'solar:widget-4-linear' },
                { value: 'list', label: 'List', icon: 'solar:list-linear' },
              ] as const).map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setView(v.value)}
                  aria-pressed={view === v.value}
                  aria-label={t(v.label)}
                  title={t(v.label)}
                  className={`w-10 h-9 flex items-center justify-center transition-colors ${view === v.value ? 'bg-[#FF6115] text-white' : 'text-[#6B7280] hover:bg-[#F9FAFB]'}`}
                >
                  <Icon icon={v.icon} width={18} height={18} />
                </button>
              ))}
            </div>
            <ActionMenu
              label={t('More actions for {name}', { name: collection.name })}
              vertical
              items={[
                { label: t('People with access'), icon: 'solar:users-group-rounded-linear', onClick: onPeopleWithAccess },
                { label: t('Download Collection'), icon: 'solar:download-linear', onClick: () => {} },
                { label: t('Delete Collection'), icon: 'solar:trash-bin-trash-linear', onClick: onDelete, destructive: true },
              ]}
            />
          </div>
        </div>

        {/* Search + filters */}
        <div className="px-4 sm:px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <SearchInput value={search} onChange={resetPage(setSearch)} placeholder={t('Search file name...')} className="w-full lg:w-64 flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterButton expanded={filtersOpen} activeCount={activeFilterCount} onClick={() => setFiltersOpen(!filtersOpen)} />
            {filtersOpen && (
              <>
                <FilterSelect label={t('File type')} value={fileType} options={FILE_TYPE_OPTIONS} onChange={resetPage(setFileType)} />
                <FilterSelect label={t('Status')} value={fileStatus} options={FILE_STATUS_OPTIONS} onChange={resetPage(setFileStatus)} />
              </>
            )}
            <button
              onClick={clearAll}
              disabled={!hasQuery}
              className="h-8 px-1 text-xs text-[#FF6115] hover:text-[#E5540F] disabled:cursor-default disabled:hover:text-[#FF6115] transition-colors"
            >
              {t('Clear')}
            </button>
          </div>
        </div>

        {/* Shown once something is selected (pick files with the card / row checkboxes). */}
        {selectedFiles.length > 0 && pageFiles.length > 0 && (
          <div className="mx-4 sm:mx-5 mb-3 px-3 min-h-11 py-1.5 rounded-lg bg-[#FFF5EF] flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm text-[#374151]">{t('{count} selected', { count: selectedFiles.length.toLocaleString() })}</span>
            <button type="button" onClick={unselectAll} className="text-sm text-[#6B7280] hover:text-[#1A1A1A]">
              {t('Unselect all')}
            </button>
            <span className="flex items-center gap-1 sm:ml-auto">
              <button className="text-xs text-[#6B7280] hover:bg-white px-2 py-1.5 rounded transition-colors">{t('Download')}</button>
              <button className="text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded transition-colors">{t('Delete')}</button>
            </span>
          </div>
        )}

        {pageFiles.length === 0 ? (
          <div className="py-16 text-center text-[#9CA3AF] text-sm">
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:document-linear" width={32} height={32} color="#D1D5DB" />
              <span>{hasQuery ? t('No files match your search') : t('No files in this collection yet')}</span>
            </div>
          </div>
        ) : view === 'gallery' ? (
          <>
          {/* Gallery's counterpart to the List header checkbox: selects / clears this page. */}
          <div className="px-4 sm:px-5 pb-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Checkbox state={pageState} onChange={togglePage} label={t('Select all files on this page')} />
              <span className="text-sm text-[#374151]">{t('Select all')}</span>
            </label>
          </div>
          <div className="px-4 sm:px-5 pb-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pageFiles.map((file) => {
              const selected = selectedFiles.includes(file.id);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => toggleFile(file.id)}
                  aria-pressed={selected}
                  className={`group relative text-left rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${selected ? 'border-[#FF6115]' : 'border-transparent'}`}
                >
                  <div className="aspect-square flex items-center justify-center text-4xl" style={{ background: file.color }}>
                    <span aria-hidden="true">{FILE_ICON[file.type]}</span>
                  </div>
                  <span className={`absolute top-2 right-2 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} aria-hidden="true">
                    <CheckBoxVisual state={selected ? 'on' : 'off'} />
                  </span>
                  {file.status !== 'Uploaded' && (
                    <span className={`absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_STYLE[file.status]}`}>{t(file.status)}</span>
                  )}
                  <div className="px-2.5 py-2.5 bg-white">
                    <div className="text-sm text-[#1A1A1A] truncate">{file.name}</div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5">{file.sizeMb} MB</div>
                  </div>
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                </button>
              );
            })}
          </div>
          </>
        ) : (
          <div className="overflow-x-auto border-t border-[#F0F0F0]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-left text-xs font-semibold text-[#6B7280]">
                  <th className="w-10 pl-4 sm:pl-5 py-3">
                    <Checkbox state={pageState} onChange={togglePage} label={t('Select all files on this page')} />
                  </th>
                  <th className="px-4 py-3">{t('File name')}</th>
                  <th className="px-4 py-3">{t('Type')}</th>
                  <th className="px-4 py-3">{t('Size')}</th>
                  <th className="px-4 py-3">{t('Uploaded by')}</th>
                  <th className="px-4 py-3">{t('Date')}</th>
                  <th className="px-4 sm:pr-5 py-3">{t('Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {pageFiles.map((file) => {
                  const selected = selectedFiles.includes(file.id);
                  return (
                    <tr key={file.id} className={selected ? 'bg-[#FFF5EF]' : 'hover:bg-[#FAFAFA]'}>
                      <td className="pl-4 sm:pl-5 py-3">
                        <Checkbox state={selected ? 'on' : 'off'} onChange={() => toggleFile(file.id)} label={t('Select {name}', { name: file.name })} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-lg" style={{ background: file.color }} aria-hidden="true">
                            {FILE_ICON[file.type]}
                          </span>
                          <span className="text-[#1A1A1A] truncate">{file.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">{t(file.type)}</td>
                      <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{file.sizeMb} MB</td>
                      <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{file.uploader}</td>
                      <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{file.date}</td>
                      <td className="px-4 sm:pr-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[file.status]}`}>{t(file.status)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-2 border-t border-[#E5E7EB]">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {showPhotoSync && (
        <PhotoSyncModal
          collection={collection}
          onClose={() => setShowPhotoSync(false)}
          onContinue={() => {
            setShowPhotoSync(false);
            onPhotoSync?.();
          }}
        />
      )}
    </div>
  );
}

function CreateCollectionModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (c: Collection) => void;
}) {
  const t = useT();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [linkedEvent, setLinkedEvent] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const selected = events.find(e => e.name === linkedEvent);
    onCreate({
      id: Date.now(),
      name: name.trim(),
      owner: owner || 'Admin',
      ownerAvatar: 'ST',
      linkedEvent: linkedEvent || '—',
      files: 0,
      storageGb: 0,
      lastUpdated: 'Just now',
      updatedAt: nowLocal(),
      sharing: 'Private',
      status: 'Active',
      description: description || 'No description provided',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-semibold text-[#1A1A1A]">{t('Create Collection')}</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]">
            <Icon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <Field label="Collection Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('e.g. MONOMAX Event Photos')} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t('Describe this collection...')} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] resize-none" />
          </Field>
          <Field label="Owner">
            <select value={owner} onChange={e => setOwner(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]">
              <option value="">{t('Select user')}</option>
              {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Link to Event">
            <select value={linkedEvent} onChange={e => setLinkedEvent(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]">
              <option value="">{t('Select event (optional)')}</option>
              {events.map(e => <option key={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Storage Location">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
              <Icon icon="solar:cloud-linear" width={14} height={14} color="#9CA3AF" />
              <span className="text-sm text-[#6B7280]">PEEP SHARE Cloud</span>
            </div>
          </Field>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">{t('Cancel')}</button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('Create Collection')}
          </button>
        </div>
      </div>
    </div>
  );
}

type CheckState = 'on' | 'off' | 'mixed';

/** Orange rounded checkbox; 'mixed' shows a dash (some of the page selected). */
function CheckBoxVisual({ state }: { state: CheckState }) {
  return (
    <span
      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
        state === 'on' ? 'bg-[#FF6115] border border-[#FF6115]' : state === 'mixed' ? 'bg-white border-2 border-[#FF6115]' : 'bg-white border border-[#D1D5DB]'
      }`}
    >
      {state === 'on' && <Icon icon="solar:check-linear" width={13} height={13} className="text-white" />}
      {state === 'mixed' && <span className="w-2.5 h-0.5 rounded-full bg-[#FF6115]" />}
    </span>
  );
}

function Checkbox({ state, onChange, label }: { state: CheckState; onChange: () => void; label: string }) {
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        checked={state === 'on'}
        ref={(el) => {
          if (el) el.indeterminate = state === 'mixed';
        }}
        onChange={onChange}
        aria-label={label}
        className="peer absolute inset-0 opacity-0 cursor-pointer"
      />
      <span className="rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6115]/40">
        <CheckBoxVisual state={state} />
      </span>
    </span>
  );
}

type DirectoryPicker = () => Promise<{ name: string }>;

// Upload → Photo Sync: pick a folder on this computer; its photos and files sync into this collection.
function PhotoSyncModal({ collection, onClose, onContinue }: { collection: Collection; onClose: () => void; onContinue: (folder: string) => void }) {
  const t = useT();
  const [folder, setFolder] = useState<{ name: string; files?: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Folder picking needs a non-standard attribute React doesn't type.
  useEffect(() => {
    inputRef.current?.setAttribute('webkitdirectory', '');
  }, []);

  const pick = async () => {
    const picker = (window as unknown as { showDirectoryPicker?: DirectoryPicker }).showDirectoryPicker;
    if (picker) {
      try {
        const dir = await picker();
        setFolder({ name: dir.name });
      } catch {
        // Picker closed without choosing.
      }
      return;
    }
    inputRef.current?.click();
  };

  return (
    <Modal
      title={t('Connect data')}
      onClose={onClose}
      maxWidth="sm:max-w-5xl"
      footer={
        folder && (
          <button
            type="button"
            onClick={() => onContinue(folder.name)}
            className="h-10 px-5 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors"
          >
            {t('Continue')}
          </button>
        )
      }
    >
      {/* The source side is wider: it holds the folder name, description and button. */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_auto_minmax(0,1fr)] items-stretch gap-4">
        {/* Source folder */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <span className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:folder-linear" width={20} height={20} className="text-[#6B7280]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate" title={folder?.name}>
              {folder ? folder.name : t('No folder selected')}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {folder?.files != null && `${t('{count} files', { count: folder.files.toLocaleString() })} · `}
              {t("Photos and files in the selected folder will automatically sync to this event's collection.")}
            </p>
          </div>
          <button
            type="button"
            onClick={pick}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors flex-shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
          >
            {folder ? (
              t('Change')
            ) : (
              <>
                <Icon icon="solar:add-linear" width={14} height={14} />
                {t('Select Folder')}
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) setFolder({ name: files[0].webkitRelativePath.split('/')[0] || files[0].name, files: files.length });
              e.target.value = '';
            }}
          />
        </div>

        {/* Arrow */}
        <div className="flex md:flex-col items-center justify-center gap-1 text-[#9CA3AF]">
          <Icon icon="solar:arrow-right-linear" width={20} height={20} className="rotate-90 md:rotate-0" />
          <span className="text-[10px]">{t('Sync to')}</span>
        </div>

        {/* Destination collection */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <span className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
            <Icon icon="solar:folder-linear" width={20} height={20} className="text-[#FF6115]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{collection.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{t('Photos and files for this event will be stored in the Collection you choose.')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Public link to a collection (mock domain). */
const collectionUrl = (c: Collection) => `https://peepshare.com/c/${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

/** Someone a collection is shared with, and what they can do. */
interface AccessEntry {
  id: string;
  name: string;
  avatar: string;
  role: ShareRole;
}

const ROLE_LABEL: Record<ShareRole, string> = { viewer: 'Viewer', editor: 'Edit' };

/** Mock: two teammates (not the owner) already have access. */
function sampleAccess(c: Collection): AccessEntry[] {
  return users
    .filter((u) => u.name !== c.owner)
    .slice(c.id % 2, (c.id % 2) + 2)
    .map((u, i) => ({ id: u.id, name: u.name, avatar: u.avatar, role: i === 0 ? 'viewer' : 'editor' }));
}

// ⋮ → People with access: the owner, then everyone it's shared with. Open a person to change their role or remove them.
function PeopleAccessModal({ collection, people, onChange, onClose }: {
  collection: Collection;
  people: AccessEntry[];
  onChange: (people: AccessEntry[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Modal title={t('People with access')} onClose={onClose}>
      <ul className="-my-2">
        <li className="flex items-center gap-3 py-2.5">
          <span className="relative">
            <Avatar initials={collection.ownerAvatar} />
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF6115] border-2 border-white flex items-center justify-center">
              <Icon icon="solar:crown-minimalistic-bold" width={8} height={8} className="text-white" />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#1A1A1A] truncate">{collection.owner}</span>
            <span className="block text-xs text-[#9CA3AF]">{t('Owner')}</span>
          </span>
        </li>

        {people.map((p) => {
          const open = openId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : p.id)}
                aria-expanded={open}
                className="w-full flex items-center gap-3 py-2.5 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
              >
                <Avatar initials={p.avatar} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#1A1A1A] truncate">{p.name}</span>
                  <span className="block text-xs text-[#9CA3AF]">{t(ROLE_LABEL[p.role])}</span>
                </span>
                <Icon icon={open ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} width={18} height={18} className="text-[#9CA3AF]" />
              </button>
              {open && (
                <div className="mb-2 rounded-xl bg-[#F9FAFB] px-4 py-1" role="radiogroup" aria-label={t('Access for {name}', { name: p.name })}>
                  {SHARE_ROLES.map((r) => {
                    const on = p.role === r.value;
                    return (
                      <label key={r.value} className="flex items-center gap-3 py-3 cursor-pointer">
                        <Icon icon={r.icon} width={18} height={18} className={on ? 'text-[#FF6115]' : 'text-[#6B7280]'} />
                        <span className={`flex-1 text-sm ${on ? 'font-medium text-[#FF6115]' : 'text-[#6B7280]'}`}>{t(ROLE_LABEL[r.value])}</span>
                        <input
                          type="radio"
                          name={`access-${p.id}`}
                          checked={on}
                          onChange={() => onChange(people.map((x) => (x.id === p.id ? { ...x, role: r.value } : x)))}
                          className="sr-only"
                        />
                        <RadioDot on={on} />
                      </label>
                    );
                  })}
                  <div className="border-t border-[#E5E7EB]">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(people.filter((x) => x.id !== p.id));
                        setOpenId(null);
                      }}
                      className="flex items-center gap-3 py-3 text-sm text-[#DC2626] hover:text-[#B91C1C]"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" width={18} height={18} />
                      {t('Remove')}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}

        {people.length === 0 && <li className="py-4 text-sm text-[#9CA3AF]">{t('Not shared with anyone yet.')}</li>}
      </ul>
    </Modal>
  );
}

type ShareAccess = 'private' | 'link';
type ShareRole = 'viewer' | 'editor';

const SHARE_ROLES: { value: ShareRole; label: string; description: string; icon: string }[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view only', icon: 'solar:eye-bold' },
  { value: 'editor', label: 'Editor', description: 'Can edit and manage content', icon: 'solar:pen-bold' },
];

interface SharePerson {
  id: string;
  name: string;
  meta: string;
  avatar: string;
  /** Group size, shown as "{count} members". */
  count?: number;
}

// Mock groups; friends come from the user list.
const SHARE_GROUPS: SharePerson[] = [
  { id: 'g-photo', name: 'Photographers', meta: '5 members', avatar: 'PH', count: 5 },
  { id: 'g-monomax', name: 'MONOMAX Team', meta: '8 members', avatar: 'MT', count: 8 },
  { id: 'g-staff', name: 'Event Staff', meta: '12 members', avatar: 'ES', count: 12 },
];
const SHARE_FRIENDS: SharePerson[] = users.map((u) => ({ id: u.id, name: u.name, meta: u.role, avatar: u.avatar }));

// Share: who can open the collection, who it's shared with, plus Copy Link and Download QR Code.
function ShareModal({ collection, onClose, onShare }: {
  collection: Collection;
  onClose: () => void;
  onShare: (sharing: SharingType, people: AccessEntry[]) => void;
}) {
  const t = useT();
  const url = collectionUrl(collection);
  const [access, setAccess] = useState<ShareAccess>(collection.sharing === 'Public Link' ? 'link' : 'private');
  const [linkRole, setLinkRole] = useState<ShareRole>('viewer');
  const [peopleRole, setPeopleRole] = useState<ShareRole>('editor');
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const term = search.trim().toLowerCase();
  const match = (p: SharePerson) => !term || `${p.name} ${p.meta}`.toLowerCase().includes(term);
  const groups = SHARE_GROUPS.filter(match);
  const friends = SHARE_FRIENDS.filter(match);
  const everyone = [...SHARE_GROUPS, ...SHARE_FRIENDS];
  const chosen = selected.map((id) => everyone.find((p) => p.id === id)!).filter(Boolean);
  const toggle = (id: string) => setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard can be blocked (e.g. inside an iframe).
    }
    setCopied(true);
  };

  const download = async () => {
    setDownloading(true);
    try {
      await downloadQrPng(url, collection.name);
    } finally {
      setDownloading(false);
    }
  };

  const share = () =>
    onShare(
      access === 'link' ? 'Public Link' : selected.length ? 'Restricted' : 'Private',
      chosen.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, role: peopleRole })),
    );

  const personRow = (p: SharePerson) => {
    const on = selected.includes(p.id);
    return (
      <li key={p.id}>
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <Avatar initials={p.avatar} />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-[#1A1A1A] truncate">{p.name}</span>
            <span className="block text-xs text-[#9CA3AF] truncate">{p.count != null ? t('{count} members', { count: p.count }) : t(p.meta)}</span>
          </span>
          <input type="checkbox" checked={on} onChange={() => toggle(p.id)} className="sr-only" />
          <RadioDot on={on} />
        </label>
      </li>
    );
  };

  return (
    <Modal
      title={t('Share collection')}
      onClose={onClose}
      maxWidth="sm:max-w-4xl"
      footer={
        <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center gap-3">
          <div className="flex gap-2 sm:mr-auto">
            <button
              type="button"
              onClick={copy}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-10 px-4 text-sm font-medium rounded-full border transition-colors ${
                copied ? 'border-green-200 bg-green-50 text-green-700' : 'border-[#FF6115] text-[#FF6115] hover:bg-[#FFF0E8]'
              }`}
            >
              <Icon icon={copied ? 'solar:check-circle-bold' : 'solar:link-linear'} width={16} height={16} />
              <span aria-live="polite">{copied ? t('Copied') : t('Copy Link')}</span>
            </button>
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-10 px-4 text-sm font-medium rounded-full border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
            >
              <Icon icon="solar:qr-code-linear" width={16} height={16} />
              {downloading ? t('Preparing…') : t('Download QR Code')}
            </button>
          </div>
          <button
            type="button"
            onClick={share}
            className="h-10 px-10 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#FF6115] hover:from-[#FF6115] hover:to-[#E5540F] transition-colors"
          >
            {t('Share')}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Who can access */}
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">{t('Who has access')}</h4>
          <AccessOption
            checked={access === 'private'}
            onSelect={() => setAccess('private')}
            icon="solar:lock-keyhole-minimalistic-bold"
            title={t('Private access')}
            description={t('Only people with access can open this link')}
          />
          <div className={`rounded-xl border transition-colors ${access === 'link' ? 'border-[#FF6115]' : 'border-transparent'}`}>
            <AccessOption
              checked={access === 'link'}
              onSelect={() => setAccess('link')}
              icon="solar:global-bold"
              title={t('Anyone with the link')}
              description={t('Anyone on the internet with the link can view')}
              flat={access === 'link'}
            />
            {access === 'link' && (
              <div className="px-4 pb-4 pt-1 border-t border-[#F0F0F0] mx-3">
                <p className="text-sm font-semibold text-[#1A1A1A] mt-3 mb-2">{t('Collection access permission')}</p>
                <div className="space-y-2" role="radiogroup" aria-label={t('Collection access permission')}>
                  {SHARE_ROLES.map((r) => {
                    const on = linkRole === r.value;
                    return (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                          on ? 'border-[#FF6115] bg-[#FFF5EF]' : 'border-transparent bg-[#F9FAFB] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <Icon icon={r.icon} width={16} height={16} className={on ? 'text-[#FF6115]' : 'text-[#6B7280]'} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-[#1A1A1A]">{t(r.label)}</span>
                          <span className="block text-xs text-[#9CA3AF]">{t(r.description)}</span>
                        </span>
                        <input type="radio" name="share-link-role" checked={on} onChange={() => setLinkRole(r.value)} className="sr-only" />
                        <RadioDot on={on} />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Share with people */}
        <section className="min-w-0 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#1A1A1A]">{t('Share with')}</h4>
            <label className="relative inline-flex items-center">
              <span className="sr-only">{t('Permission for people you share with')}</span>
              <select
                value={peopleRole}
                onChange={(e) => setPeopleRole(e.target.value as ShareRole)}
                className="appearance-none bg-transparent pr-5 text-xs font-medium text-[#374151] focus:outline-none cursor-pointer"
              >
                {SHARE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(r.label)}
                  </option>
                ))}
              </select>
              <Icon icon="solar:alt-arrow-down-linear" width={12} height={12} className="absolute right-0 pointer-events-none text-[#6B7280]" />
            </label>
          </div>

          {chosen.length > 0 && (
            <ul className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label={t('Selected')}>
              {chosen.map((p) => (
                <li key={p.id} className="relative flex flex-col items-center w-14 flex-shrink-0">
                  <Avatar initials={p.avatar} size="lg" />
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-label={t('Remove {name}', { name: p.name })}
                    className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-[#9CA3AF] hover:bg-[#6B7280] text-white flex items-center justify-center"
                  >
                    <Icon icon="solar:close-linear" width={10} height={10} />
                  </button>
                  <span className="mt-1 text-[10px] text-[#4B5563] truncate w-full text-center">{p.name}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="relative mt-3">
            <Icon icon="solar:magnifer-linear" width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6115] pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search ...')}
              aria-label={t('Search people or groups')}
              className="w-full h-10 pl-9 pr-3 text-sm bg-[#F9FAFB] border border-transparent rounded-lg focus:outline-none focus:border-[#FF6115] focus:bg-white"
            />
          </div>

          <div className="mt-3 md:max-h-[340px] md:overflow-y-auto pr-1">
            {groups.length > 0 && (
              <>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-1">{t('Groups ({count})', { count: groups.length })}</p>
                <ul>{groups.map(personRow)}</ul>
              </>
            )}
            {friends.length > 0 && (
              <>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-3">{t('Friends ({count})', { count: friends.length })}</p>
                <ul>{friends.map(personRow)}</ul>
              </>
            )}
            {groups.length + friends.length === 0 && <p className="py-8 text-center text-sm text-[#9CA3AF]">{t('No matching people found')}</p>}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function AccessOption({ checked, onSelect, icon, title, description, flat }: {
  checked: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  description: string;
  /** Inside the highlighted "anyone with the link" box, which already draws the border. */
  flat?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
        flat ? '' : checked ? 'border border-[#FF6115] bg-white' : 'border border-transparent bg-[#F9FAFB] hover:bg-[#F3F4F6]'
      }`}
    >
      <span className="w-9 h-9 rounded-full bg-[#FF6115] text-white flex items-center justify-center flex-shrink-0">
        <Icon icon={icon} width={18} height={18} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-[#1A1A1A]">{title}</span>
        <span className="block text-xs text-[#9CA3AF]">{description}</span>
      </span>
      <input type="radio" name="share-access" checked={checked} onChange={onSelect} className="sr-only" />
      <RadioDot on={checked} />
    </label>
  );
}

function RadioDot({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${on ? 'border-[#FF6115]' : 'border-[#D1D5DB]'}`}>
      {on && <span className="w-2.5 h-2.5 rounded-full bg-[#FF6115]" />}
    </span>
  );
}

function Avatar({ initials, size = 'md' }: { initials: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={`rounded-full bg-[#FFF0E8] text-[#E5540F] font-bold flex items-center justify-center flex-shrink-0 ${size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'}`}
    >
      {initials}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#374151]">{t(label)}</label>
      {children}
    </div>
  );
}

import { useState } from 'react';
import { events, users } from '../data/mock';

type SharingType = 'Public Link' | 'Private' | 'Restricted' | 'Expired';

interface Collection {
  id: number;
  name: string;
  owner: string;
  ownerAvatar: string;
  linkedEvent: string;
  files: number;
  storageGb: number;
  lastUpdated: string;
  sharing: SharingType;
  status: 'Active' | 'Archived';
  description: string;
}

const SHARING_COLORS: Record<SharingType, string> = {
  'Public Link': 'bg-green-50 text-green-700',
  'Private': 'bg-gray-100 text-gray-600',
  'Restricted': 'bg-[#FFF0E8] text-[#FF6115]',
  'Expired': 'bg-red-50 text-red-600',
};

const FILE_TABS = ['All Files', 'Photos', 'Videos', 'Documents', 'Audio', 'Other'] as const;
type FileTab = typeof FILE_TABS[number];

const mockCollections: Collection[] = [
  { id: 1, name: 'MONOMAX Event Photos', owner: 'Aom Siriporn', ownerAvatar: 'AS', linkedEvent: 'MONOMAX Event', files: 8520, storageGb: 18.2, lastUpdated: 'Today', sharing: 'Public Link', status: 'Active', description: 'All photos from MONOMAX Event 5-6 Sep 2026' },
  { id: 2, name: 'Pattaya Countdown Photos', owner: 'Beam Natthawut', ownerAvatar: 'BN', linkedEvent: 'Pattaya Countdown 2027', files: 12820, storageGb: 24.5, lastUpdated: 'Yesterday', sharing: 'Private', status: 'Active', description: 'Photos for Pattaya Countdown event' },
  { id: 3, name: 'PEEP Sport Day Album', owner: 'Mint Wanida', ownerAvatar: 'MW', linkedEvent: 'PEEP Sport Day', files: 3240, storageGb: 8.4, lastUpdated: '2 days ago', sharing: 'Restricted', status: 'Active', description: 'Sport Day photos and videos' },
  { id: 4, name: 'Event Documents', owner: 'Admin', ownerAvatar: 'ST', linkedEvent: 'MONOMAX Event', files: 42, storageGb: 0.85, lastUpdated: '3 days ago', sharing: 'Restricted', status: 'Active', description: 'Contracts, schedules and documents' },
  { id: 5, name: 'Songkran Walk Photos', owner: 'Beam Natthawut', ownerAvatar: 'BN', linkedEvent: 'Songkran Photo Walk', files: 5100, storageGb: 10.2, lastUpdated: '5 days ago', sharing: 'Expired', status: 'Archived', description: 'Songkran 2026 walk event photos' },
  { id: 6, name: 'Behind the Scenes', owner: 'Aom Siriporn', ownerAvatar: 'AS', linkedEvent: 'MONOMAX Event', files: 240, storageGb: 1.4, lastUpdated: 'Today', sharing: 'Private', status: 'Active', description: 'BTS footage and candid shots' },
];

const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `DSC_${String(1000 + i).padStart(4, '0')}.jpg`,
  size: `${(2.1 + Math.random() * 5).toFixed(1)} MB`,
  date: '5 Sep 2026',
  uploader: i % 3 === 0 ? 'Mint Wanida' : 'Beam Natthawut',
  color: ['#FFE4D6', '#D6E8FF', '#D6FFE8', '#EDD6FF', '#FFF9D6', '#FFD6D6', '#D6FFF9', '#FFD6F9'][i % 8],
}));

export default function Collections() {
  const [collections, setCollections] = useState(mockCollections);
  const [search, setSearch] = useState('');
  const [sharingFilter, setSharingFilter] = useState<SharingType | 'All'>('All');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [shareCollection, setShareCollection] = useState<Collection | null>(null);

  const filtered = collections.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.linkedEvent.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase());
    const matchSharing = sharingFilter === 'All' || c.sharing === sharingFilter;
    return matchSearch && matchSharing;
  });

  if (selectedCollection) {
    return (
      <CollectionDetail
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
        onShare={() => setShareCollection(selectedCollection)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Collections</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage and organize files stored in your PEEP SHARE Cloud</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium px-4 py-2.5 sm:py-2 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Collection
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:min-w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search collections..."
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
              {s}
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
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-[#9CA3AF] text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={1.5}>
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                      </svg>
                      <span>No collections found</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#FF6115" strokeWidth={2}>
                          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
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
                  <td className="px-4 py-3.5 text-sm text-[#9CA3AF]">{c.lastUpdated}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SHARING_COLORS[c.sharing]}`}>{c.sharing}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedCollection(c)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">View</button>
                      <button onClick={() => setShareCollection(c)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Share</button>
                      <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
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
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={1.5}>
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <span>No collections found</span>
            </div>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#FF6115" strokeWidth={2}>
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                </svg>
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
              <span className={`inline-flex flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${SHARING_COLORS[c.sharing]}`}>{c.sharing}</span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-[#4B5563]">
              <span>{c.files.toLocaleString()} files</span>
              <span>{c.storageGb >= 1 ? `${c.storageGb} GB` : `${Math.round(c.storageGb * 1000)} MB`}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.status}
              </span>
            </div>

            <div className="text-xs text-[#9CA3AF] mt-2">Updated {c.lastUpdated}</div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-1">
                <button onClick={() => setSelectedCollection(c)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">View</button>
                <button onClick={() => setShareCollection(c)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Share</button>
              </div>
              <button className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateCollectionModal
          onClose={() => setShowCreate(false)}
          onCreate={(c) => {
            setCollections(prev => [...prev, c]);
            setShowCreate(false);
          }}
        />
      )}

      {shareCollection && (
        <ShareModal collection={shareCollection} onClose={() => setShareCollection(null)} />
      )}
    </div>
  );
}

function CollectionDetail({ collection, onBack, onShare }: {
  collection: Collection;
  onBack: () => void;
  onShare: () => void;
}) {
  const [activeTab, setActiveTab] = useState<FileTab>('Photos');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const toggleFile = (id: number) => {
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">Collections</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{collection.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF0E8] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#FF6115" strokeWidth={1.75}>
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">{collection.name}</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">{collection.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex-1 sm:flex-none min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download
          </button>
          <button
            onClick={onShare}
            className="flex-1 sm:flex-none min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-[#FF6115] text-[#FF6115] rounded-lg hover:bg-[#FFF0E8] transition-colors"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
          <button className="flex-1 sm:flex-none min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors font-medium">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Upload
          </button>
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
            <div className="text-xs text-[#9CA3AF] mb-0.5">{m.label}</div>
            <div className="text-sm font-semibold text-[#1A1A1A] truncate">{m.value}</div>
          </div>
        ))}
      </div>

      {/* File browser */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-[#E5E7EB] px-4 flex gap-1 overflow-x-auto">
          {FILE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === t ? 'border-[#FF6115] text-[#FF6115]' : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* File toolbar */}
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <>
                <span className="text-xs text-[#6B7280]">{selectedFiles.length} selected</span>
                <button className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">Delete</button>
                <button className="text-xs text-[#6B7280] hover:bg-[#F9FAFB] px-2 py-1 rounded transition-colors">Download</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9CA3AF]">{collection.files.toLocaleString()} total files</span>
          </div>
        </div>

        {/* Photo grid */}
        {(activeTab === 'Photos' || activeTab === 'All Files') && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mockPhotos.map(photo => {
              const selected = selectedFiles.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selected ? 'border-[#FF6115]' : 'border-transparent hover:border-[#E5E7EB]'}`}
                  onClick={() => toggleFile(photo.id)}
                >
                  <div className="aspect-square flex items-center justify-center text-2xl" style={{ background: photo.color }}>
                    📷
                  </div>
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#FF6115] rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                  <div className="p-2 bg-white">
                    <div className="text-[10px] font-medium text-[#1A1A1A] truncate">{photo.name}</div>
                    <div className="text-[9px] text-[#9CA3AF]">{photo.size}</div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}

        {activeTab !== 'Photos' && activeTab !== 'All Files' && (
          <div className="py-16 text-center text-[#9CA3AF] text-sm">
            <div className="flex flex-col items-center gap-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={1.5}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
              </svg>
              <span>No {activeTab.toLowerCase()} in this collection</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateCollectionModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (c: Collection) => void;
}) {
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
      sharing: 'Private',
      status: 'Active',
      description: description || 'No description provided',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-semibold text-[#1A1A1A]">Create Collection</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <Field label="Collection Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MONOMAX Event Photos" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Describe this collection..." className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] resize-none" />
          </Field>
          <Field label="Owner">
            <select value={owner} onChange={e => setOwner(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]">
              <option value="">Select user</option>
              {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Link to Event">
            <select value={linkedEvent} onChange={e => setLinkedEvent(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]">
              <option value="">Select event (optional)</option>
              {events.map(e => <option key={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Storage Location">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2}>
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
              </svg>
              <span className="text-sm text-[#6B7280]">PEEP SHARE Cloud</span>
            </div>
          </Field>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Collection
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ collection, onClose }: { collection: Collection; onClose: () => void }) {
  const [access, setAccess] = useState<'anyone' | 'peepshare' | 'restricted'>('anyone');
  const [allowDownload, setAllowDownload] = useState(true);
  const [expiration, setExpiration] = useState<'never' | 'date'>('never');
  const [password, setPassword] = useState<'none' | 'require'>('none');
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://peepshare.com/c/${collection.name.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">Share Collection</h3>
            <p className="text-xs text-[#9CA3AF]">{collection.name}</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Share URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Share URL</label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs text-[#6B7280] truncate font-mono">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]'}`}
              >
                {copied ? '✓ Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">QR Code</label>
            <div className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col items-center gap-3">
              {/* Placeholder QR pattern */}
              <div className="w-32 h-32 bg-white border border-[#E5E7EB] rounded-lg p-2 grid grid-cols-7 gap-0.5">
                {Array.from({ length: 49 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${Math.random() > 0.5 ? 'bg-[#1A1A1A]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">Download QR Code</button>
                <button onClick={handleCopy} className="px-3 py-1.5 text-xs border border-[#FF6115] text-[#FF6115] rounded-lg hover:bg-[#FFF0E8] transition-colors">Copy Link</button>
              </div>
            </div>
          </div>

          {/* Access Settings */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#374151]">Who can access?</label>
            {[
              { value: 'anyone' as const, label: 'Anyone with the link' },
              { value: 'peepshare' as const, label: 'PEEP SHARE users only' },
              { value: 'restricted' as const, label: 'Restricted users' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="access" value={opt.value} checked={access === opt.value} onChange={() => setAccess(opt.value)} className="accent-[#FF6115]" />
                <span className="text-sm text-[#4B5563]">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Download */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm text-[#4B5563]">Allow downloading files</div>
            </div>
            <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} className="w-4 h-4 accent-[#FF6115]" />
          </label>

          {/* Expiration */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#374151]">Expiration</label>
            {[
              { value: 'never' as const, label: 'Never' },
              { value: 'date' as const, label: 'Set expiration date' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="expiration" value={opt.value} checked={expiration === opt.value} onChange={() => setExpiration(opt.value)} className="accent-[#FF6115]" />
                <span className="text-sm text-[#4B5563]">{opt.label}</span>
              </label>
            ))}
            {expiration === 'date' && (
              <input type="date" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 mt-1" />
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#374151]">Password protection</label>
            {[
              { value: 'none' as const, label: 'No password' },
              { value: 'require' as const, label: 'Require password' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="password" value={opt.value} checked={password === opt.value} onChange={() => setPassword(opt.value)} className="accent-[#FF6115]" />
                <span className="text-sm text-[#4B5563]">{opt.label}</span>
              </label>
            ))}
            {password === 'require' && (
              <input type="password" placeholder="Enter password" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 mt-1" />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors">Save Sharing Settings</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#374151]">{label}</label>
      {children}
    </div>
  );
}

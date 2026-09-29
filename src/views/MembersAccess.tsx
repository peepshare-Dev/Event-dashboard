import { useState } from 'react';
import { eventMembers, type RoleType } from '../data/mock';
import { Icon } from '@iconify/react';

const ROLE_COLORS: Record<RoleType, string> = {
  'Super Admin': 'bg-purple-50 text-purple-700',
  'Event Admin': 'bg-blue-50 text-blue-700',
  'Event Staff': 'bg-[#FFF0E8] text-[#FF6115]',
  'Photographer': 'bg-green-50 text-green-700',
  'Data Viewer': 'bg-sky-100 text-sky-700',
  'Viewer': 'bg-gray-100 text-gray-600',
};

const ALL_PERMISSIONS = [
  'View Event', 'View Photos', 'Upload Photos', 'Sync Photos',
  'View Registration', 'View Survey', 'View Reports', 'Export Data', 'Manage Members',
];

const ROLES: RoleType[] = ['Event Admin', 'Event Staff', 'Photographer', 'Viewer'];

export default function MembersAccess() {
  const [members, setMembers] = useState(eventMembers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<typeof eventMembers[0] | null>(null);

  const handleRemove = (peepId: string) => {
    setMembers(prev => prev.filter(m => m.peepId !== peepId));
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1A1A1A]">Members & Access</h3>
          <p className="text-sm text-[#6B7280]">{members.length} members with access to this event</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium px-4 py-2.5 sm:py-2 rounded-lg transition-colors"
        >
          <Icon icon="solar:add-linear" width={14} height={14} />
          Add Member
        </button>
      </div>

      {/* Table (tablet & desktop) */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-[#E5E7EB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['PEEP SHARE ID', 'Name', 'Role', 'Permissions', 'Status', 'Added Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {members.map(m => (
                <tr key={m.peepId} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3.5 text-sm font-mono text-[#6B7280] whitespace-nowrap">{m.peepId}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FF6115]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#FF6115]">{m.avatar}</span>
                      </div>
                      <span className="text-sm font-medium text-[#1A1A1A] whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[m.role]}`}>{m.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {m.permissions.map(p => (
                        <span key={p} className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">{m.addedDate}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditMember(m)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Edit</button>
                      <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Role</button>
                      <button onClick={() => handleRemove(m.peepId)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Remove</button>
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
        {members.map(m => (
          <div key={m.peepId} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF6115]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#FF6115]">{m.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1A1A1A]">{m.name}</div>
                <div className="text-xs text-[#9CA3AF] font-mono">{m.peepId}</div>
              </div>
              <span className={`inline-flex flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[m.role]}`}>{m.role}</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {m.permissions.map(p => (
                <span key={p} className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">{p}</span>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-[#6B7280]">
              <span className={`font-medium px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {m.status}
              </span>
              <span>Added {m.addedDate}</span>
            </div>

            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#F3F4F6]">
              <button onClick={() => setEditMember(m)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Edit</button>
              <button className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Role</button>
              <button onClick={() => handleRemove(m.peepId)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={(member) => {
            setMembers(prev => [...prev, member]);
            setShowAddModal(false);
          }}
        />
      )}

      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSave={(updated) => {
            setMembers(prev => prev.map(m => m.peepId === updated.peepId ? updated : m));
            setEditMember(null);
          }}
        />
      )}
    </div>
  );
}

function AddMemberModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (member: typeof eventMembers[0]) => void;
}) {
  const [peepId, setPeepId] = useState('');
  const [searched, setSearched] = useState(false);
  const [role, setRole] = useState<RoleType>('Viewer');
  const [perms, setPerms] = useState<string[]>(['View Event']);

  const mockUser = { name: 'Kanya Srisuwan', avatar: 'KS', peepId: 'PPS008' };

  const togglePerm = (p: string) => {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSearch = () => {
    if (peepId.trim()) setSearched(true);
  };

  const handleAdd = () => {
    onAdd({
      peepId: peepId || 'PPS008',
      name: mockUser.name,
      avatar: mockUser.avatar,
      role,
      permissions: perms,
      status: 'Active',
      addedDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#1A1A1A]">Add Event Member</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <Icon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">PEEP SHARE ID</label>
            <div className="flex gap-2">
              <input
                value={peepId}
                onChange={e => { setPeepId(e.target.value); setSearched(false); }}
                placeholder="Search PEEP SHARE ID..."
                className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
              />
              <button onClick={handleSearch} className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                Search
              </button>
            </div>
          </div>

          {searched && (
            <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6115]/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#FF6115]">{mockUser.avatar}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A]">{mockUser.name}</div>
                  <div className="text-xs text-[#6B7280]">{peepId || mockUser.peepId}</div>
                </div>
                <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Found</span>
              </div>
            </div>
          )}

          {searched && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] bg-white"
                >
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#374151]">Permissions</label>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  {ALL_PERMISSIONS.map(p => (
                    <label key={p} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] cursor-pointer border-b border-[#F3F4F6] last:border-0">
                      <input
                        type="checkbox"
                        checked={perms.includes(p)}
                        onChange={() => togglePerm(p)}
                        className="w-4 h-4 accent-[#FF6115]"
                      />
                      <span className="text-sm text-[#4B5563]">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!searched}
            className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMemberModal({ member, onClose, onSave }: {
  member: typeof eventMembers[0];
  onClose: () => void;
  onSave: (updated: typeof eventMembers[0]) => void;
}) {
  const [role, setRole] = useState<RoleType>(member.role);
  const [perms, setPerms] = useState<string[]>(member.permissions);

  const togglePerm = (p: string) => {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-semibold text-[#1A1A1A] truncate">Edit Access — {member.name}</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] flex-shrink-0 ml-2">
            <Icon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as RoleType)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] bg-white"
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Permissions</label>
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
              {ALL_PERMISSIONS.map(p => (
                <label key={p} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] cursor-pointer border-b border-[#F3F4F6] last:border-0">
                  <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} className="w-4 h-4 accent-[#FF6115]" />
                  <span className="text-sm text-[#4B5563]">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button
            onClick={() => onSave({ ...member, role, permissions: perms })}
            className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

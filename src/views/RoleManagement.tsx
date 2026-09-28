import { useState } from 'react';
import { roles, allPermissions, type Role, type RoleType } from '../data/mock';
import { Icon } from '@iconify/react';

export default function RoleManagement({ onSelectRole }: { onSelectRole: (role: Role) => void }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Role Management</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage roles and permissions for all users</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-[#FF6115] hover:bg-[#E5540F] text-white text-sm font-medium px-4 py-2.5 sm:py-2 rounded-lg transition-colors"
        >
          <Icon icon="solar:add-linear" width={14} height={14} />
          Create Role
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Role Name', 'Description', 'Users', 'Permissions', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {roles.map(role => {
                const permCount = Object.values(role.permissions).flat().length;
                return (
                  <tr key={role.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${getRoleColor(role.name)}`}>
                          {role.name.charAt(0)}
                        </div>
                        <button
                          onClick={() => onSelectRole(role)}
                          className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] transition-colors whitespace-nowrap"
                        >
                          {role.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280] max-w-xs">{role.description}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-sm text-[#4B5563] whitespace-nowrap">
                        <Icon icon="solar:users-group-rounded-linear" width={13} height={13} />
                        {role.userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[#4B5563] whitespace-nowrap">
                        {permCount} permission{permCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${role.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {role.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onSelectRole(role)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors whitespace-nowrap">Edit</button>
                        <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors whitespace-nowrap">View Users</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateRoleModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function getRoleColor(name: RoleType): string {
  const map: Record<RoleType, string> = {
    'Super Admin': 'bg-purple-100 text-purple-700',
    'Event Admin': 'bg-blue-100 text-blue-700',
    'Event Staff': 'bg-[#FFF0E8] text-[#FF6115]',
    'Photographer': 'bg-green-100 text-green-700',
    'Viewer': 'bg-gray-100 text-gray-600',
  };
  return map[name] || 'bg-gray-100 text-gray-600';
}

function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Record<string, string[]>>({});

  const toggle = (category: string, perm: string) => {
    setSelectedPerms(prev => {
      const existing = prev[category] || [];
      return {
        ...prev,
        [category]: existing.includes(perm)
          ? existing.filter(p => p !== perm)
          : [...existing, perm],
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#1A1A1A]">Create Custom Role</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]">
            <Icon icon="solar:close-linear" width={18} height={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Role Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Content Manager" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Describe this role..." className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#374151]">Permissions</label>
            <div className="space-y-3">
              {Object.entries(allPermissions).map(([cat, perms]) => (
                <div key={cat} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <div className="bg-[#F9FAFB] px-4 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{cat}</div>
                  {perms.map(p => (
                    <label key={p} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] cursor-pointer border-t border-[#F3F4F6]">
                      <input
                        type="checkbox"
                        checked={(selectedPerms[cat] || []).includes(p)}
                        onChange={() => toggle(cat, p)}
                        className="w-4 h-4 accent-[#FF6115]"
                      />
                      <span className="text-sm text-[#4B5563]">{p}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors">Create Role</button>
        </div>
      </div>
    </div>
  );
}

export function RoleDetail({ role, onBack }: { role: Role; onBack: () => void }) {
  const [permissions, setPermissions] = useState<Record<string, string[]>>(role.permissions);

  const toggle = (cat: string, perm: string) => {
    setPermissions(prev => {
      const existing = prev[cat] || [];
      return {
        ...prev,
        [cat]: existing.includes(perm) ? existing.filter(p => p !== perm) : [...existing, perm],
      };
    });
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">Role Management</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{role.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{role.name}</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{role.description}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{role.userCount} users with this role</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">Permission Matrix</h3>
        {Object.entries(allPermissions).map(([cat, perms]) => (
          <div key={cat}>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{cat}</div>
            <div className="space-y-1">
              {perms.map(p => {
                const granted = (permissions[cat] || []).includes(p);
                return (
                  <label key={p} className="flex items-center gap-3 py-2 cursor-pointer group">
                    <div
                      onClick={() => toggle(cat, p)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors cursor-pointer ${granted ? 'bg-[#FF6115] border-[#FF6115]' : 'border-[#D1D5DB] bg-white group-hover:border-[#FF6115]/50'}`}
                    >
                      {granted && (
                        <Icon icon="solar:check-linear" width={11} height={11} color="white" />
                      )}
                    </div>
                    <span className={`text-sm ${granted ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}>{p}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
          <button onClick={onBack} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Cancel</button>
          <button className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

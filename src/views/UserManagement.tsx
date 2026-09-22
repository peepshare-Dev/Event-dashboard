import { useState } from 'react';
import { users, type User, type RoleType } from '../data/mock';

const ROLE_COLORS: Record<RoleType, string> = {
  'Super Admin': 'bg-purple-50 text-purple-700',
  'Event Admin': 'bg-blue-50 text-blue-700',
  'Event Staff': 'bg-[#FFF0E8] text-[#FF6115]',
  'Photographer': 'bg-green-50 text-green-700',
  'Viewer': 'bg-gray-100 text-gray-600',
};

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleType | 'All'>('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [data, setData] = useState(users);

  const filtered = data.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.peepId.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSuspend = (id: string) => {
    setData(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' as const : 'Active' as const } : u));
  };

  if (selectedUser) {
    return <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">User Management</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{data.length} users in the system</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:min-w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as RoleType | 'All')}
          className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 bg-white text-[#4B5563]"
        >
          <option value="All">All Roles</option>
          {(['Event Admin', 'Event Staff', 'Photographer', 'Viewer'] as RoleType[]).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table (tablet & desktop) */}
      <div className="hidden sm:block bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['User', 'PEEP SHARE ID', 'Assigned Events', 'Role', 'Status', 'Last Active', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#9CA3AF] text-sm">No users found.</td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${u.status === 'Suspended' ? 'bg-gray-100' : 'bg-[#FF6115]/10'}`}>
                        <span className={`text-xs font-bold ${u.status === 'Suspended' ? 'text-gray-400' : 'text-[#FF6115]'}`}>{u.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1A1A1A]">{u.name}</div>
                        <div className="text-xs text-[#9CA3AF]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-mono text-[#6B7280] whitespace-nowrap">{u.peepId}</td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {u.assignedEvents} events
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#9CA3AF] whitespace-nowrap">{u.lastActive}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedUser(u)} className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">View</button>
                      <button className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Edit</button>
                      <button
                        onClick={() => handleSuspend(u.id)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${u.status === 'Active' ? 'text-[#6B7280] hover:text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
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
          <div className="bg-white rounded-xl border border-[#E5E7EB] text-center py-12 text-[#9CA3AF] text-sm">No users found.</div>
        ) : filtered.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${u.status === 'Suspended' ? 'bg-gray-100' : 'bg-[#FF6115]/10'}`}>
                <span className={`text-xs font-bold ${u.status === 'Suspended' ? 'text-gray-400' : 'text-[#FF6115]'}`}>{u.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1A1A1A]">{u.name}</div>
                <div className="text-xs text-[#9CA3AF] truncate">{u.email}</div>
              </div>
              <span className={`inline-flex flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>{u.role}</span>
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-[#6B7280]">
              <span className="font-mono">{u.peepId}</span>
              <span>{u.assignedEvents} events</span>
              <span className={`font-medium px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {u.status}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-1">
                <button onClick={() => setSelectedUser(u)} className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">View</button>
                <button className="min-h-[44px] px-3 text-xs text-[#6B7280] hover:text-[#FF6115] hover:bg-[#FFF0E8] rounded-lg transition-colors">Edit</button>
              </div>
              <button
                onClick={() => handleSuspend(u.id)}
                className={`min-h-[44px] px-3 text-xs rounded-lg transition-colors ${u.status === 'Active' ? 'text-[#6B7280] hover:text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
              >
                {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserDetail({ user, onBack }: { user: User; onBack: () => void }) {
  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <button onClick={onBack} className="hover:text-[#FF6115] transition-colors">User Management</button>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{user.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#FF6115]/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#FF6115]">{user.avatar}</span>
          </div>
          <div>
            <div className="text-base font-semibold text-[#1A1A1A]">{user.name}</div>
            <div className="text-sm text-[#6B7280]">{user.email}</div>
            <div className="text-xs text-[#9CA3AF] mt-1 font-mono">{user.peepId}</div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {user.status}
          </span>
          <div className="w-full pt-3 border-t border-[#E5E7EB] text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Role</span>
              <span className="font-medium text-[#4B5563]">{user.role}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Last Active</span>
              <span className="font-medium text-[#4B5563]">{user.lastActive}</span>
            </div>
          </div>
        </div>

        {/* Assigned Events */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Assigned Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Event', 'Role', 'Status'].map(h => (
                    <th key={h} className="text-left pb-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {[
                  { event: 'MONOMAX Event', role: user.role, status: 'Active' },
                  { event: 'PEEP Sport Day', role: user.role, status: 'Active' },
                  { event: 'Songkran Photo Walk', role: user.role, status: 'Completed' },
                ].slice(0, user.assignedEvents).map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-sm font-medium text-[#1A1A1A] whitespace-nowrap">{r.event}</td>
                    <td className="py-2.5 text-sm text-[#6B7280] whitespace-nowrap">{r.role}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-[#FFF0E8] text-[#FF6115]'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 col-span-full">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Recent Activity</h3>
          <div className="space-y-0">
            {[
              { time: '2026-09-21 10:15', action: 'Uploaded 820 photos to MONOMAX Event' },
              { time: '2026-09-21 13:40', action: 'Uploaded 450 photos to PEEP Sport Day' },
              { time: '2026-09-20 09:00', action: 'Logged in to the system' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-4 py-3 border-b border-[#F3F4F6] last:border-0">
                <span className="text-xs text-[#9CA3AF] whitespace-nowrap mt-0.5">{a.time}</span>
                <span className="text-sm text-[#4B5563]">{a.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

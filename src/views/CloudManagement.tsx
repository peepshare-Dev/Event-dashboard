import { useState } from 'react';
import { events } from '../data/mock';
import { Icon } from '@iconify/react';

const USED_GB = 28.5;
const TOTAL_GB = 100;
const AVAILABLE_GB = TOTAL_GB - USED_GB;
const USAGE_PCT = Math.round((USED_GB / TOTAL_GB) * 100);

const FILE_BREAKDOWN = [
  { label: 'Photos', gb: 18.2, color: 'bg-[#FF6115]' },
  { label: 'Videos', gb: 7.8, color: 'bg-blue-400' },
  { label: 'Documents', gb: 2.5, color: 'bg-purple-400' },
  { label: 'Other', gb: 0, color: 'bg-gray-300' },
];

const PACKAGES = [
  { size: '100 GB', price: null, current: true },
  { size: '200 GB', price: '฿199', current: false },
  { size: '500 GB', price: '฿449', current: false },
  { size: '1 TB', price: '฿849', current: false },
];

const EVENT_USAGE = [
  { event: 'MONOMAX Event', collection: 'MONOMAX Event Photos', files: 8520, gb: 18.2, updated: 'Today', status: 'Active' },
  { event: 'Pattaya Countdown 2027', collection: 'Event Photos', files: 12820, gb: 24.5, updated: 'Yesterday', status: 'Active' },
  { event: 'PEEP Sport Day', collection: 'Sport Photos', files: 3240, gb: 8.4, updated: '2 days ago', status: 'Active' },
  { event: 'Songkran Photo Walk', collection: 'Walk Photos', files: 5100, gb: 10.2, updated: '3 days ago', status: 'Archived' },
];

function getUsageState(): 'normal' | 'warning' | 'full' {
  if (USAGE_PCT >= 100) return 'full';
  if (USAGE_PCT >= 80) return 'warning';
  return 'normal';
}

export default function CloudManagement() {
  const [search, setSearch] = useState('');
  const usageState = getUsageState();

  const filteredEvents = EVENT_USAGE.filter(e =>
    e.event.toLowerCase().includes(search.toLowerCase()) ||
    e.collection.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Cloud Management</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Manage your PEEP SHARE cloud storage and storage plans</p>
      </div>

      {/* Warning banner if near full */}
      {usageState === 'warning' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex flex-wrap items-center gap-3">
          <Icon icon="solar:danger-triangle-linear" width={16} height={16} color="#D97706" className="flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium">Storage almost full — {USED_GB} GB / {TOTAL_GB} GB used. {AVAILABLE_GB} GB remaining.</span>
          <button className="sm:ml-auto text-xs font-semibold text-[#FF6115] hover:underline">Upgrade Storage</button>
        </div>
      )}

      {/* Top row — Storage overview + Breakdown + Current plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Storage Overview */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] flex items-center justify-center">
              <Icon icon="solar:cloud-linear" width={16} height={16} color="#FF6115" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Cloud Storage</h3>
          </div>
          <div className="text-3xl font-bold text-[#1A1A1A] mb-0.5">{AVAILABLE_GB} GB</div>
          <div className="text-sm text-[#6B7280] mb-4">available</div>

          {/* Progress bar */}
          <div className="h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${usageState === 'warning' ? 'bg-amber-500' : 'bg-[#FF6115]'}`}
              style={{ width: `${USAGE_PCT}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#9CA3AF] mb-5">
            <span>{USED_GB} GB used</span>
            <span>{TOTAL_GB} GB total</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Used', value: `${USED_GB} GB` },
              { label: 'Available', value: `${AVAILABLE_GB} GB` },
              { label: 'Total', value: `${TOTAL_GB} GB` },
            ].map(s => (
              <div key={s.label} className="bg-[#F9FAFB] rounded-lg p-2.5 text-center">
                <div className="text-sm font-semibold text-[#1A1A1A]">{s.value}</div>
                <div className="text-[10px] text-[#9CA3AF]">{s.label}</div>
              </div>
            ))}
          </div>

          <button className="w-full py-2 text-sm font-medium border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition-colors">
            Manage Storage
          </button>
        </div>

        {/* Storage Breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Storage Usage</h3>
          <div className="space-y-3">
            {FILE_BREAKDOWN.map(f => {
              const pct = (f.gb / TOTAL_GB) * 100;
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-sm ${f.color}`} />
                      <span className="text-[#4B5563]">{f.label}</span>
                    </div>
                    <span className="font-medium text-[#1A1A1A]">{f.gb > 0 ? `${f.gb} GB` : '—'}</span>
                  </div>
                  <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className={`h-full ${f.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Total Used</span>
            <span className="font-bold text-[#1A1A1A]">{USED_GB} GB</span>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Current Plan</h3>
          <div className="flex-1">
            <div className="text-2xl font-bold text-[#1A1A1A] mb-0.5">100 GB</div>
            <div className="text-sm text-[#6B7280] mb-4">Cloud Storage</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Status</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Renewal</span>
                <span className="font-medium text-[#1A1A1A]">31 Dec 2027</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Billing</span>
                <span className="font-medium text-[#1A1A1A]">Monthly</span>
              </div>
            </div>
          </div>
          <button className="mt-5 w-full py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors">
            Manage Plan
          </button>
        </div>
      </div>

      {/* Upgrade Storage */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">Upgrade Storage</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">Choose a storage plan that fits your event scale</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.size}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                pkg.current
                  ? 'border-[#FF6115] bg-[#FFF0E8]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#FF6115]/40'
              }`}
            >
              <div className="text-lg font-bold text-[#1A1A1A] mb-0.5">{pkg.size}</div>
              {pkg.current ? (
                <>
                  <div className="text-xs text-[#FF6115] font-medium mb-3">Current Plan</div>
                  <span className="text-xs text-[#FF6115] font-semibold bg-[#FF6115]/10 px-3 py-1 rounded-full">Active</span>
                </>
              ) : (
                <>
                  <div className="text-sm text-[#6B7280] mb-3">{pkg.price} / month</div>
                  <button className="w-full py-1.5 text-xs font-semibold border border-[#FF6115] text-[#FF6115] rounded-lg hover:bg-[#FF6115] hover:text-white transition-colors">
                    Upgrade
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Storage Usage by Event */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Storage Usage by Event</h3>
          <div className="relative">
            <Icon icon="solar:magnifer-linear" width={13} height={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] w-full sm:w-52"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Event', 'Collection', 'Files', 'Storage Used', 'Last Updated', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredEvents.map((row, i) => (
                <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3.5 text-sm font-medium text-[#1A1A1A] whitespace-nowrap">{row.event}</td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="solar:folder-linear" width={13} height={13} color="#9CA3AF" />
                      {row.collection}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#4B5563]">{row.files.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium text-[#1A1A1A]">{row.gb} GB</div>
                    <div className="h-1 w-24 bg-[#F3F4F6] rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#FF6115] rounded-full" style={{ width: `${(row.gb / TOTAL_GB) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#9CA3AF] whitespace-nowrap">{row.updated}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${row.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

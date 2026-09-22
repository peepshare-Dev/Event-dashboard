import { useState } from 'react';

const SECTIONS = ['General', 'Registration', 'Survey', 'Photos', 'Storage', 'Notifications'] as const;
type Section = typeof SECTIONS[number];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-[#FF6115]' : 'bg-[#D1D5DB]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-[#F3F4F6] last:border-0 gap-2 sm:gap-4">
      <div>
        <div className="text-sm font-medium text-[#1A1A1A]">{label}</div>
        {description && <div className="text-xs text-[#9CA3AF] mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto">{children}</div>
    </div>
  );
}

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState<Section>('General');

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">System Settings</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Global configuration for PEEP SHARE Event Dashboard</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Section nav */}
        <div className="lg:w-44 flex-shrink-0 flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 lg:flex-col lg:gap-0.5 lg:space-y-0.5">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-shrink-0 whitespace-nowrap text-left px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === s ? 'bg-[#FFF0E8] text-[#FF6115] font-medium' : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-[#E5E7EB] p-5">
          {activeSection === 'General' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">General Settings</h3>
              <p className="text-xs text-[#9CA3AF] mb-5">Basic platform configuration</p>
              <SettingRow label="Platform Name" description="Displayed in the header and emails">
                <input defaultValue="PEEP SHARE Event Dashboard" className="w-full sm:w-56 px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]" />
              </SettingRow>
              <SettingRow label="Default Language">
                <select className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30">
                  <option>English (EN)</option>
                  <option>Thai (TH)</option>
                </select>
              </SettingRow>
              <SettingRow label="Timezone">
                <select className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30">
                  <option>Asia/Bangkok (UTC+7)</option>
                  <option>UTC</option>
                </select>
              </SettingRow>
              <SettingRow label="Maintenance Mode" description="Disables access for non-admin users">
                <Toggle />
              </SettingRow>
            </div>
          )}

          {activeSection === 'Registration' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">Registration Settings</h3>
              <p className="text-xs text-[#9CA3AF] mb-5">Global registration defaults (can be overridden per event)</p>
              <SettingRow label="Allow Self-Registration" description="Users can register without admin invite">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Email Confirmation Required">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Auto Check-in via QR Code">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Export Registration Data" description="Allow event admins to export">
                <Toggle defaultOn />
              </SettingRow>
            </div>
          )}

          {activeSection === 'Survey' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">Survey Settings</h3>
              <p className="text-xs text-[#9CA3AF] mb-5">Default survey configuration for all events</p>
              <SettingRow label="Enable Post-Event Survey">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Survey Trigger" description="When to prompt attendees">
                <select className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30">
                  <option>After check-in</option>
                  <option>After event ends</option>
                  <option>24 hours after event</option>
                </select>
              </SettingRow>
              <SettingRow label="Anonymous Responses">
                <Toggle />
              </SettingRow>
            </div>
          )}

          {activeSection === 'Photos' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">Photo Settings</h3>
              <p className="text-xs text-[#9CA3AF] mb-5">Photo upload and processing configuration</p>
              <SettingRow label="Auto-Process Uploaded Photos">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Max File Size per Photo">
                <select className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30">
                  <option>50 MB</option>
                  <option>100 MB</option>
                  <option>200 MB</option>
                </select>
              </SettingRow>
              <SettingRow label="Accepted Formats" description="JPEG, PNG, and RAW are supported">
                <div className="flex gap-1">
                  {['JPEG', 'PNG', 'RAW', 'HEIC'].map(f => (
                    <span key={f} className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Notify on Upload Failure">
                <Toggle defaultOn />
              </SettingRow>
            </div>
          )}

          {activeSection === 'Storage' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">Storage</h3>
              <p className="text-xs text-[#9CA3AF] mb-5">System storage usage and configuration</p>
              <div className="border border-[#E5E7EB] rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-[#1A1A1A]">Storage Used</span>
                  <span className="text-[#FF6115] font-semibold">2.4 TB / 10 TB</span>
                </div>
                <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6115] rounded-full" style={{ width: '24%' }} />
                </div>
                <div className="flex justify-between text-xs text-[#9CA3AF] mt-1.5">
                  <span>2.4 TB used</span>
                  <span>7.6 TB free</span>
                </div>
              </div>
              <SettingRow label="Auto-Archive Old Events" description="Events older than 2 years">
                <Toggle />
              </SettingRow>
              <SettingRow label="Compress Uploaded Photos">
                <Toggle defaultOn />
              </SettingRow>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">Notifications</h3>
              <p className="text-xs text-[#9CA3AF] mb-5">Configure system alerts and email notifications</p>
              <SettingRow label="Email on New Member Added">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Email on Upload Completion">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Email on Upload Failure">
                <Toggle defaultOn />
              </SettingRow>
              <SettingRow label="Weekly System Summary">
                <Toggle />
              </SettingRow>
              <SettingRow label="Notify Super Admin on Role Changes">
                <Toggle defaultOn />
              </SettingRow>
            </div>
          )}

          {!['General', 'Registration', 'Survey', 'Photos', 'Storage', 'Notifications'].includes(activeSection) && (
            <div className="py-12 text-center text-[#9CA3AF] text-sm">Settings coming soon.</div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E5E7EB]">
            <button className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">Reset Defaults</button>
            <button className="px-4 py-2 text-sm font-medium bg-[#FF6115] hover:bg-[#E5540F] text-white rounded-lg transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

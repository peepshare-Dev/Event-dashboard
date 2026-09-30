import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import PickerInput from '../ui/PickerInput';
import type { SetEventStatus } from '../../data/setEvents';

type PanelStatus = Exclude<SetEventStatus, 'Trash'>;

const STATUS_OPTIONS: { value: PanelStatus; label: string; description: string }[] = [
  { value: 'Draft', label: 'Draft', description: 'Not ready to publish.' },
  { value: 'Pending', label: 'Pending', description: 'Waiting for review before publishing.' },
  { value: 'Private', label: 'Private', description: 'Only visible to site admins and editors.' },
  { value: 'Scheduled', label: 'Scheduled', description: 'Publish automatically on a chosen date.' },
  { value: 'Published', label: 'Published', description: 'Visible to everyone.' },
];

interface StatusVisibilityPanelProps {
  status: SetEventStatus;
  /** Options that can't be chosen yet (e.g. publishing before review). */
  lockedStatuses?: PanelStatus[];
  onStatusChange: (status: PanelStatus) => void;
  scheduleDate: string;
  scheduleTime: string;
  onScheduleChange: (patch: { date?: string; time?: string }) => void;
  scheduleError?: string;
  passwordEnabled: boolean;
  password: string;
  onPasswordEnabledChange: (enabled: boolean) => void;
  onPasswordChange: (password: string) => void;
  passwordError?: string;
  onMoveToTrash?: () => void;
  onClose: () => void;
  /** Which edge of the trigger the popover lines up with (tablet and up). */
  align?: 'left' | 'right';
}

// Popover anchored under the status badge in the event page header.
export default function StatusVisibilityPanel({
  status,
  lockedStatuses = [],
  onStatusChange,
  scheduleDate,
  scheduleTime,
  onScheduleChange,
  scheduleError,
  passwordEnabled,
  password,
  onPasswordEnabledChange,
  onPasswordChange,
  passwordError,
  onMoveToTrash,
  onClose,
  align = 'right',
}: StatusVisibilityPanelProps) {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Status & visibility"
        // Pinned inside the viewport on phones; anchored under the ⋯ button from tablet up.
        className={`fixed inset-x-4 top-20 max-h-[calc(100vh-6rem)] overflow-y-auto sm:absolute sm:inset-x-auto ${align === 'left' ? 'sm:left-0' : 'sm:right-0'} sm:top-full sm:mt-2 sm:max-h-none sm:overflow-visible z-30 sm:w-[340px] bg-white border border-[#D1D5DB] rounded-lg shadow-lg p-6`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Status &amp; visibility</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-2 flex items-center justify-center rounded-lg text-[#1A1A1A] hover:bg-[#F9FAFB]"
          >
            <Icon icon="solar:close-linear" width={20} height={20} />
          </button>
        </div>

        <div role="radiogroup" aria-label="Status" className="space-y-4">
          {STATUS_OPTIONS.map((option) => {
            const checked = status === option.value;
            const locked = lockedStatuses.includes(option.value);
            return (
              <div key={option.value}>
                <label className={`flex gap-3 group ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="event-status"
                    value={option.value}
                    checked={checked}
                    disabled={locked}
                    onChange={() => onStatusChange(option.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6115]/40 ${
                      checked ? 'bg-[#FF6115]' : `border-[1.5px] border-[#1A1A1A] ${locked ? '' : 'group-hover:border-[#FF6115]'}`
                    }`}
                  >
                    {checked && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span>
                    <span className="block text-[15px] text-[#1A1A1A]">{option.label}</span>
                    <span className="block text-sm text-[#6B7280] mt-0.5">
                      {option.description}
                      {locked && ' Available after Submit to Review.'}
                    </span>
                  </span>
                </label>

                {option.value === 'Scheduled' && checked && (
                  <div className="ml-8 mt-3">
                    <div className="flex gap-2">
                      <PickerInput
                        type="date"
                        placeholder="DD / MM / YYYY"
                        value={scheduleDate}
                        invalid={Boolean(scheduleError)}
                        onChange={(date) => onScheduleChange({ date })}
                        className="flex-1 min-w-0"
                      />
                      <PickerInput
                        type="time"
                        placeholder="Set time"
                        value={scheduleTime}
                        invalid={Boolean(scheduleError)}
                        onChange={(time) => onScheduleChange({ time })}
                        className="w-28"
                      />
                    </div>
                    {scheduleError && <p className="mt-1.5 text-xs text-[#DC2626]">{scheduleError}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="my-5 border-t border-[#E5E7EB]" />

        <label className="flex gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={passwordEnabled}
            onChange={(e) => onPasswordEnabledChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`mt-0.5 w-5 h-5 rounded-[3px] flex-shrink-0 flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6115]/40 ${
              passwordEnabled ? 'bg-[#FF6115]' : 'border-[1.5px] border-[#1A1A1A] group-hover:border-[#FF6115]'
            }`}
          >
            {passwordEnabled && <Icon icon="solar:check-linear" width={14} height={14} className="text-white" />}
          </span>
          <span>
            <span className="block text-[15px] text-[#1A1A1A]">Password protected</span>
            <span className="block text-sm text-[#6B7280] mt-0.5">Only visible to those who know the password</span>
          </span>
        </label>

        {passwordEnabled && (
          <div className="ml-8 mt-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter a password"
                aria-label="Event password"
                aria-invalid={Boolean(passwordError)}
                autoComplete="new-password"
                autoFocus
                className={`w-full h-10 pl-3 pr-10 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115] ${
                  passwordError ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#6B7280]"
              >
                <Icon icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={16} height={16} />
              </button>
            </div>
            {passwordError && <p className="mt-1.5 text-xs text-[#DC2626]">{passwordError}</p>}
          </div>
        )}

        {onMoveToTrash && (
          <>
            <div className="my-5 border-t border-[#E5E7EB]" />
            <button
              type="button"
              onClick={onMoveToTrash}
              className="inline-flex items-center gap-2 text-sm text-[#DC2626] hover:text-[#B91C1C]"
            >
              <Icon icon="solar:trash-bin-trash-linear" width={16} height={16} />
              Move to Trash
            </button>
          </>
        )}
      </div>
    </>
  );
}

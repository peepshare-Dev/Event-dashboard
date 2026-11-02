import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import ActionMenu, { type ActionMenuItem } from '../../components/ui/ActionMenu';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import { JsonBlock } from './slugJson';
import { formatDay } from '../../data/appBanners';
import type { SlugValue } from '../../data/mock/slugApi';
import { useT } from '@/i18n';

interface SlugListProps {
  items: SlugValue[];
  loadState: 'loading' | 'error' | 'ready';
  actionError: string;
  /** Item with an action in flight. */
  busyId: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (s: SlugValue) => void;
  onDelete: (s: SlugValue) => void;
  onToast: (message: string) => void;
}

// Slug Value list: search, table (cards on phones) and the row action menu.
export default function SlugList({ items, loadState, actionError, busyId, onRetry, onCreate, onEdit, onDelete, onToast }: SlugListProps) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<SlugValue | null>(null);

  const term = search.trim().toLowerCase();
  const visible = useMemo(() => items.filter((s) => !term || `${s.title} ${s.slug} ${s.value}`.toLowerCase().includes(term)), [items, term]);

  const copy = async (s: SlugValue) => {
    try {
      await navigator.clipboard.writeText(s.slug);
      onToast(t('Slug copied.'));
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the slug stays visible to copy by hand.
    }
  };

  const menuItems = (s: SlugValue): ActionMenuItem[] => [
    { label: t('Edit'), icon: 'solar:pen-new-square-linear', onClick: () => onEdit(s) },
    { label: t('Copy Slug'), icon: 'solar:copy-linear', onClick: () => copy(s) },
    { label: t('Delete'), icon: 'solar:trash-bin-trash-linear', onClick: () => setDeleting(s), destructive: true },
  ];

  const updated = (s: SlugValue) => `${formatDay(s.updatedAt, t)} ${s.updatedAt.slice(11, 16)}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] px-4 sm:px-6 pt-6 lg:pt-8 pb-6">
        <PageHeader
          title={t('Slug Value')}
          icon="solar:hashtag-linear"
          description={t('Manage the JSON values the Peep Share app reads by slug.')}
          actions={
            <Button pill icon="solar:add-linear" onClick={onCreate} className="whitespace-nowrap flex-1 sm:flex-none">
              {t('Create Slug')}
            </Button>
          }
        />

        {loadState === 'ready' && items.length > 0 && (
          <p className="mt-4 text-sm text-[#6B7280]">
            {(() => {
              const [before, after] = t('{count} slugs in total').split('{count}');
              return (
                <>
                  {before}
                  <span className="font-semibold text-[#1A1A1A]">{items.length}</span>
                  {after}
                </>
              );
            })()}
          </p>
        )}

        <div className="mt-5">
          <SearchInput value={search} onChange={setSearch} placeholder={t('Search title, slug or value')} className="w-full lg:w-72" />
        </div>

        {actionError && (
          <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            <Icon icon="solar:danger-circle-linear" width={18} height={18} className="flex-shrink-0" />
            {actionError}
          </p>
        )}

        {loadState === 'loading' ? (
          <LoadingRows />
        ) : loadState === 'error' ? (
          <StateBox icon="solar:cloud-cross-linear" title={t('Couldn’t load slugs')} text={t('Something went wrong while loading. Check your connection and try again.')}>
            <Button variant="secondary" icon="solar:refresh-linear" onClick={onRetry}>
              {t('Retry')}
            </Button>
          </StateBox>
        ) : items.length === 0 ? (
          <StateBox icon="solar:hashtag-linear" title={t('No slugs yet')} text={t('Create a slug to give the app a JSON value it can look up by key.')}>
            <Button icon="solar:add-linear" onClick={onCreate}>
              {t('Create Slug')}
            </Button>
          </StateBox>
        ) : visible.length === 0 ? (
          <StateBox icon="solar:magnifer-linear" title={t('No slugs match your search')} text={t('Try a different search.')}>
            <Button variant="secondary" onClick={() => setSearch('')}>
              {t('Clear search')}
            </Button>
          </StateBox>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block mt-4 overflow-x-auto border-b border-[#E5E7EB]">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-y border-[#E5E7EB] text-left text-xs font-medium text-[#374151]">
                    <th scope="col" className="h-11 pl-4 pr-4 w-[260px]">{t('Title / Slug')}</th>
                    <th scope="col" className="px-4">{t('Value')}</th>
                    <th scope="col" className="px-4 w-[160px]">{t('Last updated')}</th>
                    <th scope="col" className="w-16"><span className="sr-only">{t('Actions')}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {visible.map((s) => (
                    <tr key={s.id} className={`align-top hover:bg-[#FAFAFA] transition-colors ${busyId === s.id ? 'opacity-50 pointer-events-none' : ''}`}>
                      <td className="pl-4 pr-4 py-4">
                        <button
                          type="button"
                          onClick={() => onEdit(s)}
                          className="text-left text-sm font-medium text-[#1A1A1A] hover:text-[#FF6115] focus:outline-none focus-visible:underline"
                        >
                          {s.title}
                        </button>
                        <p className="mt-1 font-mono text-xs text-[#6B7280] break-all">{s.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <JsonBlock text={s.value} className="max-h-44" />
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#374151] whitespace-nowrap">{updated(s)}</td>
                      <td className="pr-3 py-3 text-right">
                        <ActionMenu label={t('Actions for {name}', { name: s.title })} items={menuItems(s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden mt-4 space-y-3">
              {visible.map((s) => (
                <li key={s.id} className={`rounded-xl border border-[#E5E7EB] p-4 ${busyId === s.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{s.title}</p>
                      <p className="mt-0.5 font-mono text-xs text-[#6B7280] break-all">{s.slug}</p>
                      <p className="mt-0.5 text-xs text-[#9CA3AF]">
                        {t('Last updated')} {updated(s)}
                      </p>
                    </div>
                    <ActionMenu label={t('Actions for {name}', { name: s.title })} items={menuItems(s)} />
                  </div>
                  <JsonBlock text={s.value} className="mt-3 max-h-40" />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {deleting && (
        <DeleteConfirmationModal
          title={t('Delete slug?')}
          message={
            <>
              {(() => {
                const [before, after] = t('Are you sure you want to delete {name}? The app will no longer find a value for it.').split('{name}');
                return (
                  <>
                    {before}
                    <span className="font-semibold text-[#1A1A1A]">‘{deleting.title}’</span>
                    {after}
                  </>
                );
              })()}
            </>
          }
          onConfirm={() => {
            onDelete(deleting);
            setDeleting(null);
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function LoadingRows() {
  const t = useT();
  return (
    <div role="status" aria-label={t('Loading slugs')} className="mt-4 space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border border-[#F0F0F0] p-4 animate-pulse">
          <div className="w-32 h-4 rounded bg-[#F3F4F6]" />
          <div className="flex-1 h-20 rounded-lg bg-[#F3F4F6]" />
        </div>
      ))}
    </div>
  );
}

function StateBox({ icon, title, text, children }: { icon: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-3">
        <Icon icon={icon} width={22} height={22} className="text-[#FF6115]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
      <p className="text-sm text-[#6B7280] mt-1 max-w-sm">{text}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

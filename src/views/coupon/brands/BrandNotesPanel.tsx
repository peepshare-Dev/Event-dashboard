import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import Button from '../../../components/ui/Button';
import StatusTabs from '../../../components/ui/StatusTabs';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import { textareaClass } from '../../../components/set-event/form/FormField';
import { canDeleteDocument, canDeleteNote, canEditNote, type Brand, type BrandDocument, type BrandNote } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { useCan, useCouponUser } from '../CouponRoleContext';
import { initials, useCouponFormat } from '../format';
import { useT } from '@/i18n';

const TABS = ['Notes', 'Documents'] as const;
type Tab = (typeof TABS)[number];

const DOC_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
const DOC_MAX_MB = 10;
const NOTE_MAX = 2000;

const newestFirst = <T,>(list: T[], key: (x: T) => string) => [...list].sort((a, b) => key(b).localeCompare(key(a)));

interface BrandNotesPanelProps {
  brandId: string;
  onToast: (message: string) => void;
}

// Brand notes and documents for the BD team. Usable by BD even where the rest of the page is read-only.
export default function BrandNotesPanel({ brandId, onToast }: BrandNotesPanelProps) {
  const t = useT();
  const [tab, setTab] = useState<Tab>('Notes');
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(() => {
    setLoadState('loading');
    couponApi.brands
      .get(brandId)
      .then((s) => {
        setBrand(s);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [brandId]);

  useEffect(load, [load]);

  if (loadState === 'loading') {
    return (
      <div role="status" aria-label={t('Loading partner notes')} className="p-4 sm:p-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-[#F3F4F6] animate-pulse" />
        ))}
      </div>
    );
  }
  if (loadState === 'error' || !brand) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-[#6B7280]">{t('Couldn’t load the partner’s notes. Check your connection and try again.')}</p>
        <Button variant="secondary" icon="solar:refresh-linear" onClick={load} className="mt-3">
          {t('Retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <StatusTabs tabs={TABS} active={tab} counts={{ Notes: brand.notes.length, Documents: brand.documents.length }} onChange={setTab} />
      <div className="mt-4">
        {tab === 'Notes' ? (
          <NotesTab brand={brand} onChange={(notes) => setBrand({ ...brand, notes })} onToast={onToast} />
        ) : (
          <DocumentsTab brand={brand} onChange={(documents) => setBrand({ ...brand, documents })} onToast={onToast} />
        )}
      </div>
    </div>
  );
}

const errorMessage = (e: unknown, fallback: string) => (e instanceof CouponApiError && e.status !== 404 ? e.message : fallback);

function NotesTab({ brand, onChange, onToast }: { brand: Brand; onChange: (notes: BrandNote[]) => void; onToast: (m: string) => void }) {
  const t = useT();
  const fmt = useCouponFormat();
  const { user } = useCouponUser();
  const canWrite = useCan('brandNote.write');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);
  const [deleting, setDeleting] = useState<BrandNote | null>(null);
  const notes = newestFirst(brand.notes, (n) => n.createdAt);

  const add = async () => {
    setSaving(true);
    setError('');
    try {
      const note = await couponApi.brands.addNote(brand.id, body.trim());
      onChange([note, ...brand.notes]);
      setBody('');
      onToast(t('Note added.'));
    } catch (e) {
      setError(errorMessage(e, t('Couldn’t add the note. Try again.')));
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const note = await couponApi.brands.updateNote(editing.id, editing.body.trim());
      onChange(brand.notes.map((n) => (n.id === note.id ? note : n)));
      setEditing(null);
      onToast(t('Note updated.'));
    } catch (e) {
      setError(errorMessage(e, t('Couldn’t save the note. Try again.')));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (note: BrandNote) => {
    setDeleting(null);
    setError('');
    try {
      await couponApi.brands.removeNote(note.id);
      onChange(brand.notes.filter((n) => n.id !== note.id));
      onToast(t('Note deleted.'));
    } catch (e) {
      setError(errorMessage(e, t('Couldn’t delete the note. Try again.')));
    }
  };

  return (
    <div>
      {canWrite && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) add();
          }}
          className="space-y-2"
        >
          <label htmlFor="brand-note-new" className="sr-only">
            {t('New note')}
          </label>
          <textarea
            id="brand-note-new"
            rows={3}
            value={body}
            maxLength={NOTE_MAX}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('Write a note for the team, e.g. who you spoke to and what was agreed…')}
            className={textareaClass()}
          />
          <div className="flex justify-end">
            <Button type="submit" icon="solar:add-linear" disabled={!body.trim() || saving}>
              {saving && !editing ? t('Adding…') : t('Add note')}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#DC2626]">
          {error}
        </p>
      )}

      {notes.length === 0 ? (
        <p className="mt-6 text-sm text-[#6B7280] text-center">{t('No notes yet.')}</p>
      ) : (
        <ol className="mt-5 relative">
          {notes.map((note, i) => (
            <li key={note.id} className="relative flex gap-3 pb-5">
              {/* Timeline line */}
              {i < notes.length - 1 && <span className="absolute left-4 top-9 bottom-0 w-px bg-[#E5E7EB]" aria-hidden="true" />}
              <span className="w-8 h-8 rounded-full bg-[#FFF0E8] text-[#FF6115] text-[11px] font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                {initials(note.authorName)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium text-[#1A1A1A]">{note.authorName}</span>
                  {note.authorId === user.id && <span className="text-[#9CA3AF]"> ({t('you')})</span>}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  <time dateTime={note.createdAt}>{fmt.dateTime(note.createdAt)}</time>
                  {note.updatedAt && <> · {t('Edited · {time}', { time: fmt.dateTime(note.updatedAt) })}</>}
                </p>

                {editing?.id === note.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={3}
                      autoFocus
                      value={editing.body}
                      maxLength={NOTE_MAX}
                      aria-label={t('Edit note')}
                      onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                      className={textareaClass()}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                        {t('Cancel')}
                      </Button>
                      <Button onClick={saveEdit} disabled={!editing.body.trim() || saving}>
                        {saving ? t('Saving…') : t('Save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1.5 text-sm text-[#374151] whitespace-pre-wrap break-words">{note.body}</p>
                    {(canEditNote(user, note) || canDeleteNote(user, note)) && (
                      <div className="mt-1.5 flex gap-3 text-xs">
                        {canEditNote(user, note) && (
                          <button type="button" onClick={() => setEditing({ id: note.id, body: note.body })} className="text-[#6B7280] hover:text-[#FF6115] underline-offset-2 hover:underline">
                            {t('Edit')}
                          </button>
                        )}
                        {canDeleteNote(user, note) && (
                          <button type="button" onClick={() => setDeleting(note)} className="text-[#6B7280] hover:text-[#DC2626] underline-offset-2 hover:underline">
                            {t('Delete')}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {deleting && (
        <DeleteConfirmationModal
          title={t('Delete note?')}
          message={deleting.authorId === user.id ? t('This note will be removed for everyone.') : t('This note by {name} will be removed for everyone.', { name: deleting.authorName })}
          onConfirm={() => remove(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function DocumentsTab({ brand, onChange, onToast }: { brand: Brand; onChange: (docs: BrandDocument[]) => void; onToast: (m: string) => void }) {
  const t = useT();
  const fmt = useCouponFormat();
  const { user } = useCouponUser();
  const canWrite = useCan('brandDocument.write');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<BrandDocument | null>(null);
  const docs = newestFirst(brand.documents, (d) => d.uploadedAt);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!DOC_EXTENSIONS.includes(ext)) return setError(t('“{name}” isn’t a supported file. Upload a PDF, JPG, PNG or Word document.', { name: file.name }));
    if (file.size > DOC_MAX_MB * 1024 * 1024) return setError(t('“{name}” is larger than {size}MB.', { name: file.name, size: DOC_MAX_MB }));
    setError('');
    setUploading(true);
    try {
      const doc = await couponApi.brands.uploadDocument(brand.id, file);
      onChange([doc, ...brand.documents]);
      onToast(t('“{name}” uploaded.', { name: doc.fileName }));
    } catch (e) {
      setError(errorMessage(e, t('Upload failed. Check your connection and try again.')));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (doc: BrandDocument) => {
    setDeleting(null);
    setError('');
    try {
      await couponApi.brands.removeDocument(doc.id);
      onChange(brand.documents.filter((d) => d.id !== doc.id));
      onToast(t('“{name}” deleted.', { name: doc.fileName }));
    } catch (e) {
      setError(errorMessage(e, t('Couldn’t delete the file. Try again.')));
    }
  };

  return (
    <div>
      {canWrite && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-xl border-2 border-dashed px-4 py-5 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left transition-colors ${
            dragging ? 'border-[#FF6115] bg-[#FFF5EF]' : 'border-[#E5E7EB]'
          }`}
        >
          <Icon icon={uploading ? 'solar:refresh-linear' : 'solar:upload-linear'} width={28} height={28} className={`flex-shrink-0 ${uploading ? 'text-[#FF6115] animate-spin' : 'text-[#9CA3AF]'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#1A1A1A]">{uploading ? t('Uploading…') : t('Contracts, agreements and other files for this partner')}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{t('PDF, JPG, PNG or Word, up to {size}MB', { size: DOC_MAX_MB })}</p>
          </div>
          <Button variant="secondary" pill onClick={() => inputRef.current?.click()} disabled={uploading} className="whitespace-nowrap">
            {t('Upload file')}
          </Button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={DOC_EXTENSIONS.map((e) => `.${e}`).join(',')}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#DC2626]">
          {error}
        </p>
      )}

      {docs.length === 0 ? (
        <p className="mt-6 text-sm text-[#6B7280] text-center">{t('No documents yet.')}</p>
      ) : (
        <ul className="mt-4 divide-y divide-[#F0F0F0] border-y border-[#F0F0F0]">
          {docs.map((doc) => {
            const isImage = /\.(png|jpe?g)$/i.test(doc.fileName);
            return (
              <li key={doc.id} className="flex items-center gap-3 py-3">
                <span className="w-9 h-9 rounded-lg bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center flex-shrink-0">
                  <Icon icon={isImage ? 'solar:gallery-linear' : 'solar:file-text-linear'} width={18} height={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-[#9CA3AF] truncate">
                    {doc.uploadedBy} · <time dateTime={doc.uploadedAt}>{fmt.dateTime(doc.uploadedAt)}</time>
                  </p>
                </div>
                <a
                  href={doc.fileUrl}
                  download={doc.fileName}
                  aria-label={t('Download {name}', { name: doc.fileName })}
                  title={t('Download')}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#FF6115] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                >
                  <Icon icon="solar:download-minimalistic-linear" width={18} height={18} />
                </a>
                {canDeleteDocument(user, doc) && (
                  <button
                    type="button"
                    onClick={() => setDeleting(doc)}
                    aria-label={t('Delete {name}', { name: doc.fileName })}
                    title={t('Delete')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" width={18} height={18} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {deleting && (
        <DeleteConfirmationModal
          title={t('Delete file?')}
          message={t('“{name}” will be removed for everyone.', { name: deleting.fileName })}
          onConfirm={() => remove(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import Drawer from '../../../components/ui/Drawer';
import Button from '../../../components/ui/Button';
import Toggle from '../../../components/ui/Toggle';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import SegmentedControl from '../../../components/set-event/form/SegmentedControl';
import DateTimeRange from '../../../components/set-event/form/DateTimeRange';
import BannerDropzone, { type BannerFile } from '../../../components/set-event/BannerDropzone';
import { bannerStatus, type Banner } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { fromLocalParts, toLocalParts, useCouponFormat } from '../format';
import { useT } from '@/i18n';

const IMAGE_SIZE = '1432 × 480 px';
const IMAGE_MAX_MB = 2;

interface Draft {
  image: BannerFile | null;
  title: string;
  linkUrl: string;
  schedule: 'always' | 'schedule';
  start: { date: string; time: string };
  end: { date: string; time: string };
  isActive: boolean;
}

const toDraft = (b?: Banner): Draft => ({
  image: b ? { url: b.imageUrl, name: b.title } : null,
  title: b?.title ?? '',
  linkUrl: b?.linkUrl ?? '',
  schedule: b?.startDate || b?.endDate ? 'schedule' : 'always',
  start: toLocalParts(b?.startDate),
  end: toLocalParts(b?.endDate),
  isActive: b?.isActive ?? true,
});

type Errors = Partial<Record<'image' | 'title' | 'linkUrl' | 'start' | 'end', string>>;

interface BannerDrawerProps {
  /** Omit to add one; it's added last in the display order. */
  banner?: Banner;
  onClose: () => void;
  onSaved: (banner: Banner, created: boolean) => void;
  onDeleted: (banner: Banner) => void;
}

// Add / edit a Coupon landing banner: image, title, optional link, optional schedule.
export default function BannerDrawer({ banner, onClose, onSaved, onDeleted }: BannerDrawerProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const initial = useMemo(() => toDraft(banner), [banner]);
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirm, setConfirm] = useState<'discard' | 'delete' | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const startAt = draft.schedule === 'schedule' ? fromLocalParts(draft.start.date, draft.start.time) : '';
  const endAt = draft.schedule === 'schedule' ? fromLocalParts(draft.end.date, draft.end.time) : '';

  const validate = (d: Draft): Errors => {
    const e: Errors = {};
    if (!d.image) e.image = t('Upload the banner image (JPG or PNG, up to {size}MB).', { size: IMAGE_MAX_MB });
    if (!d.title.trim()) e.title = t('Enter a banner title. The app reads it aloud to screen reader users.');
    if (d.linkUrl.trim()) {
      try {
        if (!/^https?:$/.test(new URL(d.linkUrl.trim()).protocol)) throw new Error();
      } catch {
        e.linkUrl = t('Enter a full link starting with https://, or leave it empty.');
      }
    }
    if (d.schedule === 'schedule') {
      const s = fromLocalParts(d.start.date, d.start.time);
      const en = fromLocalParts(d.end.date, d.end.time);
      if (!s) e.start = t('Set the start date and time.');
      if (!en) e.end = t('Set the end date and time.');
      if (s && en && en <= s) e.end = t('The end must be after the start.');
    }
    return e;
  };

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (submitted) setErrors(validate(next));
  };

  const save = async () => {
    const next = validate(draft);
    setErrors(next);
    setSubmitted(true);
    setSaveError('');
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const saved = await couponApi.banners.save({
        id: banner?.id,
        imageUrl: draft.image!.url,
        title: draft.title.trim(),
        linkUrl: draft.linkUrl.trim() || undefined,
        isActive: draft.isActive,
        startDate: startAt || undefined,
        endDate: endAt || undefined,
      });
      onSaved(saved, !banner);
    } catch (e) {
      setSaveError(e instanceof CouponApiError ? e.message : t('Couldn’t save the banner. Check your connection and try again.'));
      setSaving(false);
    }
  };

  const remove = async () => {
    setConfirm(null);
    setSaving(true);
    try {
      await couponApi.banners.remove(banner!.id);
      onDeleted(banner!);
    } catch (e) {
      setSaveError(e instanceof CouponApiError ? e.message : t('Couldn’t delete the banner. Try again.'));
      setSaving(false);
    }
  };

  const shownAs = bannerStatus({ id: '', imageUrl: '', title: '', sortOrder: 0, isActive: draft.isActive, startDate: startAt || undefined, endDate: endAt || undefined });
  const statusHint =
    shownAs === 'Inactive'
      ? t('Hidden from the app until you turn it on.')
      : shownAs === 'Scheduled'
        ? t('Shows from {date}.', { date: fmt.dateTime(startAt) })
        : shownAs === 'Expired'
          ? t('The schedule has ended, so it won’t show.')
          : t('Shows in the app now.');
  const close = () => (dirty ? setConfirm('discard') : onClose());

  return (
    <Drawer
      title={banner ? t('Edit banner') : t('Add banner')}
      description={t('Shown in the carousel on the Coupon landing screen.')}
      onClose={close}
      footer={
        <>
          {banner && (
            <Button variant="ghost" icon="solar:trash-bin-trash-linear" onClick={() => setConfirm('delete')} disabled={saving} className="sm:mr-auto text-[#DC2626] hover:bg-[#FEF2F2]">
              {t('Delete')}
            </Button>
          )}
          <Button variant="secondary" onClick={close} disabled={saving}>
            {t('Cancel')}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t('Saving…') : banner ? t('Save changes') : t('Add banner')}
          </Button>
        </>
      }
    >
      <div className="px-4 sm:px-6 py-5 space-y-6">
        {saveError && (
          <p role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            {saveError}
          </p>
        )}

        <FormField label={t('Banner image')} required hint={t('Recommended {size}. JPEG or PNG, up to {max}MB.', { size: IMAGE_SIZE, max: IMAGE_MAX_MB })} error={errors.image} asGroup>
          {() => (
            <BannerDropzone
              title={t('Banner image')}
              aspect="banner"
              suggestedSize={IMAGE_SIZE}
              maxMb={IMAGE_MAX_MB}
              value={draft.image}
              onChange={(image) => update({ image })}
              onUpload={couponApi.banners.uploadImage}
              invalid={Boolean(errors.image)}
            />
          )}
        </FormField>

        <FormField label={t('Title')} required hint={t('For finding it here, and read aloud by screen readers in the app.')} error={errors.title}>
          {(id) => (
            <input
              id={id}
              value={draft.title}
              maxLength={80}
              onChange={(e) => update({ title: e.target.value })}
              placeholder={t('e.g. {example}', { example: 'Year-End Feast — ลดสูงสุด 50%' })}
              aria-invalid={Boolean(errors.title) || undefined}
              className={inputClass(Boolean(errors.title))}
            />
          )}
        </FormField>

        <FormField label={t('Link')} hint={t('Optional. Where tapping the banner goes.')} error={errors.linkUrl}>
          {(id) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              value={draft.linkUrl}
              onChange={(e) => update({ linkUrl: e.target.value })}
              placeholder="https://"
              aria-invalid={Boolean(errors.linkUrl) || undefined}
              className={inputClass(Boolean(errors.linkUrl))}
            />
          )}
        </FormField>

        <FormField label={t('Schedule')} hint={t('Optional. Without one, it shows whenever it’s active.')} error={errors.start ?? errors.end} asGroup>
          {() => (
            <div className="space-y-3">
              <SegmentedControl
                label={t('Schedule')}
                value={draft.schedule}
                options={[
                  { value: 'always', label: t('Always') },
                  { value: 'schedule', label: t('[verb] Schedule') },
                ]}
                onChange={(schedule) => update({ schedule })}
              />
              {draft.schedule === 'schedule' && (
                <DateTimeRange
                  start={draft.start}
                  end={draft.end}
                  onStartChange={(p) => update({ start: { ...draft.start, ...p } })}
                  onEndChange={(p) => update({ end: { ...draft.end, ...p } })}
                  startInvalid={Boolean(errors.start)}
                  endInvalid={Boolean(errors.end)}
                />
              )}
            </div>
          )}
        </FormField>

        <FormField label={t('Status')} hint={statusHint} asGroup>
          {() => <Toggle checked={draft.isActive} onChange={(isActive) => update({ isActive })} label={draft.isActive ? t('Active') : t('Inactive')} />}
        </FormField>
      </div>

      {confirm === 'discard' && (
        <DeleteConfirmationModal title={t('Discard changes?')} confirmLabel={t('Discard')} message={t('Your unsaved changes to this banner will be lost.')} onConfirm={onClose} onClose={() => setConfirm(null)} />
      )}
      {confirm === 'delete' && (
        <DeleteConfirmationModal
          title={t('Delete banner?')}
          message={t('“{name}” will be removed from the app and can’t be restored.', { name: banner!.title })}
          onConfirm={remove}
          onClose={() => setConfirm(null)}
        />
      )}
    </Drawer>
  );
}

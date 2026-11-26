import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import RichTextEditor from '../../../components/set-event/RichTextEditor';
import type { Brand } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { htmlToText, sanitizeHtml } from '@/lib/sanitizeHtml';
import { useT } from '@/i18n';

interface BrandSettingsProps {
  brand: Brand;
  onSaved: (brand: Brand) => void;
  onDirtyChange: (dirty: boolean) => void;
  onToast: (message: string) => void;
}

// Settings (Admin): default conditions that new coupons for this brand start from.
export default function BrandSettings({ brand, onSaved, onDirtyChange, onToast }: BrandSettingsProps) {
  const t = useT();
  const saved = sanitizeHtml(brand.defaultConditionsHtml ?? '');
  const [html, setHtml] = useState(saved);
  // The editor only reads its value on mount, so a new key loads a discarded draft back.
  const [editorKey, setEditorKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dirty = html !== saved;
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const clean = sanitizeHtml(html);
      const next = await couponApi.brands.update(brand.id, { defaultConditionsHtml: htmlToText(clean) ? clean : undefined });
      onDirtyChange(false);
      onSaved(next);
      setHtml(sanitizeHtml(next.defaultConditionsHtml ?? ''));
      onToast(t('Default conditions saved.'));
    } catch (e) {
      setError(e instanceof CouponApiError ? e.message : t('Couldn’t save the default conditions. Check your connection and try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="brand-settings-title" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <header className="px-4 sm:px-6 pt-5 pb-4 border-b border-[#F0F0F0]">
        <h2 id="brand-settings-title" className="text-[15px] font-semibold text-[#1A1A1A]">
          {t('Default conditions')}
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          {t('New coupons for {name} start with these conditions, and each coupon can still change them. Existing coupons aren’t affected.', { name: brand.name })}
        </p>
      </header>
      <div className="px-4 sm:px-6 py-5">
        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            {error}
          </p>
        )}
        <RichTextEditor
          key={editorKey}
          variant="basic"
          defaultValue={html}
          onChange={setHtml}
          placeholder={t('e.g. Valid at all branches. One per account. Can’t be combined with other promotions.')}
          ariaLabel={t('Default conditions')}
        />
      </div>
      <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-[#F0F0F0]">
        {dirty && <span className="sm:mr-auto text-xs font-medium text-[#E5540F]">{t('Unsaved changes')}</span>}
        <Button
          variant="secondary"
          onClick={() => {
            setHtml(saved);
            setEditorKey((k) => k + 1);
          }}
          disabled={!dirty || saving}
        >
          {t('Discard')}
        </Button>
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? t('Saving…') : t('Save changes')}
        </Button>
      </footer>
    </section>
  );
}

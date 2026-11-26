import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import BannerDropzone, { type BannerFile } from '../../../components/set-event/BannerDropzone';
import type { Brand } from '../../../data/coupons';
import { couponApi, CouponApiError } from '../../../data/mock/couponApi';
import { useT } from '@/i18n';

interface AddBrandModalProps {
  /** To catch a duplicate name before saving. */
  brands: Brand[];
  /** Pre-filled from what the admin typed in the brand search. */
  initialName?: string;
  onClose: () => void;
  onCreated: (brand: Brand) => void;
}

// Quick "Add partner": just a name and a logo. Everything else is filled in on the brand's page.
export default function AddBrandModal({ brands, initialName = '', onClose, onCreated }: AddBrandModalProps) {
  const t = useT();
  const [name, setName] = useState(initialName);
  const [logo, setLogo] = useState<BannerFile | null>(null);
  const [errors, setErrors] = useState<{ name?: string; logo?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const save = async () => {
    const trimmed = name.trim();
    const next: typeof errors = {};
    if (!trimmed) next.name = t('Enter the partner name.');
    else if (brands.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) next.name = t('“{name}” already exists. Pick it from the partner list instead.', { name: trimmed });
    if (!logo) next.logo = t('Upload the partner logo.');
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setSaveError('');
    try {
      onCreated(await couponApi.brands.create({ name: trimmed, logoUrl: logo!.url }));
    } catch (e) {
      setSaveError(e instanceof CouponApiError ? e.message : t('Couldn’t add the partner. Check your connection and try again.'));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t('Add new partner')}
      onClose={onClose}
      maxWidth="sm:max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('Cancel')}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t('Adding…') : t('Add partner')}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <FormField label={t('Partner name')} required error={errors.name}>
          {(id) => (
            <input
              id={id}
              autoFocus
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('e.g. {example}', { example: 'Sukishi' })}
              aria-invalid={Boolean(errors.name) || undefined}
              className={inputClass(Boolean(errors.name))}
            />
          )}
        </FormField>
        <FormField label={t('Partner logo')} required hint={t('Square, at least 240 × 240 px. JPEG or PNG, up to 2MB.')} error={errors.logo} asGroup>
          {() => <BannerDropzone title={t('Partner logo')} aspect="square" suggestedSize="240 × 240 px (1:1)" maxMb={2} value={logo} onChange={setLogo} onUpload={couponApi.brands.uploadLogo} invalid={Boolean(errors.logo)} />}
        </FormField>
        {saveError && (
          <p role="alert" className="text-sm text-[#DC2626]">
            {saveError}
          </p>
        )}
      </div>
    </Modal>
  );
}

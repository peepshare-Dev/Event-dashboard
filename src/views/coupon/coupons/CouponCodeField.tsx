import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import ChoiceCards from '../../../components/set-event/form/ChoiceCards';
import FormField, { inputClass } from '../../../components/set-event/form/FormField';
import SegmentedControl from '../../../components/set-event/form/SegmentedControl';
import Button from '../../../components/ui/Button';
import { CODE_MAX_LENGTH, CODE_PREFIX_MAX_LENGTH, GENERATE_MAX_CODES, generateCode, generateCodes, parseCodesCsv, type CouponCodeType, type ParsedCodes } from '../../../data/coupons';
import Barcode from '../Barcode';
import { downloadCsv, toCsv } from '../dashboard/metrics';
import { useCouponFormat } from '../format';
import { useT } from '@/i18n';

/** Codes from an uploaded CSV or generated here. `name` is '' for codes already saved on the coupon. */
export interface CodeFile {
  name: string;
  parsed: ParsedCodes;
  generated?: boolean;
}

type CodeSource = 'generate' | 'upload';

const CSV_MAX_MB = 5;
const SHOW_DUPLICATES = 5;

interface CouponCodeFieldProps {
  codeType: CouponCodeType;
  barcode: string;
  codeFile: CodeFile | null;
  onChange: (patch: { codeType?: CouponCodeType; barcode?: string; codeFile?: CodeFile | null }) => void;
  errors: { barcode?: string; codes?: string };
  /** Users already hold these codes, so they can't change. */
  locked: boolean;
}

export default function CouponCodeField({ codeType, barcode, codeFile, onChange, errors, locked }: CouponCodeFieldProps) {
  const t = useT();
  const fmt = useCouponFormat();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const [source, setSource] = useState<CodeSource>('generate');
  const [prefix, setPrefix] = useState('');
  const [count, setCount] = useState('');
  const [generateError, setGenerateError] = useState('');
  const sample = codeType === 'single' ? barcode.trim() : (codeFile?.parsed.codes[0] ?? '');

  const read = async (file: File | undefined) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) return setFileError(t('“{name}” isn’t a CSV file. Save the sheet as CSV and upload it again.', { name: file.name }));
    if (file.size > CSV_MAX_MB * 1024 * 1024) return setFileError(t('“{name}” is larger than {size}MB.', { name: file.name, size: CSV_MAX_MB }));
    setFileError('');
    onChange({ codeFile: { name: file.name, parsed: parseCodesCsv(await file.text()) } });
  };

  const generate = () => {
    const n = Number(count);
    if (!count.trim() || !Number.isInteger(n) || n < 1 || n > GENERATE_MAX_CODES) return setGenerateError(t('Enter a whole number from 1 to {max}.', { max: fmt.number(GENERATE_MAX_CODES) }));
    setGenerateError('');
    onChange({ codeFile: { name: '', generated: true, parsed: { codes: generateCodes(n, prefix), duplicates: [], invalidRows: [] } } });
  };

  // Hand the codes to the partner so their stores can accept them.
  const download = (codes: string[]) => downloadCsv(`coupon-codes_${codes.length}.csv`, toCsv(['code'], codes.map((c) => [c])));

  return (
    <div className="space-y-5">
      {locked && (
        <p className="flex items-start gap-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 text-sm text-[#4B5563]">
          <Icon icon="solar:lock-keyhole-minimalistic-linear" width={18} height={18} className="mt-0.5 flex-shrink-0 text-[#6B7280]" />
          {t('Users have already claimed this coupon, so its codes can’t change.')}
        </p>
      )}

      <fieldset disabled={locked} className="min-w-0 space-y-5">
        <ChoiceCards
          label={t('Code type')}
          value={codeType}
          onChange={(next) => onChange({ codeType: next })}
          options={[
            { value: 'single', label: t('One code for everyone'), description: t('Every user shows the same barcode at the store.'), icon: 'solar:ticket-linear' },
            { value: 'unique', label: t('Unique code per coupon'), description: t('Each user gets their own code, generated here or from a CSV you upload.'), icon: 'solar:list-linear' },
          ]}
        />

        {codeType === 'single' ? (
          <FormField
            label={t('Barcode value')}
            required
            hint={t('Type the partner’s code, or generate one. English letters, numbers and symbols only, up to {max} characters.', { max: CODE_MAX_LENGTH })}
            error={errors.barcode}
          >
            {(id) => (
              <div className="flex gap-2">
                <input
                  id={id}
                  value={barcode}
                  maxLength={CODE_MAX_LENGTH}
                  onChange={(e) => onChange({ barcode: e.target.value })}
                  placeholder={t('e.g. {example}', { example: 'PIZZA50OFF' })}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.barcode) || undefined}
                  className={`${inputClass(Boolean(errors.barcode))} font-mono flex-1 min-w-0`}
                />
                <Button variant="secondary" icon="solar:magic-stick-2-linear" onClick={() => onChange({ barcode: generateCode() })} className="flex-shrink-0 h-12">
                  {t('Generate')}
                </Button>
              </div>
            )}
          </FormField>
        ) : (
          <FormField
            label={t('Codes')}
            required
            hint={codeFile || source === 'generate' ? undefined : t('One code per row, in the first column. A header row named “code” is skipped.')}
            error={errors.codes}
            asGroup
          >
            {() => (
              <div aria-invalid={Boolean(errors.codes) || undefined} tabIndex={errors.codes ? -1 : undefined} className="focus:outline-none space-y-3">
                <input
                  ref={inputRef}
                  type="file"
                  hidden
                  accept=".csv,.txt,text/csv"
                  onChange={(e) => {
                    read(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                {codeFile ? (
                  <div className={`rounded-xl border p-4 ${errors.codes ? 'border-[#FCA5A5]' : 'border-[#E5E7EB]'}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center flex-shrink-0">
                        <Icon icon={codeFile.generated ? 'solar:magic-stick-2-linear' : 'solar:file-text-linear'} width={20} height={20} />
                      </span>
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{codeFile.generated ? t('Generated codes') : codeFile.name || t('Saved codes')}</p>
                        <p className="text-sm text-[#15803D] font-medium">{t('{count} codes ready', { count: fmt.number(codeFile.parsed.codes.length) })}</p>
                      </div>
                      {!locked && (
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                          {codeFile.parsed.codes.length > 0 && (
                            <Button variant="secondary" pill icon="solar:download-minimalistic-linear" onClick={() => download(codeFile.parsed.codes)}>
                              {t('Download CSV')}
                            </Button>
                          )}
                          {!codeFile.generated && (
                            <Button variant="secondary" pill onClick={() => inputRef.current?.click()}>
                              {t('[file] Replace')}
                            </Button>
                          )}
                          <Button variant="ghost" pill onClick={() => onChange({ codeFile: null })} aria-label={t('Remove codes')}>
                            {t('Remove')}
                          </Button>
                        </div>
                      )}
                    </div>
                    {codeFile.generated && <p className="mt-3 text-xs text-[#6B7280]">{t('Download the CSV and send it to the partner, so their stores accept these codes.')}</p>}
                    {codeFile.parsed.duplicates.length > 0 && (
                      <p className="mt-3 flex items-start gap-2 rounded-lg bg-[#FFFBEB] px-3 py-2 text-xs text-[#B45309]">
                        <Icon icon="solar:danger-triangle-linear" width={16} height={16} className="flex-shrink-0" />
                        <span>
                          {codeFile.parsed.duplicates.length === 1
                            ? t('1 duplicate code found. Only the first copy is kept:')
                            : t('{count} duplicate codes found. Only the first copy of each is kept:', { count: codeFile.parsed.duplicates.length })}{' '}
                          <span className="font-mono">{codeFile.parsed.duplicates.slice(0, SHOW_DUPLICATES).join(', ')}</span>
                          {codeFile.parsed.duplicates.length > SHOW_DUPLICATES && ` ${t('and {count} more', { count: codeFile.parsed.duplicates.length - SHOW_DUPLICATES })}`}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <SegmentedControl
                    label={t('Where the codes come from')}
                    value={source}
                    options={[
                      { value: 'generate', label: 'Generate codes' },
                      { value: 'upload', label: 'Upload CSV' },
                    ]}
                    onChange={(next) => {
                      setSource(next);
                      setFileError('');
                      setGenerateError('');
                    }}
                  />
                )}
                {!codeFile && source === 'generate' && (
                  <div className={`rounded-xl border p-4 ${errors.codes ? 'border-[#FCA5A5]' : 'border-[#E5E7EB]'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 sm:items-end">
                      <FormField label={t('Prefix (optional)')}>
                        {(id) => (
                          <input
                            id={id}
                            value={prefix}
                            maxLength={CODE_PREFIX_MAX_LENGTH}
                            onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            placeholder={t('e.g. {example}', { example: 'PIZZA' })}
                            autoComplete="off"
                            spellCheck={false}
                            className={`${inputClass()} font-mono`}
                          />
                        )}
                      </FormField>
                      <FormField label={t('Number of codes')} error={generateError}>
                        {(id) => (
                          <input
                            id={id}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={GENERATE_MAX_CODES}
                            step={1}
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), generate())}
                            placeholder={t('e.g. {example}', { example: '500' })}
                            aria-invalid={Boolean(generateError) || undefined}
                            className={inputClass(Boolean(generateError))}
                          />
                        )}
                      </FormField>
                      <Button icon="solar:magic-stick-2-linear" onClick={generate} className={`h-12 ${generateError ? 'sm:mb-6' : ''}`}>
                        {t('Generate')}
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-[#6B7280]">
                      {t('Each code is {prefix}8 random letters and digits, e.g. {example}.', { prefix: prefix ? `${prefix}-` : '', example: prefix ? `${prefix}-7KQ4M9XT` : '7KQ4M9XT' })}
                    </p>
                  </div>
                )}
                {!codeFile && source === 'upload' && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      read(e.dataTransfer.files?.[0]);
                    }}
                    className={`rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center text-center ${errors.codes ? 'border-[#FCA5A5]' : 'border-[#E5E7EB]'}`}
                  >
                    <Icon icon="solar:upload-linear" width={28} height={28} className="text-[#9CA3AF]" />
                    <p className="mt-2 text-sm text-[#1A1A1A]">{t('Drop a CSV file here')}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{t('Up to {size}MB', { size: CSV_MAX_MB })}</p>
                    <Button variant="secondary" pill onClick={() => inputRef.current?.click()} className="mt-3">
                      {t('Upload CSV')}
                    </Button>
                  </div>
                )}
                {fileError && <p className="mt-2 text-xs text-[#DC2626]">{fileError}</p>}
              </div>
            )}
          </FormField>
        )}
      </fieldset>

      <div>
        <p className="text-sm font-medium text-[#1A1A1A]">{t('Barcode preview')}</p>
        <p className="text-xs text-[#6B7280] mt-0.5">
          {codeType === 'single' ? t('What the store scans (Code 128).') : t('Sample: the first code. Each user gets a different one.')}
        </p>
        <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white p-4 flex items-center justify-center min-h-[120px]">
          {sample ? <Barcode value={sample} className="w-full max-w-[360px]" /> : <span className="text-sm text-[#9CA3AF]">{codeType === 'single' ? t('Enter a barcode value to see it here.') : t('Generate or upload codes to see a sample.')}</span>}
        </div>
      </div>
    </div>
  );
}

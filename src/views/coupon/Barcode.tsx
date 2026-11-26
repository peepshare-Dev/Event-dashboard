import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { useT } from '@/i18n';

interface BarcodeProps {
  value: string;
  className?: string;
}

// Code 128 barcode as the store's scanner will see it. Scales to its container.
export default function Barcode({ value, className = '' }: BarcodeProps) {
  const t = useT();
  const svgRef = useRef<SVGSVGElement>(null);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !value) return;
    try {
      JsBarcode(svg, value, {
        format: 'CODE128',
        width: 2,
        height: 72,
        margin: 12,
        fontSize: 16,
        font: 'Inter, system-ui, sans-serif',
        lineColor: '#1A1A1A',
        background: '#FFFFFF',
        valid: setValid,
      });
      // Swap the fixed size for a viewBox so the barcode scales down instead of overflowing.
      const w = svg.getAttribute('width');
      const h = svg.getAttribute('height');
      if (w && h) {
        svg.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
        svg.removeAttribute('width');
        svg.removeAttribute('height');
      }
    } catch {
      setValid(false);
    }
  }, [value]);

  if (!value) return null;
  return (
    <div className={className}>
      <svg ref={svgRef} role="img" aria-label={t('Barcode for {code}', { code: value })} className={`block w-full h-auto ${valid ? '' : 'hidden'}`} />
      {!valid && <p className="text-xs text-[#DC2626]">{t('This code can’t be shown as a barcode.')}</p>}
    </div>
  );
}

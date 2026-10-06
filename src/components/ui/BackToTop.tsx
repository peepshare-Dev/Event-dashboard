import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

interface BackToTopProps {
  /** Scroll distance (px) before the button appears. */
  threshold?: number;
}

const GAP = 24;

// Floating "back to top" button. Place it inside the scrolling <main>; it watches that element,
// and sits above a sticky action bar (`data-action-bar`) when one is on the page.
export default function BackToTop({ threshold = 400 }: BackToTopProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [bottom, setBottom] = useState(GAP);

  useEffect(() => {
    const scroller = anchorRef.current?.closest('main');
    if (!scroller) return;
    scrollerRef.current = scroller;
    const update = () => {
      setVisible(scroller.scrollTop > threshold);
      // offsetParent is null while the bar's page is hidden.
      const bar = scroller.querySelector<HTMLElement>('[data-action-bar]');
      setBottom(bar?.offsetParent ? bar.offsetHeight + 16 : GAP);
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, [threshold]);

  const toTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollerRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <>
      <span ref={anchorRef} hidden />
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        title="Back to top"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        style={{ bottom }}
        className={`fixed right-4 sm:right-6 z-30 w-11 h-11 rounded-full bg-white border border-[#E5E7EB] text-[#374151] shadow-[0_4px_16px_rgba(16,24,40,0.12)] flex items-center justify-center transition-[opacity,transform,color,bottom] duration-200 hover:text-[#FF6115] hover:border-[#FFB38F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <Icon icon="solar:arrow-up-linear" width={20} height={20} />
      </button>
    </>
  );
}

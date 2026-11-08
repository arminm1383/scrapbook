import { useEffect, useRef, useState } from 'react';
import { ScrapbookPage } from './ScrapbookPages';

/** Twelve printed sides: front cover, ten interior pages, back cover. */
export const PAGE_COUNT = 12;
const LAST_SPREAD = PAGE_COUNT / 2;

export interface StorybookProps {
  initialSpread?: number;
}

function Page({ index }: { index: number }) {
  const cover = index === 0 || index === PAGE_COUNT - 1;
  return (
    <div className={`magazine-page ${cover ? 'magazine-cover' : 'magazine-paper'} ${index === PAGE_COUNT - 1 ? 'back-cover' : ''} ${index === 1 || index === 2 ? 'has-artwork' : ''}`}>
      {(index === 1 || index === 2) && <ScrapbookPage page={index} />}
      {index === 0 && <span className="cover-title">scrapbook</span>}
      {index === PAGE_COUNT - 1 && <span className="back-mark" aria-hidden="true">s.</span>}
    </div>
  );
}

export function Storybook({ initialSpread = 0 }: StorybookProps) {
  const [spread, setSpread] = useState(() => Math.max(0, Math.min(LAST_SPREAD, Math.trunc(initialSpread))));
  const [turn, setTurn] = useState<{ from: number; direction: number } | null>(null);
  const turning = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function navigate(direction: number) {
    if (turning.current) return;
    const next = spread + direction;
    if (next < 0 || next > LAST_SPREAD) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      turning.current = true;
      setTurn({ from: spread, direction });
      timer.current = setTimeout(() => {
        setTurn(null);
        turning.current = false;
      }, 720);
    }
    setSpread(next);
  }

  const closed = spread === 0 || spread === LAST_SPREAD;
  const openingCover = turn?.from === 0 && turn.direction === 1;
  const closingCover = turn?.from === 1 && turn.direction === -1;
  const turningFrontCover = openingCover || closingCover;
  const leftPage = spread === LAST_SPREAD ? PAGE_COUNT - 1 : spread * 2 - 1;
  const rightPage = spread * 2;
  const description = spread === 0 ? 'Front cover, page 1 of 12' : spread === LAST_SPREAD
    ? 'Back cover, page 12 of 12' : `Pages ${leftPage + 1} and ${rightPage + 1} of 12`;

  return (
    <section className="storybook" aria-label="Scrapbook, 12 pages">
      <button
        type="button"
        data-turning={turn !== null}
        className={`magazine ${closed && !turningFrontCover ? 'is-closed' : 'is-open'} ${spread === LAST_SPREAD ? 'is-back' : ''} ${turningFrontCover ? 'is-turning-front-cover' : ''} ${openingCover ? 'is-opening' : ''} ${closingCover ? 'is-closing' : ''}`}
        aria-label={`${description}. ${spread === 0 ? 'Click to open.' : spread === LAST_SPREAD ? 'Click to turn back to the previous pages.' : 'Click the left page to turn backward or the right page to turn forward.'} Use left and right arrow keys to turn pages.`}
        onPointerMove={(event) => {
          if (closed || turning.current || event.pointerType === 'touch' ||
              window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
          const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
          event.currentTarget.style.setProperty('--parallax-x', String(x));
          event.currentTarget.style.setProperty('--parallax-y', String(y));
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--parallax-x', '0');
          event.currentTarget.style.setProperty('--parallax-y', '0');
        }}
        onPointerDown={(event) => {
          event.currentTarget.style.setProperty('--parallax-x', '0');
          event.currentTarget.style.setProperty('--parallax-y', '0');
        }}
        onClick={(event) => {
          // A closed cover is a single page: front opens, back reopens.
          if (closed) {
            navigate(spread === 0 ? 1 : -1);
            return;
          }
          // Enter/Space activate the button without pointer coordinates.
          if (event.detail === 0) {
            navigate(1);
            return;
          }
          const bounds = event.currentTarget.getBoundingClientRect();
          navigate(event.clientX < bounds.left + bounds.width / 2 ? -1 : 1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            navigate(event.key === 'ArrowRight' ? 1 : -1);
          }
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            if (!turning.current) setSpread(event.key === 'Home' ? 0 : LAST_SPREAD);
          }
        }}
      >
        {turningFrontCover ? <>
          <Page index={1} />
          <Page index={2} />
        </> : closed ? <Page index={spread === 0 ? 0 : PAGE_COUNT - 1} /> : <>
          <Page index={leftPage} />
          <Page index={rightPage} />
        </>}
        {turningFrontCover ? <span className="front-cover-leaf" aria-hidden="true">
          <span className="cover-face cover-front"><Page index={0} /></span>
          <span className="cover-face cover-reverse"><Page index={1} /></span>
        </span> : turn && <span
          key={`${turn.from}-${turn.direction}`}
          aria-hidden="true"
          className={`turning-page ${turn.direction < 0 ? 'turning-back' : ''} ${turn.from === 0 || turn.from === LAST_SPREAD ? 'turning-cover' : ''}`}
        />}
      </button>
      <span className="sr-only" role="status">{description}</span>
    </section>
  );
}

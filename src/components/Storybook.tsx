import { usePageTurnSound } from './usePageTurnSound';
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ScrapbookPage, type InsidePage } from './ScrapbookPages';
import { FrontCover } from './FrontCover';
import { BackCover } from './BackCover';
import { ScrapbookNav } from './ScrapbookNav';

// Stable artwork IDs in Figma reading order, followed immediately by the back.
export const INTERIOR_PAGE_ORDER: readonly InsidePage[] = [1, 3, 2, 4, 6, 7, 5, 8];
export const PAGE_COUNT = INTERIOR_PAGE_ORDER.length + 2;
export const LAST_SPREAD = PAGE_COUNT / 2;

export interface StorybookProps {
  initialSpread?: number;
}

function Page({ index }: { index: number }) {
  const artworkPage = INTERIOR_PAGE_ORDER[index - 1];
  const hasArtwork = artworkPage != null;
  const cover = index === 0 || index === PAGE_COUNT - 1;
  return (
    <div data-page-index={index} className={`magazine-page ${cover ? 'magazine-cover' : 'magazine-paper'} ${index === PAGE_COUNT - 1 ? 'back-cover' : ''} ${hasArtwork ? 'has-artwork' : ''}`}>
      {hasArtwork && <ScrapbookPage page={artworkPage} pageNumber={index} />}
      {index === 0 && <FrontCover />}
      {index === PAGE_COUNT - 1 && <BackCover />}
    </div>
  );
}

const INTERIOR_SHEET_COUNT = INTERIOR_PAGE_ORDER.length / 2 - 1;
const isInteriorSpread = (value: number) => value > 0 && value < LAST_SPREAD;

interface NavigationRequest { page: number; request: number }

interface PageTurn { from: number; direction: number }
interface PendingTurn extends PageTurn { to: number }

/** Physical sheets stay mounted on their final side after each turn. */
function InteriorDeck({ spread, turn, visited, hidden, onTurnEnd }: {
  spread: number;
  turn: PageTurn | null;
  visited: ReadonlySet<number>;
  hidden: boolean;
  onTurnEnd: () => void;
}) {
  const sheets = new Set<number>();
  for (const seen of visited) {
    for (const sheet of [seen - 1, seen, seen + 1]) {
      if (sheet >= 1 && sheet <= INTERIOR_SHEET_COUNT) sheets.add(sheet);
    }
  }
  const activeSheet = turn && turn.from !== spread && isInteriorSpread(turn.from) && isInteriorSpread(spread)
    ? Math.min(turn.from, spread) : null;

  return (
    <span className="page-deck" hidden={hidden}>
      <span className="deck-base deck-base-left" hidden={spread !== 1 && turn?.from !== 1} aria-hidden={spread !== 1}><Page index={1} /></span>
      {(visited.has(LAST_SPREAD - 2) || visited.has(LAST_SPREAD - 1)) && (
        <span className="deck-base deck-base-right" hidden={spread !== LAST_SPREAD - 1 && turn?.from !== LAST_SPREAD - 1} aria-hidden={spread !== LAST_SPREAD - 1}>
          <Page index={PAGE_COUNT - 2} />
        </span>
      )}
      {Array.from(sheets).sort((a, b) => a - b).map(sheet => {
        const turned = sheet < spread;
        const moving = sheet === activeSheet;
        const visible = moving || sheet === spread || sheet === spread - 1 || sheet === turn?.from || sheet === (turn?.from ?? -1) - 1;
        return (
          <span key={sheet} data-sheet={sheet} hidden={!visible}
            className={`interior-sheet ${moving ? 'is-turning-sheet' : ''}`}
            style={{ transform: `rotateY(${turned ? -180 : 0}deg)`, zIndex: moving ? 20 : turned ? sheet + 2 : INTERIOR_SHEET_COUNT - sheet + 2 }}
            onTransitionEnd={event => {
              if (moving && event.target === event.currentTarget && event.propertyName === 'transform') onTurnEnd();
            }}>
            <span className="cover-face page-face page-face-front" hidden={turned && !moving} aria-hidden={sheet * 2 !== spread * 2}>
              <Page index={sheet * 2} />
            </span>
            <span className="cover-face cover-reverse page-face page-face-back" hidden={!turned && !moving} aria-hidden={sheet * 2 + 1 !== spread * 2 - 1}>
              <Page index={sheet * 2 + 1} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function DesktopStorybook({ initialSpread = 0, onPageChange, navigation, onNavigationEnd, onFlipSound }: StorybookProps & { onPageChange: (page: number) => void; navigation: NavigationRequest | null; onNavigationEnd: () => void; onFlipSound: () => void }) {
  const [destination, setDestination] = useState<number | null>(null);
  const [spread, setSpread] = useState(() => Math.max(0, Math.min(LAST_SPREAD, Math.trunc(initialSpread))));
  const [turn, setTurn] = useState<PageTurn | null>(null);
  const [pending, setPending] = useState<PendingTurn | null>(null);
  const [visited, setVisited] = useState<Set<number>>(() => new Set(isInteriorSpread(spread) ? [spread] : []));
  const book = useRef<HTMLButtonElement>(null);
  const turning = useRef(false);
  const wasTurning = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { onPageChange(spread === LAST_SPREAD ? PAGE_COUNT - 1 : Math.max(0, spread * 2 - 1)); }, [spread, onPageChange]);

  useEffect(() => () => clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const landed = wasTurning.current;
    wasTurning.current = turn !== null;
    if (!turn && !landed) return;
    // A turning leaf must contain fully formed artwork. Keep completed pop-ins
    // completed rather than replaying them when the sheet reaches its new side.
    for (const element of book.current?.querySelectorAll('.artwork-pop') ?? []) {
      for (const animation of element.getAnimations()) {
        if ('animationName' in animation && animation.animationName === 'artwork-pop-in') animation.finish();
      }
    }
  }, [turn]);

  function finishTurn() {
    clearTimeout(timer.current);
    setTurn(null);
    turning.current = false;
  }

  function startTurn(from: number, to: number, direction: number) {
    turning.current = true;
    setTurn({ from, direction });
    setSpread(to);
    // Interior sheets finish on their actual transform transition. The timeout
    // is only a safety net for interrupted/backgrounded browser animations.
    timer.current = setTimeout(finishTurn, isInteriorSpread(from) && isInteriorSpread(to) ? 1000 : 720);
  }

  function navigate(direction: number, queued = false) {
    if (!queued) { setDestination(null); onNavigationEnd(); }
    if (turning.current) return;
    const next = spread === LAST_SPREAD && direction === 1 ? 0 : spread + direction;
    if (next < 0 || next > LAST_SPREAD) return;
    if (!queued) onFlipSound();
    if (isInteriorSpread(next)) setVisited(previous => new Set([...previous, next]));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSpread(next);
    } else if (isInteriorSpread(spread) && isInteriorSpread(next)) {
      // Mount and decode the destination before moving a physical sheet.
      turning.current = true;
      setPending({ from: spread, to: next, direction });
    } else {
      startTurn(spread, next, direction);
    }
  }

  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    const pages = [pending.to * 2 - 1, pending.to * 2];
    const elements = pages.flatMap(index => Array.from(book.current?.querySelectorAll<HTMLImageElement>(`.page-deck [data-page-index="${index}"] img`) ?? []));
    const posters = pages.flatMap(index => Array.from(book.current?.querySelectorAll<HTMLVideoElement>(`.page-deck [data-page-index="${index}"] video[poster]`) ?? []));
    const ready = [
      ...elements.map(img => img.decode().catch(() => {})),
      ...posters.map(video => { const img = new Image(); img.src = video.poster; return img.decode().catch(() => {}); }),
    ];
    void Promise.all(ready).then(() => {
      if (cancelled) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setSpread(pending.to);
        turning.current = false;
      } else {
        startTurn(pending.from, pending.to, pending.direction);
      }
      setPending(null);
    });
    return () => { cancelled = true; };
  }, [pending]);

  useEffect(() => {
    if (navigation) setDestination(navigation.page === PAGE_COUNT - 1 ? LAST_SPREAD : Math.ceil(navigation.page / 2));
  }, [navigation]);

  // Seek through physical sheets so navbar jumps preserve the real flip animation.
  useEffect(() => {
    if (destination === null || turn || pending || turning.current) return;
    if (destination === spread) { setDestination(null); onNavigationEnd(); }
    else navigate(destination > spread ? 1 : -1, true);
  }, [destination, spread, turn, pending]);

  const closed = spread === 0 || spread === LAST_SPREAD;
  const openingCover = turn?.from === 0 && turn.direction === 1;
  const closingCover = turn?.from === 1 && turn.direction === -1;
  const turningFrontCover = openingCover || closingCover;
  const closingBack = turn?.from === LAST_SPREAD - 1 && spread === LAST_SPREAD;
  const openingBack = turn?.from === LAST_SPREAD && spread === LAST_SPREAD - 1;
  const turningBackCover = closingBack || openingBack;
  const flippingOver = turn?.from === LAST_SPREAD && spread === 0;
  const deckSpread = turningFrontCover ? 1 : turningBackCover || spread === LAST_SPREAD
    ? LAST_SPREAD - 1 : spread === 0 ? 1 : spread;
  const endingLeft = PAGE_COUNT - 3;
  const leftPage = spread === LAST_SPREAD ? PAGE_COUNT - 1 : spread * 2 - 1;
  const rightPage = spread * 2;
  const description = spread === 0 ? `Front cover, page 1 of ${PAGE_COUNT}` : spread === LAST_SPREAD
    ? `Back cover, page ${PAGE_COUNT} of ${PAGE_COUNT}` : `Pages ${leftPage + 1} and ${rightPage + 1} of ${PAGE_COUNT}`;

  return (
    <section className="storybook" aria-label={`Scrapbook, ${PAGE_COUNT} pages`}>
      <button
        ref={book}
        type="button"
        aria-busy={pending !== null}
        data-turning={turn !== null || pending !== null}
        className={`magazine ${closed && !turningFrontCover && !turningBackCover ? 'is-closed' : 'is-open'} ${spread === LAST_SPREAD ? 'is-back' : ''} ${turningFrontCover ? 'is-turning-front-cover' : ''} ${openingCover ? 'is-opening' : ''} ${closingCover ? 'is-closing' : ''} ${turningBackCover ? 'is-turning-back-cover' : ''} ${closingBack ? 'is-closing-back' : ''} ${openingBack ? 'is-opening-back' : ''} ${flippingOver ? 'is-flipping-over' : ''}`}
        aria-label={`${description}. ${spread === 0 ? 'Click to open.' : spread === LAST_SPREAD ? 'Click to flip the magazine to the front cover.' : 'Click the left page to turn backward or the right page to turn forward.'} Use left and right arrow keys to turn pages.`}
        onClick={(event) => {
          // Front opens; a click on the back turns the closed magazine over.
          if (closed) {
            navigate(1);
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
            if (!turning.current) {
              if (event.key === 'Home' && spread === LAST_SPREAD) navigate(1);
              else {
                const next = event.key === 'Home' ? 0 : LAST_SPREAD;
                if (next !== spread) onFlipSound();
                setSpread(next);
              }
            }
          }
        }}
      >
        {visited.size > 0 && <InteriorDeck spread={deckSpread} turn={turn} visited={visited}
          hidden={closed && !turningFrontCover && !turningBackCover} onTurnEnd={finishTurn} />}
        {closed && !turningFrontCover && !turningBackCover && <Page index={spread === 0 ? 0 : PAGE_COUNT - 1} />}
        {turningFrontCover ? <span className="front-cover-leaf" aria-hidden="true">
          <span className="cover-face cover-front"><Page index={0} /></span>
          <span className="cover-face cover-reverse"><Page index={1} /></span>
        </span> : turningBackCover ? <span className="back-cover-leaf" aria-hidden="true">
          <span className="cover-face cover-front"><Page index={endingLeft} /></span>
          <span className="cover-face cover-reverse"><Page index={PAGE_COUNT - 1} /></span>
        </span> : flippingOver ? <span className="whole-book-flip" aria-hidden="true">
          <span className="cover-face cover-front"><Page index={PAGE_COUNT - 1} /></span>
          <span className="cover-face cover-reverse"><Page index={0} /></span>
        </span> : null}
      </button>
      <span className="sr-only" role="status">{turn ? 'Turning page' : description}</span>
    </section>
  );
}


// Include landscape phones whose width grows beyond the portrait breakpoint.
const MOBILE_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse) and (max-width: 1024px)';
function subscribeToMobile(change: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener('change', change);
  return () => media.removeEventListener('change', change);
}
const mobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

export function Storybook({ initialSpread = 0 }: StorybookProps) {
  const playPageTurn = usePageTurnSound();
  const mobile = useSyncExternalStore(subscribeToMobile, mobileSnapshot, () => false);
  const currentPage = useRef(initialSpread >= LAST_SPREAD ? PAGE_COUNT - 1 : Math.max(0, initialSpread * 2 - 1));
  const [activePage, setActivePage] = useState(currentPage.current);
  const [navigation, setNavigation] = useState<NavigationRequest | null>(null);
  const endNavigation = useRef(() => setNavigation(null)).current;
  const rememberPage = useRef((page: number) => {
    currentPage.current = page;
    setActivePage(page);
  }).current;
  const rememberSpread = useRef((leftPage: number) => {
    // Retain a phone's right-hand page when resizing into its desktop spread.
    if (leftPage > 0 && leftPage < PAGE_COUNT - 1 && currentPage.current === leftPage + 1) return;
    currentPage.current = leftPage;
    setActivePage(leftPage);
  }).current;
  return <>
    <ScrapbookNav page={activePage} mobile={mobile}
      onSelect={page => {
        const current = currentPage.current;
        const sameLocation = mobile ? current === page
          : (current === PAGE_COUNT - 1 ? LAST_SPREAD : Math.ceil(current / 2)) === (page === PAGE_COUNT - 1 ? LAST_SPREAD : Math.ceil(page / 2));
        // A navbar selection is one interaction, regardless of sheets crossed.
        if (!sameLocation) playPageTurn();
        setNavigation(previous => ({ page, request: (previous?.request ?? 0) + 1 }));
      }} />
    {mobile
      ? <MobileStorybook initialPage={currentPage.current} onPageChange={rememberPage} navigation={navigation} onNavigationEnd={endNavigation} onFlipSound={playPageTurn} />
      : <DesktopStorybook initialSpread={currentPage.current === PAGE_COUNT - 1 ? LAST_SPREAD : Math.ceil(currentPage.current / 2)} onPageChange={rememberSpread} navigation={navigation} onNavigationEnd={endNavigation} onFlipSound={playPageTurn} />}
  </>;
}

interface MobileTurn { from: number; to: number; direction: number }

function MobileStorybook({ initialPage, onPageChange, navigation, onNavigationEnd, onFlipSound }: { initialPage: number; onPageChange: (page: number) => void; navigation: NavigationRequest | null; onNavigationEnd: () => void; onFlipSound: () => void }) {
  const [destination, setDestination] = useState<number | null>(null);
  const [page, setPage] = useState(initialPage);
  const [visited, setVisited] = useState(() => new Set([initialPage]));
  const [pending, setPending] = useState<MobileTurn | null>(null);
  const [turn, setTurn] = useState<MobileTurn | null>(null);
  const book = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => { onPageChange(page); }, [page, onPageChange]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function finishTurn() {
    clearTimeout(timer.current);
    busy.current = false;
    setTurn(null);
  }

  function navigate(direction: number, queued = false) {
    if (!queued) { setDestination(null); onNavigationEnd(); }
    if (busy.current) return;
    const to = page === PAGE_COUNT - 1 && direction === 1 ? 0 : page + direction;
    if (to < 0 || to >= PAGE_COUNT) return;
    if (!queued) onFlipSound();
    busy.current = true;
    setVisited(previous => new Set([...previous, to]));
    setPending({ from: page, to, direction });
  }

  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    const destination = book.current?.querySelector(`[data-mobile-page="${pending.to}"]`);
    const images = Array.from(destination?.querySelectorAll('img') ?? []);
    const posters = Array.from(destination?.querySelectorAll('video[poster]') ?? []);
    const ready = [
      ...images.map(image => image.decode().catch(() => {})),
      ...posters.map(video => { const image = new Image(); image.src = video.getAttribute('poster')!; return image.decode().catch(() => {}); }),
    ];
    void Promise.all(ready).then(() => {
      if (cancelled) return;
      setPage(pending.to);
      setPending(null);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        busy.current = false;
      } else {
        setTurn(pending);
        timer.current = setTimeout(finishTurn, 500);
      }
    });
    return () => { cancelled = true; };
  }, [pending]);

  useEffect(() => {
    if (navigation) setDestination(navigation.page);
  }, [navigation]);

  useEffect(() => {
    if (destination === null || turn || pending || busy.current) return;
    if (destination === page) { setDestination(null); onNavigationEnd(); }
    else navigate(destination > page ? 1 : -1, true);
  }, [destination, page, turn, pending]);

  const description = `${page === 0 ? 'Front cover' : page === PAGE_COUNT - 1 ? 'Back cover' : 'Scrapbook'}, page ${page + 1} of ${PAGE_COUNT}`;
  return (
    <section className="storybook storybook--mobile" aria-label={`Scrapbook, ${PAGE_COUNT} pages`}>
      <div ref={book} className="magazine is-closed magazine--mobile" role="group" tabIndex={0}
        aria-label={`${description}. Swipe left for the next page or right for the previous page. Arrow keys also turn pages.`}
        aria-busy={pending !== null} data-turning={pending !== null || turn !== null}
        onPointerDownCapture={event => {
          if (!event.isPrimary || event.button !== 0 || busy.current || (event.target as Element).closest('button')) return;
          // Touch swipes belong to the page; mouse drags can still tilt the sculptures.
          if (event.pointerType === 'mouse' && (event.target as Element).closest('chrome-sculpture, character-depth')) return;
          gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
          if (event.pointerType !== 'mouse') event.stopPropagation();
        }}
        onPointerUp={event => {
          const start = gesture.current;
          gesture.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          const threshold = Math.max(32, Math.min(64, event.currentTarget.clientWidth * .13));
          if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.25) navigate(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { gesture.current = null; }}
        onLostPointerCapture={() => { gesture.current = null; }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            navigate(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
      >
        <span className="mobile-page-stack">
          {Array.from(visited).map(index => (
            <span key={index} data-mobile-page={index}
              hidden={index !== page && index !== turn?.from}
              aria-hidden={index !== page} inert={index !== page}
              className={`mobile-leaf ${turn?.to === index ? 'mobile-leaf-in' : ''} ${turn?.from === index ? 'mobile-leaf-out' : ''}`}
              style={{ '--page-direction': turn?.direction ?? 1 } as CSSProperties}
              onAnimationEnd={event => {
                if (event.target === event.currentTarget && index === turn?.to) finishTurn();
              }}
            ><Page index={index} /></span>
          ))}
        </span>
        <button type="button" className="sr-only mobile-page-control" disabled={page === 0} onClick={() => navigate(-1)}>Previous page</button>
        <button type="button" className="sr-only mobile-page-control" onClick={() => navigate(1)}>{page === PAGE_COUNT - 1 ? 'Return to front cover' : 'Next page'}</button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{turn ? 'Turning page' : description}</span>
    </section>
  );
}

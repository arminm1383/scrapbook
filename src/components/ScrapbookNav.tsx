import { useEffect, useId, useRef, useState } from 'react';

const destinations = [
  { label: 'cover', page: 0, node: '23:3026' },
  { label: 'page 1-2', page: 1, node: '23:3028' },
  { label: 'page 3-4', page: 3, node: '23:3051' },
  { label: 'page 5-6', page: 5, node: '23:3047' },
  { label: 'page 7-8', page: 7, node: '23:3049' },
  { label: 'back', page: 9, node: '23:3045' },
] as const;

export function ScrapbookNav({ page, mobile, onSelect }: {
  page: number; mobile: boolean; onSelect: (page: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const active = page === 0 ? 0 : page === 9 ? 5 : Math.ceil(page / 2);

  useEffect(() => { setOpen(false); }, [mobile]);

  useEffect(() => {
    if (!mobile || !open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [mobile, open]);

  return (
    <aside ref={root} className={`scrapbook-navigation ${mobile ? 'scrapbook-navigation--mobile' : ''}`}
      onKeyDown={event => {
        if (event.key === 'Escape' && mobile && open) {
          event.preventDefault();
          setOpen(false);
          toggle.current?.focus();
        }
      }}>
      {mobile && <button ref={toggle} type="button" className="scrapbook-nav-toggle"
        aria-label={open ? 'Close page navigation' : 'Open page navigation'}
        aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>pages</button>}
      <nav id={id} className="scrapbook-nav" data-node-id="23:3032" aria-label="Scrapbook pages" hidden={mobile && !open}>
        {destinations.map((destination, index) => (
          <button key={destination.page} type="button" data-node-id={destination.node}
            aria-current={index === active ? 'page' : undefined}
            onClick={() => {
              onSelect(destination.page);
              setOpen(false);
              if (mobile) toggle.current?.focus();
            }}>{destination.label}</button>
        ))}
      </nav>
    </aside>
  );
}

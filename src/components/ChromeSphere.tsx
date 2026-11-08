import { useEffect, useRef } from 'react';
import reflection from './chrome-sphere/assets/reflection.jpg';

/** Mount the supplied Web Component without introducing browser globals into SSR. */
export function ChromeSphere({ fallback }: { fallback: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const gesture = useRef<{ x: number; y: number; dragged: boolean } | null>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    let sculpture: HTMLElement | undefined;
    let observer: MutationObserver | undefined;

    void import('./chrome-sphere/chrome-sculpture.js').then(() => {
      if (cancelled) return;
      sculpture = document.createElement('chrome-sculpture');
      sculpture.setAttribute('reflection', reflection);
      sculpture.setAttribute('max-tilt', '5');
      sculpture.setAttribute('tabindex', '-1');
      sculpture.setAttribute('role', 'img');
      sculpture.setAttribute('aria-label', 'Chrome sculpture. Drag to tilt; arrow keys adjust the view. Escape resets.');
      observer = new MutationObserver(() => {
        if (sculpture?.dataset.ready === 'true') container.dataset.ready = 'true';
      });
      observer.observe(sculpture, { attributes: true, attributeFilter: ['data-ready'] });
      container.append(sculpture);
    }).catch(() => {
      // Keep the original Figma image when the component cannot load.
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      sculpture?.remove();
      delete container.dataset.ready;
    };
  }, []);

  return (
    <span
      ref={host}
      className="chrome-sphere-component"
      onPointerDown={(event) => {
        gesture.current = { x: event.clientX, y: event.clientY, dragged: false };
      }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (current && Math.hypot(event.clientX - current.x, event.clientY - current.y) > 5) {
          current.dragged = true;
        }
      }}
      onClick={(event) => {
        if (gesture.current?.dragged) event.stopPropagation();
        gesture.current = null;
      }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <img className="chrome-sphere-fallback" src={fallback} alt="" draggable={false} />
    </span>
  );
}

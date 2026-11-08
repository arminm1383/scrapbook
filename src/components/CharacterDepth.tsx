import { useEffect, useRef } from 'react';

/** Preserve the source artwork until its textured volume has rendered. */
export function CharacterDepth({ source }: { source: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const gesture = useRef<{ x: number; y: number; dragged: boolean } | null>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    let model: HTMLElement | undefined;
    let observer: MutationObserver | undefined;
    void import('./character-depth/character-depth.js').then(() => {
      if (cancelled) return;
      model = document.createElement('character-depth');
      model.setAttribute('src', source);
      model.setAttribute('tabindex', '0');
      model.setAttribute('role', 'img');
      model.setAttribute('aria-label', 'Character sculpture. Drag gently to tilt. Arrow keys adjust; Escape resets.');
      observer = new MutationObserver(() => {
        if (model?.dataset.ready === 'true') container.dataset.ready = 'true';
        else delete container.dataset.ready;
      });
      observer.observe(model, { attributes: true, attributeFilter: ['data-ready'] });
      container.append(model);
    }).catch(() => { /* Retain the original artwork if WebGL cannot load. */ });
    return () => {
      cancelled = true;
      observer?.disconnect();
      model?.remove();
      delete container.dataset.ready;
    };
  }, [source]);

  return (
    <span ref={host} className="character-depth-component"
      onPointerDown={(event) => { gesture.current = { x: event.clientX, y: event.clientY, dragged: false }; }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (current && Math.hypot(event.clientX - current.x, event.clientY - current.y) > 5) current.dragged = true;
      }}
      onClick={(event) => {
        if (gesture.current?.dragged) event.stopPropagation();
        gesture.current = null;
      }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <img className="character-depth-fallback" src={source} alt="" draggable={false} />
    </span>
  );
}

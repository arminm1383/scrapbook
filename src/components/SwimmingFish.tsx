import { useEffect, useRef } from 'react';
import swimmingVideo from '../assets/scrapbook/fish-swimming.webm';
import poster from '../assets/scrapbook/fish-swimming-poster.png';

/** Pre-rendered articulated original fish artwork, with alpha to preserve the collage beneath. */
export function SwimmingFish() {
  const player = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = player.current;
    if (!video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const magazine = video.closest('.magazine');
    let visible = false;
    const update = () => {
      if (visible && !document.hidden && !motion.matches && magazine?.getAttribute('data-turning') !== 'true') {
        void video.play().catch(() => { /* Leave the rendered poster visible if autoplay is unavailable. */ });
      } else {
        video.pause();
        if (motion.matches) video.currentTime = 0;
      }
    };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    visibility.observe(video);
    const transition = new MutationObserver(update);
    if (magazine) transition.observe(magazine, { attributes: true, attributeFilter: ['data-turning'] });
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      video.pause();
      visibility.disconnect();
      transition.disconnect();
      motion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <video ref={player} className="swimming-fish-video" src={swimmingVideo} poster={poster}
      muted loop playsInline preload="auto" aria-hidden="true" disablePictureInPicture />
  );
}

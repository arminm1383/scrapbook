import animatedWine from '../assets/scrapbook/page2-wine-pouring.gif';
import stillWine from '../assets/scrapbook/page2-wine.png';

/** Freeze the same artwork when the viewer requests reduced motion. */
export function WinePour() {
  return (
    <picture className="wine-pour">
      <source media="(prefers-reduced-motion: reduce)" srcSet={stillWine} />
      <img src={animatedWine} alt="" draggable={false} />
    </picture>
  );
}

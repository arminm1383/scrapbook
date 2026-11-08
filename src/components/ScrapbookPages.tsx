import type { CSSProperties } from 'react';
import food from '../assets/scrapbook/page1-food.png';
import portrait1 from '../assets/scrapbook/page1-portrait.png';
import couple from '../assets/scrapbook/page1-couple.png';
import bouquet from '../assets/scrapbook/page1-bouquet.png';
import heartLarge from '../assets/scrapbook/heart-large.png';
import heartSmall from '../assets/scrapbook/heart-small.png';
import teddy from '../assets/scrapbook/page1-teddy.png';
import portrait2 from '../assets/scrapbook/page2-portrait.png';
import wine from '../assets/scrapbook/page2-wine.png';
import mirror from '../assets/scrapbook/page2-mirror.png';
import cafe from '../assets/scrapbook/page2-cafe.png';
import crab from '../assets/scrapbook/page2-crab.png';
import mango from '../assets/scrapbook/page2-mango.png';

interface Artwork {
  node: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  innerWidth?: number;
  innerHeight?: number;
  rotate?: number;
  flipX?: boolean;
  radius?: number;
  crop?: CSSProperties;
}

// Coordinates are from the high-fidelity Figma code for frames 2:38 and 2:14.
// Keep the layer order: several cutouts deliberately overlap and leave the page.
export const pageArtwork: Record<1 | 2, readonly Artwork[]> = {
  1: [
    { node: '10:417', src: food, x: 285, y: 242, width: 167, height: 156, innerWidth: 156, innerHeight: 167, rotate: -90, radius: 4, crop: { height: '124.4%', top: '-11.48%' } },
    { node: '9:250', src: portrait1, x: 14, y: 58, width: 257, height: 343, radius: 8 },
    { node: '10:394', src: couple, x: 143, y: 320, width: 397, height: 298 },
    { node: '10:403', src: bouquet, x: 288, y: 60, width: 164, height: 170, radius: 4, crop: { height: '128.63%', top: '-20%' } },
    { node: '9:263', src: heartLarge, x: 421, y: 299, width: 82.859, height: 82.097, innerWidth: 65.889, innerHeight: 64.691, rotate: -18.29 },
    { node: '10:408', src: heartLarge, x: 102, y: 443, width: 82.859, height: 82.097, innerWidth: 65.889, innerHeight: 64.691, rotate: -18.29 },
    { node: '9:272', src: heartLarge, x: -27, y: 0, width: 103.561, height: 102.228, innerWidth: 89.888, innerHeight: 88.254, rotate: -9.77 },
    { node: '10:410', src: heartSmall, x: 441, y: 85, width: 43.309, height: 45.783, innerWidth: 33.821, innerHeight: 37.545, rotate: -16.97 },
    { node: '10:412', src: heartSmall, x: 258, y: 207, width: 44.5, height: 46.75, innerWidth: 33.821, innerHeight: 37.545, rotate: 19.71 },
    { node: '10:406', src: teddy, x: -74, y: 303, width: 272, height: 362 },
  ],
  2: [
    { node: '8:230', src: portrait2, x: 60, y: 36, width: 252, height: 336, radius: 8 },
    { node: '9:234', src: wine, x: -7, y: 372, width: 138, height: 212, flipX: true },
    { node: '9:318', src: mirror, x: 289, y: 266, width: 152, height: 278, radius: 8, crop: { height: '138.3%', width: '189.32%', top: '-38.3%' } },
    { node: '8:214', src: cafe, x: 289, y: 52, width: 153, height: 203, radius: 8 },
    { node: '9:314', src: crab, x: 332, y: 455, width: 191.115, height: 160.989, innerWidth: 109.411, innerHeight: 162.452, rotate: 68.68 },
    { node: '9:300', src: mango, x: 145, y: 388, width: 124, height: 147, radius: 4, crop: { height: '108.16%', left: '-0.11%', top: '-4.08%', width: '100.21%' } },
  ],
};

// Every overlapping foreground layer sits one level above what it covers.
// Derive depth from the existing paint order, including future collage assets.
function stackingDepths(artwork: readonly Artwork[]) {
  const depths: number[] = [];
  artwork.forEach((art, index) => {
    depths[index] = 1;
    artwork.slice(0, index).forEach((behind, behindIndex) => {
      if (art.x < behind.x + behind.width && art.x + art.width > behind.x &&
          art.y < behind.y + behind.height && art.y + art.height > behind.y) {
        depths[index] = Math.max(depths[index], depths[behindIndex] + 1);
      }
    });
  });
  return depths;
}

const pageDepths = { 1: stackingDepths(pageArtwork[1]), 2: stackingDepths(pageArtwork[2]) };

export function ScrapbookPage({ page }: { page: 1 | 2 }) {
  return (
    <div className="scrapbook-artwork" data-figma-frame={page === 1 ? '2:38' : '2:14'} role="img" aria-label={`Scrapbook collage, inside page ${page}`}>
      {pageArtwork[page].map((art, index) => (
        <span key={art.node} className="artwork-slot" data-node-id={art.node} style={{
          left: `${art.x / 474 * 100}%`, top: `${art.y / 583 * 100}%`,
          width: `${art.width / 474 * 100}%`, height: `${art.height / 583 * 100}%`,
          '--layer-depth': pageDepths[page][index],
        } as CSSProperties}>
          <span className="artwork-crop" style={{
            width: `${(art.innerWidth ?? art.width) / art.width * 100}%`,
            height: `${(art.innerHeight ?? art.height) / art.height * 100}%`,
            transform: `rotate(${art.rotate ?? 0}deg) scaleX(${art.flipX ? -1 : 1})`,
            borderRadius: `${(art.radius ?? 0) / 474 * 100}cqw`,
          }}>
            <img src={art.src} alt="" draggable={false} style={art.crop ? { objectFit: 'fill', ...art.crop } : undefined} />
          </span>
        </span>
      ))}
    </div>
  );
}

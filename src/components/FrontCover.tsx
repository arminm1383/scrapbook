import { parallaxDelay, stackingDepths } from './collageMotion';
import type { CSSProperties } from 'react';
import couple from '../assets/scrapbook/cover-couple.png';
import apples from '../assets/scrapbook/cover-apples.png';
import bouquet from '../assets/scrapbook/cover-bouquet.png';
import horse from '../assets/scrapbook/cover-horse.png';
import ginghamHeart from '../assets/scrapbook/heart-small.png';
import pinkHeart from '../assets/scrapbook/p4heart.png';

interface CoverArtwork {
  node: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  innerWidth?: number;
  innerHeight?: number;
  rotate?: number;
  radius?: number;
  crop?: CSSProperties;
  foreground?: boolean;
}

// Source frame 2:10 is 474 × 583, like the existing magazine pages.
export const coverArtwork: readonly CoverArtwork[] = [
  { node: '14:484', src: couple, x: 133, y: 277, width: 305, height: 229, radius: 8 },
  { node: '14:489', src: apples, x: 325, y: 521, width: 169, height: 71 },
  { node: '14:487', src: bouquet, x: 332, y: 149, width: 106, height: 106, radius: 4, crop: { height: '130.62%', top: '-21.21%' } },
  { node: '14:492', src: horse, x: 226, y: 149, width: 97, height: 106, radius: 4, crop: { height: '122.81%', left: '-0.16%', width: '100.32%' } },
  { node: '14:494', src: ginghamHeart, x: -44, y: 401, width: 249.664, height: 267.993, innerWidth: 209.643, innerHeight: 232.723, rotate: -10.84, foreground: true },
  { node: '14:499', src: pinkHeart, x: 400, y: 206, width: 76.803, height: 76.803, innerWidth: 63, innerHeight: 63, rotate: 14.54, crop: { height: '117.65%', top: '-17.65%', width: '105.12%' }, foreground: true },
];

const coverDepths = stackingDepths(coverArtwork);

export function FrontCover() {
  return (
    <div className="scrapbook-artwork front-cover-artwork" data-figma-frame="2:10" role="img" aria-label="11-09-2026, from armin to ekin">
      {coverArtwork.map((art, index) => (
        <span className="artwork-slot" key={art.node} data-node-id={art.node} style={{
          left: `${art.x / 474 * 100}%`, top: `${art.y / 583 * 100}%`,
          width: `${art.width / 474 * 100}%`, height: `${art.height / 583 * 100}%`,
          '--layer-depth': coverDepths[index],
          '--parallax-delay': parallaxDelay(index),
        } as CSSProperties}>
          <span className={`artwork-crop ${art.foreground ? 'artwork-pop' : ''}`} style={{
            width: `${(art.innerWidth ?? art.width) / art.width * 100}%`,
            height: `${(art.innerHeight ?? art.height) / art.height * 100}%`,
            transform: `rotate(${art.rotate ?? 0}deg)`,
            borderRadius: `${(art.radius ?? 0) / 474 * 100}cqw`,
          }}>
            <img src={art.src} alt="" draggable={false} style={art.crop ? { objectFit: 'fill', ...art.crop } : undefined} />
          </span>
        </span>
      ))}
      <p className="front-cover-date" data-node-id="14:490">11-09-2026</p>
      <p className="front-cover-from" data-node-id="14:496">from armin</p>
      <p className="front-cover-to" data-node-id="14:497">to ekin</p>
    </div>
  );
}

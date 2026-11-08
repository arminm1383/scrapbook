import { parallaxDelay, stackingDepths } from './collageMotion';
import type { CSSProperties } from 'react';
import night from '../assets/scrapbook/back-night.png';
import portrait from '../assets/scrapbook/back-portrait.png';
import sunshine from '../assets/scrapbook/back-sunshine.png';
import garden from '../assets/scrapbook/back-garden.png';
import dinner from '../assets/scrapbook/back-dinner.png';
import party from '../assets/scrapbook/back-party.png';
import costume from '../assets/scrapbook/back-costume.png';

interface BackArtwork {
  node: string; src: string; x: number; y: number; width: number; height: number;
  radius: number; crop?: CSSProperties;
}

export const backArtwork: readonly BackArtwork[] = [
  { node: '14:516', src: night, x: 43, y: 51, width: 210, height: 280, radius: 8 },
  { node: '14:514', src: portrait, x: 266, y: 51, width: 157, height: 209, radius: 8 },
  { node: '14:511', src: sunshine, x: 266, y: 269, width: 165, height: 124, radius: 8 },
  { node: '14:515', src: garden, x: 43, y: 345, width: 123, height: 164, radius: 8 },
  { node: '14:519', src: dinner, x: 266, y: 411, width: 162, height: 121, radius: 8 },
  { node: '14:517', src: party, x: 175, y: 345, width: 81, height: 90, radius: 4, crop: { height: '148.03%', left: '-22.91%', top: '-28.95%', width: '123.2%' } },
  { node: '14:518', src: costume, x: 175, y: 444, width: 81, height: 79, radius: 4, crop: { height: '137.42%', left: '-0.01%', top: '-37.42%', width: '100.02%' } },
];

const backDepths = stackingDepths(backArtwork);

export function BackCover() {
  return (
    <div className="scrapbook-artwork back-cover-artwork" data-figma-frame="2:45" role="img" aria-label="Back cover photo collage">
      {backArtwork.map((art, index) => (
        <span key={art.node} className="artwork-slot" data-node-id={art.node} style={{
          left: `${art.x / 474 * 100}%`, top: `${art.y / 583 * 100}%`,
          width: `${art.width / 474 * 100}%`, height: `${art.height / 583 * 100}%`,
          '--layer-depth': backDepths[index],
          '--parallax-delay': parallaxDelay(index),
        } as CSSProperties}>
          <span className="artwork-crop" style={{ width: '100%', height: '100%', borderRadius: `${art.radius / 474 * 100}cqw` }}>
            <img src={art.src} alt="" draggable={false} style={art.crop ? { objectFit: 'fill', ...art.crop } : undefined} />
          </span>
        </span>
      ))}
    </div>
  );
}

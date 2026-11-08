import { parallaxDelay, stackingDepths } from './collageMotion';
import { CharacterDepth } from './CharacterDepth';
import type { CSSProperties } from 'react';
import { ChromeSphere } from './ChromeSphere';
import { WinePour } from './WinePour';
import { SwimmingFish } from './SwimmingFish';
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

import p3frame1 from '../assets/scrapbook/p3frame1.png';
import p3frame2 from '../assets/scrapbook/p3frame2.png';
import p3soup from '../assets/scrapbook/p3soup.png';
import p3frame3 from '../assets/scrapbook/p3frame3.png';
import p3mirror from '../assets/scrapbook/p3mirror.png';
import p3frame4 from '../assets/scrapbook/p3frame4.png';
import p3frame5 from '../assets/scrapbook/p3frame5.png';
import p3frame6 from '../assets/scrapbook/p3frame6.png';
import p3frame7 from '../assets/scrapbook/p3frame7.png';
import p3stars from '../assets/scrapbook/p3stars.png';
import p4nature from '../assets/scrapbook/p4nature.png';
import p4dinner from '../assets/scrapbook/p4dinner.png';
import p4bean from '../assets/scrapbook/p4bean.png';
import p4review from '../assets/scrapbook/p4review.png';
import p4word2 from '../assets/scrapbook/p4word2.png';
import p4word1 from '../assets/scrapbook/p4word1.png';
import p4heart from '../assets/scrapbook/p4heart.png';
import p4shoes from '../assets/scrapbook/p4shoes.png';

import p5food from '../assets/scrapbook/p5food.png';
import p5family from '../assets/scrapbook/p5family.png';
import p5friends from '../assets/scrapbook/p5friends.png';
import p5fish from '../assets/scrapbook/p5fish.png';
import p5dance from '../assets/scrapbook/p5dance.png';
import p6casino from '../assets/scrapbook/p6casino.png';
import p6mushrooms from '../assets/scrapbook/p6mushrooms.png';
import p6couple from '../assets/scrapbook/p6couple.png';
import p6hotpot from '../assets/scrapbook/p6hotpot.png';
import p6dog from '../assets/scrapbook/p6dog.png';
import p6bisoncouple from '../assets/scrapbook/p6bisoncouple.png';
import p6bison from '../assets/scrapbook/p6bison-running.gif';

import p8portrait from '../assets/scrapbook/p8portrait.png';
import p8dog from '../assets/scrapbook/p8dog.png';
import p8night from '../assets/scrapbook/p8night.png';
import p8cat from '../assets/scrapbook/p8cat.png';
import p8dinner from '../assets/scrapbook/p8dinner.png';
import p8heart from '../assets/scrapbook/p8heart.png';

import p6grid1 from '../assets/scrapbook/p6grid1.png';
import p6grid2 from '../assets/scrapbook/p6grid2.png';
import p6grid3 from '../assets/scrapbook/p6grid3.png';
import p6grid4 from '../assets/scrapbook/p6grid4.png';
import p6figure from '../assets/scrapbook/p6figure.png';
import p6dessert from '../assets/scrapbook/p6dessert.png';
import p6saturn from '../assets/scrapbook/p6saturn.png';
import p6stars from '../assets/scrapbook/p6stars.png';
import p6comic from '../assets/scrapbook/p6comic.png';
import p6painting from '../assets/scrapbook/p6painting.png';
import p6ticket from '../assets/scrapbook/p6ticket.png';

export type InsidePage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const pageFrames: Record<InsidePage, string> = { 1: '2:38', 2: '2:14', 3: '2:15', 4: '2:18', 5: '2:60', 6: '2:61', 7: '2:64', 8: '2:71' };

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

// Coordinates are from the high-fidelity Figma code for the inside-page frames and section-level overlapping artwork.
// Keep the layer order: several cutouts deliberately overlap and leave the page.
export const pageArtwork: Record<InsidePage, readonly Artwork[]> = {
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
  3: [
    { node: '9:331', src: p3frame1, x: 249, y: 11, width: 124, height: 164 },
    { node: '9:339', src: p3frame2, x: 290, y: 149, width: 205, height: 273 },
    { node: '9:349', src: p3soup, x: 256, y: 375, width: 117, height: 167, crop: { height: '225.45%', left: '-85.35%', top: '-67.58%', width: '241.89%' } },
    { node: '9:338', src: p3frame3, x: 244, y: 249, width: 134, height: 179 },
    { node: '9:353', src: p3mirror, x: -238, y: -83, width: 657.562, height: 665.593, innerWidth: 577.083, innerHeight: 586.633, rotate: 8.51 },
    { node: '9:344', src: p3frame4, x: 325, y: 347, width: 150, height: 121, crop: { height: '225.63%', left: '-25.61%', top: '-63.7%', width: '135.98%' } },
    { node: '9:329', src: p3frame5, x: 325, y: 26, width: 134, height: 180 },
    { node: '9:330', src: p3frame6, x: 254, y: 131, width: 148, height: 197 },
    { node: '9:328', src: p3frame7, x: 359, y: 107, width: 122, height: 163 },
    { node: '9:320', src: p3stars, x: 359, y: 422, width: 99, height: 114 },
  ],
  4: [
    { node: '3:138', src: p4nature, x: 31, y: 66, width: 275, height: 327, flipX: true, radius: 8, crop: { height: '131.09%', left: '-16.6%', top: '-31.09%', width: '116.6%' } },
    { node: '2:82', src: p4dinner, x: 260, y: 37, width: 198, height: 265, radius: 8 },
    { node: '2:86', src: p4bean, x: -1.5642, y: 442.497, width: 166.8006, height: 133.0989, innerWidth: 150.372746, innerHeight: 72.315997, rotate: 27.23, crop: {} },
    { node: '8:204', src: p4review, x: 227, y: 302, width: 134, height: 158, crop: { height: '121.7%', left: '-3.95%', top: '-10.85%', width: '107.9%' } },
    { node: '2:91', src: p4word2, x: 82.002, y: 458.0048, width: 169.9764, height: 66.9867, crop: { objectPosition: 'bottom' } },
    { node: '2:93', src: p4word1, x: 13.983, y: 388.9776, width: 174.0054, height: 67.045, crop: { objectPosition: 'bottom' } },
    { node: '3:146', src: p4heart, x: 373, y: 214, width: 127, height: 128, crop: { height: '117.65%', top: '-17.65%', width: '105.12%' } },
    { node: '3:150', src: p4heart, x: 352, y: 319, width: 69.708, height: 69.708, innerWidth: 63, innerHeight: 63, rotate: -6.48, crop: { height: '117.65%', top: '-17.65%', width: '105.12%' } },
    { node: '3:152', src: p4heart, x: 400, y: 338, width: 76.803, height: 76.803, innerWidth: 63, innerHeight: 63, rotate: 14.54, crop: { height: '117.65%', top: '-17.65%', width: '105.12%' } },
    { node: '8:208', src: p4shoes, x: 137.9814, y: 399.9963, width: 335.0232, height: 183.0037, crop: {} },
  ],
  5: [
    { node: '2:79', src: p5food, x: 45, y: 46, width: 166, height: 221, radius: 8 },
    { node: '2:80', src: p5family, x: 223, y: 61, width: 222, height: 296, radius: 8 },
    // Node 5:186 has no visible fill in the reference; it contributes no artwork.
    { node: '2:81', src: p5friends, x: 45, y: 278, width: 166, height: 161, radius: 4, crop: { height: '137.64%', left: '-0.04%', top: '-37.6%', width: '99.83%' } },
    { node: '5:191', src: p5fish, x: -37, y: 267, width: 221, height: 408, flipX: true },
    // This photo belongs to section 2:59 and floats over page 5, above its children.
    // Section-relative (322, 462) minus page-frame origin (101, 95).
    { node: '12:420', src: p5dance, x: 221, y: 367, width: 224, height: 168, radius: 8 },
  ],
  6: [
    { node: '13:445', src: p6casino, x: -91.008, y: 53.9858, width: 250.0476, height: 229.0024, crop: { width: '99.95%', height: '99.95%', top: '0.05%' } },
    { node: '9:276', src: p6mushrooms, x: -67, y: 192, width: 265, height: 292, crop: { left: '-9.67%', width: '191.02%' } },
    // Flatten the nested grid into page coordinates, retaining its 9px gutters.
    { node: '5:193', src: p6couple, x: 164, y: 62, width: 300, height: 225, radius: 8 },
    { node: '13:423', src: p6hotpot, x: 164, y: 296, width: 161, height: 173, radius: 4, flipX: true, crop: { height: '124.79%', top: '-10.26%' } },
    { node: '13:433', src: p6dog, x: 334, y: 296, width: 129, height: 173, radius: 4 },
    { node: '13:430', src: p6mushrooms, x: 341.96, y: 405.74, width: 185.618, height: 203.291, innerWidth: 180.6, innerHeight: 198.743, rotate: -1.46, flipX: true, crop: { left: '-9.67%', width: '191.02%' } },
    { node: '3:120', src: p6bisoncouple, x: -17.0166, y: 331.0274, width: 247.0014, height: 275.9922, crop: {} },
    // Keep the GIF proportions and transparent padding; lift and slightly shrink it clear of the bottom trim.
    { node: '5:188', src: p6bison, x: 133.5, y: 392, width: 361, height: 188.1, crop: { left: '1.035205%', top: '12.906676%', width: '95.648701%', height: '80.770014%' } },
  ],
  7: [
    { node: '4:180', src: p6grid1, x: 38, y: 185, width: 129, height: 173, radius: 4 },
    { node: '4:181', src: p6grid2, x: 176, y: 185, width: 130, height: 173, radius: 4 },
    { node: '4:182', src: p6grid3, x: 38, y: 365, width: 130, height: 173, radius: 4 },
    { node: '4:183', src: p6grid4, x: 176, y: 365, width: 130, height: 173, radius: 4 },
    { node: '10:369', src: p6figure, x: 272, y: 206, width: 255, height: 383 },
    { node: '2:69', src: p6dessert, x: 40, y: 42, width: 173, height: 130, radius: 4 },
    { node: '10:375', src: p6saturn, x: 136.986, y: 327.0047, width: 78.0204, height: 59.466, innerWidth: 70.312162, innerHeight: 33.918068, rotate: -23.86, crop: { height: '98.27%', left: '0.57%', top: '0.7%', width: '99.25%' } },
    { node: '10:377', src: p6stars, x: -11.992200, y: 137.935927, width: 36.972000, height: 40.128146, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '10:379', src: p6stars, x: 14.978400, y: 156.910204, width: 37.019400, height: 40.179593, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '10:381', src: p6stars, x: -11.992200, y: 171.935927, width: 36.972000, height: 40.128146, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '13:452', src: p6stars, x: 425.983800, y: -24.089796, width: 37.019400, height: 40.179593, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '13:453', src: p6stars, x: 453.001800, y: -5.089796, width: 37.019400, height: 40.179593, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '13:458', src: p6stars, x: -11.992200, y: 537.935927, width: 36.972000, height: 40.128146, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '13:459', src: p6stars, x: 14.978400, y: 556.910204, width: 37.019400, height: 40.179593, crop: { height: '190.29%', left: '0.71%', top: '-52.01%', width: '257.97%' } },
    { node: '10:389', src: p6comic, x: 229.9848, y: 36.005822, width: 164.004000, height: 129.988356, crop: { height: '227.9%', left: '-6.67%', top: '-72.8%', width: '135.56%' } },
    { node: '10:390', src: p6painting, x: 341.6592, y: 79, width: 116.3196, height: 98.422786, innerWidth: 115.363737, innerHeight: 97.287310, rotate: -0.57, crop: { height: '213.78%', left: '-17.61%', top: '-56.89%', width: '135.21%' } },
    { node: '10:391', src: p6ticket, x: 360.003, y: 50.0214, width: 50.007, height: 28.9751, crop: { height: '96.44%', left: '0.3%', top: '2.52%', width: '99.35%' } },
  ],
  8: [
    { node: '2:72', src: p8portrait, x: 31, y: 49, width: 286, height: 381, radius: 8 },
    { node: '14:464', src: p8dog, x: 272, y: 314, width: 155, height: 206, radius: 8 },
    { node: '14:479', src: p8night, x: 333, y: 49, width: 104, height: 108, radius: 4, crop: { height: '177.25%', left: '-21.47%', top: '-45.39%', width: '138.65%' } },
    { node: '4:184', src: p8cat, x: -31, y: 397, width: 152, height: 197, flipX: true },
    { node: '14:474', src: p8dinner, x: 338, y: 169, width: 92, height: 123, radius: 4 },
    { node: '9:268', src: p6mushrooms, x: 214, y: 467, width: 123.984, height: 120.361, innerWidth: 110.228, innerHeight: 105.965, rotate: -8.05, crop: { height: '138.51%', left: '-131.03%', top: '0%', width: '231.13%' } },
    { node: '10:399', src: p8heart, x: 108, y: 417, width: 133.842, height: 130.824, innerWidth: 110.228, innerHeight: 105.965, rotate: 14.96, crop: { objectPosition: 'bottom' } },
  ],
};

const pageDepths = Object.fromEntries(
  Object.entries(pageArtwork).map(([page, artwork]) => [page, stackingDepths(artwork)]),
) as Record<InsidePage, number[]>;

// A few foreground accents per page; leave the pouring-wine figure stationary.
const popInNodes: Record<InsidePage, readonly string[]> = {
  1: ['9:263', '10:408', '10:410'],
  2: ['9:300', '9:314'],
  3: ['9:329', '9:320'],
  4: ['2:91', '3:150', '3:152'],
  5: ['5:191', '12:420'],
  6: ['13:430', '3:120', '5:188'],
  7: ['10:375', '10:390', '10:391'],
  8: ['4:184', '9:268', '10:399'],
};

export function ScrapbookPage({ page, pageNumber = page }: { page: InsidePage; pageNumber?: number }) {
  return (
    <div className="scrapbook-artwork" data-figma-frame={pageFrames[page]} data-inside-page={page} role="img" aria-label={`Scrapbook collage, inside page ${pageNumber}`}>
      {pageArtwork[page].map((art, index) => (
        <span key={art.node} className="artwork-slot" data-node-id={art.node} style={{
          left: `${art.x / 474 * 100}%`, top: `${art.y / 583 * 100}%`,
          width: `${art.width / 474 * 100}%`, height: `${art.height / 583 * 100}%`,
          '--layer-depth': pageDepths[page][index],
          '--parallax-delay': parallaxDelay(index),
        } as CSSProperties}>
          <span className={`artwork-crop ${popInNodes[page].includes(art.node) ? 'artwork-pop' : ''}`} style={{
            width: `${(art.innerWidth ?? art.width) / art.width * 100}%`,
            height: `${(art.innerHeight ?? art.height) / art.height * 100}%`,
            transform: `rotate(${art.rotate ?? 0}deg) scaleX(${art.flipX ? -1 : 1})`,
            borderRadius: `${(art.radius ?? 0) / 474 * 100}cqw`,
            '--pop-delay': `${Math.max(0, popInNodes[page].indexOf(art.node)) * 75 + 40}ms`,
          } as CSSProperties}>
            {art.node === '10:369' ? <CharacterDepth source={art.src} /> : art.node === '9:353' ? <ChromeSphere fallback={art.src} /> : art.node === '9:234' ? <WinePour /> : art.node === '5:191' ? <SwimmingFish /> : (
              <img src={art.src} alt="" draggable={false} style={art.crop ? { objectFit: 'fill', ...art.crop } : undefined} />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

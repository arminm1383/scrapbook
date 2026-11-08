interface ArtworkBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Paint order determines which overlapping artwork sits nearer the viewer. */
export function stackingDepths(artwork: readonly ArtworkBounds[]) {
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

// Offset the same slow loop so equal-depth images do not drift as one flat sheet.
export function parallaxDelay(index: number) {
  return `${(index % 5) * -2.8}s`;
}

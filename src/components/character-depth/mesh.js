/** Fresh closed mesh derived from the current RGBA silhouette, not a billboard. */
export function buildCharacterMesh(rgba, width, height) {
  const step = 6, columns = Math.ceil(width / step), rows = Math.ceil(height / step);
  const stride = columns + 1, occupied = new Uint8Array(columns * rows);
  const samples = new Uint32Array(occupied.length), distance = new Float32Array(occupied.length);
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const cell = row * columns + col;
    let best = 0;
    for (let y = row * step; y < Math.min(height, (row + 1) * step); y++) {
      for (let x = col * step; x < Math.min(width, (col + 1) * step); x++) {
        const pixel = y * width + x, alpha = rgba[pixel * 4 + 3];
        if (alpha > best) { best = alpha; samples[cell] = pixel; }
      }
    }
    occupied[cell] = best > 0 ? 1 : 0;
    distance[cell] = occupied[cell] ? 10000 : 0;
  }
  // Distance to the silhouette rounds the volume down into its exact outline.
  for (let pass = 0; pass < 2; pass++) {
    for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) {
      const r = pass ? rows - 1 - j : j, c = pass ? columns - 1 - i : i;
      const k = r * columns + c;
      if (!occupied[k]) continue;
      for (const [dr, dc, cost] of (pass ? [[1, 0, 1], [0, 1, 1], [1, 1, 1.414], [1, -1, 1.414]] : [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.414], [-1, 1, 1.414]])) {
        const nr = r + dr, nc = c + dc;
        distance[k] = Math.min(distance[k], nr < 0 || nr >= rows || nc < 0 || nc >= columns ? cost : distance[nr * columns + nc] + cost);
      }
    }
  }
  const ellipsoids = [
    [510, 235, 155, 230, 140], [464, 230, 78, 116, 112],
    [510, 540, 172, 272, 100], [496, 765, 177, 130, 110],
    [341, 625, 69, 115, 48], [718, 837, 38, 55, 40],
    [403, 1380, 77, 151, 65], [556, 1380, 68, 151, 65],
  ];
  const limbs = [
    [350, 410, 306, 593, 54, 49], [306, 593, 255, 750, 43, 43],
    [692, 413, 735, 597, 49, 48], [735, 597, 748, 770, 42, 43],
    [435, 887, 384, 1068, 74, 65], [384, 1068, 405, 1226, 59, 58],
    [566, 887, 552, 1060, 71, 65], [552, 1060, 566, 1226, 55, 56],
  ];
  function depthAt(x, y) {
    // Coordinates below refer to the unmodified 1024 × 1536 source artwork.
    const px = x / width * 1024, py = y / height * 1536;
    let depth = 18;
    for (const [cx, cy, rx, ry, radius] of ellipsoids) {
      const d = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2;
      if (d < 1) depth = Math.max(depth, 6 + radius * Math.sqrt(1 - d));
    }
    for (const [ax, ay, bx, by, radius, thickness] of limbs) {
      const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
      const d = Math.hypot(px - ax - (bx - ax) * t, py - ay - (by - ay) * t) / radius;
      if (d < 1) depth = Math.max(depth, 6 + thickness * Math.sqrt(1 - d * d));
    }
    const col = Math.max(0, Math.min(columns - 1, Math.floor(x / step)));
    const row = Math.max(0, Math.min(rows - 1, Math.floor(y / step)));
    return Math.min(depth, 6 + distance[row * columns + col] * step * 1.6);
  }
  const vertices = [];
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= columns; c++) {
    const x = Math.min(width, c * step), y = Math.min(height, r * step), depth = depthAt(x, y);
    const dx = (depthAt(Math.min(width, x + 1), y) - depthAt(Math.max(0, x - 1), y)) / 2;
    const dy = (depthAt(x, Math.min(height, y + 1)) - depthAt(x, Math.max(0, y - 1))) / 2;
    const len = Math.hypot(dx, dy, 1);
    vertices.push({ x: (x - width / 2) * 2 / height, y: (height / 2 - y) * 2 / height,
      front: depth * 2 / height, back: -(depth * .85 + 8) * 2 / height,
      u: x / width, v: y / height, nx: -dx / len, ny: dy / len, nz: 1 / len });
  }
  const front = [], back = [], sides = [];
  function emit(target, a, b, c, reverse = false, uv) {
    for (const vertex of [a, b, c]) target.push(vertex.x, vertex.y, reverse ? vertex.back : vertex.front,
      reverse ? -vertex.nx : vertex.nx, reverse ? -vertex.ny : vertex.ny, reverse ? -vertex.nz : vertex.nz,
      uv ? uv[0] : vertex.u, uv ? uv[1] : vertex.v);
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
    const cell = r * columns + c;
    if (!occupied[cell]) continue;
    const a = vertices[r * stride + c], b = vertices[r * stride + c + 1];
    const d = vertices[(r + 1) * stride + c], e = vertices[(r + 1) * stride + c + 1];
    emit(front, a, d, b); emit(front, b, d, e);
    emit(back, a, b, d, true); emit(back, b, e, d, true);
    for (const [empty, p, q] of [[r === 0 || !occupied[cell - columns], a, b], [c === columns - 1 || !occupied[cell + 1], b, e], [r === rows - 1 || !occupied[cell + columns], e, d], [c === 0 || !occupied[cell - 1], d, a]]) {
      if (!empty) continue;
      const pixel = samples[cell], uv = [(pixel % width + .5) / width, (Math.floor(pixel / width) + .5) / height];
      const pb = { ...p, front: p.back }, qb = { ...q, front: q.back };
      emit(sides, p, pb, q, false, uv); emit(sides, q, pb, qb, false, uv);
    }
  }
  return { front: new Float32Array(front), back: new Float32Array(back), sides: new Float32Array(sides), width, height };
}

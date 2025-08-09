// Deterministic RNG (Mulberry32)
function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeedToInt(seed) {
  const str = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seed) {
  return mulberry32(hashSeedToInt(seed));
}

export function generateWardLayout(seed, options = {}) {
  const rng = createRng(seed);
  const roomCount = options.roomCount ?? 8;
  const gridSize = options.gridSize ?? 5; // 5x5 grid logical
  const rooms = [];
  const doors = [];
  const loot = [];
  const enemies = [];

  // pick distinct logical coordinates for rooms
  const coords = new Set();
  while (coords.size < roomCount) {
    const x = Math.floor(rng() * gridSize);
    const y = Math.floor(rng() * gridSize);
    coords.add(`${x},${y}`);
  }
  const coordList = Array.from(coords).map(s => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
  });

  // Ensure connectivity via MST-like linking
  const connected = new Set([`${coordList[0].x},${coordList[0].y}`]);
  const edges = [];
  while (connected.size < coordList.length) {
    let best = null;
    for (const a of coordList) {
      for (const b of coordList) {
        const keyA = `${a.x},${a.y}`;
        const keyB = `${b.x},${b.y}`;
        if (keyA === keyB) continue;
        const oneIn = connected.has(keyA) ^ connected.has(keyB);
        if (!oneIn) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = dx * dx + dy * dy + rng() * 0.01;
        if (!best || dist < best.dist) best = { a, b, dist };
      }
    }
    if (best) {
      edges.push(best);
      connected.add(`${best.a.x},${best.a.y}`);
      connected.add(`${best.b.x},${best.b.y}`);
    } else break;
  }

  // Build rooms and doors
  for (const c of coordList) {
    rooms.push({ id: `${c.x},${c.y}`, x: c.x, y: c.y });
  }
  for (const e of edges) {
    doors.push({ from: `${e.a.x},${e.a.y}`, to: `${e.b.x},${e.b.y}` });
  }

  // Place shards (3), player start (first room), boss (last room)
  const shuffled = [...rooms].sort(() => rng() - 0.5);
  const playerStart = rooms[0];
  const bossRoom = shuffled[0];
  const shardRooms = shuffled.slice(1, 4);
  const exitRoom = shuffled[4] || rooms[rooms.length - 1];

  for (const r of shardRooms) loot.push({ type: 'shard', roomId: r.id });

  // Simple loot and enemies placement
  for (const r of rooms) {
    if (!shardRooms.find(s => s.id === r.id) && r.id !== bossRoom.id && r.id !== exitRoom.id) {
      if (rng() < 0.4) loot.push({ type: 'weapon', roomId: r.id });
      if (rng() < 0.5) enemies.push({ type: 'manifestation', roomId: r.id, count: 1 + Math.floor(rng() * 3) });
    }
  }

  return {
    seed,
    gridSize,
    rooms,
    doors,
    loot,
    enemies,
    playerStart,
    bossRoom,
    exitRoom
  };
}


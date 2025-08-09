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
  const rooms = [];
  const doors = [];
  const loot = [];
  const enemies = [];
  const roomType = {}; // id -> 'start'|'combat'|'loot'|'event'|'boss'|'exit'

  let playerStart, bossRoom, exitRoom, shardRooms;
  if (options.phase1Line) {
    // Deterministic 6-room line: start → combat → loot → combat → boss → exit
    const coordList = Array.from({ length: 6 }, (_, i) => ({ x: i, y: 0 }));
    for (const c of coordList) rooms.push({ id: `${c.x},${c.y}`, x: c.x, y: c.y });
    for (let i = 0; i < coordList.length - 1; i++) {
      doors.push({ from: `${coordList[i].x},${coordList[i].y}`, to: `${coordList[i + 1].x},${coordList[i + 1].y}` });
    }
    playerStart = rooms[0];
    bossRoom = rooms[4];
    exitRoom = rooms[5];
    shardRooms = [rooms[1], rooms[2], rooms[3]];
    roomType[rooms[0].id] = 'start';
    roomType[rooms[1].id] = 'combat';
    roomType[rooms[2].id] = 'loot';
    roomType[rooms[3].id] = 'combat';
    roomType[rooms[4].id] = 'boss';
    roomType[rooms[5].id] = 'exit';
  } else {
    const roomCount = options.roomCount ?? 9;
    const gridSize = options.gridSize ?? 4;
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
    // simple connectivity chain for now
    for (const c of coordList) rooms.push({ id: `${c.x},${c.y}`, x: c.x, y: c.y });
    for (let i = 0; i < coordList.length - 1; i++) {
      doors.push({ from: `${coordList[i].x},${coordList[i].y}`, to: `${coordList[i + 1].x},${coordList[i + 1].y}` });
    }
    const shuffled = [...rooms].sort(() => rng() - 0.5);
    playerStart = rooms[0];
    bossRoom = shuffled[0];
    shardRooms = shuffled.slice(1, 4);
    exitRoom = shuffled[4] || rooms[rooms.length - 1];
  }

  for (const r of shardRooms) loot.push({ type: 'shard', roomId: r.id });

  // Simple loot and enemies placement
  for (const r of rooms) {
    if (r.id === playerStart.id) {
      roomType[r.id] = 'start';
      continue;
    }
    if (r.id === bossRoom.id) {
      roomType[r.id] = 'boss';
      continue;
    }
    if (r.id === exitRoom.id) {
      roomType[r.id] = 'exit';
      continue;
    }

    // Event/loot/combat mix
    const roll = rng();
    if (roll < 0.2) {
      roomType[r.id] = 'event';
      if (rng() < 0.6) loot.push({ type: 'trait', roomId: r.id });
      if (rng() < 0.4) loot.push({ type: 'consumable', roomId: r.id });
    } else if (roll < 0.45) {
      roomType[r.id] = 'loot';
      if (rng() < 0.6) loot.push({ type: 'weapon', roomId: r.id });
      if (rng() < 0.6) loot.push({ type: 'consumable', roomId: r.id });
    } else {
      roomType[r.id] = 'combat';
      enemies.push({ type: 'manifestation', roomId: r.id, count: 1 + Math.floor(rng() * 2) });
      if (rng() < 0.3) loot.push({ type: 'consumable', roomId: r.id });
    }
  }

  return {
    seed,
    rooms,
    doors,
    loot,
    enemies,
    roomType,
    playerStart,
    bossRoom,
    exitRoom
  };
}

export function buildAdjacency(doors) {
  const neighbors = new Map();
  const add = (a, b) => {
    if (!neighbors.has(a)) neighbors.set(a, new Set());
    neighbors.get(a).add(b);
  };
  for (const d of doors) {
    add(d.from, d.to);
    add(d.to, d.from);
  }
  const obj = {};
  for (const [k, set] of neighbors.entries()) obj[k] = Array.from(set);
  return obj;
}


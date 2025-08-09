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
    const roomCount = options.roomCount ?? 8;
    const gridSize = options.gridSize ?? 3; // small NxN like 3x3
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
    // Ensure connectivity using greedy linking but restrict to orth adjacency only
    const connected = new Set([`${coordList[0].x},${coordList[0].y}`]);
    const available = new Set(coordList.map(c => `${c.x},${c.y}`));
    for (const c of coordList) rooms.push({ id: `${c.x},${c.y}`, x: c.x, y: c.y });
    while (connected.size < coordList.length) {
      let best = null;
      for (const a of coordList) {
        for (const b of coordList) {
          const keyA = `${a.x},${a.y}`;
          const keyB = `${b.x},${b.y}`;
          if (keyA === keyB) continue;
          const oneIn = connected.has(keyA) ^ connected.has(keyB);
          if (!oneIn) continue;
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);
          if (dx + dy !== 1) continue; // only orth neighbors
          const dist = dx + dy + rng() * 0.01;
          if (!best || dist < best.dist) best = { a, b, dist };
        }
      }
      // if no orth neighbor link available, force-connect by moving towards nearest
      if (!best) {
        // Find nearest pair and add an intermediate room if space allows
        let min = null;
        for (const a of coordList) for (const b of coordList) {
          const keyA = `${a.x},${a.y}`; const keyB = `${b.x},${b.y}`;
          const oneIn = connected.has(keyA) ^ connected.has(keyB);
          if (!oneIn) continue;
          const dx = a.x - b.x; const dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (!min || d2 < min.d2) min = { a, b, d2 };
        }
        if (min) {
          const step = { x: min.a.x + Math.sign(min.b.x - min.a.x), y: min.a.y + Math.sign(min.b.y - min.a.y) };
          const stepKey = `${step.x},${step.y}`;
          if (available.has(stepKey) && !connected.has(stepKey)) {
            doors.push({ from: `${min.a.x},${min.a.y}`, to: stepKey });
            connected.add(stepKey);
          }
        }
      } else {
        doors.push({ from: `${best.a.x},${best.a.y}`, to: `${best.b.x},${best.b.y}` });
        connected.add(`${best.a.x},${best.a.y}`);
        connected.add(`${best.b.x},${best.b.y}`);
      }
    }
    const shuffled = [...rooms].sort(() => rng() - 0.5);
    playerStart = rooms[0];
    bossRoom = shuffled[0];
    shardRooms = []; // will set after adjacency is known
    exitRoom = shuffled[4] || rooms[rooms.length - 1];
  }

  // shards will be assigned after we build adjacency

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

  const adjacency = buildAdjacency(doors);

  // Choose shard rooms reachable from start without passing through the boss room
  const reachable = new Set();
  const queue = [playerStart.id];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === bossRoom.id) continue; // do not traverse into boss for shard access
    if (reachable.has(cur)) continue;
    reachable.add(cur);
    for (const n of adjacency[cur] || []) {
      if (!reachable.has(n) && n !== bossRoom.id) queue.push(n);
    }
  }
  const candidates = rooms.filter(r => reachable.has(r.id) && r.id !== playerStart.id && r.id !== exitRoom.id);
  const shuffledForShards = [...candidates].sort(() => rng() - 0.5);
  shardRooms = shuffledForShards.slice(0, 3);
  for (const r of shardRooms) loot.push({ type: 'shard', roomId: r.id });

  return {
    seed,
    rooms,
    doors,
    loot,
    enemies,
    roomType,
    playerStart,
    bossRoom,
    exitRoom,
    adjacency
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


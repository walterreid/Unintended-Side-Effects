export function createEnemyData(kind, x, y) {
  switch (kind) {
    case 'manifestation':
      return { kind, x, y, speed: 60, health: 20, color: 0xff6666 };
    case 'boss':
      return { kind, x, y, speed: 80, health: 400, color: 0xff00ff };
    default:
      return { kind: 'manifestation', x, y, speed: 60, health: 20, color: 0xff6666 };
  }
}

export function updateEnemyTowards(enemy, target, dt) {
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const len = Math.hypot(dx, dy) || 1;
  enemy.x += (dx / len) * enemy.speed * dt;
  enemy.y += (dy / len) * enemy.speed * dt;
}


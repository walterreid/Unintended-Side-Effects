export const WeaponKind = {
  MoodStabilizer: 'MoodStabilizer',
  AnxiolyticSMG: 'AnxiolyticSMG',
  BetaBlocker: 'BetaBlocker'
};

export function createWeapon(weaponKind) {
  switch (weaponKind) {
    case WeaponKind.MoodStabilizer:
      return {
        name: 'Mood Stabilizer',
        fireRateMs: 350,
        projectileSpeed: 450,
        burst: 1,
        spreadDeg: 0
      };
    case WeaponKind.AnxiolyticSMG:
      return {
        name: 'Anxiolytic SMG',
        fireRateMs: 100,
        projectileSpeed: 500,
        burst: 1,
        spreadDeg: 8
      };
    case WeaponKind.BetaBlocker:
      return {
        name: 'Beta Blocker',
        fireRateMs: 650,
        projectileSpeed: 700,
        burst: 1,
        spreadDeg: 0
      };
    default:
      return createWeapon(WeaponKind.MoodStabilizer);
  }
}

export function nextFireTime(nowMs, weapon) {
  return nowMs + weapon.fireRateMs;
}

export function generateProjectiles(origin, aimAngleRad, weapon, rng) {
  const bullets = [];
  for (let i = 0; i < weapon.burst; i++) {
    const spread = (weapon.spreadDeg * (Math.PI / 180)) * (rng() * 2 - 1);
    const angle = aimAngleRad + spread;
    const vx = Math.cos(angle) * weapon.projectileSpeed;
    const vy = Math.sin(angle) * weapon.projectileSpeed;
    bullets.push({ x: origin.x, y: origin.y, vx, vy, radius: 4, lifetimeMs: 800 });
  }
  return bullets;
}


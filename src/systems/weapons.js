export const WeaponKind = {
  MoodStabilizer: 'MoodStabilizer',
  AnxiolyticSMG: 'AnxiolyticSMG',
  BetaBlocker: 'BetaBlocker',
  Shotgun: 'Shotgun',
  Beam: 'Beam',
  ChargeShot: 'ChargeShot'
};

export function createWeapon(weaponKind) {
  switch (weaponKind) {
    case WeaponKind.MoodStabilizer:
      return {
        kind: weaponKind,
        name: 'Mood Stabilizer',
        fireRateMs: 300,
        projectileSpeed: 600,
        burst: 1,
        spreadDeg: 0,
        projectileKind: 'bullet'
      };
    case WeaponKind.AnxiolyticSMG:
      return {
        kind: weaponKind,
        name: 'Anxiolytic SMG',
        fireRateMs: 90,
        projectileSpeed: 520,
        burst: 1,
        spreadDeg: 10,
        projectileKind: 'bullet'
      };
    case WeaponKind.BetaBlocker:
      return {
        kind: weaponKind,
        name: 'Beta Blocker',
        fireRateMs: 650,
        projectileSpeed: 750,
        burst: 1,
        spreadDeg: 0,
        projectileKind: 'bullet'
      };
    case WeaponKind.Shotgun:
      return {
        kind: weaponKind,
        name: 'Shotgun',
        fireRateMs: 700,
        projectileSpeed: 520,
        burst: 6,
        spreadDeg: 18,
        projectileKind: 'bullet'
      };
    case WeaponKind.Beam:
      return {
        kind: weaponKind,
        name: 'Focus Beam',
        fireRateMs: 40,
        projectileSpeed: 0,
        burst: 1,
        spreadDeg: 0,
        projectileKind: 'beam'
      };
    case WeaponKind.ChargeShot:
      return {
        kind: weaponKind,
        name: 'Charge Shot',
        fireRateMs: 900,
        projectileSpeed: 500,
        burst: 1,
        spreadDeg: 0,
        projectileKind: 'charge'
      };
    default:
      return createWeapon(WeaponKind.MoodStabilizer);
  }
}

export function nextFireTime(nowMs, weapon) {
  return nowMs + weapon.fireRateMs;
}

export function generateProjectiles(origin, aimAngleRad, weapon, rng, chargeRatio = 1) {
  const out = [];
  if (weapon.projectileKind === 'beam') {
    out.push({ kind: 'beam', x: origin.x, y: origin.y, angle: aimAngleRad, width: 4, length: 260, lifetimeMs: 60 });
    return out;
  }
  const burst = weapon.projectileKind === 'charge' ? Math.max(1, Math.round(weapon.burst * (0.5 + chargeRatio))) : weapon.burst;
  for (let i = 0; i < burst; i++) {
    const spread = (weapon.spreadDeg * (Math.PI / 180)) * (rng() * 2 - 1);
    const angle = aimAngleRad + spread;
    const speed = weapon.projectileKind === 'charge' ? weapon.projectileSpeed * (0.8 + 0.7 * chargeRatio) : weapon.projectileSpeed;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const radius = weapon.projectileKind === 'charge' ? 6 + Math.round(5 * chargeRatio) : 4;
    const dmg = weapon.projectileKind === 'charge' ? 22 + Math.round(18 * chargeRatio) : 10;
    out.push({ kind: 'bullet', x: origin.x, y: origin.y, vx, vy, radius, lifetimeMs: 900, damage: dmg });
  }
  return out;
}


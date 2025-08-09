export const TraitKind = {
  FleetOfFoot: 'FleetOfFoot',
  KeenEye: 'KeenEye',
  IronWill: 'IronWill',
  FocusedBreath: 'FocusedBreath',
  NightTerrors: 'NightTerrors',
  ShakyHands: 'ShakyHands'
};

export function rollStartingTraits(rng) {
  const positives = [TraitKind.FleetOfFoot, TraitKind.KeenEye, TraitKind.IronWill, TraitKind.FocusedBreath];
  const negatives = [TraitKind.NightTerrors, TraitKind.ShakyHands];
  const start = [];
  // 2 random positives, 1 random negative
  start.push(positives[Math.floor(rng() * positives.length)]);
  start.push(positives[Math.floor(rng() * positives.length)]);
  start.push(negatives[Math.floor(rng() * negatives.length)]);
  return start;
}

export function applyTraitsToStats(baseStats, traits) {
  const stats = { ...baseStats };
  for (const t of traits) {
    switch (t) {
      case TraitKind.FleetOfFoot:
        stats.moveSpeed *= 1.2;
        break;
      case TraitKind.KeenEye:
        stats.projectileSpeed *= 1.15;
        break;
      case TraitKind.IronWill:
        stats.maxHealth += 20;
        break;
      case TraitKind.FocusedBreath:
        stats.insightRegenPerMin += 1;
        break;
      case TraitKind.NightTerrors:
        stats.auditTimerStart -= 10; // less time after boss
        break;
      case TraitKind.ShakyHands:
        stats.weaponSpreadDeg += 6;
        break;
    }
  }
  return stats;
}


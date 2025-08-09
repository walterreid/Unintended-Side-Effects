export function saveSeed(seed) {
  try {
    localStorage.setItem('use:lastSeed', String(seed));
  } catch (_) {}
}

export function loadLastSeed() {
  try {
    return localStorage.getItem('use:lastSeed');
  } catch (_) {
    return null;
  }
}

export function saveRunData(run) {
  try {
    localStorage.setItem('use:lastRun', JSON.stringify(run));
  } catch (_) {}
}

export function loadLastRun() {
  try {
    const raw = localStorage.getItem('use:lastRun');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearRun() {
  try {
    localStorage.removeItem('use:lastRun');
  } catch (_) {}
}


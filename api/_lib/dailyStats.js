const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

export function dateKeySeoul(date = new Date()) {
  const seoul = new Date(date.getTime() + SEOUL_OFFSET_MS);
  return seoul.toISOString().slice(0, 10);
}

export function statKey(type, date) {
  return `stats:${type}:${date}`;
}

// Calendar dates, newest first, anchored to "today" in Asia/Seoul.
export function recentDateKeys(days) {
  const base = new Date(`${dateKeySeoul()}T00:00:00Z`);
  const keys = [];
  for (let i = 0; i < days; i++) {
    keys.push(new Date(base.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  }
  return keys;
}

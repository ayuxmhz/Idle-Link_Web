// Lets users type RAM/storage naturally ("16GB", "1 TB", "512") instead of
// being locked to a bare number — parses out the value and normalizes it to
// GB, since ramGB/storageGB feed real computations elsewhere (e.g. the
// booking service's simulated RAM utilization), not just display text.
export function parseCapacityToGB(raw: string): number | null {
  const match = raw.trim().toLowerCase().match(/^([\d.]+)\s*(tb|gb|mb|t|g|m)?$/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  if (Number.isNaN(value) || value <= 0) return null;

  const unit = match[2] ?? "gb";
  if (unit.startsWith("t")) return Math.round(value * 1024 * 100) / 100;
  if (unit.startsWith("m")) return Math.round((value / 1024) * 100) / 100;
  return Math.round(value * 100) / 100;
}

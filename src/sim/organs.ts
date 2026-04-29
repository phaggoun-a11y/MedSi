import type { OrganId, OrganState } from "./types";

export const ORGAN_DEFS: { id: OrganId; name: string; stats: string[] }[] = [
  { id: "heart",       name: "Heart",       stats: ["output", "rate", "pressure", "inflammation"] },
  { id: "lungs",       name: "Lungs",       stats: ["o2", "capacity", "inflammation", "scarring"] },
  { id: "liver",       name: "Liver",       stats: ["efficiency", "toxicity", "inflammation", "regen"] },
  { id: "kidneys",     name: "Kidneys",     stats: ["filtration", "toxicity", "inflammation"] },
  { id: "brain",       name: "Brain",       stats: ["perfusion", "clarity", "inflammation"] },
  { id: "stomach",     name: "Stomach",     stats: ["mucosa", "acidity", "bleeding"] },
  { id: "intestines",  name: "Intestines",  stats: ["absorption", "flora", "inflammation"] },
  { id: "pancreas",    name: "Pancreas",    stats: ["insulin", "enzymes", "inflammation"] },
  { id: "skin",        name: "Skin",        stats: ["integrity", "jaundice", "hydration"] },
  { id: "bones",       name: "Bones",       stats: ["density", "marrow"] },
  { id: "immune",      name: "Immune",      stats: ["response", "fatigue"] },
];

export function buildBaselineOrgans(): Record<OrganId, OrganState> {
  const baseline: Partial<Record<string, number>> = {
    output: 85, rate: 70, pressure: 50, inflammation: 5,
    o2: 95, capacity: 90, scarring: 0,
    efficiency: 90, toxicity: 5, regen: 80,
    filtration: 92,
    perfusion: 88, clarity: 90,
    mucosa: 90, acidity: 50, bleeding: 0,
    absorption: 90, flora: 80,
    insulin: 85, enzymes: 85,
    integrity: 95, jaundice: 0, hydration: 80,
    density: 85, marrow: 85,
    response: 80, fatigue: 10,
  };
  const out = {} as Record<OrganId, OrganState>;
  for (const def of ORGAN_DEFS) {
    const stats: Record<string, number> = {};
    for (const s of def.stats) stats[s] = baseline[s] ?? 80;
    out[def.id] = { id: def.id, name: def.name, stats };
  }
  return out;
}

/** Aggregate health score 0-100 per organ */
export function organHealth(o: OrganState): number {
  const s = o.stats;
  let score = 100;
  // Penalties for "bad" stats
  for (const k of ["inflammation", "toxicity", "scarring", "bleeding", "jaundice", "fatigue"]) {
    if (k in s) score -= s[k] * 0.6;
  }
  // Reward for "good" stats (relative to baseline 85)
  const positives = ["output","o2","capacity","efficiency","filtration","perfusion","clarity","mucosa","absorption","insulin","enzymes","integrity","density","marrow","response","regen","hydration","flora"];
  let pos = 0, n = 0;
  for (const k of positives) if (k in s) { pos += s[k]; n++; }
  if (n) score = score * 0.5 + (pos / n) * 0.5;
  return Math.max(0, Math.min(100, score));
}
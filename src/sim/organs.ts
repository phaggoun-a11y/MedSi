import type { OrganId, OrganState, PatientProfile } from "./types";

export interface OrganDef {
  id: OrganId;
  name: string;
  stats: string[];
  /** SVG-overlay hotspot in normalized coords (0-1) of the body image */
  hotspot: { x: number; y: number; r: number };
}

/** Hotspots calibrated to the generated anatomy-body.png (front-facing torso). */
export const ORGAN_DEFS: OrganDef[] = [
  { id: "brain",      name: "Brain",      stats: ["perfusion","clarity","inflammation","neuro"],         hotspot: { x: 0.50, y: 0.08, r: 0.055 } },
  { id: "thyroid",    name: "Thyroid",    stats: ["t3t4","inflammation"],                                hotspot: { x: 0.50, y: 0.22, r: 0.025 } },
  { id: "lungs",      name: "Lungs",      stats: ["o2","capacity","inflammation","scarring"],            hotspot: { x: 0.40, y: 0.34, r: 0.07 }  },
  { id: "heart",      name: "Heart",      stats: ["output","rate","pressure","inflammation","rhythm"],   hotspot: { x: 0.52, y: 0.36, r: 0.05 }  },
  { id: "liver",      name: "Liver",      stats: ["efficiency","toxicity","inflammation","regen"],       hotspot: { x: 0.42, y: 0.50, r: 0.06 }  },
  { id: "spleen",     name: "Spleen",     stats: ["filtration","immune"],                                hotspot: { x: 0.62, y: 0.50, r: 0.025 } },
  { id: "stomach",    name: "Stomach",    stats: ["mucosa","acidity","bleeding"],                        hotspot: { x: 0.55, y: 0.54, r: 0.035 } },
  { id: "pancreas",   name: "Pancreas",   stats: ["insulin","enzymes","inflammation"],                   hotspot: { x: 0.50, y: 0.58, r: 0.025 } },
  { id: "kidneys",    name: "Kidneys",    stats: ["filtration","toxicity","inflammation"],               hotspot: { x: 0.36, y: 0.60, r: 0.03 }  },
  { id: "intestines", name: "Intestines", stats: ["absorption","flora","inflammation"],                  hotspot: { x: 0.50, y: 0.72, r: 0.07 }  },
  { id: "bladder",    name: "Bladder",    stats: ["capacity","inflammation"],                            hotspot: { x: 0.50, y: 0.86, r: 0.025 } },
  { id: "skin",       name: "Skin",       stats: ["integrity","jaundice","hydration"],                   hotspot: { x: 0.18, y: 0.40, r: 0.025 } },
  { id: "bones",      name: "Bones",      stats: ["density","marrow"],                                   hotspot: { x: 0.82, y: 0.45, r: 0.025 } },
  { id: "immune",     name: "Immune",     stats: ["response","fatigue"],                                 hotspot: { x: 0.82, y: 0.55, r: 0.025 } },
];

const POSITIVE = new Set(["output","o2","capacity","efficiency","filtration","perfusion","clarity","mucosa","absorption","insulin","enzymes","integrity","density","marrow","response","regen","hydration","flora","t3t4","neuro","rhythm","immune"]);
const NEGATIVE = new Set(["inflammation","toxicity","scarring","bleeding","jaundice","fatigue"]);

export function isPositiveStat(s: string) { return POSITIVE.has(s); }
export function isNegativeStat(s: string) { return NEGATIVE.has(s); }

const BASELINE: Record<string, number> = {
  output: 85, rate: 70, pressure: 50, rhythm: 95, inflammation: 5,
  o2: 96, capacity: 92, scarring: 0,
  efficiency: 90, toxicity: 5, regen: 80,
  filtration: 92,
  perfusion: 88, clarity: 92, neuro: 90,
  mucosa: 90, acidity: 50, bleeding: 0,
  absorption: 90, flora: 82,
  insulin: 88, enzymes: 86,
  integrity: 94, jaundice: 0, hydration: 80,
  density: 88, marrow: 86,
  response: 84, fatigue: 10,
  t3t4: 88, immune: 84,
};

/** Build organ baselines, modulated by patient profile (age, sex, BMI). */
export function buildBaselineOrgans(profile: PatientProfile): Record<OrganId, OrganState> {
  const bmi = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
  const ageFactor = Math.max(0, (profile.age - 30) * 0.25); // -0.25 per yr after 30
  const bmiPenalty = bmi > 30 ? (bmi - 30) * 1.2 : bmi < 18 ? (18 - bmi) * 1.0 : 0;

  const out = {} as Record<OrganId, OrganState>;
  for (const def of ORGAN_DEFS) {
    const stats: Record<string, number> = {};
    for (const s of def.stats) {
      let base = BASELINE[s] ?? 80;
      if (POSITIVE.has(s)) base = clamp(base - ageFactor - bmiPenalty * 0.4);
      if (s === "pressure") base = clamp(base + ageFactor * 0.6 + bmiPenalty * 0.5);
      if (s === "inflammation") base = clamp(base + bmiPenalty * 0.3);
      stats[s] = Math.round(base);
    }
    out[def.id] = { id: def.id, name: def.name, stats };
  }
  return out;
}

function clamp(v: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }

/** Aggregate health score 0-100 per organ */
export function organHealth(o: OrganState): number {
  const s = o.stats;
  let score = 100;
  for (const k of NEGATIVE) if (k in s) score -= s[k] * 0.55;
  let pos = 0, n = 0;
  for (const k of Object.keys(s)) if (POSITIVE.has(k)) { pos += s[k]; n++; }
  if (n) score = score * 0.5 + (pos / n) * 0.5;
  // pressure penalty if abnormal
  if ("pressure" in s) score -= Math.max(0, Math.abs(s.pressure - 50) - 15) * 0.5;
  return Math.max(0, Math.min(100, score));
}
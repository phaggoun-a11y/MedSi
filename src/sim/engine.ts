import { ORGAN_DEFS, buildBaselineOrgans } from "./organs";
import type { ActiveEntity, Entity, PatientState, SimEvent } from "./types";

export function newPatient(age = 35): PatientState {
  return {
    age,
    ticks: 0,
    organs: buildBaselineOrgans(),
    active: [],
    events: [],
  };
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

/** Resolve one simulation tick. */
export function tick(state: PatientState): PatientState {
  const next: PatientState = {
    ...state,
    ticks: state.ticks + 1,
    organs: structuredClone(state.organs),
    active: state.active.map((a) => ({ ...a, ageTicks: a.ageTicks + 1 })),
    events: [...state.events],
  };

  // Collect tags present on patient
  const allTags = new Set<string>();
  for (const a of next.active) {
    for (const m of a.entity.modifiers) m.tags?.forEach((t) => allTags.add(t));
  }

  // Apply each modifier
  for (const a of next.active) {
    const e = a.entity;

    // Intensity decay (half-life)
    if (e.halfLife && e.halfLife > 0) {
      a.intensity = Math.max(0, (e.intensity ?? 1) * Math.pow(0.5, a.ageTicks / e.halfLife));
    } else {
      a.intensity = e.intensity ?? 1;
    }

    for (const m of e.modifiers) {
      let delta = m.delta * a.intensity;

      // Synergy: if this entity amplifies tags also present, boost
      if (e.amplifies && m.tags?.some((t) => e.amplifies!.includes(t))) {
        delta *= 1.5;
      }
      // Suppression: if any active entity suppresses these tags, dampen
      const suppressed = next.active.some(
        (b) => b !== a && b.entity.suppresses?.some((t) => m.tags?.includes(t))
      );
      if (suppressed) delta *= 0.35;

      // Cross-entity amplification (other entities amplify these tags)
      const amplified = next.active.some(
        (b) => b !== a && b.entity.amplifies?.some((t) => m.tags?.includes(t))
      );
      if (amplified) delta *= 1.4;

      // Micro-variance ±10%
      delta *= 0.9 + Math.random() * 0.2;

      const organ = next.organs[m.organ];
      if (organ && m.stat in organ.stats) {
        organ.stats[m.stat] = clamp(organ.stats[m.stat] + delta);
      }
    }
  }

  // Homeostasis: drift toward baseline slowly when no modifiers act on a stat
  for (const def of ORGAN_DEFS) {
    const organ = next.organs[def.id];
    for (const stat of def.stats) {
      const baseline = ["inflammation","toxicity","scarring","bleeding","jaundice","fatigue"].includes(stat) ? 5 : 85;
      organ.stats[stat] += (baseline - organ.stats[stat]) * 0.005;
    }
  }

  // Threshold cascade events
  const events: SimEvent[] = [];
  const heart = next.organs.heart;
  if (heart.stats.pressure > 80 && heart.stats.inflammation > 50) {
    events.push({ tick: next.ticks, severity: "critical" as const, message: "⚠ Cardiac crisis: pressure + inflammation cascade" });
  }
  if (next.organs.lungs.stats.o2 < 35) {
    events.push({ tick: next.ticks, severity: "warning" as const, message: "Hypoxia detected — O₂ saturation critical" });
  }
  if (next.organs.liver.stats.toxicity > 75 && next.organs.liver.stats.efficiency < 35) {
    events.push({ tick: next.ticks, severity: "critical" as const, message: "⚠ Hepatic failure imminent" });
  }
  if (next.organs.kidneys.stats.filtration < 30) {
    events.push({ tick: next.ticks, severity: "warning" as const, message: "Renal filtration impaired" });
  }
  next.events = [...next.events, ...events].slice(-30);

  return next;
}

export function addEntity(state: PatientState, entity: Entity): PatientState {
  if (state.active.some((a) => a.entity.id === entity.id)) return state;
  const active: ActiveEntity = { entity, ageTicks: 0, intensity: entity.intensity ?? 1 };
  return {
    ...state,
    active: [...state.active, active],
    events: [...state.events, { tick: state.ticks, severity: "info" as const, message: `+ ${entity.name} applied` }].slice(-30),
  };
}

export function removeEntity(state: PatientState, id: string): PatientState {
  return {
    ...state,
    active: state.active.filter((a) => a.entity.id !== id),
    events: [...state.events, { tick: state.ticks, severity: "info" as const, message: `– ${id} removed` }].slice(-30),
  };
}

/** Detect interaction warnings between active entities. */
export function detectInteractions(state: PatientState): SimEvent[] {
  const out: SimEvent[] = [];
  const ids = state.active.map((a) => a.entity.id);
  if (ids.includes("aspirin") && ids.includes("ulcer")) {
    out.push({ tick: state.ticks, severity: "warning" as const, message: "Aspirin + Ulcer → bleeding risk amplified" });
  }
  if (ids.includes("alcohol") && ids.includes("metformin")) {
    out.push({ tick: state.ticks, severity: "warning" as const, message: "Alcohol + Metformin → lactic acidosis risk" });
  }
  if (ids.includes("smoking") && ids.includes("hypertension")) {
    out.push({ tick: state.ticks, severity: "caution" as const, message: "Smoking compounds hypertensive vascular damage" });
  }
  if (ids.includes("ace_inhibitor") && ids.includes("hypertension")) {
    out.push({ tick: state.ticks, severity: "info" as const, message: "ACE inhibitor actively suppressing hypertension" });
  }
  return out;
}
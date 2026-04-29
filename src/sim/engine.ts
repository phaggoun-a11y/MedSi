import { ORGAN_DEFS, buildBaselineOrgans, organHealth } from "./organs";
import type { ActiveEntity, Entity, PatientProfile, PatientState, SimEvent } from "./types";

export function newPatient(profile: PatientProfile): PatientState {
  return {
    profile,
    ticks: 0,
    organs: buildBaselineOrgans(profile),
    active: [],
    events: [{ tick: 0, severity: "info", message: `Patient ${profile.name || "Subject"} initialized — ${profile.age}y ${profile.sex}` }],
    alive: true,
  };
}

function clamp(v: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }

const BAD = new Set(["inflammation","toxicity","scarring","bleeding","jaundice","fatigue"]);
const HOMEO_BAD = 5;
const HOMEO_GOOD = 85;

/** Resolve one simulation tick. */
export function tick(state: PatientState): PatientState {
  if (!state.alive) return state;
  const next: PatientState = {
    ...state,
    ticks: state.ticks + 1,
    organs: structuredClone(state.organs),
    active: state.active.map((a) => ({ ...a, ageTicks: a.ageTicks + 1 })),
    events: [...state.events],
  };

  // --- 1. Decay intensities & drop expired ---
  next.active = next.active.filter((a) => {
    const e = a.entity;
    if (e.halfLife && e.halfLife > 0) {
      a.intensity = (e.intensity ?? 1) * Math.pow(0.5, a.ageTicks / e.halfLife);
      if (a.intensity < 0.05) {
        next.events.push({ tick: next.ticks, severity: "info", message: `${e.name} cleared` });
        return false;
      }
    } else {
      a.intensity = e.intensity ?? 1;
    }
    return true;
  });

  // --- 2. Apply each modifier with synergy/suppression ---
  for (const a of next.active) {
    const e = a.entity;
    for (const m of e.modifiers) {
      let delta = m.delta * a.intensity;

      const myTags = m.tags ?? [];
      // Suppression by other entities
      const suppressed = next.active.some(
        (b) => b !== a && b.entity.suppresses?.some((t) => myTags.includes(t))
      );
      if (suppressed) delta *= 0.3;

      // Cross-entity amplification
      const amplified = next.active.some(
        (b) => b !== a && b.entity.amplifies?.some((t) => myTags.includes(t))
      );
      if (amplified) delta *= 1.5;

      // Self-tag amplification
      if (e.amplifies && myTags.some((t) => e.amplifies!.includes(t))) {
        delta *= 1.4;
      }

      // Stochastic micro-variance
      delta *= 0.88 + Math.random() * 0.24;

      const organ = next.organs[m.organ];
      if (organ && m.stat in organ.stats) {
        organ.stats[m.stat] = clamp(organ.stats[m.stat] + delta);
      }
    }
  }

  // --- 3. Homeostasis drift ---
  for (const def of ORGAN_DEFS) {
    const organ = next.organs[def.id];
    for (const stat of def.stats) {
      const baseline = BAD.has(stat) ? HOMEO_BAD : (stat === "pressure" ? 50 : stat === "rate" ? 70 : stat === "acidity" ? 50 : HOMEO_GOOD);
      organ.stats[stat] += (baseline - organ.stats[stat]) * 0.004;
    }
  }

  // --- 4. Threshold cascade events ---
  emitCascadeEvents(next);

  // --- 5. Death check ---
  const overall = Object.values(next.organs).reduce((s, o) => s + organHealth(o), 0) / ORGAN_DEFS.length;
  if (overall < 12) {
    next.alive = false;
    next.events.push({ tick: next.ticks, severity: "critical", message: "✕ Multi-organ failure — patient deceased" });
  }

  // Cap event log
  if (next.events.length > 80) next.events = next.events.slice(-80);
  return next;
}

function emitCascadeEvents(s: PatientState) {
  const lastTick = s.events[s.events.length - 1]?.tick;
  const o = s.organs;
  const push = (severity: SimEvent["severity"], message: string, key: string) => {
    // dedupe within last 30 ticks
    const recent = s.events.slice(-15).some((e) => e.message === message);
    if (!recent) s.events.push({ tick: s.ticks, severity, message });
  };
  if (o.heart.stats.pressure > 80 && o.heart.stats.inflammation > 45) push("critical", "⚠ Cardiac crisis — pressure + inflammation cascade", "card");
  if (o.lungs.stats.o2 < 38) push("warning", "Hypoxia — O₂ saturation critical", "hyp");
  if (o.liver.stats.toxicity > 75 && o.liver.stats.efficiency < 35) push("critical", "⚠ Hepatic failure imminent", "hep");
  if (o.kidneys.stats.filtration < 30) push("warning", "Renal filtration impaired", "ren");
  if (o.brain.stats.perfusion < 35) push("critical", "⚠ Cerebral hypoperfusion — stroke risk", "stroke");
  if (o.pancreas.stats.insulin < 30) push("warning", "Insulin secretion compromised", "ins");
  if (o.stomach.stats.bleeding > 55) push("warning", "GI bleeding detected", "gi");
  if (o.skin.stats.jaundice > 50) push("caution", "Jaundice visible — bilirubin elevated", "jau");
  if (o.immune.stats.fatigue > 75) push("caution", "Immune exhaustion", "imm");
}

export function addEntity(state: PatientState, entity: Entity): PatientState {
  if (state.active.some((a) => a.entity.id === entity.id)) return state;
  const active: ActiveEntity = { entity, ageTicks: 0, intensity: entity.intensity ?? 1 };
  return {
    ...state,
    active: [...state.active, active],
    events: [...state.events, { tick: state.ticks, severity: "info", message: `+ ${entity.name}` }],
  };
}

export function removeEntity(state: PatientState, id: string): PatientState {
  const removed = state.active.find((a) => a.entity.id === id);
  return {
    ...state,
    active: state.active.filter((a) => a.entity.id !== id),
    events: removed
      ? [...state.events, { tick: state.ticks, severity: "info", message: `– ${removed.entity.name} discontinued` }]
      : state.events,
  };
}

/** Detect interaction warnings between active entities. */
export function detectInteractions(state: PatientState): SimEvent[] {
  const out: SimEvent[] = [];
  const ids = new Set(state.active.map((a) => a.entity.id));
  const add = (sev: SimEvent["severity"], msg: string) => out.push({ tick: state.ticks, severity: sev, message: msg });

  for (const a of state.active) {
    for (const cid of a.entity.contraindications ?? []) {
      if (ids.has(cid)) {
        const other = state.active.find((x) => x.entity.id === cid)!;
        add("warning", `⚠ ${a.entity.name} + ${other.entity.name} → contraindicated`);
      }
    }
    for (const sid of a.entity.synergies ?? []) {
      if (ids.has(sid)) {
        const other = state.active.find((x) => x.entity.id === sid)!;
        add("info", `${a.entity.name} ↔ ${other.entity.name} synergy active`);
      }
    }
    // suppression hints
    const suppressedTargets = state.active.filter(
      (b) => b !== a && b.entity.modifiers.some((m) => m.tags?.some((t) => a.entity.suppresses?.includes(t)))
    );
    for (const t of suppressedTargets) {
      add("info", `${a.entity.name} actively suppressing ${t.entity.name}`);
    }
  }
  // dedupe
  return Array.from(new Map(out.map((e) => [e.message, e])).values());
}
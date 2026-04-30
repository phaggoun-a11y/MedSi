import { ORGAN_DEFS, buildBaselineOrgans, organHealth } from "./organs";
import type { ActiveEntity, Entity, OrganId, PatientProfile, PatientState, SimEvent, StatsSnapshot } from "./types";

/** Crucial organs — reaching 0% health on any = instant death */
const CRUCIAL_ORGANS: Set<OrganId> = new Set(["heart", "brain", "lungs", "liver", "kidneys"]);

/** Effect multiplier — amplifies all disease/drug deltas for engaging pace */
const IMPACT_MULTIPLIER = 2.5;

export function newPatient(profile: PatientProfile): PatientState {
  return {
    profile,
    ticks: 0,
    organs: buildBaselineOrgans(profile),
    active: [],
    events: [{ tick: 0, severity: "info", message: `Patient ${profile.name || "Subject"} initialized — ${profile.age}y ${profile.sex}` }],
    alive: true,
    statsHistory: [],
  };
}

function clamp(v: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }

const BAD = new Set(["inflammation", "toxicity", "scarring", "bleeding", "jaundice", "fatigue"]);
const HOMEO_BAD = 5;
const HOMEO_GOOD = 85;

/** Snapshot current organ health for history tracking */
function takeSnapshot(state: PatientState): StatsSnapshot {
  const organs: Record<string, number> = {};
  for (const def of ORGAN_DEFS) {
    organs[def.id] = organHealth(state.organs[def.id]);
  }
  return { tick: state.ticks, organs };
}

/** Resolve one simulation tick. */
export function tick(state: PatientState): PatientState {
  if (!state.alive) return state;
  const next: PatientState = {
    ...state,
    ticks: state.ticks + 1,
    organs: structuredClone(state.organs),
    active: state.active.map((a) => ({ ...a, ageTicks: a.ageTicks + 1 })),
    events: [...state.events],
    statsHistory: [...state.statsHistory],
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
      let delta = m.delta * a.intensity * IMPACT_MULTIPLIER;

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
        const before = organ.stats[m.stat];
        organ.stats[m.stat] = clamp(organ.stats[m.stat] + delta);
        // Detailed per-tick event logging (every 5 ticks)
        if (next.ticks % 5 === 0) {
          const after = organ.stats[m.stat];
          const diff = after - before;
          if (Math.abs(diff) > 0.3) {
            const arrow = diff > 0 ? "↑" : "↓";
            const severity: SimEvent["severity"] = Math.abs(diff) > 2 ? "warning" : "info";
            next.events.push({
              tick: next.ticks,
              severity,
              message: `${organ.name} ${m.stat}: ${before.toFixed(0)}% → ${after.toFixed(0)}% ${arrow} (${e.name})`,
            });
          }
        }
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

  // --- 5. Crucial organ death check ---
  for (const cid of CRUCIAL_ORGANS) {
    const health = organHealth(next.organs[cid]);
    if (health <= 0) {
      next.alive = false;
      const organName = next.organs[cid].name;
      next.events.push({ tick: next.ticks, severity: "critical", message: `✕ ${organName} failure — 0% health` });
      // Cascading failure log
      if (cid === "heart") {
        next.events.push({ tick: next.ticks, severity: "critical", message: "→ Cardiac arrest → Brain hypoxia → Systemic shutdown" });
      } else if (cid === "brain") {
        next.events.push({ tick: next.ticks, severity: "critical", message: "→ Brain death → Autonomic failure → Cardiac arrest" });
      } else if (cid === "lungs") {
        next.events.push({ tick: next.ticks, severity: "critical", message: "→ Respiratory failure → Hypoxia → Cardiac arrest" });
      } else if (cid === "liver") {
        next.events.push({ tick: next.ticks, severity: "critical", message: "→ Hepatic failure → Toxin buildup → Multi-organ shutdown" });
      } else if (cid === "kidneys") {
        next.events.push({ tick: next.ticks, severity: "critical", message: "→ Renal failure → Uremia → Cardiac arrhythmia → Death" });
      }
      next.events.push({ tick: next.ticks, severity: "critical", message: "✕ PATIENT DEATH — Simulation ended" });
      break;
    }
  }

  // Also check overall vitality
  if (next.alive) {
    const overall = Object.values(next.organs).reduce((s, o) => s + organHealth(o), 0) / ORGAN_DEFS.length;
    if (overall < 12) {
      next.alive = false;
      next.events.push({ tick: next.ticks, severity: "critical", message: "✕ Multi-organ failure — patient deceased" });
    }
  }

  // --- 6. Record stats history snapshot (every 3 ticks) ---
  if (next.ticks % 3 === 0) {
    next.statsHistory.push(takeSnapshot(next));
    // Keep last 200 snapshots
    if (next.statsHistory.length > 200) next.statsHistory = next.statsHistory.slice(-200);
  }

  // Cap event log at 200
  if (next.events.length > 200) next.events = next.events.slice(-200);
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
  // Lowered thresholds (50% lower) for faster/more dramatic cascade
  if (o.heart.stats.pressure > 65 && o.heart.stats.inflammation > 30) push("critical", "⚠ Cardiac crisis — pressure + inflammation cascade", "card");
  if (o.lungs.stats.o2 < 50) push("warning", "Hypoxia — O₂ saturation critical", "hyp");
  if (o.liver.stats.toxicity > 50 && o.liver.stats.efficiency < 50) push("critical", "⚠ Hepatic failure imminent", "hep");
  if (o.kidneys.stats.filtration < 45) push("warning", "Renal filtration impaired", "ren");
  if (o.brain.stats.perfusion < 50) push("critical", "⚠ Cerebral hypoperfusion — stroke risk", "stroke");
  if (o.pancreas.stats.insulin < 45) push("warning", "Insulin secretion compromised", "ins");
  if (o.stomach.stats.bleeding > 35) push("warning", "GI bleeding detected", "gi");
  if (o.skin.stats.jaundice > 30) push("caution", "Jaundice visible — bilirubin elevated", "jau");
  if (o.immune.stats.fatigue > 50) push("caution", "Immune exhaustion", "imm");
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
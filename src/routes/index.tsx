import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Pause, Play, RotateCcw, X, FastForward } from "lucide-react";
import { BodyMap } from "@/components/BodyMap";
import { EntityPicker } from "@/components/EntityPicker";
import { StatBar } from "@/components/StatBar";
import { addEntity, detectInteractions, newPatient, removeEntity, tick } from "@/sim/engine";
import { ORGAN_DEFS, organHealth } from "@/sim/organs";
import type { OrganId, PatientState } from "@/sim/types";

export const Route = createFileRoute("/")({
  component: Index,
});

const INVERTED_STATS = new Set(["inflammation", "toxicity", "scarring", "bleeding", "jaundice", "fatigue", "pressure"]);

function Index() {
  const [patient, setPatient] = useState<PatientState>(() => newPatient(38));
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<OrganId>("heart");
  const stateRef = useRef(patient);
  stateRef.current = patient;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPatient((p) => tick(p));
    }, 600 / speed);
    return () => clearInterval(interval);
  }, [running, speed]);

  const activeIds = useMemo(() => new Set(patient.active.map((a) => a.entity.id)), [patient.active]);
  const interactions = useMemo(() => detectInteractions(patient), [patient]);
  const overall = useMemo(
    () => Object.values(patient.organs).reduce((s, o) => s + organHealth(o), 0) / 11,
    [patient.organs]
  );
  const selectedOrgan = patient.organs[selected];
  const selectedDef = ORGAN_DEFS.find((o) => o.id === selected)!;

  return (
    <main className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-[0.2em]">BIOSIM</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Human Body Organ Simulator · v0.1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-1.5">
            <span>Tick</span>
            <span className="text-primary tabular-nums font-semibold">{patient.ticks.toString().padStart(5, "0")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-1.5">
            <span>Vitality</span>
            <span
              className="tabular-nums font-semibold"
              style={{ color: overall > 60 ? "var(--health)" : overall > 35 ? "var(--warning)" : "var(--crisis)" }}
            >
              {overall.toFixed(0)}%
            </span>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_340px]">
        {/* Left: Entity Picker */}
        <aside className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-[var(--shadow-panel)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.2em] text-primary">Modifier Library</h2>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {activeIds.size} active
            </span>
          </div>
          <EntityPicker onAdd={(e) => setPatient((p) => addEntity(p, e))} activeIds={activeIds} />

          {/* Active modifiers */}
          <div className="mt-5">
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Applied</h3>
            {patient.active.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic">Body in baseline state.</p>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {patient.active.map((a) => (
                  <div
                    key={a.entity.id}
                    className="group flex items-center justify-between gap-2 rounded-md border border-border/40 bg-secondary/30 px-2 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{a.entity.name}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {a.entity.category} · t+{a.ageTicks} · {(a.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                    <button
                      onClick={() => setPatient((p) => removeEntity(p, a.entity.id))}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center: Body */}
        <section className="flex flex-col gap-3">
          <div className="relative flex-1 min-h-[500px]">
            <BodyMap patient={patient} selected={selected} onSelect={setSelected} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-[var(--shadow-panel)]">
            <button
              onClick={() => setRunning((r) => !r)}
              className="flex items-center gap-2 rounded-md bg-primary/20 border border-primary/40 px-4 py-2 text-xs uppercase tracking-[0.15em] text-primary hover:bg-primary/30 transition-colors"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Pause" : "Run"}
            </button>
            <div className="flex items-center gap-1 rounded-md border border-border/60 bg-secondary/30 p-1">
              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded px-2 py-1 text-[10px] tabular-nums ${
                    speed === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <button
              onClick={() => setPatient((p) => tick(p))}
              className="flex items-center gap-1 rounded-md border border-border/60 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:border-primary/60"
            >
              <FastForward className="h-3 w-3" /> Step
            </button>
            <button
              onClick={() => setPatient(newPatient(38))}
              className="ml-auto flex items-center gap-1 rounded-md border border-border/60 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive hover:border-destructive/60"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </section>

        {/* Right: Selected organ + events */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-[var(--shadow-panel)]">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xs uppercase tracking-[0.2em] text-primary">{selectedDef.name}</h2>
              <span
                className="text-xs tabular-nums font-semibold"
                style={{
                  color:
                    organHealth(selectedOrgan) > 60
                      ? "var(--health)"
                      : organHealth(selectedOrgan) > 35
                        ? "var(--warning)"
                        : "var(--crisis)",
                }}
              >
                {organHealth(selectedOrgan).toFixed(0)}% HEALTH
              </span>
            </div>
            <div className="space-y-3">
              {selectedDef.stats.map((s) => (
                <StatBar
                  key={s}
                  label={s}
                  value={selectedOrgan.stats[s]}
                  inverted={INVERTED_STATS.has(s)}
                />
              ))}
            </div>
          </div>

          {/* Interaction warnings */}
          {interactions.length > 0 && (
            <div className="rounded-2xl border border-warning/40 bg-card/60 p-4 shadow-[var(--shadow-panel)]">
              <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--warning)" }}>
                Interaction Analysis
              </h3>
              <div className="space-y-1.5">
                {interactions.map((i, idx) => (
                  <div key={idx} className="text-xs leading-relaxed text-foreground/90">
                    {i.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event log */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-[var(--shadow-panel)] flex-1 min-h-[200px]">
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Event Log</h3>
            <div className="space-y-1 font-mono text-[11px] max-h-[260px] overflow-y-auto">
              {patient.events.slice().reverse().map((e, i) => {
                const color =
                  e.severity === "critical" ? "var(--crisis)" :
                  e.severity === "warning" ? "var(--warning)" :
                  e.severity === "caution" ? "var(--accent)" :
                  "var(--muted-foreground)";
                return (
                  <div key={i} className="flex gap-2 leading-tight">
                    <span className="text-muted-foreground/60 tabular-nums">{e.tick.toString().padStart(4, "0")}</span>
                    <span style={{ color }}>{e.message}</span>
                  </div>
                );
              })}
              {patient.events.length === 0 && (
                <p className="text-muted-foreground/60 italic">Awaiting input…</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
        Reactive State Machine · {ORGAN_DEFS.length} Organs · {patient.active.length > 0 ? "Cascading" : "Homeostasis"}
      </footer>
    </main>
  );
}

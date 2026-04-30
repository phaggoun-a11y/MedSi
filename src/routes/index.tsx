import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Activity, BarChart3, FastForward, Moon, Pause, Play, RotateCcw, Sun, X } from "lucide-react";
import { BodyMap } from "@/components/BodyMap";
import { EntityPicker } from "@/components/EntityPicker";
import { ProfileSetup } from "@/components/ProfileSetup";
import { StatBar } from "@/components/StatBar";
import { StatsGraph } from "@/components/StatsGraph";
import { addEntity, detectInteractions, newPatient, removeEntity, tick } from "@/sim/engine";
import { ORGAN_DEFS, organHealth } from "@/sim/organs";
import type { Entity, OrganId, PatientProfile, PatientState } from "@/sim/types";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const [patient, setPatient] = useState<PatientState | null>(null);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<OrganId>("heart");
  const startRef = useRef<{ profile: PatientProfile; preset: Entity[] } | null>(null);
  const [showGraphs, setShowGraphs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");

  useEffect(() => {
    if (!running || !patient || !patient.alive) return;
    const id = setInterval(() => setPatient((p) => (p ? tick(p) : p)), 600 / speed);
    return () => clearInterval(id);
  }, [running, speed, patient?.alive]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!patient) {
    return (
      <ProfileSetup
        onStart={(profile, preset) => {
          startRef.current = { profile, preset };
          let p = newPatient(profile);
          for (const e of preset) p = addEntity(p, e);
          setPatient(p);
        }}
      />
    );
  }

  const activeIds = new Set(patient.active.map((a) => a.entity.id));
  const interactions = detectInteractions(patient);
  const overall = Object.values(patient.organs).reduce((s, o) => s + organHealth(o), 0) / ORGAN_DEFS.length;
  const selectedOrgan = patient.organs[selected];
  const selectedDef = ORGAN_DEFS.find((o) => o.id === selected)!;

  const filteredEvents = logFilter === "all"
    ? patient.events
    : patient.events.filter((e) => e.message.toLowerCase().includes(logFilter.toLowerCase()));

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-[0.2em]">MedSim</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {patient.profile.name} · {patient.profile.age}y · {patient.profile.sex}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <Stat label="Tick" value={patient.ticks.toString().padStart(5, "0")} />
          <Stat label="Vitality" value={`${overall.toFixed(0)}%`}
            color={overall > 60 ? "var(--health)" : overall > 35 ? "var(--warning)" : "var(--crisis)"} />
          <Stat label="Active" value={patient.active.length.toString()} />
          <button
            onClick={() => setShowGraphs((g) => !g)}
            className={`flex items-center gap-1 rounded-md border px-3 py-1.5 transition-all ${showGraphs ? "border-primary/60 bg-primary/20 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 className="h-3 w-3" /> Graphs
          </button>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="rounded-md border border-border/60 px-2 py-1.5 text-muted-foreground hover:text-foreground"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => { setPatient(null); setRunning(true); }}
            className="rounded-md border border-border/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive hover:border-destructive/60"
          >
            New Patient
          </button>
        </div>
      </header>

      {showGraphs && (
        <div className="mb-4">
          <StatsGraph history={patient.statsHistory} onClose={() => setShowGraphs(false)} />
        </div>
      )}

      {!patient.alive && (
        <div className="mb-4 rounded-2xl border-2 border-destructive/60 bg-destructive/10 p-4 text-center">
          <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-destructive">Patient Death</h2>
          <p className="mt-1 text-xs text-muted-foreground">Simulation ended. Review event log for cause of death.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_340px]">
        {/* Left: picker */}
        <aside className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-[var(--shadow-panel)] backdrop-blur-sm">
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Modifier Library</h2>
          <EntityPicker activeIds={activeIds} onAdd={(e) => setPatient((p) => (p ? addEntity(p, e) : p))} />
        </aside>

        {/* Center: body */}
        <section className="flex flex-col gap-3">
          <div className="relative min-h-[560px] flex-1">
            <BodyMap patient={patient} selected={selected} onSelect={setSelected} />
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-[var(--shadow-panel)]">
            <button
              onClick={() => setRunning((r) => !r)}
              disabled={!patient.alive}
              className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/20 px-4 py-2 text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary/30 disabled:opacity-40"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Pause" : "Run"}
            </button>
            <div className="flex items-center gap-1 rounded-md border border-border/60 bg-secondary/30 p-1">
              {[1, 2, 4, 8].map((s) => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`rounded px-2 py-1 text-[10px] tabular-nums ${speed === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {s}x
                </button>
              ))}
            </div>
            <button
              onClick={() => setPatient((p) => (p ? tick(p) : p))}
              className="flex items-center gap-1 rounded-md border border-border/60 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:border-primary/60 hover:text-foreground"
            >
              <FastForward className="h-3 w-3" /> Step
            </button>
            <button
              onClick={() => {
                if (startRef.current) {
                  let p = newPatient(startRef.current.profile);
                  for (const e of startRef.current.preset) p = addEntity(p, e);
                  setPatient(p);
                }
              }}
              className="ml-auto flex items-center gap-1 rounded-md border border-border/60 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:border-destructive/60 hover:text-destructive"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Active list horizontal */}
          {patient.active.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/60 p-3 shadow-[var(--shadow-panel)]">
              <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active Modifiers</h3>
              <div className="flex flex-wrap gap-1.5">
                {patient.active.map((a) => (
                  <div key={a.entity.id} className="group flex items-center gap-1.5 rounded-md border border-border/40 bg-secondary/30 px-2 py-1 text-[11px]">
                    <span className="font-medium">{a.entity.name}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{(a.intensity * 100).toFixed(0)}%</span>
                    <button onClick={() => setPatient((p) => (p ? removeEntity(p, a.entity.id) : p))}
                      className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right: telemetry */}
        <aside className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-[var(--shadow-panel)] backdrop-blur-sm">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xs uppercase tracking-[0.2em] text-primary">{selectedDef.name}</h2>
              <span className="text-xs font-semibold tabular-nums"
                style={{ color: organHealth(selectedOrgan) > 60 ? "var(--health)" : organHealth(selectedOrgan) > 35 ? "var(--warning)" : "var(--crisis)" }}>
                {organHealth(selectedOrgan).toFixed(0)}%
              </span>
            </div>
            <div className="space-y-3">
              {selectedDef.stats.map((s) => (
                <StatBar key={s} label={s} value={selectedOrgan.stats[s]} />
              ))}
            </div>
          </div>

          {interactions.length > 0 && (
            <div className="rounded-2xl border border-warning/40 bg-card/60 p-4 shadow-[var(--shadow-panel)]">
              <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--warning)" }}>
                Interaction Analysis
              </h3>
              <div className="space-y-1.5">
                {interactions.slice(0, 6).map((i, idx) => (
                  <div key={idx} className="text-xs leading-relaxed text-foreground/90">{i.message}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-[var(--shadow-panel)]">
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Event Log</h3>
            <div className="max-h-[360px] space-y-1 overflow-y-auto font-mono text-[11px]">
              {patient.events.slice().reverse().map((e, i) => {
                const color =
                  e.severity === "critical" ? "var(--crisis)" :
                  e.severity === "warning" ? "var(--warning)" :
                  e.severity === "caution" ? "var(--accent)" :
                  "var(--muted-foreground)";
                return (
                  <div key={i} className="flex gap-2 leading-tight">
                    <span className="tabular-nums text-muted-foreground/60">{e.tick.toString().padStart(4, "0")}</span>
                    <span style={{ color }}>{e.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-1.5">
      <span>{label}</span>
      <span className="font-semibold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}
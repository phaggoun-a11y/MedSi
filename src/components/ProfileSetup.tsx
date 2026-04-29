import { useMemo, useState } from "react";
import { Activity, ChevronRight, Plus, X } from "lucide-react";
import { ENTITY_LIBRARY } from "@/sim/entities";
import { buildBaselineOrgans, ORGAN_DEFS, organHealth } from "@/sim/organs";
import type { Entity, PatientProfile, Sex } from "@/sim/types";

interface Props {
  onStart: (profile: PatientProfile, preset: Entity[]) => void;
}

const ETHNICITIES = ["Caucasian","African","Hispanic","Asian","Middle Eastern","South Asian","Mixed","Other"];

export function ProfileSetup({ onStart }: Props) {
  const [name, setName] = useState("Subject A");
  const [age, setAge] = useState(35);
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [ethnicity, setEthnicity] = useState("Caucasian");
  const [preset, setPreset] = useState<Entity[]>([]);
  const [pickerCat, setPickerCat] = useState<"disease"|"drug"|"habit"|"nutrition"|"environmental">("disease");
  const [q, setQ] = useState("");

  const profile: PatientProfile = { name, age, sex, weightKg: weight, heightCm: height, ethnicity };
  const bmi = weight / Math.pow(height / 100, 2);

  const previewOrgans = useMemo(() => buildBaselineOrgans(profile), [age, sex, weight, height]);
  const previewVitality = useMemo(
    () => Object.values(previewOrgans).reduce((s, o) => s + organHealth(o), 0) / ORGAN_DEFS.length,
    [previewOrgans]
  );

  const presetIds = new Set(preset.map((p) => p.id));
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ENTITY_LIBRARY
      .filter((e) => e.category === pickerCat)
      .filter((e) => !needle || e.name.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [pickerCat, q]);

  return (
    <main className="relative min-h-screen p-4 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-[0.18em]">BIOSIM</h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Patient Configuration · Pre-Simulation</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[380px_1fr_360px]">
        {/* Demographics */}
        <section className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-[var(--shadow-panel)] backdrop-blur-sm">
          <h2 className="mb-4 text-xs uppercase tracking-[0.22em] text-primary">Demographics</h2>
          <div className="space-y-4">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age (yrs)">
                <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(+e.target.value || 0)} className={inputCls} />
              </Field>
              <Field label="Sex">
                <div className="flex gap-1 rounded-md border border-border/60 bg-secondary/40 p-1">
                  {(["male","female"] as Sex[]).map((s) => (
                    <button key={s} onClick={() => setSex(s)}
                      className={`flex-1 rounded px-2 py-1.5 text-[10px] uppercase tracking-[0.15em] ${sex===s ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight (kg)">
                <input type="number" min={20} max={250} value={weight} onChange={(e) => setWeight(+e.target.value || 0)} className={inputCls} />
              </Field>
              <Field label="Height (cm)">
                <input type="number" min={100} max={230} value={height} onChange={(e) => setHeight(+e.target.value || 0)} className={inputCls} />
              </Field>
            </div>
            <Field label={`BMI · ${bmi.toFixed(1)} ${bmiLabel(bmi)}`}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
                <div className="h-full transition-all"
                  style={{ width: `${Math.min(100, (bmi / 40) * 100)}%`, background: bmi > 30 || bmi < 18 ? "var(--crisis)" : "var(--health)" }} />
              </div>
            </Field>
            <Field label="Ethnicity">
              <select value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} className={inputCls}>
                {ETHNICITIES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>
        </section>

        {/* Preview */}
        <section className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-5 shadow-[var(--shadow-panel)] backdrop-blur-sm">
          <h2 className="mb-4 text-xs uppercase tracking-[0.22em] text-primary">Baseline Vitality Preview</h2>
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-5xl font-bold tabular-nums" style={{ color: previewVitality > 70 ? "var(--health)" : previewVitality > 45 ? "var(--warning)" : "var(--crisis)" }}>
              {previewVitality.toFixed(0)}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">/ 100 pre-condition</span>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Demographic factors (age, BMI) modulate baseline organ function. Pre-existing conditions stack on top.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ORGAN_DEFS.slice(0, 12).map((def) => {
              const h = organHealth(previewOrgans[def.id]);
              const c = h > 70 ? "var(--health)" : h > 45 ? "var(--warning)" : "var(--crisis)";
              return (
                <div key={def.id} className="flex items-center justify-between rounded-md border border-border/40 bg-secondary/30 px-3 py-2 text-[11px]">
                  <span className="text-muted-foreground">{def.name}</span>
                  <span className="tabular-nums font-semibold" style={{ color: c }}>{h.toFixed(0)}</span>
                </div>
              );
            })}
          </div>

          {/* Selected presets */}
          <div className="mt-5">
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pre-existing ({preset.length})</h3>
            {preset.length === 0 ? (
              <p className="text-xs italic text-muted-foreground/60">None — patient starts clean.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {preset.map((e) => (
                  <span key={e.id} className="group flex items-center gap-1.5 rounded-md border border-border/40 bg-secondary/30 px-2 py-1 text-[11px]">
                    {e.name}
                    <button onClick={() => setPreset((p) => p.filter((x) => x.id !== e.id))}>
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onStart(profile, preset)}
            className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02]"
          >
            Begin Simulation <ChevronRight className="h-4 w-4" />
          </button>
        </section>

        {/* Pre-existing picker */}
        <section className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-[var(--shadow-panel)] backdrop-blur-sm">
          <h2 className="mb-4 text-xs uppercase tracking-[0.22em] text-primary">Add Pre-Existing</h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MedlinePlus…" className={`${inputCls} mb-3`} />
          <div className="mb-3 flex flex-wrap gap-1 rounded-lg border border-border/60 bg-secondary/30 p-1">
            {(["disease","drug","habit","nutrition","environmental"] as const).map((c) => (
              <button key={c} onClick={() => setPickerCat(c)}
                className={`flex-1 rounded px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${pickerCat===c ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {c.slice(0,4)}
              </button>
            ))}
          </div>
          <div className="flex max-h-[420px] flex-col gap-1.5 overflow-y-auto pr-1">
            {items.map((e) => {
              const added = presetIds.has(e.id);
              return (
                <button key={e.id} disabled={added}
                  onClick={() => setPreset((p) => [...p, e])}
                  className="group flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-left transition-all hover:border-primary/60 disabled:opacity-40 disabled:cursor-not-allowed">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{e.name}</div>
                    <div className="truncate text-[9px] uppercase tracking-wider text-muted-foreground">{e.category}</div>
                  </div>
                  {!added && <Plus className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 group-hover:opacity-100" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

const inputCls = "w-full rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "(underweight)";
  if (bmi < 25) return "(normal)";
  if (bmi < 30) return "(overweight)";
  return "(obese)";
}
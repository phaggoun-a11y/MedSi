import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ORGAN_DEFS } from "@/sim/organs";
import type { StatsSnapshot, OrganId } from "@/sim/types";

interface Props {
  history: StatsSnapshot[];
  onClose: () => void;
}

const ORGAN_COLORS: Record<string, string> = {
  brain: "#a78bfa",
  heart: "#f87171",
  lungs: "#60a5fa",
  liver: "#fbbf24",
  kidneys: "#34d399",
  stomach: "#fb923c",
  intestines: "#a3e635",
  pancreas: "#e879f9",
  spleen: "#2dd4bf",
  skin: "#fcd34d",
  bones: "#d4d4d8",
  immune: "#38bdf8",
  thyroid: "#c084fc",
  bladder: "#fda4af",
};

export function StatsGraph({ history, onClose }: Props) {
  const [selectedOrgans, setSelectedOrgans] = useState<Set<OrganId>>(
    new Set(["heart", "brain", "lungs", "liver", "kidneys"])
  );

  const data = useMemo(() => {
    return history.map((snap) => {
      const row: Record<string, number> = { tick: snap.tick };
      for (const [id, val] of Object.entries(snap.organs)) {
        row[id] = Math.round(val);
      }
      return row;
    });
  }, [history]);

  const toggleOrgan = (id: OrganId) => {
    setSelectedOrgans((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Overall vitality trend
  const overallData = useMemo(() => {
    return history.map((snap) => {
      const vals = Object.values(snap.organs);
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      return { tick: snap.tick, vitality: Math.round(avg) };
    });
  }, [history]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[var(--shadow-panel)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Stats History</h2>
        <button
          onClick={onClose}
          className="rounded-md border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {/* Overall Vitality */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Overall Vitality</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={overallData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="tick" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
            <Line type="monotone" dataKey="vitality" stroke="var(--primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Organ selector chips */}
      <div className="flex flex-wrap gap-1.5">
        {ORGAN_DEFS.map((def) => {
          const active = selectedOrgans.has(def.id);
          return (
            <button
              key={def.id}
              onClick={() => toggleOrgan(def.id)}
              className={`rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.1em] border transition-all ${
                active
                  ? "border-primary/60 bg-primary/20 text-foreground"
                  : "border-border/40 bg-secondary/20 text-muted-foreground hover:text-foreground"
              }`}
              style={active ? { borderColor: ORGAN_COLORS[def.id] } : undefined}
            >
              {def.name}
            </button>
          );
        })}
      </div>

      {/* Per-organ chart */}
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Organ Health Trends</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="tick" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            {ORGAN_DEFS.filter((d) => selectedOrgans.has(d.id)).map((def) => (
              <Line
                key={def.id}
                type="monotone"
                dataKey={def.id}
                name={def.name}
                stroke={ORGAN_COLORS[def.id]}
                strokeWidth={1.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {history.length === 0 && (
        <p className="py-4 text-center text-xs italic text-muted-foreground/60">No data yet — start the simulation.</p>
      )}
    </div>
  );
}
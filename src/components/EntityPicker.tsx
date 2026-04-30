import { useMemo, useState } from "react";
import { Plus, Search, ExternalLink } from "lucide-react";
import { ENTITY_LIBRARY } from "@/sim/entities";
import { ORGAN_DEFS } from "@/sim/organs";
import type { Entity, EntityCategory } from "@/sim/types";

interface Props {
  onAdd: (e: Entity) => void;
  activeIds: Set<string>;
}

const CATS: { id: EntityCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "disease", label: "Diseases" },
  { id: "drug", label: "Drugs" },
  { id: "habit", label: "Habits" },
  { id: "nutrition", label: "Nutrition" },
  { id: "environmental", label: "Env." },
];

const CAT_COLOR: Record<EntityCategory, string> = {
  disease: "var(--crisis)",
  drug: "var(--primary)",
  habit: "var(--accent)",
  environmental: "var(--warning)",
  nutrition: "var(--health)",
};

function getTargetOrgans(e: Entity): { primary: string[]; secondary: string[] } {
  const organCounts: Record<string, number> = {};
  for (const m of e.modifiers) {
    organCounts[m.organ] = (organCounts[m.organ] || 0) + Math.abs(m.delta);
  }
  const sorted = Object.entries(organCounts).sort((a, b) => b[1] - a[1]);
  const organName = (id: string) => ORGAN_DEFS.find((d) => d.id === id)?.name || id;
  return {
    primary: sorted.slice(0, 1).map(([id]) => organName(id)),
    secondary: sorted.slice(1, 3).map(([id]) => organName(id)),
  };
}

export function EntityPicker({ onAdd, activeIds }: Props) {
  const [cat, setCat] = useState<EntityCategory | "all">("all");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ENTITY_LIBRARY
      .filter((e) => cat === "all" || e.category === cat)
      .filter((e) => !needle || e.name.toLowerCase().includes(needle) || e.description.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cat, q]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${ENTITY_LIBRARY.length} entries…`}
          className="w-full rounded-md border border-border/60 bg-secondary/40 py-2 pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary/60"
        />
      </div>
      <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-secondary/30 p-1">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex-1 min-w-[48px] rounded-md px-2 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-all ${
              cat === c.id
                ? "bg-primary/20 text-primary shadow-[inset_0_0_8px_oklch(0.78_0.16_195/0.3)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
        {items.length === 0 && (
          <p className="py-6 text-center text-xs italic text-muted-foreground/60">No matches.</p>
        )}
        {items.map((e) => {
          const added = activeIds.has(e.id);
          const targets = getTargetOrgans(e);
          return (
            <div
              key={e.id}
              className="group relative"
            >
              <button
                onClick={() => !added && onAdd(e)}
                disabled={added}
                className="w-full flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-left transition-all hover:border-primary/60 hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: CAT_COLOR[e.category], boxShadow: `0 0 6px ${CAT_COLOR[e.category]}` }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{e.name}</div>
                    <div className="truncate text-[9px] uppercase tracking-wider text-muted-foreground">{e.category}</div>
                  </div>
                </div>
                {!added && <Plus className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />}
              </button>
              {/* Hover tooltip */}
              <div className="pointer-events-none absolute left-full top-0 z-50 ml-2 w-64 rounded-xl border border-border/60 bg-card/95 p-3 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <p className="mb-2 text-[11px] leading-relaxed text-foreground/90">{e.description}</p>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {targets.primary.map((o) => (
                    <span key={o} className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary font-semibold">
                      {o} (Primary)
                    </span>
                  ))}
                  {targets.secondary.map((o) => (
                    <span key={o} className="rounded-md bg-secondary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                      {o}
                    </span>
                  ))}
                </div>
                {e.source && (
                  <a href={e.source} target="_blank" rel="noopener noreferrer"
                    className="pointer-events-auto flex items-center gap-1 text-[9px] text-primary/70 hover:text-primary">
                    <ExternalLink className="h-2.5 w-2.5" /> MedlinePlus
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
        {items.length} of {ENTITY_LIBRARY.length} · Source: MedlinePlus
      </div>
    </div>
  );
}
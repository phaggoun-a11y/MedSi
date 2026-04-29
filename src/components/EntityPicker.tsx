import { useState } from "react";
import { ENTITY_LIBRARY } from "@/sim/entities";
import type { Entity, EntityCategory } from "@/sim/types";
import { Plus } from "lucide-react";

interface Props {
  onAdd: (e: Entity) => void;
  activeIds: Set<string>;
}

const CATS: { id: EntityCategory; label: string }[] = [
  { id: "disease", label: "Diseases" },
  { id: "drug", label: "Drugs" },
  { id: "habit", label: "Habits" },
  { id: "environmental", label: "Environment" },
];

const CAT_COLOR: Record<EntityCategory, string> = {
  disease: "var(--crisis)",
  drug: "var(--primary)",
  habit: "var(--accent)",
  environmental: "var(--warning)",
};

export function EntityPicker({ onAdd, activeIds }: Props) {
  const [cat, setCat] = useState<EntityCategory>("disease");
  const items = ENTITY_LIBRARY.filter((e) => e.category === cat);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-lg border border-border/60 bg-secondary/30 p-1">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-all ${
              cat === c.id
                ? "bg-primary/20 text-primary shadow-[inset_0_0_8px_oklch(0.78_0.16_195/0.3)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
        {items.map((e) => {
          const added = activeIds.has(e.id);
          return (
            <button
              key={e.id}
              onClick={() => !added && onAdd(e)}
              disabled={added}
              className={`group flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-left transition-all hover:border-primary/60 hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: CAT_COLOR[e.category], boxShadow: `0 0 6px ${CAT_COLOR[e.category]}` }}
                />
                <span className="text-xs font-medium truncate">{e.name}</span>
              </div>
              {!added && <Plus className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
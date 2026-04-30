import { motion } from "framer-motion";
import bodyImg from "@/assets/anatomy-body.png";
import { ORGAN_DEFS, organHealth } from "@/sim/organs";
import type { OrganId, PatientState } from "@/sim/types";

interface Props {
  patient: PatientState;
  selected: OrganId;
  onSelect: (id: OrganId) => void;
}

function colorFor(score: number) {
  if (score >= 70) return "var(--health)";
  if (score >= 45) return "var(--warning)";
  return "var(--crisis)";
}

/**
 * Body visualization. Renders the anatomical body image and overlays
 * interactive hotspots positioned by normalized coordinates per organ.
 * Each hotspot pulses with the organ's "pace" (heart rate / breathing) and
 * tints with health color. Active organs show animated rings.
 */
export function BodyMap({ patient, selected, onSelect }: Props) {
  // Heart rate drives global pulse
  const heartRate = patient.organs.heart.stats.rate ?? 70;
  const pulseDur = Math.max(0.45, Math.min(2.4, 60 / heartRate));

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background/50 to-card/40 shadow-[var(--shadow-panel)]">
      {/* Backdrop grid + scan */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_center,transparent_55%,oklch(0.18_0.025_250)_100%)]" />
      <div className="scanline pointer-events-none absolute inset-0" />

      {/* HUD corners */}
      {(["tl","tr","bl","br"] as const).map((c) => (
        <div key={c} className={`pointer-events-none absolute h-6 w-6 border-primary/60 ${
          c === "tl" ? "top-2 left-2 border-t border-l" :
          c === "tr" ? "top-2 right-2 border-t border-r" :
          c === "bl" ? "bottom-2 left-2 border-b border-l" :
          "bottom-2 right-2 border-b border-r"
        }`} />
      ))}

      {/* Body image */}
      <div className="relative mx-auto flex h-full w-full items-center justify-center p-4">
        <div className="relative aspect-[896/1408] h-full max-h-[680px]">
          <img
            src={bodyImg}
            alt="Anatomical visualization of the human body interior — front view"
            className="h-full w-full object-contain mix-blend-luminosity opacity-95"
            draggable={false}
          />
          {/* Tint layer */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/10 mix-blend-color" />

          {/* Overlay svg hotspots */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            {ORGAN_DEFS.map((def) => {
              const score = organHealth(patient.organs[def.id]);
              const color = colorFor(score);
              const isSelected = def.id === selected;
              const cx = def.hotspot.x * 100;
              const cy = def.hotspot.y * 100;
              const r = def.hotspot.r * 100;
              const isCrisis = score < 35;
              return (
                <g key={def.id}
                   onClick={() => onSelect(def.id)}
                   style={{ cursor: "pointer" }}>
                  {/* Pulse halo */}
                  <motion.circle
                    cx={cx} cy={cy}
                    r={r}
                    fill={color}
                    opacity={0.18}
                    animate={{ r: [r * 0.85, r * 1.25, r * 0.85], opacity: [0.1, 0.32, 0.1] }}
                    transition={{ duration: pulseDur, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Glow blob */}
                  <circle cx={cx} cy={cy} r={r * 1.4} fill="url(#organGlow)" />
                  {/* Core dot */}
                  <circle
                    cx={cx} cy={cy} r={Math.max(0.8, r * 0.45)}
                    fill={color}
                    style={{
                      filter: `drop-shadow(0 0 ${isCrisis ? 4 : 2}px ${color})`,
                      animation: isCrisis ? "blink-crisis 0.8s ease-in-out infinite" : undefined,
                    }}
                  />
                  {/* Selection ring */}
                  {isSelected && (
                    <motion.circle
                      cx={cx} cy={cy} r={r * 1.6}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth={0.4}
                      strokeDasharray="2 1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Annotation labels (left/right of body) */}
          <div className="pointer-events-none absolute inset-0">
            {ORGAN_DEFS.map((def) => {
              const score = organHealth(patient.organs[def.id]);
              const color = colorFor(score);
              const isSelected = def.id === selected;
              const onLeft = def.hotspot.x < 0.5;
              const labelStyle: React.CSSProperties = {
                position: "absolute",
                top: `${def.hotspot.y * 100}%`,
                [onLeft ? "right" : "left"]: `${(1 - (onLeft ? def.hotspot.x : (1 - def.hotspot.x))) * 100}%`,
                transform: "translateY(-50%)",
              };
              if (!isSelected) return null;
              return (
                <div key={def.id} style={labelStyle} className="flex items-center gap-2">
                  {!onLeft && <span className="h-px w-12 bg-primary/60" />}
                  <span
                    className="rounded border border-primary/50 bg-card/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur-sm"
                    style={{ color }}
                  >
                    {def.name} · {score.toFixed(0)}
                  </span>
                  {onLeft && <span className="h-px w-12 bg-primary/60" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom telemetry strip */}
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>MedSim · {patient.alive ? "VITALS NOMINAL" : "CODE BLUE"}</span>
        <span className="text-primary tabular-nums">HR {heartRate.toFixed(0)} · SpO₂ {patient.organs.lungs.stats.o2.toFixed(0)}</span>
      </div>
    </div>
  );
}
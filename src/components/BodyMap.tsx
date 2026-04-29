import { motion } from "framer-motion";
import type { OrganId, PatientState } from "@/sim/types";
import { organHealth } from "@/sim/organs";

interface OrganShape {
  id: OrganId;
  label: string;
  // SVG path or shape
  shape: JSX.Element;
  cx: number; cy: number;
}

const ORGAN_SHAPES: OrganShape[] = [
  { id: "brain",      label: "Brain",      cx: 200, cy: 60,
    shape: <ellipse cx={200} cy={60} rx={42} ry={34} /> },
  { id: "lungs",      label: "Lungs",      cx: 200, cy: 175,
    shape: <g>
      <path d="M165 140 Q140 165 140 215 Q140 240 170 235 Q185 230 185 200 Q185 165 175 145 Z" />
      <path d="M235 140 Q260 165 260 215 Q260 240 230 235 Q215 230 215 200 Q215 165 225 145 Z" />
    </g> },
  { id: "heart",      label: "Heart",      cx: 188, cy: 185,
    shape: <path d="M188 215 C 165 198, 160 175, 175 168 C 185 163, 190 170, 188 178 C 186 170, 191 163, 201 168 C 216 175, 211 198, 188 215 Z" /> },
  { id: "liver",      label: "Liver",      cx: 175, cy: 255,
    shape: <path d="M150 240 Q145 280 185 285 Q220 285 215 250 Q210 235 180 235 Q160 235 150 240 Z" /> },
  { id: "stomach",    label: "Stomach",    cx: 220, cy: 260,
    shape: <path d="M210 245 Q235 245 235 270 Q235 290 215 290 Q200 290 205 270 Q207 255 210 245 Z" /> },
  { id: "pancreas",   label: "Pancreas",   cx: 200, cy: 285,
    shape: <path d="M170 285 Q200 280 230 290 Q210 295 195 293 Q180 290 170 285 Z" /> },
  { id: "kidneys",    label: "Kidneys",    cx: 200, cy: 305,
    shape: <g>
      <path d="M165 295 Q160 320 175 325 Q185 322 183 305 Q180 290 170 290 Z" />
      <path d="M235 295 Q240 320 225 325 Q215 322 217 305 Q220 290 230 290 Z" />
    </g> },
  { id: "intestines", label: "Intestines", cx: 200, cy: 360,
    shape: <path d="M155 335 Q145 380 175 395 Q205 400 200 375 Q195 360 215 360 Q245 365 245 395 Q240 410 200 410 Q160 410 155 380 Z" /> },
  { id: "bones",      label: "Bones",      cx: 200, cy: 460,
    shape: <g>
      <rect x={175} y={420} width={12} height={80} rx={5} />
      <rect x={213} y={420} width={12} height={80} rx={5} />
    </g> },
  { id: "skin",       label: "Skin",       cx: 200, cy: 280,
    shape: <path d="M150 100 Q140 120 145 200 Q140 280 150 380 Q160 440 175 510 L225 510 Q240 440 250 380 Q260 280 255 200 Q260 120 250 100 Q230 70 200 70 Q170 70 150 100 Z" fill="none" /> },
  { id: "immune",     label: "Immune",     cx: 145, cy: 220,
    shape: <circle cx={145} cy={220} r={8} /> },
];

function healthToColor(h: number, inflammation: number): string {
  // h 0-100. inflammation pushes toward red.
  if (inflammation > 50) return `oklch(0.55 0.25 ${20 + (100 - h) * 0.5})`;
  if (h > 75) return "oklch(0.78 0.18 150)"; // healthy emerald
  if (h > 50) return "oklch(0.82 0.16 75)";  // amber
  if (h > 25) return "oklch(0.7 0.22 30)";   // orange
  return "oklch(0.55 0.27 18)";              // crisis red
}

interface Props {
  patient: PatientState;
  selected: OrganId | null;
  onSelect: (id: OrganId) => void;
}

export function BodyMap({ patient, selected, onSelect }: Props) {
  return (
    <div className="relative h-full w-full flex items-center justify-center scanline overflow-hidden rounded-2xl bg-card/40 border border-border/60">
      <svg viewBox="0 0 400 540" className="h-full max-h-[640px] w-auto">
        <defs>
          <radialGradient id="bodyGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="oklch(0.78 0.16 195 / 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="oklch(0.78 0.16 195 / 0.08)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="540" fill="url(#grid)" />
        <rect width="400" height="540" fill="url(#bodyGlow)" />

        {/* Body outline */}
        <g stroke="oklch(0.78 0.16 195 / 0.4)" strokeWidth="1.2" fill="none">
          <path d="M150 100 Q140 120 145 200 Q140 280 150 380 Q160 440 175 510 L225 510 Q240 440 250 380 Q260 280 255 200 Q260 120 250 100 Q230 70 200 70 Q170 70 150 100 Z" />
          {/* arms */}
          <path d="M148 160 Q120 200 115 280 Q113 320 120 360" />
          <path d="M252 160 Q280 200 285 280 Q287 320 280 360" />
        </g>

        {/* Organs */}
        {ORGAN_SHAPES.map((o) => {
          if (o.id === "skin") return null;
          const organ = patient.organs[o.id];
          const h = organHealth(organ);
          const inflam = organ.stats.inflammation ?? 0;
          const color = healthToColor(h, inflam);
          const isCrisis = h < 30 || inflam > 70;
          const isSelected = selected === o.id;
          return (
            <motion.g
              key={o.id}
              onClick={() => onSelect(o.id)}
              style={{ cursor: "pointer", transformOrigin: `${o.cx}px ${o.cy}px` }}
              animate={{ scale: isSelected ? 1.08 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <g
                fill={color}
                stroke={isSelected ? "oklch(0.95 0.05 195)" : "oklch(0.2 0.03 240)"}
                strokeWidth={isSelected ? 2 : 0.8}
                style={{
                  filter: isCrisis
                    ? `drop-shadow(0 0 12px ${color})`
                    : `drop-shadow(0 0 6px ${color})`,
                  animation: isCrisis ? "blink-crisis 1.4s ease-in-out infinite" : `pulse-organ ${o.id === "heart" ? 0.9 : 3}s ease-in-out infinite`,
                }}
              >
                {o.shape}
              </g>
            </motion.g>
          );
        })}

        {/* Connection lines from selected organ to label */}
        {ORGAN_SHAPES.filter(o => o.id !== "skin").map((o) => (
          <g key={`label-${o.id}`}>
            <line
              x1={o.cx} y1={o.cy}
              x2={o.cx > 200 ? 320 : 80}
              y2={o.cy}
              stroke="oklch(0.78 0.16 195 / 0.3)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <text
              x={o.cx > 200 ? 322 : 78}
              y={o.cy + 3}
              fill="oklch(0.85 0.05 195)"
              fontSize="9"
              textAnchor={o.cx > 200 ? "start" : "end"}
              fontFamily="JetBrains Mono, monospace"
              style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              {o.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
export interface StatsSnapshot {
  tick: number;
  organs: Record<string, number>; // organId → health 0-100
}

export type OrganId =
  | "brain" | "heart" | "lungs" | "liver" | "kidneys"
  | "stomach" | "intestines" | "pancreas" | "spleen"
  | "skin" | "bones" | "immune" | "thyroid" | "bladder";

export type StatKey = string;

export interface OrganState {
  id: OrganId;
  name: string;
  stats: Record<StatKey, number>; // 0-100
}

export type EntityCategory = "disease" | "drug" | "habit" | "environmental" | "nutrition";

export interface ModifierRule {
  organ: OrganId;
  stat: StatKey;
  delta: number;            // per-tick base delta
  tags?: string[];          // tags this modifier carries
}

export interface Entity {
  id: string;
  name: string;
  category: EntityCategory;
  description: string;       // MedlinePlus-sourced summary
  source?: string;           // MedlinePlus topic/drug URL
  modifiers: ModifierRule[];
  amplifies?: string[];      // tags this entity boosts when present
  suppresses?: string[];     // tags this entity dampens when present
  halfLife?: number;         // ticks; 0/undef = persistent
  onsetDelay?: number;
  intensity?: number;        // 0-1 starting strength
  contraindications?: string[]; // entity ids — emit warning when co-active
  synergies?: string[];      // entity ids — beneficial pairs
}

export interface ActiveEntity {
  entity: Entity;
  ageTicks: number;
  intensity: number;
}

export type Sex = "male" | "female";

export interface PatientProfile {
  name: string;
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ethnicity: string;
}

export interface PatientState {
  profile: PatientProfile;
  ticks: number;
  organs: Record<OrganId, OrganState>;
  active: ActiveEntity[];
  events: SimEvent[];
  alive: boolean;
  statsHistory: StatsSnapshot[];
}

export interface SimEvent {
  tick: number;
  severity: "info" | "caution" | "warning" | "critical";
  message: string;
}
export type OrganId =
  | "heart" | "lungs" | "liver" | "kidneys" | "brain"
  | "stomach" | "intestines" | "pancreas" | "skin" | "bones" | "immune";

export type StatKey = string;

export interface OrganState {
  id: OrganId;
  name: string;
  stats: Record<StatKey, number>; // 0-100 normalized
}

export type EntityCategory = "disease" | "drug" | "habit" | "environmental";

export interface ModifierRule {
  organ: OrganId;
  stat: StatKey;
  /** Per-tick base delta (will be multiplied by synergy/suppression). */
  delta: number;
  /** Tags for synergy matching */
  tags?: string[];
}

export interface Entity {
  id: string;
  name: string;
  category: EntityCategory;
  description: string;
  modifiers: ModifierRule[];
  /** Multiplier when these tags are present anywhere on patient */
  amplifies?: string[];
  suppresses?: string[];
  /** Half-life in ticks (after onset, intensity decays). 0 = permanent */
  halfLife?: number;
  onsetDelay?: number;
  intensity?: number; // 0-1 starting strength
}

export interface ActiveEntity {
  entity: Entity;
  ageTicks: number;
  intensity: number;
}

export interface PatientState {
  age: number;
  ticks: number;
  organs: Record<OrganId, OrganState>;
  active: ActiveEntity[];
  events: SimEvent[];
}

export interface SimEvent {
  tick: number;
  severity: "info" | "caution" | "warning" | "critical";
  message: string;
}
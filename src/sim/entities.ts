import type { Entity } from "./types";

export const ENTITY_LIBRARY: Entity[] = [
  // ---------------- DISEASES ----------------
  {
    id: "hypertension", name: "Hypertension", category: "disease",
    description: "Chronically elevated arterial pressure stresses cardiac and renal tissue.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.45, tags: ["pressure-up"] },
      { organ: "heart", stat: "inflammation", delta: 0.05 },
      { organ: "kidneys", stat: "filtration", delta: -0.1 },
    ],
  },
  {
    id: "diabetes", name: "Type 2 Diabetes", category: "disease",
    description: "Insulin resistance disrupts glucose metabolism, damaging vessels system-wide.",
    modifiers: [
      { organ: "pancreas", stat: "insulin", delta: -0.25 },
      { organ: "kidneys", stat: "filtration", delta: -0.08 },
      { organ: "skin", stat: "integrity", delta: -0.05 },
    ],
  },
  {
    id: "pneumonia", name: "Pneumonia", category: "disease",
    description: "Acute lung infection floods alveoli, impairing oxygen exchange.",
    modifiers: [
      { organ: "lungs", stat: "o2", delta: -0.6, tags: ["hypoxia"] },
      { organ: "lungs", stat: "inflammation", delta: 0.5 },
      { organ: "immune", stat: "fatigue", delta: 0.3 },
    ],
    halfLife: 200,
  },
  {
    id: "cirrhosis", name: "Cirrhosis", category: "disease",
    description: "Irreversible scarring of liver tissue from chronic insult.",
    modifiers: [
      { organ: "liver", stat: "efficiency", delta: -0.3 },
      { organ: "liver", stat: "regen", delta: -0.4 },
      { organ: "skin", stat: "jaundice", delta: 0.3 },
    ],
  },
  {
    id: "ulcer", name: "Stomach Ulcer", category: "disease",
    description: "Mucosal erosion exposed to gastric acid; bleeds under stress.",
    modifiers: [
      { organ: "stomach", stat: "mucosa", delta: -0.3 },
      { organ: "stomach", stat: "bleeding", delta: 0.15, tags: ["bleed-risk"] },
    ],
  },

  // ---------------- DRUGS ----------------
  {
    id: "ace_inhibitor", name: "ACE Inhibitor", category: "drug",
    description: "Blocks angiotensin conversion, lowering vascular resistance.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: -0.6, tags: ["pressure-down"] },
    ],
    suppresses: ["pressure-up"],
    halfLife: 80,
  },
  {
    id: "metformin", name: "Metformin", category: "drug",
    description: "Reduces hepatic glucose production; first-line for Type 2 diabetes.",
    modifiers: [
      { organ: "pancreas", stat: "insulin", delta: 0.2 },
      { organ: "liver", stat: "efficiency", delta: -0.02 },
    ],
    halfLife: 60,
  },
  {
    id: "antibiotic", name: "Broad Antibiotic", category: "drug",
    description: "Bactericidal agent; clears infection but disrupts gut flora.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: -0.4 },
      { organ: "lungs", stat: "o2", delta: 0.3 },
      { organ: "intestines", stat: "flora", delta: -0.3 },
    ],
    halfLife: 40,
  },
  {
    id: "aspirin", name: "Aspirin", category: "drug",
    description: "COX inhibitor — anti-inflammatory but raises bleeding risk.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: -0.1 },
      { organ: "stomach", stat: "mucosa", delta: -0.1 },
      { organ: "stomach", stat: "bleeding", delta: 0.08, tags: ["bleed-risk"] },
    ],
    amplifies: ["bleed-risk"],
    halfLife: 50,
  },
  {
    id: "statin", name: "Statin", category: "drug",
    description: "Inhibits cholesterol synthesis; minor hepatic load.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: -0.08 },
      { organ: "liver", stat: "toxicity", delta: 0.05 },
    ],
    halfLife: 90,
  },

  // ---------------- HABITS ----------------
  {
    id: "smoking", name: "Smoking", category: "habit",
    description: "Combustion byproducts scar alveoli and constrict vessels.",
    modifiers: [
      { organ: "lungs", stat: "scarring", delta: 0.08 },
      { organ: "lungs", stat: "capacity", delta: -0.1 },
      { organ: "heart", stat: "pressure", delta: 0.1, tags: ["pressure-up"] },
    ],
  },
  {
    id: "alcohol", name: "Alcohol Abuse", category: "habit",
    description: "Chronic ethanol exposure overwhelms hepatic detoxification.",
    modifiers: [
      { organ: "liver", stat: "toxicity", delta: 0.2 },
      { organ: "liver", stat: "efficiency", delta: -0.1 },
      { organ: "brain", stat: "clarity", delta: -0.1 },
    ],
  },
  {
    id: "exercise", name: "Daily Exercise", category: "habit",
    description: "Aerobic conditioning improves perfusion and metabolic flexibility.",
    modifiers: [
      { organ: "heart", stat: "output", delta: 0.1 },
      { organ: "heart", stat: "pressure", delta: -0.08, tags: ["pressure-down"] },
      { organ: "lungs", stat: "capacity", delta: 0.05 },
      { organ: "brain", stat: "perfusion", delta: 0.05 },
    ],
  },
  {
    id: "high_sodium", name: "High-Sodium Diet", category: "habit",
    description: "Sodium load drives fluid retention and arterial pressure.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.15, tags: ["pressure-up"] },
      { organ: "kidneys", stat: "filtration", delta: -0.05 },
    ],
  },
  {
    id: "hydration", name: "Optimal Hydration", category: "habit",
    description: "Adequate fluid intake supports renal clearance and circulation.",
    modifiers: [
      { organ: "skin", stat: "hydration", delta: 0.15 },
      { organ: "kidneys", stat: "filtration", delta: 0.1 },
      { organ: "kidneys", stat: "toxicity", delta: -0.1 },
    ],
  },

  // ---------------- ENVIRONMENTAL ----------------
  {
    id: "altitude", name: "High Altitude", category: "environmental",
    description: "Reduced oxygen pressure forces compensatory adaptation.",
    modifiers: [
      { organ: "lungs", stat: "o2", delta: -0.15, tags: ["hypoxia"] },
      { organ: "heart", stat: "rate", delta: 0.1 },
    ],
  },
  {
    id: "pollution", name: "Air Pollution", category: "environmental",
    description: "Particulate inhalation drives chronic pulmonary inflammation.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: 0.12 },
      { organ: "lungs", stat: "scarring", delta: 0.02 },
    ],
  },
];
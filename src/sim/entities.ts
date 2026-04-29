import type { Entity } from "./types";

/**
 * Entity library. Descriptions and behavioural rules are authored using the
 * MedlinePlus Health Topics taxonomy and the MedlinePlus Drugs & Supplements
 * index as the underlying medical reference (https://medlineplus.gov/).
 * Modifier deltas are simulation-tuned, not clinical dosages.
 */

const ML = (slug: string) => `https://medlineplus.gov/${slug}.html`;

export const ENTITY_LIBRARY: Entity[] = [
  // ============================================================
  // CARDIOVASCULAR DISEASES
  // ============================================================
  { id: "hypertension", name: "Hypertension", category: "disease", source: ML("highbloodpressure"),
    description: "Chronically elevated arterial pressure (≥130/80 mmHg) damages vessels, heart, kidneys and brain.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.55, tags: ["pressure-up","vascular-stress"] },
      { organ: "heart", stat: "inflammation", delta: 0.06 },
      { organ: "kidneys", stat: "filtration", delta: -0.12 },
      { organ: "brain", stat: "perfusion", delta: -0.04 },
    ] },
  { id: "hypotension", name: "Hypotension", category: "disease", source: ML("lowbloodpressure"),
    description: "Abnormally low blood pressure causing inadequate organ perfusion.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: -0.45, tags: ["pressure-down"] },
      { organ: "brain", stat: "perfusion", delta: -0.18 },
      { organ: "kidneys", stat: "filtration", delta: -0.1 },
    ] },
  { id: "atherosclerosis", name: "Atherosclerosis", category: "disease", source: ML("atherosclerosis"),
    description: "Plaque accumulation narrows arteries, reducing perfusion to vital organs.",
    modifiers: [
      { organ: "heart", stat: "output", delta: -0.1, tags: ["vascular-stress"] },
      { organ: "heart", stat: "pressure", delta: 0.18 },
      { organ: "brain", stat: "perfusion", delta: -0.08 },
    ] },
  { id: "coronary_disease", name: "Coronary Artery Disease", category: "disease", source: ML("coronaryarterydisease"),
    description: "Coronary plaque restricts myocardial blood flow, predisposing to angina and infarction.",
    modifiers: [
      { organ: "heart", stat: "output", delta: -0.18 },
      { organ: "heart", stat: "rhythm", delta: -0.1, tags: ["arrhythmia"] },
      { organ: "heart", stat: "inflammation", delta: 0.1 },
    ] },
  { id: "heart_failure", name: "Heart Failure", category: "disease", source: ML("heartfailure"),
    description: "Heart cannot pump enough blood to meet body demand; causes congestion and fatigue.",
    modifiers: [
      { organ: "heart", stat: "output", delta: -0.35 },
      { organ: "lungs", stat: "capacity", delta: -0.12 },
      { organ: "kidneys", stat: "filtration", delta: -0.1 },
      { organ: "immune", stat: "fatigue", delta: 0.2 },
    ] },
  { id: "arrhythmia", name: "Arrhythmia", category: "disease", source: ML("arrhythmia"),
    description: "Irregular heart rhythm — bradyarrhythmia or tachyarrhythmia.",
    modifiers: [
      { organ: "heart", stat: "rhythm", delta: -0.3, tags: ["arrhythmia"] },
      { organ: "heart", stat: "output", delta: -0.08 },
    ] },
  { id: "stroke", name: "Stroke", category: "disease", source: ML("stroke"),
    description: "Acute interruption of cerebral blood flow causing neurological deficit.",
    modifiers: [
      { organ: "brain", stat: "perfusion", delta: -0.5 },
      { organ: "brain", stat: "neuro", delta: -0.4 },
      { organ: "brain", stat: "clarity", delta: -0.3 },
    ], halfLife: 400 },
  { id: "myocardial_infarction", name: "Myocardial Infarction", category: "disease", source: ML("heartattack"),
    description: "Acute ischemic damage to cardiac muscle from blocked coronary artery.",
    modifiers: [
      { organ: "heart", stat: "output", delta: -0.6 },
      { organ: "heart", stat: "inflammation", delta: 0.4 },
      { organ: "heart", stat: "rhythm", delta: -0.3 },
    ], halfLife: 300 },
  { id: "high_cholesterol", name: "Hypercholesterolemia", category: "disease", source: ML("cholesterol"),
    description: "Elevated LDL cholesterol drives plaque formation throughout arterial tree.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: 0.05, tags: ["vascular-stress"] },
      { organ: "liver", stat: "efficiency", delta: -0.04 },
    ] },
  { id: "anemia", name: "Anemia", category: "disease", source: ML("anemia"),
    description: "Reduced red cells or hemoglobin compromise oxygen delivery.",
    modifiers: [
      { organ: "lungs", stat: "o2", delta: -0.2, tags: ["hypoxia"] },
      { organ: "immune", stat: "fatigue", delta: 0.18 },
      { organ: "bones", stat: "marrow", delta: -0.1 },
    ] },

  // ============================================================
  // ENDOCRINE / METABOLIC
  // ============================================================
  { id: "diabetes_t1", name: "Type 1 Diabetes", category: "disease", source: ML("diabetestype1"),
    description: "Autoimmune destruction of pancreatic β-cells causing insulin deficiency.",
    modifiers: [
      { organ: "pancreas", stat: "insulin", delta: -0.5, tags: ["hyperglycemia"] },
      { organ: "kidneys", stat: "filtration", delta: -0.1 },
      { organ: "skin", stat: "integrity", delta: -0.05 },
    ] },
  { id: "diabetes_t2", name: "Type 2 Diabetes", category: "disease", source: ML("diabetestype2"),
    description: "Insulin resistance with progressive β-cell dysfunction; vascular damage system-wide.",
    modifiers: [
      { organ: "pancreas", stat: "insulin", delta: -0.3, tags: ["hyperglycemia"] },
      { organ: "kidneys", stat: "filtration", delta: -0.1 },
      { organ: "skin", stat: "integrity", delta: -0.06 },
      { organ: "heart", stat: "inflammation", delta: 0.05 },
    ] },
  { id: "hypothyroidism", name: "Hypothyroidism", category: "disease", source: ML("hypothyroidism"),
    description: "Underactive thyroid slows metabolism, causes weight gain and fatigue.",
    modifiers: [
      { organ: "thyroid", stat: "t3t4", delta: -0.4 },
      { organ: "heart", stat: "rate", delta: -0.15 },
      { organ: "immune", stat: "fatigue", delta: 0.2 },
    ] },
  { id: "hyperthyroidism", name: "Hyperthyroidism", category: "disease", source: ML("hyperthyroidism"),
    description: "Overactive thyroid accelerates metabolism, causes tachycardia and weight loss.",
    modifiers: [
      { organ: "thyroid", stat: "t3t4", delta: 0.4 },
      { organ: "heart", stat: "rate", delta: 0.25, tags: ["tachycardia"] },
      { organ: "heart", stat: "rhythm", delta: -0.08 },
    ] },
  { id: "obesity", name: "Obesity", category: "disease", source: ML("obesity"),
    description: "Excess adipose tissue drives systemic inflammation and metabolic dysfunction.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.15, tags: ["pressure-up"] },
      { organ: "liver", stat: "toxicity", delta: 0.08 },
      { organ: "pancreas", stat: "insulin", delta: -0.08, tags: ["hyperglycemia"] },
      { organ: "bones", stat: "density", delta: -0.04 },
    ] },
  { id: "metabolic_syndrome", name: "Metabolic Syndrome", category: "disease", source: ML("metabolicsyndrome"),
    description: "Cluster of central obesity, hypertension, dyslipidemia and glucose intolerance.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.18, tags: ["pressure-up"] },
      { organ: "heart", stat: "inflammation", delta: 0.06 },
      { organ: "pancreas", stat: "insulin", delta: -0.12 },
      { organ: "liver", stat: "efficiency", delta: -0.06 },
    ] },

  // ============================================================
  // RESPIRATORY
  // ============================================================
  { id: "asthma", name: "Asthma", category: "disease", source: ML("asthma"),
    description: "Reversible bronchial inflammation and constriction restricting airflow.",
    modifiers: [
      { organ: "lungs", stat: "capacity", delta: -0.18, tags: ["bronchoconstriction"] },
      { organ: "lungs", stat: "inflammation", delta: 0.18 },
      { organ: "lungs", stat: "o2", delta: -0.1, tags: ["hypoxia"] },
    ] },
  { id: "copd", name: "COPD", category: "disease", source: ML("copd"),
    description: "Chronic obstructive pulmonary disease — irreversible airflow limitation, emphysema.",
    modifiers: [
      { organ: "lungs", stat: "capacity", delta: -0.2 },
      { organ: "lungs", stat: "scarring", delta: 0.05 },
      { organ: "lungs", stat: "o2", delta: -0.18, tags: ["hypoxia"] },
      { organ: "heart", stat: "pressure", delta: 0.05 },
    ] },
  { id: "pneumonia", name: "Pneumonia", category: "disease", source: ML("pneumonia"),
    description: "Acute infection of pulmonary parenchyma with alveolar consolidation.",
    modifiers: [
      { organ: "lungs", stat: "o2", delta: -0.55, tags: ["hypoxia","infection"] },
      { organ: "lungs", stat: "inflammation", delta: 0.45 },
      { organ: "immune", stat: "fatigue", delta: 0.3 },
    ], halfLife: 220 },
  { id: "bronchitis", name: "Bronchitis", category: "disease", source: ML("bronchitis"),
    description: "Inflammation of bronchial mucosa with productive cough.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: 0.25 },
      { organ: "lungs", stat: "capacity", delta: -0.08 },
    ], halfLife: 150 },
  { id: "tuberculosis", name: "Tuberculosis", category: "disease", source: ML("tuberculosis"),
    description: "Mycobacterial infection causing granulomatous lung destruction.",
    modifiers: [
      { organ: "lungs", stat: "scarring", delta: 0.15 },
      { organ: "lungs", stat: "capacity", delta: -0.15, tags: ["infection"] },
      { organ: "immune", stat: "fatigue", delta: 0.25 },
    ] },
  { id: "pulmonary_fibrosis", name: "Pulmonary Fibrosis", category: "disease", source: ML("idiopathicpulmonaryfibrosis"),
    description: "Progressive scarring of lung interstitium impairs gas exchange.",
    modifiers: [
      { organ: "lungs", stat: "scarring", delta: 0.18 },
      { organ: "lungs", stat: "capacity", delta: -0.18 },
      { organ: "lungs", stat: "o2", delta: -0.15 },
    ] },
  { id: "sleep_apnea", name: "Sleep Apnea", category: "disease", source: ML("sleepapnea"),
    description: "Repetitive nocturnal airway collapse causes intermittent hypoxia.",
    modifiers: [
      { organ: "lungs", stat: "o2", delta: -0.08 },
      { organ: "heart", stat: "pressure", delta: 0.1, tags: ["pressure-up"] },
      { organ: "brain", stat: "clarity", delta: -0.06 },
    ] },

  // ============================================================
  // HEPATIC / GI
  // ============================================================
  { id: "cirrhosis", name: "Cirrhosis", category: "disease", source: ML("cirrhosis"),
    description: "Irreversible hepatic fibrosis from chronic insult — alcohol, hepatitis, NAFLD.",
    modifiers: [
      { organ: "liver", stat: "efficiency", delta: -0.35 },
      { organ: "liver", stat: "regen", delta: -0.45 },
      { organ: "skin", stat: "jaundice", delta: 0.32 },
      { organ: "stomach", stat: "bleeding", delta: 0.08, tags: ["bleed-risk"] },
    ] },
  { id: "hepatitis_b", name: "Hepatitis B", category: "disease", source: ML("hepatitisb"),
    description: "Viral hepatic inflammation; can become chronic and progress to cirrhosis.",
    modifiers: [
      { organ: "liver", stat: "inflammation", delta: 0.3, tags: ["infection"] },
      { organ: "liver", stat: "efficiency", delta: -0.15 },
    ] },
  { id: "hepatitis_c", name: "Hepatitis C", category: "disease", source: ML("hepatitisc"),
    description: "Bloodborne RNA virus causing chronic hepatitis and fibrosis.",
    modifiers: [
      { organ: "liver", stat: "inflammation", delta: 0.25, tags: ["infection"] },
      { organ: "liver", stat: "efficiency", delta: -0.12 },
    ] },
  { id: "fatty_liver", name: "Fatty Liver Disease", category: "disease", source: ML("fattyliverdisease"),
    description: "Hepatic steatosis (NAFLD/NASH) impairs metabolism and predisposes to fibrosis.",
    modifiers: [
      { organ: "liver", stat: "efficiency", delta: -0.12 },
      { organ: "liver", stat: "inflammation", delta: 0.08 },
    ] },
  { id: "ulcer", name: "Peptic Ulcer", category: "disease", source: ML("pepticulcer"),
    description: "Mucosal erosion exposed to gastric acid; bleeds under stress or NSAIDs.",
    modifiers: [
      { organ: "stomach", stat: "mucosa", delta: -0.3 },
      { organ: "stomach", stat: "bleeding", delta: 0.15, tags: ["bleed-risk"] },
    ] },
  { id: "gerd", name: "GERD", category: "disease", source: ML("gerd"),
    description: "Gastroesophageal reflux of acidic content irritates esophageal mucosa.",
    modifiers: [
      { organ: "stomach", stat: "acidity", delta: 0.18 },
      { organ: "stomach", stat: "mucosa", delta: -0.08 },
    ] },
  { id: "ibs", name: "Irritable Bowel Syndrome", category: "disease", source: ML("irritablebowelsyndrome"),
    description: "Functional GI disorder with altered motility, bloating, pain.",
    modifiers: [
      { organ: "intestines", stat: "absorption", delta: -0.08 },
      { organ: "intestines", stat: "flora", delta: -0.1 },
    ] },
  { id: "ibd", name: "Inflammatory Bowel Disease", category: "disease", source: ML("crohnsdisease"),
    description: "Crohn's / ulcerative colitis — chronic transmural intestinal inflammation.",
    modifiers: [
      { organ: "intestines", stat: "inflammation", delta: 0.25 },
      { organ: "intestines", stat: "absorption", delta: -0.18 },
      { organ: "immune", stat: "fatigue", delta: 0.12 },
    ] },
  { id: "celiac", name: "Celiac Disease", category: "disease", source: ML("celiacdisease"),
    description: "Autoimmune reaction to gluten damages small intestinal villi.",
    modifiers: [
      { organ: "intestines", stat: "absorption", delta: -0.22 },
      { organ: "bones", stat: "density", delta: -0.06 },
    ] },
  { id: "pancreatitis", name: "Pancreatitis", category: "disease", source: ML("pancreatitis"),
    description: "Acute or chronic pancreatic inflammation from autodigestion.",
    modifiers: [
      { organ: "pancreas", stat: "inflammation", delta: 0.3 },
      { organ: "pancreas", stat: "enzymes", delta: -0.2 },
      { organ: "pancreas", stat: "insulin", delta: -0.1 },
    ], halfLife: 180 },

  // ============================================================
  // RENAL / UROLOGIC
  // ============================================================
  { id: "ckd", name: "Chronic Kidney Disease", category: "disease", source: ML("chronickidneydisease"),
    description: "Progressive loss of nephron function with rising creatinine and toxin retention.",
    modifiers: [
      { organ: "kidneys", stat: "filtration", delta: -0.3 },
      { organ: "kidneys", stat: "toxicity", delta: 0.18 },
      { organ: "heart", stat: "pressure", delta: 0.08, tags: ["pressure-up"] },
      { organ: "bones", stat: "density", delta: -0.05 },
    ] },
  { id: "uti", name: "Urinary Tract Infection", category: "disease", source: ML("urinarytractinfections"),
    description: "Bacterial colonization of urinary tract, typically E. coli.",
    modifiers: [
      { organ: "bladder", stat: "inflammation", delta: 0.4, tags: ["infection"] },
      { organ: "kidneys", stat: "inflammation", delta: 0.05 },
    ], halfLife: 120 },
  { id: "kidney_stones", name: "Kidney Stones", category: "disease", source: ML("kidneystones"),
    description: "Calculi obstructing urinary tract cause renal colic and inflammation.",
    modifiers: [
      { organ: "kidneys", stat: "inflammation", delta: 0.18 },
      { organ: "kidneys", stat: "filtration", delta: -0.08 },
    ] },

  // ============================================================
  // NEUROLOGIC / PSYCHIATRIC
  // ============================================================
  { id: "alzheimers", name: "Alzheimer's Disease", category: "disease", source: ML("alzheimersdisease"),
    description: "Progressive neurodegeneration with amyloid plaques and tau tangles.",
    modifiers: [
      { organ: "brain", stat: "neuro", delta: -0.18 },
      { organ: "brain", stat: "clarity", delta: -0.2 },
    ] },
  { id: "parkinsons", name: "Parkinson's Disease", category: "disease", source: ML("parkinsonsdisease"),
    description: "Degeneration of dopaminergic substantia nigra neurons; tremor, rigidity.",
    modifiers: [
      { organ: "brain", stat: "neuro", delta: -0.15 },
    ] },
  { id: "epilepsy", name: "Epilepsy", category: "disease", source: ML("epilepsy"),
    description: "Recurrent unprovoked seizures from abnormal cortical electrical activity.",
    modifiers: [
      { organ: "brain", stat: "neuro", delta: -0.1 },
      { organ: "brain", stat: "clarity", delta: -0.05 },
    ] },
  { id: "migraine", name: "Migraine", category: "disease", source: ML("migraine"),
    description: "Recurrent neurovascular headache with photophobia and nausea.",
    modifiers: [
      { organ: "brain", stat: "perfusion", delta: -0.08 },
      { organ: "brain", stat: "clarity", delta: -0.1 },
    ], halfLife: 80 },
  { id: "depression", name: "Depression", category: "disease", source: ML("depression"),
    description: "Persistent low mood, anhedonia and cognitive symptoms.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: -0.12 },
      { organ: "immune", stat: "fatigue", delta: 0.18 },
      { organ: "heart", stat: "rate", delta: -0.04 },
    ] },
  { id: "anxiety", name: "Anxiety Disorder", category: "disease", source: ML("anxiety"),
    description: "Excessive worry with autonomic activation.",
    modifiers: [
      { organ: "heart", stat: "rate", delta: 0.12, tags: ["tachycardia"] },
      { organ: "stomach", stat: "acidity", delta: 0.08 },
    ] },

  // ============================================================
  // INFECTIOUS
  // ============================================================
  { id: "influenza", name: "Influenza", category: "disease", source: ML("flu"),
    description: "Acute respiratory viral infection with systemic symptoms.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: 0.2, tags: ["infection","viral"] },
      { organ: "immune", stat: "fatigue", delta: 0.3 },
      { organ: "lungs", stat: "o2", delta: -0.05 },
    ], halfLife: 140 },
  { id: "covid19", name: "COVID-19", category: "disease", source: ML("covid19"),
    description: "SARS-CoV-2 infection with respiratory and multi-system involvement.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: 0.3, tags: ["infection","viral"] },
      { organ: "lungs", stat: "o2", delta: -0.2, tags: ["hypoxia"] },
      { organ: "heart", stat: "inflammation", delta: 0.08 },
      { organ: "immune", stat: "fatigue", delta: 0.3 },
    ], halfLife: 200 },
  { id: "hiv", name: "HIV Infection", category: "disease", source: ML("hivaids"),
    description: "Retroviral infection of CD4+ T-cells leading to immunodeficiency.",
    modifiers: [
      { organ: "immune", stat: "response", delta: -0.3 },
      { organ: "immune", stat: "fatigue", delta: 0.15 },
    ] },
  { id: "sepsis", name: "Sepsis", category: "disease", source: ML("sepsis"),
    description: "Dysregulated host response to infection causing organ dysfunction.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: -0.4, tags: ["pressure-down"] },
      { organ: "kidneys", stat: "filtration", delta: -0.25 },
      { organ: "liver", stat: "efficiency", delta: -0.2 },
      { organ: "lungs", stat: "o2", delta: -0.15 },
      { organ: "immune", stat: "fatigue", delta: 0.4 },
    ], halfLife: 100 },

  // ============================================================
  // AUTOIMMUNE
  // ============================================================
  { id: "rheumatoid", name: "Rheumatoid Arthritis", category: "disease", source: ML("rheumatoidarthritis"),
    description: "Autoimmune polyarthritis with synovial inflammation and joint destruction.",
    modifiers: [
      { organ: "bones", stat: "density", delta: -0.08 },
      { organ: "immune", stat: "response", delta: 0.05, tags: ["autoimmune"] },
      { organ: "immune", stat: "fatigue", delta: 0.18 },
    ] },
  { id: "lupus", name: "Lupus (SLE)", category: "disease", source: ML("lupus"),
    description: "Multisystem autoimmune disease with antinuclear antibodies.",
    modifiers: [
      { organ: "kidneys", stat: "inflammation", delta: 0.15, tags: ["autoimmune"] },
      { organ: "skin", stat: "integrity", delta: -0.1 },
      { organ: "immune", stat: "fatigue", delta: 0.2 },
    ] },
  { id: "ms", name: "Multiple Sclerosis", category: "disease", source: ML("multiplesclerosis"),
    description: "Autoimmune demyelination of CNS white matter.",
    modifiers: [
      { organ: "brain", stat: "neuro", delta: -0.18 },
      { organ: "immune", stat: "fatigue", delta: 0.18 },
    ] },

  // ============================================================
  // CANCERS
  // ============================================================
  { id: "lung_cancer", name: "Lung Cancer", category: "disease", source: ML("lungcancer"),
    description: "Malignant neoplasm of the lung; strongly tobacco-associated.",
    modifiers: [
      { organ: "lungs", stat: "capacity", delta: -0.2 },
      { organ: "lungs", stat: "scarring", delta: 0.08 },
      { organ: "immune", stat: "fatigue", delta: 0.2 },
    ] },
  { id: "liver_cancer", name: "Liver Cancer", category: "disease", source: ML("livercancer"),
    description: "Hepatocellular carcinoma; often follows cirrhosis or chronic hepatitis.",
    modifiers: [
      { organ: "liver", stat: "efficiency", delta: -0.25 },
      { organ: "skin", stat: "jaundice", delta: 0.15 },
    ] },
  { id: "leukemia", name: "Leukemia", category: "disease", source: ML("leukemia"),
    description: "Malignant proliferation of leukocyte precursors in marrow.",
    modifiers: [
      { organ: "bones", stat: "marrow", delta: -0.3 },
      { organ: "immune", stat: "response", delta: -0.2 },
      { organ: "immune", stat: "fatigue", delta: 0.25 },
    ] },

  // ============================================================
  // DRUGS — ANTIHYPERTENSIVES
  // ============================================================
  { id: "ace_inhibitor", name: "ACE Inhibitor (lisinopril)", category: "drug", source: ML("druginfo/meds/a692051"),
    description: "Inhibits angiotensin-converting enzyme, reducing peripheral vascular resistance.",
    modifiers: [{ organ: "heart", stat: "pressure", delta: -0.6, tags: ["pressure-down"] }],
    suppresses: ["pressure-up","vascular-stress"], halfLife: 80 },
  { id: "arb", name: "ARB (losartan)", category: "drug", source: ML("druginfo/meds/a695008"),
    description: "Angiotensin II receptor blocker — lowers BP without ACE-related cough.",
    modifiers: [{ organ: "heart", stat: "pressure", delta: -0.55, tags: ["pressure-down"] }],
    suppresses: ["pressure-up"], halfLife: 90 },
  { id: "beta_blocker", name: "Beta Blocker (metoprolol)", category: "drug", source: ML("druginfo/meds/a682864"),
    description: "Blocks β-adrenergic receptors — slows rate, lowers BP, reduces afterload.",
    modifiers: [
      { organ: "heart", stat: "rate", delta: -0.2 },
      { organ: "heart", stat: "pressure", delta: -0.3, tags: ["pressure-down"] },
    ],
    suppresses: ["tachycardia","arrhythmia","pressure-up"], halfLife: 70 },
  { id: "calcium_blocker", name: "Calcium Channel Blocker", category: "drug", source: ML("druginfo/meds/a684027"),
    description: "Blocks L-type Ca²⁺ channels, dilates arterioles, reduces afterload.",
    modifiers: [{ organ: "heart", stat: "pressure", delta: -0.4, tags: ["pressure-down"] }],
    suppresses: ["pressure-up"], halfLife: 80 },
  { id: "diuretic", name: "Diuretic (furosemide)", category: "drug", source: ML("druginfo/meds/a682858"),
    description: "Loop diuretic — promotes natriuresis, reduces preload and BP.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: -0.3, tags: ["pressure-down"] },
      { organ: "kidneys", stat: "filtration", delta: 0.05 },
      { organ: "skin", stat: "hydration", delta: -0.1 },
    ],
    suppresses: ["pressure-up"], halfLife: 50 },

  // DRUGS — ANTIDIABETICS
  { id: "metformin", name: "Metformin", category: "drug", source: ML("druginfo/meds/a696005"),
    description: "Reduces hepatic gluconeogenesis; first-line therapy for type 2 diabetes.",
    modifiers: [
      { organ: "pancreas", stat: "insulin", delta: 0.18 },
      { organ: "liver", stat: "efficiency", delta: -0.02 },
    ],
    suppresses: ["hyperglycemia"], halfLife: 60 },
  { id: "insulin_inj", name: "Insulin (injectable)", category: "drug", source: ML("druginfo/meds/a682611"),
    description: "Exogenous insulin replaces or supplements endogenous secretion.",
    modifiers: [{ organ: "pancreas", stat: "insulin", delta: 0.4 }],
    suppresses: ["hyperglycemia"], halfLife: 30 },
  { id: "sulfonylurea", name: "Sulfonylurea (glipizide)", category: "drug", source: ML("druginfo/meds/a684060"),
    description: "Stimulates pancreatic insulin secretion; risk of hypoglycemia.",
    modifiers: [{ organ: "pancreas", stat: "insulin", delta: 0.25 }],
    suppresses: ["hyperglycemia"], halfLife: 60 },

  // DRUGS — ANTIBIOTICS / ANTIVIRALS
  { id: "amoxicillin", name: "Amoxicillin", category: "drug", source: ML("druginfo/meds/a685001"),
    description: "β-lactam antibiotic active against many gram-positive and some gram-negative organisms.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: -0.25 },
      { organ: "intestines", stat: "flora", delta: -0.15 },
    ],
    suppresses: ["infection"], halfLife: 50 },
  { id: "azithromycin", name: "Azithromycin", category: "drug", source: ML("druginfo/meds/a697037"),
    description: "Macrolide antibiotic with long tissue half-life.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: -0.3 },
      { organ: "intestines", stat: "flora", delta: -0.18 },
    ],
    suppresses: ["infection"], halfLife: 90 },
  { id: "ciprofloxacin", name: "Ciprofloxacin", category: "drug", source: ML("druginfo/meds/a688016"),
    description: "Fluoroquinolone — broad-spectrum, good urinary penetration.",
    modifiers: [
      { organ: "bladder", stat: "inflammation", delta: -0.35 },
      { organ: "intestines", stat: "flora", delta: -0.2 },
    ],
    suppresses: ["infection"], halfLife: 70 },

  // DRUGS — ANALGESICS
  { id: "aspirin", name: "Aspirin", category: "drug", source: ML("druginfo/meds/a682878"),
    description: "Irreversible COX inhibitor — analgesic, antiplatelet, anti-inflammatory.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: -0.1 },
      { organ: "stomach", stat: "mucosa", delta: -0.12 },
      { organ: "stomach", stat: "bleeding", delta: 0.08, tags: ["bleed-risk"] },
    ],
    amplifies: ["bleed-risk"], halfLife: 50,
    contraindications: ["ulcer","warfarin"] },
  { id: "ibuprofen", name: "Ibuprofen", category: "drug", source: ML("druginfo/meds/a682159"),
    description: "NSAID — reversible COX inhibition; gastric and renal toxicity risk.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: -0.08 },
      { organ: "stomach", stat: "mucosa", delta: -0.15, tags: ["bleed-risk"] },
      { organ: "kidneys", stat: "filtration", delta: -0.06 },
    ], halfLife: 40,
    contraindications: ["ulcer","ckd"] },
  { id: "acetaminophen", name: "Acetaminophen", category: "drug", source: ML("druginfo/meds/a681004"),
    description: "Analgesic/antipyretic with hepatic metabolism — overdose causes hepatotoxicity.",
    modifiers: [
      { organ: "liver", stat: "toxicity", delta: 0.04 },
    ], halfLife: 30,
    contraindications: ["alcohol","cirrhosis"] },
  { id: "morphine", name: "Morphine", category: "drug", source: ML("druginfo/meds/a682133"),
    description: "μ-opioid agonist — analgesia, respiratory depression, dependence risk.",
    modifiers: [
      { organ: "lungs", stat: "capacity", delta: -0.1 },
      { organ: "brain", stat: "clarity", delta: -0.15 },
      { organ: "intestines", stat: "absorption", delta: -0.05 },
    ], halfLife: 30 },

  // DRUGS — LIPIDS / ANTICOAGULANTS
  { id: "statin", name: "Statin (atorvastatin)", category: "drug", source: ML("druginfo/meds/a600045"),
    description: "HMG-CoA reductase inhibitor — lowers LDL, stabilizes plaque.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: -0.1 },
      { organ: "liver", stat: "toxicity", delta: 0.06 },
    ],
    suppresses: ["vascular-stress"], halfLife: 100 },
  { id: "warfarin", name: "Warfarin", category: "drug", source: ML("druginfo/meds/a682277"),
    description: "Vitamin K antagonist anticoagulant — narrow therapeutic window.",
    modifiers: [
      { organ: "stomach", stat: "bleeding", delta: 0.12, tags: ["bleed-risk"] },
    ],
    amplifies: ["bleed-risk"], halfLife: 200,
    contraindications: ["aspirin","ibuprofen"] },
  { id: "heparin", name: "Heparin", category: "drug", source: ML("druginfo/meds/a682826"),
    description: "Activates antithrombin — rapid parenteral anticoagulation.",
    modifiers: [{ organ: "stomach", stat: "bleeding", delta: 0.1, tags: ["bleed-risk"] }],
    halfLife: 30 },

  // DRUGS — PSYCHIATRIC
  { id: "ssri", name: "SSRI (fluoxetine)", category: "drug", source: ML("druginfo/meds/a689006"),
    description: "Selective serotonin reuptake inhibitor — first-line antidepressant.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: 0.1 },
      { organ: "stomach", stat: "bleeding", delta: 0.04, tags: ["bleed-risk"] },
    ], halfLife: 200 },
  { id: "benzodiazepine", name: "Benzodiazepine (alprazolam)", category: "drug", source: ML("druginfo/meds/a684001"),
    description: "Enhances GABA-A — anxiolytic, sedative, dependence risk.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: -0.1 },
      { organ: "lungs", stat: "capacity", delta: -0.04 },
    ], halfLife: 80 },
  { id: "antipsychotic", name: "Antipsychotic (olanzapine)", category: "drug", source: ML("druginfo/meds/a601213"),
    description: "Atypical antipsychotic — D2/5HT2 antagonism; metabolic side effects.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: -0.05 },
      { organ: "pancreas", stat: "insulin", delta: -0.06 },
    ], halfLife: 120 },

  // DRUGS — RESPIRATORY / IMMUNE
  { id: "salbutamol", name: "Salbutamol (albuterol)", category: "drug", source: ML("druginfo/meds/a607004"),
    description: "Short-acting β2-agonist bronchodilator.",
    modifiers: [
      { organ: "lungs", stat: "capacity", delta: 0.25 },
      { organ: "lungs", stat: "o2", delta: 0.15 },
      { organ: "heart", stat: "rate", delta: 0.08, tags: ["tachycardia"] },
    ],
    suppresses: ["bronchoconstriction"], halfLife: 30 },
  { id: "corticosteroid", name: "Corticosteroid (prednisone)", category: "drug", source: ML("druginfo/meds/a601102"),
    description: "Systemic glucocorticoid — potent anti-inflammatory and immunosuppressive.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: -0.3 },
      { organ: "immune", stat: "response", delta: -0.15 },
      { organ: "bones", stat: "density", delta: -0.04 },
      { organ: "pancreas", stat: "insulin", delta: -0.06 },
    ],
    suppresses: ["autoimmune"], halfLife: 80 },
  { id: "antihistamine", name: "Antihistamine (cetirizine)", category: "drug", source: ML("druginfo/meds/a698026"),
    description: "H1 receptor antagonist — relieves allergic symptoms.",
    modifiers: [{ organ: "skin", stat: "integrity", delta: 0.05 }],
    halfLife: 80 },
  { id: "ppi", name: "PPI (omeprazole)", category: "drug", source: ML("druginfo/meds/a693050"),
    description: "Proton-pump inhibitor — blocks gastric H+/K+ ATPase.",
    modifiers: [
      { organ: "stomach", stat: "acidity", delta: -0.3 },
      { organ: "stomach", stat: "mucosa", delta: 0.1 },
    ],
    suppresses: ["bleed-risk"], halfLife: 70 },
  { id: "vaccine", name: "Vaccination", category: "drug", source: ML("immunization"),
    description: "Active immunization primes adaptive immunity against specific pathogens.",
    modifiers: [{ organ: "immune", stat: "response", delta: 0.15 }],
    suppresses: ["infection","viral"], halfLife: 1000 },

  // ============================================================
  // HABITS
  // ============================================================
  { id: "smoking", name: "Smoking", category: "habit", source: ML("smoking"),
    description: "Combustion byproducts scar alveoli, constrict vessels, drive carcinogenesis.",
    modifiers: [
      { organ: "lungs", stat: "scarring", delta: 0.08 },
      { organ: "lungs", stat: "capacity", delta: -0.1 },
      { organ: "lungs", stat: "o2", delta: -0.06 },
      { organ: "heart", stat: "pressure", delta: 0.1, tags: ["pressure-up","vascular-stress"] },
      { organ: "skin", stat: "integrity", delta: -0.04 },
    ],
    amplifies: ["vascular-stress"] },
  { id: "alcohol", name: "Alcohol Abuse", category: "habit", source: ML("alcohol"),
    description: "Chronic ethanol overwhelms hepatic metabolism; CNS depressant.",
    modifiers: [
      { organ: "liver", stat: "toxicity", delta: 0.2 },
      { organ: "liver", stat: "efficiency", delta: -0.12 },
      { organ: "brain", stat: "clarity", delta: -0.12 },
      { organ: "stomach", stat: "mucosa", delta: -0.08 },
    ] },
  { id: "drug_use", name: "Recreational Drug Use", category: "habit", source: ML("drugabuse"),
    description: "Illicit substance use damages multiple organ systems.",
    modifiers: [
      { organ: "brain", stat: "neuro", delta: -0.1 },
      { organ: "heart", stat: "rhythm", delta: -0.08, tags: ["arrhythmia"] },
      { organ: "liver", stat: "toxicity", delta: 0.08 },
    ] },
  { id: "exercise", name: "Daily Exercise", category: "habit", source: ML("exerciseandphysicalfitness"),
    description: "Regular aerobic conditioning improves perfusion and metabolic flexibility.",
    modifiers: [
      { organ: "heart", stat: "output", delta: 0.12 },
      { organ: "heart", stat: "pressure", delta: -0.1, tags: ["pressure-down"] },
      { organ: "lungs", stat: "capacity", delta: 0.08 },
      { organ: "brain", stat: "perfusion", delta: 0.06 },
      { organ: "bones", stat: "density", delta: 0.05 },
      { organ: "pancreas", stat: "insulin", delta: 0.08 },
    ],
    suppresses: ["pressure-up","hyperglycemia"] },
  { id: "sedentary", name: "Sedentary Lifestyle", category: "habit", source: ML("exerciseandphysicalfitness"),
    description: "Lack of physical activity accelerates cardiovascular and metabolic decline.",
    modifiers: [
      { organ: "heart", stat: "output", delta: -0.06 },
      { organ: "heart", stat: "pressure", delta: 0.08, tags: ["pressure-up"] },
      { organ: "bones", stat: "density", delta: -0.06 },
      { organ: "pancreas", stat: "insulin", delta: -0.05 },
    ] },
  { id: "good_sleep", name: "Healthy Sleep (7-9h)", category: "habit", source: ML("healthysleep"),
    description: "Adequate restorative sleep supports immune, cognitive and metabolic function.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: 0.1 },
      { organ: "immune", stat: "response", delta: 0.08 },
      { organ: "immune", stat: "fatigue", delta: -0.15 },
    ] },
  { id: "sleep_deprivation", name: "Sleep Deprivation", category: "habit", source: ML("healthysleep"),
    description: "Chronic short sleep impairs cognition, immunity and glucose handling.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: -0.12 },
      { organ: "immune", stat: "fatigue", delta: 0.15 },
      { organ: "pancreas", stat: "insulin", delta: -0.05 },
      { organ: "heart", stat: "pressure", delta: 0.05, tags: ["pressure-up"] },
    ] },
  { id: "chronic_stress", name: "Chronic Stress", category: "habit", source: ML("stress"),
    description: "Sustained cortisol elevation drives inflammation and metabolic dysfunction.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.08, tags: ["pressure-up"] },
      { organ: "stomach", stat: "acidity", delta: 0.1 },
      { organ: "immune", stat: "response", delta: -0.08 },
      { organ: "brain", stat: "clarity", delta: -0.06 },
    ] },

  // ============================================================
  // NUTRITION
  // ============================================================
  { id: "high_sodium", name: "High-Sodium Diet", category: "nutrition", source: ML("dietarysodium"),
    description: "Excess sodium drives fluid retention and arterial pressure.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.18, tags: ["pressure-up"] },
      { organ: "kidneys", stat: "filtration", delta: -0.06 },
    ] },
  { id: "high_sugar", name: "High-Sugar Diet", category: "nutrition", source: ML("sugars"),
    description: "Excess refined sugar promotes insulin resistance and hepatic steatosis.",
    modifiers: [
      { organ: "pancreas", stat: "insulin", delta: -0.1, tags: ["hyperglycemia"] },
      { organ: "liver", stat: "efficiency", delta: -0.05 },
      { organ: "skin", stat: "integrity", delta: -0.03 },
    ] },
  { id: "high_fat", name: "High Saturated Fat", category: "nutrition", source: ML("dietaryfats"),
    description: "Saturated fat raises LDL cholesterol, promotes atherosclerosis.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: 0.05, tags: ["vascular-stress"] },
      { organ: "liver", stat: "efficiency", delta: -0.04 },
    ] },
  { id: "mediterranean_diet", name: "Mediterranean Diet", category: "nutrition", source: ML("dietsweightloss"),
    description: "Plant-forward diet rich in olive oil, fish, nuts — cardioprotective.",
    modifiers: [
      { organ: "heart", stat: "inflammation", delta: -0.08 },
      { organ: "brain", stat: "clarity", delta: 0.05 },
      { organ: "liver", stat: "efficiency", delta: 0.05 },
    ],
    suppresses: ["vascular-stress"] },
  { id: "hydration", name: "Optimal Hydration", category: "nutrition", source: ML("dehydration"),
    description: "Adequate fluid supports renal clearance and circulation.",
    modifiers: [
      { organ: "skin", stat: "hydration", delta: 0.15 },
      { organ: "kidneys", stat: "filtration", delta: 0.1 },
      { organ: "kidneys", stat: "toxicity", delta: -0.1 },
    ] },
  { id: "dehydration", name: "Dehydration", category: "nutrition", source: ML("dehydration"),
    description: "Inadequate fluid impairs perfusion, cognition, renal function.",
    modifiers: [
      { organ: "skin", stat: "hydration", delta: -0.2 },
      { organ: "kidneys", stat: "filtration", delta: -0.15 },
      { organ: "brain", stat: "clarity", delta: -0.08 },
    ] },
  { id: "fiber_diet", name: "High-Fiber Diet", category: "nutrition", source: ML("dietaryfiber"),
    description: "Soluble & insoluble fiber support gut microbiota and metabolic health.",
    modifiers: [
      { organ: "intestines", stat: "flora", delta: 0.12 },
      { organ: "intestines", stat: "absorption", delta: 0.04 },
      { organ: "heart", stat: "inflammation", delta: -0.04 },
    ] },
  { id: "vit_d", name: "Vitamin D", category: "nutrition", source: ML("vitamind"),
    description: "Supports calcium absorption and immune function.",
    modifiers: [
      { organ: "bones", stat: "density", delta: 0.06 },
      { organ: "immune", stat: "response", delta: 0.05 },
    ], halfLife: 500 },
  { id: "iron_supp", name: "Iron Supplement", category: "nutrition", source: ML("iron"),
    description: "Supports hemoglobin synthesis; corrects iron-deficiency anemia.",
    modifiers: [
      { organ: "bones", stat: "marrow", delta: 0.08 },
      { organ: "lungs", stat: "o2", delta: 0.08 },
    ], halfLife: 300 },
  { id: "caffeine", name: "Caffeine", category: "nutrition", source: ML("caffeine"),
    description: "Adenosine antagonist — increases alertness, transient BP/HR rise.",
    modifiers: [
      { organ: "brain", stat: "clarity", delta: 0.06 },
      { organ: "heart", stat: "rate", delta: 0.08 },
      { organ: "heart", stat: "pressure", delta: 0.04 },
    ], halfLife: 50 },

  // ============================================================
  // ENVIRONMENTAL
  // ============================================================
  { id: "altitude", name: "High Altitude", category: "environmental", source: ML("altitudesickness"),
    description: "Reduced inspired O₂ pressure forces cardiopulmonary compensation.",
    modifiers: [
      { organ: "lungs", stat: "o2", delta: -0.18, tags: ["hypoxia"] },
      { organ: "heart", stat: "rate", delta: 0.1 },
    ] },
  { id: "air_pollution", name: "Air Pollution", category: "environmental", source: ML("airpollution"),
    description: "Particulate inhalation drives chronic pulmonary and vascular inflammation.",
    modifiers: [
      { organ: "lungs", stat: "inflammation", delta: 0.12 },
      { organ: "lungs", stat: "scarring", delta: 0.02 },
      { organ: "heart", stat: "inflammation", delta: 0.04 },
    ] },
  { id: "uv_exposure", name: "UV Exposure", category: "environmental", source: ML("sunexposure"),
    description: "Ultraviolet radiation damages skin DNA, photoaging, cancer risk.",
    modifiers: [{ organ: "skin", stat: "integrity", delta: -0.1 }] },
  { id: "cold_exposure", name: "Cold Exposure", category: "environmental", source: ML("coldandfreezerelatedillness"),
    description: "Hypothermia stresses cardiovascular and metabolic systems.",
    modifiers: [
      { organ: "heart", stat: "rate", delta: -0.08 },
      { organ: "skin", stat: "integrity", delta: -0.06 },
    ] },
  { id: "heat_exposure", name: "Heat Exposure", category: "environmental", source: ML("heatillness"),
    description: "Heat stress causes dehydration, electrolyte imbalance, cardiovascular strain.",
    modifiers: [
      { organ: "skin", stat: "hydration", delta: -0.2 },
      { organ: "heart", stat: "rate", delta: 0.1 },
      { organ: "kidneys", stat: "filtration", delta: -0.05 },
    ] },
  { id: "radiation", name: "Radiation Exposure", category: "environmental", source: ML("radiationexposure"),
    description: "Ionizing radiation damages DNA, particularly proliferating tissues.",
    modifiers: [
      { organ: "bones", stat: "marrow", delta: -0.15 },
      { organ: "intestines", stat: "absorption", delta: -0.08 },
      { organ: "immune", stat: "response", delta: -0.1 },
    ] },
  { id: "noise_pollution", name: "Chronic Noise", category: "environmental", source: ML("noise"),
    description: "Persistent noise raises cortisol, BP, sleep disruption.",
    modifiers: [
      { organ: "heart", stat: "pressure", delta: 0.06, tags: ["pressure-up"] },
      { organ: "brain", stat: "clarity", delta: -0.04 },
    ] },
  { id: "lead_exposure", name: "Lead Exposure", category: "environmental", source: ML("leadpoisoning"),
    description: "Heavy metal toxicity impairs neurodevelopment and hematopoiesis.",
    modifiers: [
      { organ: "brain", stat: "neuro", delta: -0.08 },
      { organ: "kidneys", stat: "toxicity", delta: 0.08 },
      { organ: "bones", stat: "marrow", delta: -0.05 },
    ] },
];

// Mark contraindications inferred from MedlinePlus drug pages
const lookup = new Map(ENTITY_LIBRARY.map((e) => [e.id, e]));
for (const e of ENTITY_LIBRARY) {
  for (const c of e.contraindications ?? []) {
    const other = lookup.get(c);
    if (other) {
      other.contraindications = Array.from(new Set([...(other.contraindications ?? []), e.id]));
    }
  }
}
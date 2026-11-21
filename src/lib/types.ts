// ---------------------------------------------------------------------------
// BanglaShield shared type contracts
// Validated data contracts shared between the agent harness, API and UI.
// ---------------------------------------------------------------------------

export type Bilingual = { bn: string; en: string };

export type RiskCategory = "high" | "uncertain" | "none";

export type Modality = "voice" | "message" | "image" | "link";

export type AnalysisEngine = "ai_assisted" | "rule_based";

export type EvidenceKind =
  | "quoted_text"
  | "heuristic"
  | "visual"
  | "url_property"
  | "context";

export interface Evidence {
  key: string; // E1, E2 ... referenced by replay stages
  kind: EvidenceKind;
  quote?: string; // redacted excerpt (never contains unredacted PII)
  interpretation: Bilingual;
  tactic?: string;
  source: string; // producing module id
  weight: "strong" | "moderate" | "weak";
}

export interface Recommendation {
  id: string;
  templateId: string; // curated template library id (safety-gate whitelisted)
  title: Bilingual;
  detail: Bilingual;
  priority: "now" | "soon" | "know";
  evidenceRefs?: string[];
}

export interface Intervention {
  question: Bilingual;
  safe: Bilingual;
  unsafe: Bilingual;
}

export interface ReplayStage {
  id: string;
  index: number;
  type: "observed" | "inferred" | "hypothetical";
  title: Bilingual;
  description: Bilingual;
  evidenceRefs: string[];
  intervention?: Intervention;
}

export interface AnalysisResult {
  caseId: string;
  modality: Modality;
  engine: AnalysisEngine;
  generatedAt: string;
  riskCategory: RiskCategory;
  scamCategory: string; // key into SCAM_CATEGORIES
  summary: Bilingual; // what happened
  why: Bilingual; // why it may be dangerous
  evidence: Evidence[];
  unknowns: Bilingual[]; // what is still unknown
  recommendations: Recommendation[];
  replay: ReplayStage[];
  limitations: Bilingual[];
  policy: { validated: boolean; checks: string[] };
  resources: string[]; // VerifiedResource keys
}

export type SessionStatus =
  | "awaiting_input"
  | "awaiting_review"
  | "processing"
  | "completed"
  | "failed";

export type PipelineStage =
  | "created"
  | "validating"
  | "redacting"
  | "detecting"
  | "ai_analyzing"
  | "safety_gate"
  | "completed";

export interface SessionSummary {
  id: string;
  modality: Modality;
  status: SessionStatus;
  stage: string | null;
  riskCategory: RiskCategory | null;
  scamCategory: string | null;
  engine: string | null;
  createdAt: string;
  completedAt: string | null;
  hasReport: boolean;
}

// Scam category registry ----------------------------------------------------

export const SCAM_CATEGORIES: Record<string, Bilingual> = {
  otp_phishing: { bn: "ওটিপি/পিন ফিশিং", en: "OTP / PIN phishing" },
  impersonation: { bn: "ভুয়া পরিচয় (সরকারি/ব্র্যান্ড)", en: "Impersonation (official / brand)" },
  fake_job: { bn: "ভুয়া চাকরির ফাঁদ", en: "Fake job offer" },
  prize_lottery: { bn: "লটারি/পুরস্কার প্রতারণা", en: "Lottery / prize scam" },
  phishing_link: { bn: "ফিশিং লিংক", en: "Phishing link" },
  loan_scam: { bn: "ভুয়া ঋণ/লোন প্রতারণা", en: "Fake loan scam" },
  parcel_scam: { bn: "পার্সেল/কুরিয়ার প্রতারণা", en: "Parcel / courier scam" },
  shopping_scam: { bn: "ভুয়া অনলাইন শপিং", en: "Fake online shopping" },
  romance_investment: { bn: "প্রেম/বিনিয়োগ প্রতারণা", en: "Romance / investment scam" },
  threat_extortion: { bn: "হুমকি/ভয় দেখানো", en: "Threats / extortion" },
  app_control: { bn: "রিমোট অ্যাপ/স্ক্রিন নিয়ন্ত্রণ", en: "Remote app / screen control" },
  uncertain_situation: { bn: "নিশ্চিত হওয়া যায়নি", en: "Uncertain situation" },
  no_indicators: { bn: "ঝুঁকির প্রমাণ পাওয়া যায়নি", en: "No risk indicators found" },
};

// Pipeline stage labels (for progress UI)
export const STAGE_LABELS: Record<PipelineStage, Bilingual> = {
  created: { bn: "প্রস্তুত", en: "Ready" },
  validating: { bn: "ইনপুট যাচাই করা হচ্ছে", en: "Validating input" },
  redacting: { bn: "গোপনীয় তথ্য আড়াল করা হচ্ছে", en: "Redacting private data" },
  detecting: { bn: "প্রতারণার চিহ্ন খোঁজা হচ্ছে", en: "Detecting scam indicators" },
  ai_analyzing: { bn: "এআই বিশ্লেষণ চলছে", en: "AI analysis in progress" },
  safety_gate: { bn: "নিরাপত্তা যাচাই (Safety Gate)", en: "Safety Gate validation" },
  completed: { bn: "সম্পন্ন", en: "Completed" },
};

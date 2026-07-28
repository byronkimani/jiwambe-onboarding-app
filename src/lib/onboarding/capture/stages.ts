import type { CaptureStageKey } from "@/lib/global/shared/routes";

export const CAPTURE_STAGES: {
  key: CaptureStageKey;
  n: number;
  label: string;
}[] = [
  { key: "readiness", n: 1, label: "Readiness check" },
  { key: "lookup", n: 2, label: "Customer lookup" },
  { key: "identity", n: 3, label: "Identity & contact" },
  { key: "dl", n: 4, label: "Driving licence" },
  { key: "cogc", n: 5, label: "Good conduct" },
  { key: "references", n: 6, label: "References" },
  { key: "model", n: 7, label: "Operating model" },
  { key: "product", n: 8, label: "Product, financing & deposit" },
  { key: "bike", n: 9, label: "Bike assignment" },
  { key: "review", n: 10, label: "Review & submit" },
];

export const READINESS_ITEMS = [
  {
    k: "hasId",
    label:
      "Customer has their original National ID with them right now.",
  },
  {
    k: "knowsKra",
    label:
      "Customer knows their KRA PIN and can produce the KRA PIN certificate.",
  },
  {
    k: "dlKnown",
    label:
      "The driving licence situation is known: valid DL, PDL, expired / under processing, or none.",
  },
  {
    k: "cogcKnown",
    label:
      "The Certificate of Good Conduct situation is known: has certificate, fingerprints taken and pending, or not started.",
  },
  {
    k: "hasFunds",
    label:
      "Deposit funds are available on M-Pesa today and meet the minimum for the operating model — read it from the table below, never quote from memory.",
  },
  {
    k: "refsBriefed",
    label:
      "The customer has briefed their three references that Jiwambe may call during this session.",
  },
] as const;

export type ReadinessKey = (typeof READINESS_ITEMS)[number]["k"];

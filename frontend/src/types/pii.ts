export type PIIFinding = {
  column_name: string;
  pii_type: string;
  severity: "High" | "Medium" | "Sensitive";
  match_count: number;
  sample_masked_value: string | null;
};

export type PIIScanResult = {
  findings: PIIFinding[];
  has_pii: boolean;
};

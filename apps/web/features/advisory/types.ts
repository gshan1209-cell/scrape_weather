export type AdvisoryAlert = {
  level: "info" | "warning" | "danger" | string;
  type: string;
  title: string;
  message: string;
};

export type WeeklyAdvisoryResponse = {
  city: string;
  district?: string | null;
  crop?: string | null;
  summary: string;
  riskLevel: "normal" | "warning" | "danger" | string;
  alerts: AdvisoryAlert[];
  suggestions: string[];
};

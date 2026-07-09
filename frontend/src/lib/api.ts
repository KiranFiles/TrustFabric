const BASE = "/api";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface TransactionIn {
  user_id: string;
  amount: number;
  channel: string;
  device_id: string;
  country_code: string;
  local_hour: number;
  txns_last_10_min: number;
}

export interface RiskResult {
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  reasons: string[];
  recommended_action: string;
  evaluated_at: string;
}

export interface IdentityRecord {
  did: string;
  user_id: string;
  full_name: string;
  credential_hash: string;
  issued_at: string;
  issuer: string;
  status: string;
}

export interface Alert {
  id: string;
  user_id: string;
  channel: string;
  amount: number;
  risk_score: number;
  reason: string;
  status: string;
  timestamp: string;
}

export interface DashboardStats {
  total_alerts: number;
  open_alerts: number;
  confirmed_fraud: number;
  avg_risk_score: number;
  by_channel: Record<string, number>;
  risk_trend_24h: { hour: string; score: number }[];
  identities_issued: number;
}

export const api = {
  scoreTransaction: (txn: TransactionIn) =>
    req<RiskResult>("/score-transaction", { method: "POST", body: JSON.stringify(txn) }),
  issueIdentity: (payload: { full_name: string; user_id: string; aadhaar_last4: string }) =>
    req<IdentityRecord>("/identity/issue", { method: "POST", body: JSON.stringify(payload) }),
  verifyIdentity: (payload: { did: string; credential_hash: string }) =>
    req<{ did: string; valid: boolean; checked_at: string; issuer: string | null }>(
      "/identity/verify",
      { method: "POST", body: JSON.stringify(payload) }
    ),
  getAlerts: (limit = 25) => req<{ count: number; alerts: Alert[] }>(`/alerts?limit=${limit}`),
  getStats: () => req<DashboardStats>("/dashboard/stats"),
};

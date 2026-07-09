import { useState } from "react";
import { api, IdentityRecord, RiskResult } from "../lib/api";

const CHANNELS = ["mobile_app", "web_portal", "atm", "branch", "ussd", "api_partner"];

export default function CustomerDashboard() {
  const [name, setName] = useState("Priya Nair");
  const [userId, setUserId] = useState("USR-10231");
  const [aadhaar, setAadhaar] = useState("4471");
  const [identity, setIdentity] = useState<IdentityRecord | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [issuing, setIssuing] = useState(false);

  const [amount, setAmount] = useState(15000);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [deviceId, setDeviceId] = useState("DEV-9911");
  const [hour, setHour] = useState(14);
  const [velocity, setVelocity] = useState(1);
  const [countryCode, setCountryCode] = useState("IN");
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleIssue() {
    setIssuing(true);
    setError(null);
    try {
      const rec = await api.issueIdentity({ full_name: name, user_id: userId, aadhaar_last4: aadhaar });
      setIdentity(rec);
      setVerifyResult(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIssuing(false);
    }
  }

  async function handleVerify() {
    if (!identity) return;
    const res = await api.verifyIdentity({ did: identity.did, credential_hash: identity.credential_hash });
    setVerifyResult(res.valid);
  }

  async function handleScore() {
    setScoring(true);
    setError(null);
    try {
      const res = await api.scoreTransaction({
        user_id: userId,
        amount,
        channel,
        device_id: deviceId,
        country_code: countryCode,
        local_hour: hour,
        txns_last_10_min: velocity,
      });
      setRisk(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setScoring(false);
    }
  }

  const loadNormalPreset = () => {
    setName("Priya Nair");
    setUserId("USR-10231");
    setAadhaar("4471");
    setAmount(800);
    setChannel("mobile_app");
    setDeviceId("DEV-9911"); // Priya's usual phone (enrolled on backend)
    setHour(18); // 6 PM
    setVelocity(1);
    setCountryCode("IN");
    setRisk(null);
    setError(null);
  };

  const loadSuspiciousPreset = () => {
    setName("Priya Nair");
    setUserId("USR-10231");
    setAadhaar("4471");
    setAmount(250000); // high amount (>₹2,00,000)
    setChannel("mobile_app");
    setDeviceId("DEV-UNSEEN"); // unrecognized device
    setHour(3); // 3 AM
    setVelocity(6); // 6 transactions
    setCountryCode("XX"); // Flagged country
    setRisk(null);
    setError(null);
  };

  const levelColor: Record<string, string> = {
    low: "text-trust",
    medium: "text-alert",
    high: "text-alert",
    critical: "text-danger",
  };

  const levelBgColor: Record<string, string> = {
    low: "bg-trust/10 border-trust/30",
    medium: "bg-alert/10 border-alert/30",
    high: "bg-alert/20 border-alert/40",
    critical: "bg-danger/10 border-danger/30",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1 text-white">Interactive Simulator</h1>
          <p className="text-fog text-sm">
            Test the Identity Wallet and Risk Scoring Engine in real time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface2 border border-line rounded-lg self-start md:self-auto">
          <span className="text-xs text-fog font-medium px-2.5">Demo Presets:</span>
          <button
            onClick={loadNormalPreset}
            className="px-3 py-1.5 rounded bg-surface border border-line text-white hover:border-trust text-xs font-semibold transition"
          >
            Priya's Normal Txn (₹800)
          </button>
          <button
            onClick={loadSuspiciousPreset}
            className="px-3 py-1.5 rounded bg-alert/10 border border-alert/30 text-alert hover:bg-alert hover:text-ink text-xs font-bold transition"
          >
            Priya's Suspicious Txn (₹2,50,000)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Identity card */}
        <div className="border border-line rounded-xl p-6 bg-surface flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-trust/15 text-trust flex items-center justify-center text-xs font-bold font-mono">1</span>
              <h2 className="font-display text-lg font-bold text-white">Part 1: Identity Wallet (DID)</h2>
            </div>
            <p className="text-xs text-fog mb-5 leading-relaxed">
              When a customer is verified once (at account opening), the bank issues them a digital ID (tamper-proof certificate). No need to re-verify KYC every time they use a different channel.
            </p>
            <div className="space-y-4 mb-6">
              <Field label="Full Name" value={name} onChange={setName} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="User ID" value={userId} onChange={setUserId} />
                <Field label="Aadhaar Last 4" value={aadhaar} onChange={setAadhaar} maxLength={4} />
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleIssue}
              disabled={issuing}
              className="w-full py-2.5 rounded-lg bg-trust text-ink font-bold text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {issuing ? "Issuing Digital ID..." : identity ? "Re-issue Digital ID" : "Issue Digital ID (DID)"}
            </button>

            {identity && (
              <div className="mt-5 font-mono text-xs bg-ink border border-line rounded-lg p-4 space-y-2 break-all">
                <p><span className="text-fog">DID:</span> <span className="text-trust">{identity.did}</span></p>
                <p><span className="text-fog">Credential Hash:</span> <span className="text-white">{identity.credential_hash}</span></p>
                <p><span className="text-fog">Issuer:</span> <span className="text-white">{identity.issuer}</span></p>
                <p><span className="text-fog">Issued At:</span> <span className="text-fog">{identity.issued_at}</span></p>
                <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                  <button
                    onClick={handleVerify}
                    className="px-3 py-1.5 rounded border border-line hover:border-trust text-paper text-xs transition"
                  >
                    Verify Credential
                  </button>
                  {verifyResult !== null && (
                    <span className={`text-xs font-bold ${verifyResult ? "text-trust" : "text-danger"}`}>
                      {verifyResult ? "✓ Valid Trust Anchor" : "✗ Invalid Credential"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk checker card */}
        <div className="border border-line rounded-xl p-6 bg-surface flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-idbi-orange/15 text-idbi-orange flex items-center justify-center text-xs font-bold font-mono">2</span>
              <h2 className="font-display text-lg font-bold text-white">Part 2: Behavioral Risk Engine</h2>
            </div>
            <p className="text-xs text-fog mb-5 leading-relaxed">
              Every transaction is scored instantly (0-100) based on simple red flags. Cross-channel context detects fraud patterns that are invisible to separate channel silos.
            </p>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Amount (₹)" value={amount} onChange={(v) => setAmount(Number(v))} type="number" />
                <div>
                  <label className="text-xs text-fog block mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-sm text-white focus:border-trust focus:outline-none"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>{c.replace("_", " ").toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Device ID" value={deviceId} onChange={setDeviceId} />
                <div>
                  <label className="text-xs text-fog block mb-1">Country</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-sm text-white focus:border-trust focus:outline-none"
                  >
                    <option value="IN">India (IN) - Normal</option>
                    <option value="XX">Flagged Country (XX) - High Risk</option>
                    <option value="RU">Russia (RU) - Flagged</option>
                    <option value="KP">North Korea (KP) - Flagged</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Local Hour (0-23)" value={hour} onChange={(v) => setHour(Number(v))} type="number" />
                <Field
                  label="Transactions in Last 10 Min"
                  value={velocity}
                  onChange={(v) => setVelocity(Number(v))}
                  type="number"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleScore}
              disabled={scoring}
              className="w-full py-2.5 rounded-lg bg-alert text-ink font-bold text-sm hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-alert/10"
            >
              {scoring ? "Scoring Transaction..." : "Evaluate Transaction Risk"}
            </button>

            {risk && (
              <div className={`mt-5 border rounded-lg p-4 ${levelBgColor[risk.risk_level]}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-fog">RISK SCORE</span>
                  <span className={`font-display text-3xl font-extrabold ${levelColor[risk.risk_level]}`}>
                    {risk.risk_score}/100
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-mono uppercase font-bold px-2 py-0.5 rounded ${
                    risk.risk_level === "critical" ? "bg-danger/20 text-danger" :
                    risk.risk_level === "high" ? "bg-alert/20 text-alert" :
                    risk.risk_level === "medium" ? "bg-alert/10 text-alert" :
                    "bg-trust/20 text-trust"
                  }`}>
                    {risk.risk_level}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-fog uppercase block font-semibold mb-1">Anomalies Detected:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {risk.reasons.map((r, i) => (
                      <span key={i} className="text-xs font-medium px-2 py-0.5 rounded bg-ink border border-line text-white">
                        🚨 {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-line/60">
                  <span className="text-[10px] text-fog uppercase block font-semibold">Recommended Action:</span>
                  <p className="text-xs text-white font-semibold mt-0.5">
                    {risk.recommended_action}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-danger text-sm mt-4 text-center font-bold">⚠️ {error}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs text-fog block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-sm text-white focus:border-trust focus:outline-none"
      />
    </div>
  );
}

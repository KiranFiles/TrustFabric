import { useState } from "react";
import { api, IdentityRecord, RiskResult } from "../lib/api";

const CHANNELS = ["mobile_app", "web_portal", "atm", "branch", "ussd", "api_partner"];

// ── Demo Personas ─────────────────────────────────────────────────────────────
const PERSONAS = [
  {
    name: "Priya Nair",
    userId: "USR-10231",
    aadhaar: "4471",
    tag: "Retail customer · Mobile-first",
    normal: {
      label: "Priya – Normal (₹800)",
      amount: 800,
      channel: "mobile_app",
      deviceId: "DEV-9911",
      hour: 18,
      velocity: 1,
      countryCode: "IN",
    },
    suspicious: {
      label: "Priya – Suspicious (₹2,50,000)",
      amount: 250000,
      channel: "mobile_app",
      deviceId: "DEV-UNSEEN",
      hour: 3,
      velocity: 6,
      countryCode: "XX",
    },
  },
  {
    name: "Rahul Mehta",
    userId: "USR-10874",
    aadhaar: "7823",
    tag: "ATM heavy user · Card skimming risk",
    normal: {
      label: "Rahul – Normal ATM (₹3,500)",
      amount: 3500,
      channel: "atm",
      deviceId: "DEV-3301",
      hour: 12,
      velocity: 1,
      countryCode: "IN",
    },
    suspicious: {
      label: "Rahul – Card Skimming (₹40,000 × 6)",
      amount: 40000,
      channel: "atm",
      deviceId: "DEV-STOLEN",
      hour: 2,
      velocity: 6,
      countryCode: "IN",
    },
  },
  {
    name: "Ananya Sharma",
    userId: "USR-11002",
    aadhaar: "3356",
    tag: "International traveller · Cross-border risk",
    normal: {
      label: "Ananya – Normal Transfer (₹5,600)",
      amount: 5600,
      channel: "mobile_app",
      deviceId: "DEV-5512",
      hour: 10,
      velocity: 1,
      countryCode: "IN",
    },
    suspicious: {
      label: "Ananya – Cross-Border (₹1,80,000)",
      amount: 180000,
      channel: "web_portal",
      deviceId: "DEV-5512",
      hour: 14,
      velocity: 2,
      countryCode: "RU",
    },
  },
  {
    name: "Vikram Iyer",
    userId: "USR-11390",
    aadhaar: "9102",
    tag: "Business account · High-velocity fraud",
    normal: {
      label: "Vikram – Normal Branch (₹22,000)",
      amount: 22000,
      channel: "branch",
      deviceId: "DEV-7741",
      hour: 11,
      velocity: 1,
      countryCode: "IN",
    },
    suspicious: {
      label: "Vikram – Burst Transfers (₹75,000 × 7)",
      amount: 75000,
      channel: "mobile_app",
      deviceId: "DEV-HIJACKED",
      hour: 4,
      velocity: 7,
      countryCode: "IN",
    },
  },
];

export default function CustomerDashboard() {
  const [activePersona, setActivePersona] = useState(0);
  const persona = PERSONAS[activePersona];

  const [name, setName] = useState(persona.name);
  const [userId, setUserId] = useState(persona.userId);
  const [aadhaar, setAadhaar] = useState(persona.aadhaar);
  const [identity, setIdentity] = useState<IdentityRecord | null>(null);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [issuing, setIssuing] = useState(false);

  const [amount, setAmount] = useState(persona.normal.amount);
  const [channel, setChannel] = useState(persona.normal.channel);
  const [deviceId, setDeviceId] = useState(persona.normal.deviceId);
  const [hour, setHour] = useState(persona.normal.hour);
  const [velocity, setVelocity] = useState(persona.normal.velocity);
  const [countryCode, setCountryCode] = useState(persona.normal.countryCode);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchPersona(idx: number) {
    const p = PERSONAS[idx];
    setActivePersona(idx);
    setName(p.name);
    setUserId(p.userId);
    setAadhaar(p.aadhaar);
    setAmount(p.normal.amount);
    setChannel(p.normal.channel);
    setDeviceId(p.normal.deviceId);
    setHour(p.normal.hour);
    setVelocity(p.normal.velocity);
    setCountryCode(p.normal.countryCode);
    setIdentity(null);
    setVerifyResult(null);
    setRisk(null);
    setError(null);
  }

  function applyPreset(preset: (typeof persona)["normal"]) {
    setAmount(preset.amount);
    setChannel(preset.channel);
    setDeviceId(preset.deviceId);
    setHour(preset.hour);
    setVelocity(preset.velocity);
    setCountryCode(preset.countryCode);
    setRisk(null);
    setError(null);
  }

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1 text-white">Interactive Simulator</h1>
          <p className="text-fog text-sm">
            Test the Identity Wallet and Risk Scoring Engine in real time.
          </p>
        </div>
      </div>

      {/* ── Persona Selector ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs text-fog font-semibold uppercase tracking-widest mb-3">Select Demo Customer</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PERSONAS.map((p, idx) => (
            <button
              key={p.userId}
              onClick={() => switchPersona(idx)}
              className={`text-left p-3 rounded-xl border transition ${
                activePersona === idx
                  ? "border-trust bg-trust/10"
                  : "border-line bg-surface hover:border-trust/40"
              }`}
            >
              <p className={`font-display font-bold text-sm mb-0.5 ${activePersona === idx ? "text-trust" : "text-white"}`}>
                {p.name}
              </p>
              <p className="text-[10px] text-fog leading-tight">{p.tag}</p>
              <p className="font-mono text-[10px] text-fog/60 mt-1">{p.userId}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Transaction Presets ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-2 bg-surface2 border border-line rounded-lg">
        <span className="text-xs text-fog font-medium px-2">Quick Presets:</span>
        <button
          onClick={() => applyPreset(persona.normal)}
          className="px-3 py-1.5 rounded bg-surface border border-line text-white hover:border-trust text-xs font-semibold transition"
        >
          ✅ {persona.normal.label}
        </button>
        <button
          onClick={() => applyPreset(persona.suspicious)}
          className="px-3 py-1.5 rounded bg-alert/10 border border-alert/30 text-alert hover:bg-alert hover:text-ink text-xs font-bold transition"
        >
          🚨 {persona.suspicious.label}
        </button>
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

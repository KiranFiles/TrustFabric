import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api, Alert, DashboardStats } from "../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getAlerts(20)])
      .then(([s, a]) => {
        setStats(s);
        setAlerts(a.alerts);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    open: "text-danger font-semibold",
    reviewing: "text-alert font-semibold",
    cleared: "text-trust font-semibold",
    confirmed_fraud: "text-danger font-semibold",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1 text-white">Fraud & Risk Console — Bank Admin</h1>
          <p className="text-fog text-sm">
            Live cross-channel threat monitoring powered by TrustFabric's unified customer behavioral memory.
          </p>
        </div>
      </div>

      {loading && <p className="text-fog text-sm">Loading dashboard stats…</p>}

      {stats && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat 
                label="Open Alerts" 
                value={stats.open_alerts} 
                accent="text-danger" 
                description="Needs review / OTP check" 
              />
              <Stat 
                label="Confirmed Fraud" 
                value={stats.confirmed_fraud} 
                accent="text-danger" 
                description="Verified bad events" 
              />
              <Stat 
                label="Avg. Risk Score" 
                value={stats.avg_risk_score} 
                accent="text-alert" 
                description="Threat index (0-100)" 
              />
              <Stat 
                label="DIDs Issued" 
                value={stats.identities_issued} 
                accent="text-trust" 
                description="Active customer wallets" 
              />
            </div>
            <div className="bg-trust/10 border border-trust/30 rounded-xl p-5 text-xs text-white">
              <h4 className="font-bold text-trust mb-1.5">💡 Shared Behavioral Memory</h4>
              <p className="text-fog leading-relaxed">
                Unlike siloed engines, TrustFabric puts all channels (app, ATM, branch, etc.) on one shared registry of customer normal behavior. A threat spotted on the mobile app instantly shields ATM and branch channels.
              </p>
            </div>
          </div>

          <div className="border border-line rounded-lg bg-surface p-6 mb-8">
            <div className="mb-4">
              <h2 className="font-display font-semibold text-sm text-white">Risk Score Trend — Last 24h</h2>
              <p className="text-xs text-fog mt-1">
                Monitors the rolling risk level of transactions processed across all bank branches, ATMs, and portals. Spikes indicate potential automated brute force attempts.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.risk_trend_24h}>
                <CartesianGrid stroke="#2A3450" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#7C8695" fontSize={11} interval={2} />
                <YAxis stroke="#7C8695" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#1B2438", border: "1px solid #2A3450", fontSize: 12 }}
                  labelStyle={{ color: "#EDEFF4" }}
                />
                <Line type="monotone" dataKey="score" stroke="#00A389" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-line rounded-lg bg-surface p-6 mb-8">
            <div className="mb-4">
              <h2 className="font-display font-semibold text-sm text-white">Alerts by Channel</h2>
              <p className="text-xs text-fog mt-1">
                Breaks down which channels are experiencing anomalous patterns. Because memory is shared, indicators travel immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.by_channel).map(([ch, count]) => (
                <div key={ch} className="border border-line rounded-md px-4 py-2 text-xs font-mono bg-ink">
                  <span className="text-fog">{ch.replace("_", " ").toUpperCase()}</span>{" "}
                  <span className="text-alert font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="border border-line rounded-lg bg-surface overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="font-display font-semibold text-sm text-white">Recent Real-Time Alerts</h2>
          <p className="text-xs text-fog mt-1">
            Global ledger of transaction logs scoring &ge; 55. If a transaction fails verification or triggers anomalies on any channel, it is instantly written here.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-line text-fog text-xs uppercase bg-ink/50">
              <th className="text-left font-semibold px-6 py-3">Alert ID</th>
              <th className="text-left font-semibold px-6 py-3">Customer ID</th>
              <th className="text-left font-semibold px-6 py-3">Channel</th>
              <th className="text-right font-semibold px-6 py-3">Amount</th>
              <th className="text-right font-semibold px-6 py-3">Risk Score</th>
              <th className="text-left font-semibold px-6 py-3">Primary Reason</th>
              <th className="text-left font-semibold px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className="border-t border-line/60 hover:bg-surface2/45 transition">
                <td className="px-6 py-3.5 font-mono text-xs text-fog">{a.id}</td>
                <td className="px-6 py-3.5 text-white font-medium">{a.user_id}</td>
                <td className="px-6 py-3.5 text-fog text-xs font-mono uppercase">{a.channel.replace("_", " ")}</td>
                <td className="px-6 py-3.5 text-right text-white font-mono">₹{a.amount.toLocaleString("en-IN")}</td>
                <td className="px-6 py-3.5 text-right font-bold text-alert">{a.risk_score}</td>
                <td className="px-6 py-3.5 text-fog text-xs font-medium">🚨 {a.reason}</td>
                <td className={`px-6 py-3.5 text-xs font-mono ${statusColor[a.status] || "text-white"}`}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, description }: { label: string; value: number; accent: string; description: string }) {
  return (
    <div className="border border-line rounded-lg bg-surface p-4 flex flex-col justify-between">
      <div>
        <p className={`font-display text-2xl font-bold ${accent}`}>{value}</p>
        <p className="text-white text-xs mt-1 font-bold">{label}</p>
      </div>
      <p className="text-[10px] text-fog mt-2 leading-tight">{description}</p>
    </div>
  );
}

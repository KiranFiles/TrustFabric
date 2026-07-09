import { Link } from "react-router-dom";
import TrustLedger from "../components/TrustLedger";

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-16 pt-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-4 bg-alert/10 border border-alert/30 px-3 py-1 rounded-full text-xs font-bold text-alert">
            🚀 WILDCARD OPEN TRACK 05 · IDBI INNOVATE 2026
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5 text-white">
            One Digital ID.
            <br />
            Every Channel.
            <br />
            <span className="text-alert">Zero Blind Spots.</span>
          </h1>
          <p className="text-fog text-base leading-relaxed mb-6">
            IDBI TrustFabric collapses channel silos into a single shared customer behavioral registry. Verify identity once, protect transactions everywhere.
          </p>
          <div className="flex gap-4">
            <Link
              to="/customer"
              className="px-6 py-3 rounded-lg bg-trust text-ink font-bold text-sm hover:opacity-90 transition shadow-lg shadow-trust/10"
            >
              Open Interactive Simulator
            </Link>
            <Link
              to="/admin"
              className="px-6 py-3 rounded-lg border border-line text-paper hover:border-alert hover:text-alert font-semibold text-sm transition"
            >
              Open Fraud Console
            </Link>
          </div>
        </div>
        <TrustLedger />
      </section>

      {/* Simplified User Flow Selection */}
      <section className="border-t border-line pt-12 mb-12">
        <h2 className="font-display font-bold text-xl text-white mb-2 text-center">Interactive Walkthrough</h2>
        <p className="text-fog text-sm mb-8 text-center max-w-md mx-auto">
          Experience the prototype by navigating through the customer simulator and fraud console.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Customer View */}
          <div className="border border-line rounded-xl p-6 bg-surface hover:border-trust/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-trust/15 text-trust flex items-center justify-center text-xs font-bold font-mono">1</span>
                <h3 className="font-display font-bold text-lg text-white">Customer Simulator</h3>
              </div>
              <p className="text-fog text-xs leading-relaxed mb-4">
                Simulate how a customer interacts with the bank. Issue a Decentralized Digital ID (DID) once, then run safe vs. high-risk transactions.
              </p>
              <ul className="text-[11px] text-fog space-y-1.5 list-disc list-inside">
                <li>Register Priya's digital identity wallet</li>
                <li>Verify DID validity with a trust anchor</li>
                <li>Simulate groceries transfer (Low risk: 0/100)</li>
                <li>Simulate suspicious transfer (Critical: 100/100)</li>
              </ul>
            </div>
            <Link
              to="/customer"
              className="w-full text-center mt-6 py-2 rounded-lg bg-trust/10 text-trust hover:bg-trust hover:text-ink text-xs font-bold transition"
            >
              Enter Customer Wallet →
            </Link>
          </div>

          {/* Card 2: Admin View */}
          <div className="border border-line rounded-xl p-6 bg-surface hover:border-alert/40 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-alert/15 text-alert flex items-center justify-center text-xs font-bold font-mono">2</span>
                <h3 className="font-display font-bold text-lg text-white">Fraud & Risk Console</h3>
              </div>
              <p className="text-fog text-xs leading-relaxed mb-4">
                Inspect cross-channel activity as a bank administrator. Spot incoming fraud events registered on ATMs, mobile devices, and branches.
              </p>
              <ul className="text-[11px] text-fog space-y-1.5 list-disc list-inside">
                <li>Real-time alert logger across channels</li>
                <li>24h rolling network risk trend metrics</li>
                <li>Priya's critical alerts trigger instantly</li>
                <li>Plain-language explainable fraud triggers</li>
              </ul>
            </div>
            <Link
              to="/admin"
              className="w-full text-center mt-6 py-2 rounded-lg bg-alert/10 text-alert hover:bg-alert hover:text-ink text-xs font-bold transition"
            >
              Enter Fraud Console →
            </Link>
          </div>
        </div>
      </section>

      {/* Summary Explanation */}
      <section className="bg-trust/5 border border-trust/20 rounded-xl p-6 text-center max-w-3xl mx-auto">
        <h4 className="font-bold text-trust text-sm mb-1.5">💡 How it helps IDBI Bank</h4>
        <p className="text-fog text-xs leading-relaxed max-w-2xl mx-auto">
          Instead of separate, disconnected rules on web logins vs ATM cash withdrawals, TrustFabric unifies all channels under one customer history memory. A security threat detected on one channel immediately shields and protects all others.
        </p>
      </section>
    </div>
  );
}

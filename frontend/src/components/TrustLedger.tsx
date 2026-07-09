import { useMemo } from "react";

function randHash(len = 12) {
  const chars = "0123456789abcdef";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const EVENTS = [
  "IDENTITY_ISSUED",
  "DEVICE_ENROLLED",
  "RISK_SCORED",
  "STEP_UP_AUTH",
  "CREDENTIAL_VERIFIED",
  "SESSION_ANCHORED",
  "TXN_CLEARED",
  "ALERT_RAISED",
];

export default function TrustLedger() {
  const rows = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        block: 480213 + i,
        event: EVENTS[Math.floor(Math.random() * EVENTS.length)],
        hash: randHash(),
        prev: randHash(8),
      })),
    []
  );
  const doubled = [...rows, ...rows];

  return (
    <div className="relative h-72 overflow-hidden rounded-lg border border-line bg-surface font-mono text-xs">
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-surface to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface to-transparent z-10" />
      <div className="animate-ledger">
        {doubled.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 border-b border-line/60 whitespace-nowrap"
          >
            <span className="text-fog">#{r.block}</span>
            <span className="text-trust w-36">{r.event}</span>
            <span className="text-fog">prev:{r.prev}</span>
            <span className="text-paper">hash:{r.hash}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-trust ml-auto shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

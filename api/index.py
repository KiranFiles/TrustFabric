"""
TrustFabric API
Decentralized Identity & Behavioral-Biometric Fraud Shield for Omni-Channel Banking

Runs as a Vercel Python serverless function (ASGI) and locally via:
    uvicorn api.index:app --reload --port 8000
"""
from __future__ import annotations

import hashlib
import random
import time
import uuid
from datetime import datetime, timedelta
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="TrustFabric API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory demo store (resets per cold start — fine for a hackathon demo)
# ---------------------------------------------------------------------------
IDENTITY_STORE: dict[str, dict] = {}
ALERTS: list[dict] = []
KNOWN_DEVICES: dict[str, set] = {}  # user_id -> set of device_ids seen before

CHANNELS = ["mobile_app", "web_portal", "atm", "branch", "ussd", "api_partner"]
HIGH_RISK_COUNTRIES = {"NG", "RU", "KP", "IR", "XX"}


def _seed_demo_data() -> None:
    """Seed a handful of alerts/devices so dashboards aren't empty on first load."""
    now = datetime.utcnow()
    sample_users = ["USR-10231", "USR-10874", "USR-11002", "USR-11390"]
    reasons_pool = [
        "new device",
        "high transaction amount",
        "odd hour",
        "high velocity",
        "flagged country",
    ]
    for i in range(14):
        user = random.choice(sample_users)
        ALERTS.append(
            {
                "id": f"ALT-{1000 + i}",
                "user_id": user,
                "channel": random.choice(CHANNELS),
                "amount": round(random.uniform(500, 95000), 2),
                "risk_score": random.randint(62, 98),
                "reason": random.choice(reasons_pool),
                "status": random.choice(["open", "reviewing", "cleared", "confirmed_fraud"]),
                "timestamp": (now - timedelta(minutes=random.randint(1, 4000))).isoformat() + "Z",
            }
        )
    for u in sample_users:
        if u == "USR-10231":
            KNOWN_DEVICES[u] = {"DEV-9911"}
        else:
            KNOWN_DEVICES[u] = {f"DEV-{random.randint(1000,9999)}" for _ in range(random.randint(1, 3))}


_seed_demo_data()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class TransactionIn(BaseModel):
    user_id: str = Field(..., examples=["USR-10231"])
    amount: float = Field(..., gt=0)
    channel: Literal["mobile_app", "web_portal", "atm", "branch", "ussd", "api_partner"]
    device_id: str = Field(..., examples=["DEV-7734"])
    country_code: str = Field("IN", examples=["IN"])
    local_hour: int = Field(..., ge=0, le=23)
    txns_last_10_min: int = Field(0, ge=0)


class RiskResult(BaseModel):
    risk_score: int
    risk_level: Literal["low", "medium", "high", "critical"]
    reasons: list[str]
    recommended_action: str
    evaluated_at: str


class IdentityIssueIn(BaseModel):
    full_name: str
    user_id: str
    aadhaar_last4: str = Field(..., min_length=4, max_length=4)
    pan_hash_seed: Optional[str] = None


class IdentityVerifyIn(BaseModel):
    did: str
    credential_hash: str


# ---------------------------------------------------------------------------
# Risk engine — transparent, weighted rule-scoring.
# (Swappable for a trained model later; kept dependency-light for serverless.)
# ---------------------------------------------------------------------------
def score_transaction(txn: TransactionIn) -> RiskResult:
    score = 0
    reasons: list[str] = []

    # 1. Amount-based risk (log-ish banding)
    if txn.amount > 200_000:
        score += 30
        reasons.append("high transaction amount")
    elif txn.amount > 50_000:
        score += 15
        reasons.append("elevated transaction amount")

    # 2. New / unrecognized device
    known = KNOWN_DEVICES.get(txn.user_id, set())
    if txn.device_id not in known:
        score += 25
        reasons.append("new device")

    # 3. Odd-hour activity
    if txn.local_hour in (1, 2, 3, 4):
        score += 15
        reasons.append("odd hour")

    # 4. Velocity
    if txn.txns_last_10_min >= 6:
        score += 25
        reasons.append("high velocity")
    elif txn.txns_last_10_min >= 3:
        score += 10
        reasons.append("moderate velocity")

    # 5. Geography
    if txn.country_code.upper() in HIGH_RISK_COUNTRIES:
        score += 20
        reasons.append("flagged country")

    score = min(score, 100)

    if score >= 80:
        level, action = "critical", "hold transaction, ask for OTP + re-verify device"
    elif score >= 55:
        level, action = "high", "Request OTP + device re-verification before release"
    elif score >= 30:
        level, action = "medium", "Allow, flag for async review"
    else:
        level, action = "low", "Allow"

    if not reasons:
        reasons.append("No anomalies detected against known behavioral profile")

    # remember device for next time ONLY IF transaction is low risk (simulates enrollment)
    if level == "low":
        KNOWN_DEVICES.setdefault(txn.user_id, set()).add(txn.device_id)

    result = RiskResult(
        risk_score=score,
        risk_level=level,
        reasons=reasons,
        recommended_action=action,
        evaluated_at=datetime.utcnow().isoformat() + "Z",
    )

    if score >= 55:
        ALERTS.insert(
            0,
            {
                "id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                "user_id": txn.user_id,
                "channel": txn.channel,
                "amount": txn.amount,
                "risk_score": score,
                "reason": reasons[0],
                "status": "open",
                "timestamp": result.evaluated_at,
            },
        )
    return result


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "TrustFabric API", "time": datetime.utcnow().isoformat() + "Z"}


@app.post("/api/score-transaction", response_model=RiskResult)
def api_score_transaction(txn: TransactionIn):
    return score_transaction(txn)


@app.post("/api/identity/issue")
def api_identity_issue(payload: IdentityIssueIn):
    """Simulates issuing a W3C-style Decentralized Identifier + Verifiable Credential."""
    did = f"did:trustfabric:idbi:{uuid.uuid4().hex[:16]}"
    raw = f"{payload.full_name}|{payload.user_id}|{payload.aadhaar_last4}|{time.time()}"
    credential_hash = hashlib.sha256(raw.encode()).hexdigest()
    record = {
        "did": did,
        "user_id": payload.user_id,
        "full_name": payload.full_name,
        "credential_hash": credential_hash,
        "issued_at": datetime.utcnow().isoformat() + "Z",
        "issuer": "IDBI Bank Trust Anchor",
        "status": "active",
    }
    IDENTITY_STORE[did] = record
    return record


@app.post("/api/identity/verify")
def api_identity_verify(payload: IdentityVerifyIn):
    record = IDENTITY_STORE.get(payload.did)
    if not record:
        raise HTTPException(status_code=404, detail="DID not found in trust registry")
    valid = record["credential_hash"] == payload.credential_hash and record["status"] == "active"
    return {
        "did": payload.did,
        "valid": valid,
        "checked_at": datetime.utcnow().isoformat() + "Z",
        "issuer": record["issuer"] if valid else None,
    }


@app.get("/api/alerts")
def api_alerts(limit: int = 25):
    return {"count": len(ALERTS), "alerts": ALERTS[:limit]}


@app.get("/api/dashboard/stats")
def api_dashboard_stats():
    total = len(ALERTS) or 1
    confirmed = sum(1 for a in ALERTS if a["status"] == "confirmed_fraud")
    open_count = sum(1 for a in ALERTS if a["status"] == "open")
    avg_risk = round(sum(a["risk_score"] for a in ALERTS) / total, 1)
    by_channel: dict[str, int] = {}
    for a in ALERTS:
        by_channel[a["channel"]] = by_channel.get(a["channel"], 0) + 1
    trend = [
        {"hour": f"{h:02d}:00", "score": random.randint(20, 90)} for h in range(24)
    ]
    return {
        "total_alerts": len(ALERTS),
        "open_alerts": open_count,
        "confirmed_fraud": confirmed,
        "avg_risk_score": avg_risk,
        "by_channel": by_channel,
        "risk_trend_24h": trend,
        "identities_issued": len(IDENTITY_STORE),
    }

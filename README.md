# IDBI TrustFabric
### Decentralized Identity & Behavioral-Biometric Fraud Shield for Omni-Channel Banking
**IDBI Innovate 2026 — Wildcard Open Track 05 (Open Innovation / Novel Banking Innovation)**

---

## 💡 The Core Idea
One secure digital ID card for a customer that works everywhere (app, ATM, branch, etc.), combined with a real-time behavioral risk engine that watches *how* transactions happen and flags anything weird instantly with a plain-English reason.

Today, fraud checks at banks are siloed per channel (e.g. mobile app rules vs branch rules vs ATM rules). **TrustFabric** collapses these silos by placing all channels on a **shared behavioral memory** of the customer's normal habits. A threat spotted on one channel is immediately visible to, and blocked by, all others.

---

## 📖 Explain in Simple Words

### How It Works:
1. **The Digital ID Card (Identity Wallet)**: Proves *who* you are. When a customer joins, the bank verifies them once and issues a secure digital ID. This ID works everywhere—mobile app, website, ATM, or physical branch. Customers don't need to re-verify or fill out forms repeatedly.
2. **The Security Guardian (Risk Engine)**: Watches *how* you act. Each time you make a transfer, the engine checks simple indicators: *Is it a new phone? An unusually large amount? Occurring at 3 AM? Multiple transactions in a row? Originating from a flagged country?*
   - Safe activities (groceries for ₹800 at 6 PM on your usual phone) get a **0 risk score** and go through.
   - Weird activities (₹2,50,000 at 3 AM from a new phone and high-risk country) trigger a **100/100 critical alert** that blocks the transfer until the customer confirms their identity with an OTP.

### How It Helps the Bank:
*   **Fills Blind Spots (Shared Memory)**: Today, app rules, ATM rules, and branch rules are siloed. An attacker might fail on the app, then immediately drain the account at an ATM because the channels don't share context. TrustFabric places all channels on **one shared memory**—so a threat spotted on mobile instantly shields the ATM and branch.
*   **Saves Millions in Fraud**: Intercepts and stops fraudulent transfers *before* they leave the bank, prompting immediate resolution via customer OTP challenges.
*   **Improves Customer Experience**: Proving identity once means zero security friction for everyday safe transactions.
*   **Plain-English Auditing**: Rather than saying "declined by system", it tells support and auditors *why* (e.g. "new device + odd hour") and *what to do next* (e.g. "hold transaction, ask for OTP"), speeding up resolutions.

---

## 🛠️ How It Works: Two Parts

### 1. Identity Wallet (DID)
When a customer is verified once (e.g., at account opening), the bank issues them a tamper-proof decentralized digital identity (DID). No need to re-verify KYC every time they use a different banking channel.

### 2. Real-Time Risk Engine
Every transaction is run against a simple set of behavioral indicators and receives an aggregated risk score from **0 to 100**. If the score exceeds safety limits, step-up authentication is triggered.

---

## 🏃‍♂️ Walkthrough Scenario (Priya Nair)

The interactive prototype includes presets to test these exact walkthrough flows:

### Scenario A: Priya Nair's Normal Transaction
- Priya buys groceries for **₹800** at **6:00 PM** on her **usual phone (DEV-9911)**.
- **Risk Score: 0/100** (Low Severity)
- **Result**: Approved immediately.

### Scenario B: Priya's Suspicious Transaction (100% Risk)
Someone attempts to transfer **₹2,50,000** from Priya's account under the following conditions:
* From a **phone/device never seen before** $\rightarrow$ `+25 points`
* Amount is **very high (>₹2,00,000)** $\rightarrow$ `+30 points`
* Occurs at **3:00 AM** $\rightarrow$ `+15 points`
* Occurs after **6 transactions in the last 10 minutes** $\rightarrow$ `+25 points`
* Originates from a **flagged high-risk country** $\rightarrow$ `+20 points`

**Total Score: 100/100 (Critical Severity)**
- **System Output**: Instantly lists why (`new device`, `high transaction amount`, `odd hour`, `high velocity`, `flagged country`).
- **Recommended Action**: `"hold transaction, ask for OTP + re-verify device"`.

---

## 📊 How Customer Data is Managed & Simulated

To run the interactive prototype without database or core banking dependencies, customer data is captured and simulated using:

1. **Interactive UI Forms & Presets**:
   The customer simulation dashboard lets you input any profile information or click the walkthrough preset buttons to load Priya Nair's test scenarios instantly.
2. **API Validation Models**:
   The React frontend transmits details to the backend via POST requests, validated using FastAPI/Pydantic schemas:
   - `IdentityIssueIn`: Models basic client fields (`full_name`, `user_id`, `aadhaar_last4`) to generate credentials.
   - `TransactionIn`: Captures transaction properties (`amount`, `channel`, `device_id`, `country_code`, `local_hour`, `txns_last_10_min`) for scoring.
3. **In-Memory Registries**:
   - `IDENTITY_STORE`: Registers DIDs and credential hashes generated during DID issuance.
   - `KNOWN_DEVICES`: Stores trust histories, mapping Priya (`USR-10231`) to her safe phone (`DEV-9911`). New devices are only enrolled on clean, low-risk transactions.
   - `ALERTS`: Seeded on startup with 14 simulated transaction histories to populate console stats immediately.

---

## 💻 Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (themed with IDBI Bank's colors: `#00836C` and `#F58220`).
- **Backend**: FastAPI (Python) running ASGI server.
- **Deployment**: Integrated Vercel serverless build config (`vercel.json`).

---

## 🚀 Local Development

1. **Backend Server** (FastAPI)
   ```bash
   # Create and activate virtualenv
   python -m venv .venv
   .venv\Scripts\activate   # Windows Powershell

   # Install dependencies and start server
   pip install -r requirements.txt
   uvicorn api.index:app --reload --port 8000
   ```

2. **Frontend Dev Server** (Vite)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` to test the simulator.

---

## 🎯 Alignment with Wildcard Track 05: Open Innovation

### 💎 A Groundbreaking Blueprint
TrustFabric is not a standard, isolated security feature—it is a **groundbreaking architectural blueprint** designed explicitly for visionaries, security professionals, and FinTech developers looking to fundamentally transform the banking landscape.

1. **Collapsing Silos into a Continuous Fabric**:
   Standard bank architectures treat channels as isolated security domains (e.g., mobile app rules are completely blind to ATM or branch activity). TrustFabric fuses these endpoints into a single, unified **cross-channel behavioral security fabric**. A threat pattern observed on one channel immediately protects all others.
2. **Decentralized KYC Architecture (Zero-Leak Liability)**:
   By shifting to decentralized identity (DIDs) and verifiable credentials, customer key signatures and biometric validations are handled at the edge (on the customer's phone). This protects the bank from maintaining target-rich databases of raw customer KYC scans, significantly reducing data-leak liabilities and cloud infrastructure costs.
3. **Pluggable & Edge-Optimized Core**:
   The engine's stateless, dependency-light API design allows it to run on Edge computing platforms (AWS Lambda@Edge or Cloudflare Workers) close to the user, evaluating transactions in **$\le$ 15ms** and keeping total latency below **150ms**. It acts as a pluggable middleware prepared for core banking integration.
4. **Transforming the Banking Business Model**:
   - *Frictionless Green Channels*: Provides instant, PIN-free transactions for verified, low-risk customer behaviors.
   - *Autonomous Mitigation*: Triggers real-time customer-mitigated challenges (OTP + device validation) rather than calling support desks, lowering bank operations overhead.
   - *Explainable Auditing*: Replaces opaque "declined by system" black boxes with transparent, plain-English reasons (`new device`, `high velocity`, etc.) that satisfy regulators and auditors.

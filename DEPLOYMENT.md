# IDBI TrustFabric Deployment Guide

This document describes how to deploy the **IDBI TrustFabric** project (React frontend + FastAPI backend) to Vercel.

---

## 🏗️ Architecture Overview

The repository is structured as a unified monorepo:
*   **`frontend/`**: Contains the React + TypeScript app bundled using Vite.
*   **`api/`**: Contains the FastAPI backend written in Python (`api/index.py`).
*   **`vercel.json`**: Instructs Vercel how to build the frontend, deploy the Python serverless function, and route traffic:
    *   `/api/*` routes are handled by the serverless function `api/index.py`.
    *   All other routes are rewritten to `/index.html` to support React client-side routing (avoiding 404 errors on refreshes).

---

## 🚀 Step-by-Step Vercel Deployment

Deploying the prototype takes less than 3 minutes:

### Step 1: Push Code to GitHub
Ensure all your local changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure IDBI branding and vercel deployments"
git push origin main
```

### Step 2: Import Project in Vercel
1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" $\rightarrow$ "Project"**.
2.  Import your GitHub repository containing the TrustFabric project.

### Step 3: Configure Settings
Vercel reads the root `vercel.json` file automatically, so it will pre-configure most of the settings. Ensure the following match:
*   **Framework Preset**: Other / None (Vercel will override this using the custom build command).
*   **Build Command**: `cd frontend && npm install && npm run build` (Pre-configured in `vercel.json`).
*   **Output Directory**: `frontend/dist` (Pre-configured in `vercel.json`).
*   **Root Directory**: Leave blank (set to the repository root `./`).

### Step 4: Click Deploy!
Click **"Deploy"**. Vercel will:
1.  Run the build command, install npm dependencies, and compile the React app.
2.  Deploy `api/index.py` as a Serverless Python Function.
3.  Generate your live deployment URL (e.g. `https://trustfabric.vercel.app`).

---

## 🛠️ Troubleshooting & Tweaks

### 🐍 Python Runtime Adjustments
By default, the serverless functions use Python 3.12 (as specified in `vercel.json` $\rightarrow$ `functions` $\rightarrow$ `api/index.py` $\rightarrow$ `runtime`). 

If your Vercel account does not support python 3.12 or fails during backend compilation, open [vercel.json](vercel.json) and change the runtime value to an older supported version:
```json
  "functions": {
    "api/index.py": {
      "runtime": "python3.10"
    }
  }
```

### 🗄️ Database & Environment Variables (For Production)
This demo uses a fast, in-memory store (`IDENTITY_STORE` and `ALERTS`) which resets whenever the serverless function goes cold. 

To make this production-ready, you would plug in a database (like Supabase PostgreSQL or Vercel KV Redis). You can configure your database URL in the **Vercel Dashboard $\rightarrow$ Settings $\rightarrow$ Environment Variables**:
1.  Add `DATABASE_URL` (e.g. `postgresql://...`).
2.  Access it in [api/index.py](api/index.py) using Python's `os.getenv("DATABASE_URL")`.

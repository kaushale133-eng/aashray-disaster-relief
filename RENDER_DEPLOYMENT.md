# 🚀 Deploying AASHRAY to Render

This project is fully structured and pre-configured for one-click deployment to **[Render.com](https://render.com/)**.

You can deploy AASHRAY using either **Static Site (Recommended)** or **Web Service (Node.js)**. Both configurations are pre-wired.

---

## 🌟 Option 1: Static Site (Recommended — 100% Free & Fastest)

Render Static Sites are hosted on Render's global CDN, have zero spin-down/sleep time, and are 100% free.

### Method A: Automatic Deployment using `render.yaml` (Blueprint)
Render automatically detects the [`render.yaml`](./render.yaml) file in the root of the repository:
1. Push your repository to **GitHub** or **GitLab**.
2. In your Render Dashboard, click **New +** ➔ **Blueprint**.
3. Select your repository.
4. Render will read `render.yaml`, configure the build command (`npm run build`), publish directory (`dist`), and SPA routes automatically.
5. Click **Apply**. Your site is live!

---

### Method B: Manual Static Site Setup on Render
If setting up manually in the Render dashboard:
1. Click **New +** ➔ **Static Site**.
2. Connect your Git repository.
3. Configure the following fields:
   - **Name:** `aashray-disaster-relief` (or your choice)
   - **Branch:** `main`
   - **Root Directory:** (leave blank or `./`)
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Under **Redirects/Rewrites**:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
5. Click **Create Static Site**.

---

## ⚡ Option 2: Web Service (Node.js)

If you prefer to deploy as a Node.js Web Service:
1. Click **New +** ➔ **Web Service**.
2. Connect your Git repository.
3. Configure:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Render will inject `PORT`, and the included [`server.js`](./server.js) will start serving the production application on `0.0.0.0:$PORT`.

---

## 📁 Repository Structure Overview

```text
├── index.html              # Vite entrypoint (SPA Shell)
├── vite.config.js          # Vite server, preview, and build configuration
├── render.yaml             # Render Blueprint infrastructure-as-code
├── server.js               # Production Node.js HTTP server for Render Web Service
├── package.json            # Node scripts (dev, build, preview, start, test)
├── .gitignore              # Ignores node_modules, dist, .env, and temp files
│
├── public/                 # Static assets copied directly to dist
│   └── favicon.svg         # Platform emblem favicon
│
├── src/                    # Source code
│   ├── main.js             # App router and lifecycle bootstrap
│   ├── components/         # Modular UI views
│   │   ├── dashboard.js    # Operational KPIs, overview & quick actions
│   │   ├── camps.js        # Relief camp management & camp cards
│   │   ├── mapView.js      # Leaflet interactive map with shortage markers
│   │   ├── inventory.js    # Stock levels, categories & restock modal
│   │   ├── requests.js     # Emergency help requests & intake form
│   │   ├── allocation.js   # Stock allocation workbench & limit validator
│   │   ├── analytics.js    # Demand trends & supply charts
│   │   └── settings.js     # Audit log, reset data & role switcher
│   ├── data/
│   │   └── initialData.js  # Pre-seeded test data (camps, inventory, requests)
│   ├── services/
│   │   ├── allocationEngine.js  # Validation logic & deficit calculation
│   │   ├── priorityEngine.js    # Urgency scoring algorithm
│   │   └── storage.js           # Local storage state persistence
│   └── styles/
│       └── main.css        # Bespoke tactical dark theme CSS
│
└── tests/
    └── verify_acceptance.js # Acceptance criteria automated verification suite
```

---

## 🧪 Local Testing Before Deploying

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview
# or
npm start

# 5. Run automated acceptance criteria test
npm test
```

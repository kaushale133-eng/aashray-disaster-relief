# AASHRAY | Disaster Relief Coordination Platform
> **DisplaceOS Implementation — VIBEATHON 2026**

A practical, demonstrable disaster-relief coordination platform engineered to connect rescue teams, government coordinators, and relief camp managers. It provides an operational, shared view of resource requirements, camp supplies, stock allocation with strict validation, and delivery progress tracking.

---

## ⚡ Quick Start & Run Commands

Ensure **Node.js** (v18+) is installed. In PowerShell on Windows:

```powershell
# 1. Install dependencies
npm.cmd install

# 2. Run automated acceptance test suite (24 criteria tests)
node tests/verify_acceptance.js

# 3. Start development server
npm.cmd run dev
```

Open your browser to:
👉 **`http://localhost:5173/`**

To produce an optimized production bundle:
```powershell
npm.cmd run build
npm.cmd run preview
# or run the production server:
npm.cmd start
```

---

## 🌐 Deploy to Render

AASHRAY is ready for deployment on **Render**:
- **Static Site (Recommended):** Build Command: `npm run build`, Publish Directory: `dist`
- **Render Blueprint:** Automatically deploys using [`render.yaml`](./render.yaml).
- See detailed instructions in **[`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md)**.

---

## 🎯 Core Features & Acceptance Verification

| Feature | Requirement / Acceptance Criteria | Status |
| :--- | :--- | :---: |
| **Tactical Dashboard** | Displays starting metrics: **4 camps**, **8 requests**, **5 open requests**, **6 low-stock records**. Status breakdown: Pending (3), Approved (1), In Progress (1), Delivered (2), Rejected (1). All counts dynamically recalculate. | ✅ Verified |
| **Relief Camp Management** | Add, view, edit, search, and delete camp records with validation error feedback. Initial camps: Bhimtal (`C-01`), Haldwani (`C-02`), Rishikesh (`C-03`), Haridwar (`C-04`). | ✅ Verified |
| **Interactive Camp Map** | Dark-mode Leaflet map centered on Uttarakhand. Interactive pulsing markers showing camp location, resource breakdown, and critical shortage alerts. | ✅ Verified |
| **Resource Inventory** | Tracks food packets, drinking water, medicine kits, and blankets. Low-stock (< limit) and critical-stock warning badges. Inbound stock restock modal. | ✅ Verified |
| **Emergency Help Requests** | Submit requests with camp, supply type, quantity, urgency priority (Critical, High, Normal), and description. Search and multi-filter table. | ✅ Verified |
| **Stock Allocation Workbench** | **Stock limit validation**: Coordinator cannot allocate more than available inventory. Clear insufficient-stock warning on deficits (tested with Haridwar Request `R-008`). | ✅ Verified |
| **Request & Delivery Pipeline** | Workflow pipeline: Pending ➔ Approved ➔ Dispatched (In Progress) ➔ Delivered. Activity audit log with timestamps. | ✅ Verified |
| **Priority Recommendation Engine** | Transparent urgency scoring considering severity, request age, and available warehouse stock. | ✅ Verified |
| **Dark Mode Design System** | Bespoke tactical dark aesthetic (`#080c14`, `#0f172a`, `#06b6d4` cyan/teal accents), responsive for laptop and mobile viewports. | ✅ Verified |

---

## 🧪 Verified Test Scenarios

Run the automated test suite anytime with:
```powershell
node tests/verify_acceptance.js
```

### Scenario 1: Haridwar Request `R-008` (Insufficient Stock Test)
- **Condition**: Request `R-008` demands 12 Blankets at Haridwar. Camp inventory only has 8 Blankets.
- **Result**: The system blocks the allocation of 12 with a prominent `INSUFFICIENT_STOCK` warning (Deficit: 4). Allows partial allocation of up to 8.
- **Execution**: Allocating 8 blankets decrements Haridwar stock to 0, sets request allocated to 8, and updates request status to `In Progress`.

### Scenario 2: Dynamic Dashboard Recomputation
- After allocation, **In Progress** requests count increases to 2, **Pending** decreases to 2, and low-stock alerts update automatically.

---

## 👥 Target Users & Role Switcher
Use the top-right **Active Role** dropdown to test workflows:
1. **Administrator / Coordinator**: Full dashboard, allocation workbench, and status overrides.
2. **Relief Camp Manager**: Camp stock inspection and rapid request submission.
3. **Rescue / Delivery Team**: Field delivery progression and sign-off.
4. **Public / Reviewer**: Transparency overview and data audit.

---

## 🛡️ Data Truthfulness & Demonstration Disclosures
- **Fictional Sample Data**: All 4 camps, 16 inventory items, and 8 requests are demonstration records derived from the VIBEATHON specification.
- **Storage**: Client-side local storage (`localStorage`) is used for demonstration persistence with a 1-click **Reset Demo State** button.
- **No Claimed Live Integrations**: This prototype does not claim live satellite GPS feeds, live NDRF API links, or live civil SMS broadcasts.
- **Environment Note**: In isolated sandbox environments without external Playwright CDN access, interactive browser automation subagent may encounter driver download restrictions; however, the web application runs completely offline and all tests execute via the CLI test suite.

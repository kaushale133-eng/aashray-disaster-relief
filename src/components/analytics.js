// AASHRAY Analytics & Shortage Trends Component
// Renders data-driven charts using SVG and HTML5 Canvas for zero external dependencies.
import { storage } from '../services/storage.js';

export function renderAnalytics(container, navigateTo) {
  const metrics = storage.getDashboardMetrics();
  const inventory = storage.getInventory();
  const requests = storage.getRequests();
  const camps = storage.getCamps();

  // Aggregate by Category
  const categoryTotals = {};
  inventory.forEach(item => {
    const cat = item.category || 'General';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(item.quantity);
  });

  // Aggregate by Camp
  const campStockStatus = camps.map(camp => {
    const items = inventory.filter(i => i.campId === camp.id || i.campName.toLowerCase() === camp.location.toLowerCase());
    const totalItems = items.length;
    const lowCount = items.filter(i => Number(i.quantity) < Number(i.lowStockLimit)).length;
    const healthyCount = totalItems - lowCount;
    return {
      campName: camp.location || camp.name,
      totalItems,
      lowCount,
      healthyCount,
      percentHealthy: totalItems > 0 ? Math.round((healthyCount / totalItems) * 100) : 100
    };
  });

  // Priority Breakdown
  const priorityCounts = { Critical: 0, High: 0, Normal: 0 };
  requests.forEach(r => {
    if (priorityCounts[r.priority] !== undefined) priorityCounts[r.priority]++;
  });

  container.innerHTML = `
    <div class="view-header">
      <div>
        <div class="view-header-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Disaster Logistics Analytics & Trends
        </div>
        <div class="view-header-subtitle">
          Data-driven operational intelligence, shortage distributions, and supply health metrics across all relief camps.
        </div>
      </div>
      <div class="view-actions">
        <button id="analytics-export-btn" class="btn btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Report
        </button>
      </div>
    </div>

    <!-- Analytics Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px; margin-bottom: 24px;">
      
      <!-- Chart 1: Request Status Pipeline -->
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">Request Status Pipeline</div>
          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${requests.length} requests</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
          ${Object.entries(metrics.statusCounts).map(([status, count]) => {
            const pct = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
            let barColor = 'var(--teal-500)';
            if (status === 'Pending') barColor = '#fbbf24';
            if (status === 'Approved') barColor = '#818cf8';
            if (status === 'In Progress') barColor = '#22d3ee';
            if (status === 'Delivered') barColor = '#34d399';
            if (status === 'Rejected') barColor = '#fb7185';

            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: #cbd5e1;">${status}</span>
                  <span style="color: var(--text-secondary); font-family: var(--font-mono);">${count} (${pct}%)</span>
                </div>
                <div style="height: 8px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${pct}%; background: ${barColor}; border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Chart 2: Camp Stock Health & Shortage Comparison -->
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">Camp Stock Health Index</div>
          <span style="font-size: 11px; color: var(--text-muted);">% items above threshold</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
          ${campStockStatus.map(camp => {
            let color = 'var(--emerald-500)';
            if (camp.percentHealthy < 50) color = 'var(--rose-500)';
            else if (camp.percentHealthy < 80) color = 'var(--amber-500)';

            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="font-weight: 600; color: var(--text-primary);">${camp.campName}</span>
                  <span style="color: ${color}; font-weight: 700; font-family: var(--font-mono);">${camp.percentHealthy}% Healthy (${camp.lowCount} low)</span>
                </div>
                <div style="height: 8px; background: var(--bg-surface-elevated); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${camp.percentHealthy}%; background: ${color}; border-radius: var(--radius-full);"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Chart 3: Supplies by Category -->
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">Inventory Quantities by Category</div>
          <span style="font-size: 11px; color: var(--text-muted);">Total Units In Stock</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
          ${Object.entries(categoryTotals).map(([cat, total]) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <span style="font-weight: 600; color: var(--text-primary);">${cat}</span>
              <span style="font-weight: 700; font-size: 14px; color: var(--teal-400); font-family: var(--font-mono);">${total} Units</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Chart 4: Urgency Priority Distribution -->
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">Request Urgency Demographics</div>
          <span style="font-size: 11px; color: var(--text-muted);">Severity Weighting</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 14px;">
          <div style="background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.3); border-radius: var(--radius-md); padding: 14px; text-align: center;">
            <div style="color: var(--rose-400); font-weight: 700; font-size: 11px; text-transform: uppercase;">Critical</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); margin: 4px 0;">${priorityCounts.Critical}</div>
            <div style="font-size: 10px; color: var(--text-muted);">Immediate triage</div>
          </div>
          <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); border-radius: var(--radius-md); padding: 14px; text-align: center;">
            <div style="color: var(--amber-400); font-weight: 700; font-size: 11px; text-transform: uppercase;">High</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); margin: 4px 0;">${priorityCounts.High}</div>
            <div style="font-size: 10px; color: var(--text-muted);">&lt; 8h target</div>
          </div>
          <div style="background: rgba(148,163,184,0.08); border: 1px solid rgba(148,163,184,0.3); border-radius: var(--radius-md); padding: 14px; text-align: center;">
            <div style="color: var(--text-secondary); font-weight: 700; font-size: 11px; text-transform: uppercase;">Normal</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); margin: 4px 0;">${priorityCounts.Normal}</div>
            <div style="font-size: 10px; color: var(--text-muted);">Scheduled run</div>
          </div>
        </div>
      </div>

    </div>
  `;

  container.querySelector('#analytics-export-btn')?.addEventListener('click', () => {
    const jsonStr = storage.exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aashray_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

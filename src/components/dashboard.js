// AASHRAY Dashboard View Component
import { storage } from '../services/storage.js';
import { PriorityEngine } from '../services/priorityEngine.js';

export function renderDashboard(container, navigateTo) {
  const metrics = storage.getDashboardMetrics();
  const recommendations = PriorityEngine.getRecommendations();
  const topRecommendation = recommendations.length > 0 ? recommendations[0] : null;
  const activeRole = storage.getActiveRole();

  let roleBannerHtml = '';
  if (activeRole === 'public') {
    roleBannerHtml = `
      <div class="role-perspective-banner public">
        <div>🌐 <strong>Citizen Public Transparency Portal:</strong> You are viewing live operational disaster response data in public transparency mode. Supply dispatch and database modifications require State Coordinator authorization.</div>
        <span class="status-pill status-delivered" style="font-size: 10px;">Public Access</span>
      </div>
    `;
  } else if (activeRole === 'manager') {
    roleBannerHtml = `
      <div class="role-perspective-banner manager">
        <div>🏕️ <strong>Relief Camp Manager Perspective:</strong> Rapid response mode. Monitor camp supplies, track urgent shortages, and submit resource help requests.</div>
        <span class="status-pill status-in-progress" style="font-size: 10px;">Camp Manager</span>
      </div>
    `;
  } else if (activeRole === 'delivery') {
    roleBannerHtml = `
      <div class="role-perspective-banner delivery">
        <div>🚚 <strong>Rescue &amp; Delivery Team Perspective:</strong> Field logistics overview. Proceed to Allocation &amp; Deliveries to track and advance dispatches.</div>
        <span class="status-pill status-pending" style="font-size: 10px;">Field Logistics</span>
      </div>
    `;
  }

  container.innerHTML = `
    ${roleBannerHtml}

    <!-- Page Header -->
    <div class="view-header">
      <div>
        <div class="view-header-title">
          <span>Disaster Relief Command Dashboard</span>
          <span class="status-pill status-in-progress">
            <span class="status-dot"></span> Active Operations
          </span>
        </div>
        <div class="view-header-subtitle">
          Real-time coordination across Uttarakhand relief camps. Counts dynamically derived from application data.
        </div>
      </div>
      <div class="view-actions">
        <button id="quick-add-request-btn" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Submit Request
        </button>
        <button id="quick-allocate-btn" class="btn btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path><path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"></path><circle cx="8" cy="12" r="2"></circle></svg>
          Allocate Resources
        </button>
      </div>
    </div>

    <!-- Starting Metrics Grid (PDF 2 Section 5) -->
    <div class="metrics-grid">
      <div class="metric-card accent-camps" id="metric-camps-card" style="cursor: pointer;">
        <div class="metric-card-header">
          <span class="metric-title">Total Relief Camps</span>
          <div class="metric-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        </div>
        <div class="metric-value-wrap">
          <span class="metric-value">${metrics.totalCamps}</span>
          <span class="metric-badge healthy">Active</span>
        </div>
        <div class="metric-footer">Bhimtal, Haldwani, Rishikesh, Haridwar</div>
      </div>

      <div class="metric-card accent-requests" id="metric-requests-card" style="cursor: pointer;">
        <div class="metric-card-header">
          <span class="metric-title">Total Requests</span>
          <div class="metric-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
        </div>
        <div class="metric-value-wrap">
          <span class="metric-value">${metrics.totalRequests}</span>
          <span class="metric-badge info">${metrics.statusCounts['Delivered'] || 0} Fulfilled</span>
        </div>
        <div class="metric-footer">Logged since disaster onset</div>
      </div>

      <div class="metric-card accent-open" id="metric-open-card" style="cursor: pointer;">
        <div class="metric-card-header">
          <span class="metric-title">Open Requests</span>
          <div class="metric-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>
        <div class="metric-value-wrap">
          <span class="metric-value">${metrics.openRequests}</span>
          <span class="metric-badge warning">Action Required</span>
        </div>
        <div class="metric-footer">Pending (${metrics.statusCounts['Pending'] || 0}), Approved (${metrics.statusCounts['Approved'] || 0}), In Progress (${metrics.statusCounts['In Progress'] || 0})</div>
      </div>

      <div class="metric-card accent-shortage" id="metric-shortage-card" style="cursor: pointer;">
        <div class="metric-card-header">
          <span class="metric-title">Low-Stock Records</span>
          <div class="metric-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
        </div>
        <div class="metric-value-wrap">
          <span class="metric-value">${metrics.lowStockCount}</span>
          <span class="metric-badge critical">${metrics.criticalStockCount} Critical</span>
        </div>
        <div class="metric-footer">Items below configured warning limit</div>
      </div>
    </div>

    <!-- Transparent Priority Recommendation Callout (PDF Feature 5) -->
    ${topRecommendation ? `
      <div class="alert-box alert-warning" style="align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px;">⚡</div>
          <div>
            <strong>Priority Recommendation Engine:</strong>
            Request <strong>#${topRecommendation.request.id}</strong> (${topRecommendation.request.campName} - ${topRecommendation.request.requiredSupply})
            has the highest computed urgency score (${topRecommendation.score} pts).
            <div style="display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
              ${topRecommendation.reasons.map(r => `
                <span class="priority-pill priority-${r.type === 'danger' ? 'critical' : r.type === 'warning' ? 'high' : 'normal'}" style="font-size: 10px;">
                  ${r.label}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
        <button id="review-top-rec-btn" class="btn btn-warning btn-sm" data-req-id="${topRecommendation.request.id}" style="margin-top: 6px;">
          Review Request #${topRecommendation.request.id}
        </button>
      </div>
    ` : ''}

    <!-- Quick Status Breakdown Grid -->
    <div class="status-breakdown-grid">
      <div class="card-panel" style="padding: 12px 16px; margin-bottom: 0;">
        <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Pending Review</div>
        <div class="status-counter-pending" style="font-size: 22px; font-weight: 700; font-family: var(--font-mono);">${metrics.statusCounts['Pending'] || 0}</div>
      </div>
      <div class="card-panel" style="padding: 12px 16px; margin-bottom: 0;">
        <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Approved</div>
        <div class="status-counter-approved" style="font-size: 22px; font-weight: 700; font-family: var(--font-mono);">${metrics.statusCounts['Approved'] || 0}</div>
      </div>
      <div class="card-panel" style="padding: 12px 16px; margin-bottom: 0;">
        <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">In Progress</div>
        <div class="status-counter-inprogress" style="font-size: 22px; font-weight: 700; font-family: var(--font-mono);">${metrics.statusCounts['In Progress'] || 0}</div>
      </div>
      <div class="card-panel" style="padding: 12px 16px; margin-bottom: 0;">
        <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Delivered</div>
        <div class="status-counter-delivered" style="font-size: 22px; font-weight: 700; font-family: var(--font-mono);">${metrics.statusCounts['Delivered'] || 0}</div>
      </div>
      <div class="card-panel" style="padding: 12px 16px; margin-bottom: 0;">
        <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Rejected</div>
        <div class="status-counter-rejected" style="font-size: 22px; font-weight: 700; font-family: var(--font-mono);">${metrics.statusCounts['Rejected'] || 0}</div>
      </div>
    </div>

    <!-- Two Column Layout: Recent Requests & Low Stock Alerts -->
    <div class="dashboard-split-layout">
      
      <!-- Recent Requests -->
      <div class="card-panel" style="margin-bottom: 0;">
        <div class="card-panel-header">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Recent Emergency Requests
          </div>
          <button id="view-all-requests-btn" class="btn btn-secondary btn-sm">View All (${metrics.totalRequests})</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Camp</th>
                <th>Resource</th>
                <th>Quantity</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.recentRequests.map(r => `
                <tr>
                  <td><strong>${r.id}</strong></td>
                  <td>${r.campName}</td>
                  <td>${r.requiredSupply}</td>
                  <td>${r.quantity} ${r.unit}</td>
                  <td>
                    <span class="priority-pill priority-${r.priority.toLowerCase()}">${r.priority}</span>
                  </td>
                  <td>
                    <span class="status-pill status-${r.status.toLowerCase().replace(/\s+/g, '-')}">
                      <span class="status-dot"></span> ${r.status}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm action-inspect-req" data-id="${r.id}">
                      Manage
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Warnings Callout Panel (PDF Section 5 Rules) -->
      <div class="card-panel" style="margin-bottom: 0;">
        <div class="card-panel-header">
          <div class="card-title" style="color: #f87171;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Active Stock Warnings (${metrics.lowStockCount})
          </div>
          <button id="view-all-inventory-btn" class="btn btn-secondary btn-sm">Manage Stock</button>
        </div>
        <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px;">
          Items where available quantity is strictly below the configured safety threshold:
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${metrics.lowStockItems.length === 0 ? `
            <div style="font-size: 12px; color: var(--emerald-400); padding: 12px;">All camp inventory levels are healthy.</div>
          ` : metrics.lowStockItems.map(item => {
            const isCritical = Number(item.quantity) <= (item.criticalStockLimit || Math.floor(item.lowStockLimit / 2));
            return `
              <div style="background: ${isCritical ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)'}; border: 1px solid ${isCritical ? 'rgba(244, 63, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)'}; padding: 10px 12px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 12.5px; color: var(--text-primary);">
                    ${item.campName} — ${item.resource}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                    Available: <strong style="color: ${isCritical ? 'var(--rose-400)' : 'var(--amber-400)'};">${item.quantity} ${item.unit}</strong> (Limit: ${item.lowStockLimit})
                  </div>
                </div>
                <button class="btn btn-warning btn-sm action-quick-restock" data-id="${item.id}" data-camp="${item.campName}" data-res="${item.resource}">
                  Restock
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;

  // Attach event handlers
  container.querySelector('#metric-camps-card')?.addEventListener('click', () => navigateTo('camps'));
  container.querySelector('#metric-requests-card')?.addEventListener('click', () => navigateTo('requests'));
  container.querySelector('#metric-open-card')?.addEventListener('click', () => navigateTo('requests', { filter: 'open' }));
  container.querySelector('#metric-shortage-card')?.addEventListener('click', () => navigateTo('inventory', { filter: 'low' }));

  container.querySelector('#view-all-requests-btn')?.addEventListener('click', () => navigateTo('requests'));
  container.querySelector('#view-all-inventory-btn')?.addEventListener('click', () => navigateTo('inventory'));
  container.querySelector('#quick-add-request-btn')?.addEventListener('click', () => {
    navigateTo('requests', { openModal: true });
  });
  container.querySelector('#quick-allocate-btn')?.addEventListener('click', () => navigateTo('allocation'));

  container.querySelector('#review-top-rec-btn')?.addEventListener('click', (e) => {
    const reqId = e.currentTarget.getAttribute('data-req-id');
    navigateTo('allocation', { requestId: reqId });
  });

  container.querySelectorAll('.action-inspect-req').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      navigateTo('requests', { inspectRequestId: id });
    });
  });

  container.querySelectorAll('.action-quick-restock').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      navigateTo('inventory', { restockId: id });
    });
  });
}

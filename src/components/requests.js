// AASHRAY Emergency Help Requests Component
import { storage } from '../services/storage.js';
import { RESOURCE_UNITS, RESOURCE_CATEGORIES } from '../data/initialData.js';

export function renderRequests(container, navigateTo, filterParams = {}) {
  const camps = storage.getCamps();
  const requests = storage.getRequests();
  const activeRole = storage.getActiveRole();

  let activeStatusFilter = filterParams.filter === 'open' ? 'OPEN' : (filterParams.status || 'ALL');
  let activePriorityFilter = 'ALL';
  let activeCampFilter = 'ALL';

  // Role perspective banner
  let roleBannerHtml = '';
  if (activeRole === 'public') {
    roleBannerHtml = `
      <div class="role-perspective-banner public">
        <div>🌐 <strong>Public Transparency Portal:</strong> Reviewing active regional emergency requests and dispatch statuses under Uttarakhand SDMA public registry.</div>
        <span class="status-pill status-delivered" style="font-size: 10px;">Citizen Access</span>
      </div>
    `;
  } else if (activeRole === 'manager') {
    roleBannerHtml = `
      <div class="role-perspective-banner manager">
        <div>🏕️ <strong>Relief Camp Commander View:</strong> Rapid intake mode. Log emergency resource requirements for your station and monitor SDMA coordinator approvals.</div>
        <span class="status-pill status-in-progress" style="font-size: 10px;">Camp Commander</span>
      </div>
    `;
  } else if (activeRole === 'delivery') {
    roleBannerHtml = `
      <div class="role-perspective-banner delivery">
        <div>🚚 <strong>Rescue &amp; Delivery Logistics:</strong> Review active fulfillment requests. Open Allocation &amp; Deliveries to update delivery stages.</div>
        <span class="status-pill status-pending" style="font-size: 10px;">Field Logistics</span>
      </div>
    `;
  }

  container.innerHTML = `
    ${roleBannerHtml}

    <div class="view-header">
      <div>
        <div class="view-header-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Emergency Relief Requests
        </div>
        <div class="view-header-subtitle">
          Intake, prioritize, and track camp resource supply demands across all disaster zones.
        </div>
      </div>
      <div class="view-actions">
        <button id="create-request-btn" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Submit Emergency Request
        </button>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="card-panel" style="padding: 16px; margin-bottom: 20px;">
      <div class="toolbar-wrap" style="margin-bottom: 0;">
        <div class="search-input-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="requests-search-input" class="search-input" placeholder="Search by ID, camp, supply, or notes..." />
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <select id="req-status-filter" class="filter-select">
            <option value="ALL" ${activeStatusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="OPEN" ${activeStatusFilter === 'OPEN' ? 'selected' : ''}>⚡ Open Requests (Pending, Approved, In Progress)</option>
            <option value="Pending" ${activeStatusFilter === 'Pending' ? 'selected' : ''}>Pending Review</option>
            <option value="Approved" ${activeStatusFilter === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="In Progress" ${activeStatusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Delivered" ${activeStatusFilter === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Rejected" ${activeStatusFilter === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>

          <select id="req-priority-filter" class="filter-select">
            <option value="ALL">All Priorities</option>
            <option value="Critical">🚨 Critical</option>
            <option value="High">⚠️ High</option>
            <option value="Normal">✓ Normal</option>
          </select>

          <select id="req-camp-filter" class="filter-select">
            <option value="ALL">All Camps (${camps.length})</option>
            ${camps.map(c => `<option value="${c.id}">[${c.id}] ${c.location} (${c.name})</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Requests Table Panel -->
    <div class="card-panel">
      <div class="card-panel-header">
        <div class="card-title">
          <span>Relief Requests Register</span>
          <span class="badge-tag" id="req-count-badge" style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px;">
            ${requests.length} total
          </span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table" id="requests-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Camp / Station</th>
              <th>Required Supply</th>
              <th>Requested Qty</th>
              <th>Allocated</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submission Time</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="requests-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div id="create-request-modal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title">Submit Emergency Resource Request</div>
          <button class="modal-close-btn" id="create-req-close-btn">&times;</button>
        </div>
        <form id="create-req-form" novalidate>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="req-id-display">Request ID</label>
              <input type="text" id="req-id-display" class="form-control" value="${storage.getNextRequestId()}" readonly style="opacity: 0.8; font-family: var(--font-mono); color: var(--teal-400); font-weight: 700;" />
              <div class="form-hint">Auto-generated emergency request sequence ID.</div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="req-camp-select">Relief Camp</label>
              <select id="req-camp-select" class="form-control" required>
                ${camps.map(c => `<option value="${c.id}" data-location="${c.location}">[${c.id}] ${c.name} (${c.location})</option>`).join('')}
              </select>
              <div class="invalid-feedback">Please select a camp.</div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="req-resource-select">Required Supply</label>
              <select id="req-resource-select" class="form-control" required>
                <option value="Food packets">Food packets (Packets)</option>
                <option value="Drinking water">Drinking water (Crates)</option>
                <option value="Medicine kits">Medicine kits (Kits)</option>
                <option value="Blankets">Blankets (Pieces)</option>
                <option value="Tarpaulins">Tarpaulins (Sheets)</option>
                <option value="First Aid kits">First Aid kits (Kits)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label required" for="req-qty-input">Required Quantity</label>
                <input type="number" min="1" id="req-qty-input" class="form-control" placeholder="e.g. 50" required />
                <div class="invalid-feedback" id="req-qty-error">Please specify a positive quantity &gt; 0.</div>
              </div>
              <div class="form-group">
                <label class="form-label required" for="req-unit-display">Unit</label>
                <input type="text" id="req-unit-display" class="form-control" value="Packets" readonly style="opacity: 0.8;" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required" for="req-priority-select">Urgency Priority</label>
              <select id="req-priority-select" class="form-control" required>
                <option value="Critical">🚨 Critical (Immediate life/safety risk)</option>
                <option value="High" selected>⚠️ High (Within 4-8 hours)</option>
                <option value="Normal">✓ Normal (Standard replenishment)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="req-desc-input">Description / Justification</label>
              <textarea id="req-desc-input" class="form-control" rows="3" placeholder="Provide context on why these resources are required and target population..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="create-req-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="create-req-submit-btn">Submit Help Request</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Request Details & Timeline Modal -->
    <div id="request-details-modal" class="modal-overlay">
      <div class="modal-dialog" style="max-width: 640px;">
        <div class="modal-header">
          <div class="modal-title" id="req-details-title">Request Details</div>
          <button class="modal-close-btn" id="req-details-close-btn">&times;</button>
        </div>
        <div class="modal-body" id="req-details-body">
          <!-- Dynamic details & timeline -->
        </div>
        <div class="modal-footer" id="req-details-footer">
          <!-- Quick action buttons -->
        </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div id="status-change-modal" class="modal-overlay">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div class="modal-title">Update Request Status</div>
          <button class="modal-close-btn" id="status-modal-close-btn">&times;</button>
        </div>
        <form id="status-change-form">
          <div class="modal-body">
            <input type="hidden" id="status-change-req-id" />
            <div id="status-change-context" class="alert-box alert-info"></div>

            <div class="form-group">
              <label class="form-label required" for="new-status-select">Target Status</label>
              <select id="new-status-select" class="form-control" required>
                <option value="Pending">Pending (Waiting for review)</option>
                <option value="Approved">Approved (Ready for allocation)</option>
                <option value="In Progress">In Progress (Allocation or delivery underway)</option>
                <option value="Delivered">Delivered (Completed / Signed off)</option>
                <option value="Rejected">Rejected (Declined / Duplicate)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="status-reason-input">Status Update Note / Justification</label>
              <textarea id="status-reason-input" class="form-control" rows="2" placeholder="e.g. Approved by Regional Coordinator; dispatched batch 1..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="status-modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Status Update</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Render Table
  function renderRequestsTable() {
    const tbody = container.querySelector('#requests-table-body');
    const searchVal = container.querySelector('#requests-search-input').value.trim().toLowerCase();

    const filtered = storage.getRequests().filter(req => {
      const matchSearch = !searchVal ||
        req.id.toLowerCase().includes(searchVal) ||
        req.campName.toLowerCase().includes(searchVal) ||
        (req.campId && req.campId.toLowerCase().includes(searchVal)) ||
        req.requiredSupply.toLowerCase().includes(searchVal) ||
        (req.description && req.description.toLowerCase().includes(searchVal));

      let matchStatus = true;
      if (activeStatusFilter === 'OPEN') {
        matchStatus = ['Pending', 'Approved', 'In Progress'].includes(req.status);
      } else if (activeStatusFilter !== 'ALL') {
        matchStatus = req.status === activeStatusFilter;
      }

      const matchPriority = activePriorityFilter === 'ALL' || req.priority === activePriorityFilter;
      const matchCamp = activeCampFilter === 'ALL' || 
                        req.campId === activeCampFilter || 
                        req.campName.toLowerCase() === activeCampFilter.toLowerCase();

      return matchSearch && matchStatus && matchPriority && matchCamp;
    });

    container.querySelector('#req-count-badge').textContent = `${filtered.length} of ${requests.length} requests`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <div class="empty-state-title">No relief requests found</div>
              <div class="empty-state-desc">Try clearing search filters or create a new emergency request.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(req => {
      const allocated = Number(req.allocatedQuantity || 0);
      const total = Number(req.quantity);
      const isFulfilled = allocated >= total;

      const dateStr = req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';

      let actionButtons = `
        <button class="btn btn-secondary btn-sm action-view-details" data-id="${req.id}">
          Details
        </button>
      `;

      if (activeRole === 'coordinator') {
        actionButtons = `
          <button class="btn btn-secondary btn-sm action-view-details" data-id="${req.id}">
            Details
          </button>
          <button class="btn btn-primary btn-sm action-allocate-btn" data-id="${req.id}" title="Allocate Stock">
            Allocate
          </button>
          <button class="btn btn-secondary btn-sm action-change-status" data-id="${req.id}">
            Status
          </button>
        `;
      } else if (activeRole === 'delivery') {
        actionButtons = `
          <button class="btn btn-secondary btn-sm action-view-details" data-id="${req.id}">
            Details
          </button>
          <button class="btn btn-primary btn-sm action-allocate-btn" data-id="${req.id}">
            Track Delivery
          </button>
        `;
      } else if (activeRole === 'manager') {
        actionButtons = `
          <button class="btn btn-secondary btn-sm action-view-details" data-id="${req.id}">
            Details
          </button>
        `;
      }

      return `
        <tr id="req-row-${req.id}">
          <td>
            <strong style="color: var(--teal-400); font-family: var(--font-mono); font-size: 13px;">${req.id}</strong>
          </td>
          <td>
            <strong>${req.campName}</strong>
            <span style="font-size: 10px; color: var(--teal-400); font-family: var(--font-mono); margin-left: 4px;">(${req.campId || ''})</span>
          </td>
          <td><span style="font-weight: 600; color: #fff;">${req.requiredSupply}</span></td>
          <td style="font-family: var(--font-mono);">${req.quantity} ${req.unit}</td>
          <td>
            <span style="font-family: var(--font-mono); color: ${allocated > 0 ? (isFulfilled ? 'var(--emerald-400)' : 'var(--amber-400)') : 'var(--text-muted)'}; font-weight: 600;">
              ${allocated} / ${total}
            </span>
          </td>
          <td>
            <span class="priority-pill priority-${req.priority.toLowerCase()}">${req.priority}</span>
          </td>
          <td>
            <span class="status-pill status-${req.status.toLowerCase().replace(/\s+/g, '-')}">
              <span class="status-dot"></span> ${req.status}
            </span>
          </td>
          <td style="font-size: 11px; color: var(--text-muted);">${dateStr}</td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 6px; justify-content: flex-end;">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Row handlers
    tbody.querySelectorAll('.action-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openDetailsModal(id);
      });
    });

    tbody.querySelectorAll('.action-allocate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        navigateTo('allocation', { requestId: id });
      });
    });

    tbody.querySelectorAll('.action-change-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openStatusChangeModal(id);
      });
    });
  }

  renderRequestsTable();

  // Filter Bindings
  container.querySelector('#requests-search-input').addEventListener('input', renderRequestsTable);
  container.querySelector('#req-status-filter').addEventListener('change', (e) => {
    activeStatusFilter = e.target.value;
    renderRequestsTable();
  });
  container.querySelector('#req-priority-filter').addEventListener('change', (e) => {
    activePriorityFilter = e.target.value;
    renderRequestsTable();
  });
  container.querySelector('#req-camp-filter').addEventListener('change', (e) => {
    activeCampFilter = e.target.value;
    renderRequestsTable();
  });

  // Resource unit auto-sync
  container.querySelector('#req-resource-select').addEventListener('change', (e) => {
    const unit = RESOURCE_UNITS[e.target.value] || 'Units';
    container.querySelector('#req-unit-display').value = unit;
  });

  // Create Request Modal
  const createModal = container.querySelector('#create-request-modal');
  const createForm = container.querySelector('#create-req-form');

  function openCreateModal() {
    container.querySelector('#req-id-display').value = storage.getNextRequestId();
    container.querySelector('#req-qty-input').value = "";
    container.querySelector('#req-desc-input').value = "";
    container.querySelector('#req-qty-input').classList.remove('is-invalid');
    createModal.classList.add('open');
  }

  container.querySelector('#create-request-btn')?.addEventListener('click', openCreateModal);
  container.querySelector('#create-req-close-btn')?.addEventListener('click', () => createModal.classList.remove('open'));
  container.querySelector('#create-req-cancel-btn')?.addEventListener('click', () => createModal.classList.remove('open'));

  createForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#req-id-display').value.trim();
    const campSelect = container.querySelector('#req-camp-select');
    const campId = campSelect.value;
    const selectedCamp = camps.find(c => c.id === campId);
    const campName = selectedCamp ? selectedCamp.location : 'Camp';
    const resource = container.querySelector('#req-resource-select').value;
    const qty = Number(container.querySelector('#req-qty-input').value);
    const unit = container.querySelector('#req-unit-display').value;
    const priority = container.querySelector('#req-priority-select').value;
    const description = container.querySelector('#req-desc-input').value.trim();

    if (isNaN(qty) || qty <= 0) {
      container.querySelector('#req-qty-input').classList.add('is-invalid');
      return;
    }

    const newReq = storage.addRequest({
      id,
      campId,
      campName,
      requiredSupply: resource,
      category: RESOURCE_CATEGORIES[resource] || 'General',
      quantity: qty,
      unit: unit.toLowerCase(),
      priority,
      status: 'Pending',
      description,
      createdBy: activeRole === 'manager' ? 'Relief Camp Manager' : 'Coordinator'
    });

    window.dispatchEvent(new CustomEvent('aashray:toast', {
      detail: { type: 'success', message: `Emergency Request [${newReq.id}] submitted for ${qty} ${unit} at ${campName}.` }
    }));

    createModal.classList.remove('open');
    renderRequestsTable();
  });

  // Details Modal
  const detailsModal = container.querySelector('#request-details-modal');
  function openDetailsModal(id) {
    const req = storage.getRequests().find(r => r.id === id);
    if (!req) return;

    container.querySelector('#req-details-title').innerHTML = `Request [${req.id}] — ${req.campName}`;
    const allocated = Number(req.allocatedQuantity || 0);
    const total = Number(req.quantity);
    const deficit = Math.max(0, total - allocated);

    container.querySelector('#req-details-body').innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md);">
          <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Camp &amp; Resource</div>
          <div style="font-weight: 700; color: #fff; font-size: 13.5px; margin-top: 2px;">${req.campName} (${req.campId || ''})</div>
          <div style="color: var(--teal-400); font-size: 12px;">${req.requiredSupply}</div>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md);">
          <div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Priority &amp; Status</div>
          <div style="margin-top: 4px; display: flex; gap: 6px;">
            <span class="priority-pill priority-${req.priority.toLowerCase()}">${req.priority}</span>
            <span class="status-pill status-${req.status.toLowerCase().replace(/\s+/g, '-')}">${req.status}</span>
          </div>
        </div>
      </div>

      <div class="allocation-card-summary">
        <div class="alloc-stat-row">
          <span class="alloc-stat-label">Total Requested Quantity</span>
          <span class="alloc-stat-value">${req.quantity} ${req.unit}</span>
        </div>
        <div class="alloc-stat-row">
          <span class="alloc-stat-label">Stock Already Allocated</span>
          <span class="alloc-stat-value" style="color: ${allocated > 0 ? 'var(--emerald-400)' : 'var(--text-muted)'};">${allocated} ${req.unit}</span>
        </div>
        <div class="alloc-stat-row">
          <span class="alloc-stat-label">Remaining Unfulfilled Deficit</span>
          <span class="alloc-stat-value" style="color: ${deficit > 0 ? 'var(--rose-400)' : 'var(--emerald-400)'};">${deficit} ${req.unit}</span>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Description / Notes</div>
        <div style="background: var(--bg-input); padding: 10px 12px; border-radius: var(--radius-md); font-size: 12.5px; color: #cbd5e1; margin-top: 4px; border: 1px solid var(--border-subtle);">
          ${req.description || 'No additional justification provided.'}
        </div>
      </div>

      <div>
        <div style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Activity &amp; Audit History</div>
        <div class="timeline-list">
          ${(req.history || []).map(h => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-time">${new Date(h.timestamp).toLocaleString()} &bull; ${h.by || 'System'}</div>
              <div class="timeline-action">${h.action}</div>
              ${h.note ? `<div class="timeline-note">${h.note}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const canAllocate = activeRole === 'coordinator' || activeRole === 'delivery';

    container.querySelector('#req-details-footer').innerHTML = `
      <button type="button" class="btn btn-secondary" id="details-close-btn">Close</button>
      ${canAllocate ? `
        <button type="button" class="btn btn-primary" id="details-allocate-btn">Open Allocation Workbench</button>
      ` : ''}
    `;

    container.querySelector('#details-close-btn').onclick = () => detailsModal.classList.remove('open');
    if (canAllocate) {
      container.querySelector('#details-allocate-btn').onclick = () => {
        detailsModal.classList.remove('open');
        navigateTo('allocation', { requestId: req.id });
      };
    }

    detailsModal.classList.add('open');
  }

  container.querySelector('#req-details-close-btn')?.addEventListener('click', () => detailsModal.classList.remove('open'));

  // Status Change Modal
  const statusModal = container.querySelector('#status-change-modal');
  const statusForm = container.querySelector('#status-change-form');

  function openStatusChangeModal(id) {
    const req = storage.getRequests().find(r => r.id === id);
    if (!req) return;

    container.querySelector('#status-change-req-id').value = req.id;
    container.querySelector('#status-change-context').innerHTML = `
      Request <strong>[${req.id}]</strong> — ${req.campName}<br/>
      Need: <strong>${req.quantity} ${req.unit} of ${req.requiredSupply}</strong><br/>
      Current Status: <span class="status-pill status-${req.status.toLowerCase().replace(/\s+/g, '-')}">${req.status}</span>
    `;
    container.querySelector('#new-status-select').value = req.status;
    container.querySelector('#status-reason-input').value = "";
    statusModal.classList.add('open');
  }

  container.querySelector('#status-modal-close-btn')?.addEventListener('click', () => statusModal.classList.remove('open'));
  container.querySelector('#status-modal-cancel-btn')?.addEventListener('click', () => statusModal.classList.remove('open'));

  statusForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#status-change-req-id').value;
    const newStatus = container.querySelector('#new-status-select').value;
    const reason = container.querySelector('#status-reason-input').value.trim();

    storage.updateRequestStatus(id, newStatus, activeRole === 'manager' ? "Camp Manager" : "Disaster Coordinator", reason);

    window.dispatchEvent(new CustomEvent('aashray:toast', {
      detail: { type: 'success', message: `Request [${id}] status changed to ${newStatus}.` }
    }));

    statusModal.classList.remove('open');
    renderRequestsTable();
  });

  // Auto-open create request modal if requested via navigation
  if (filterParams.openModal) {
    setTimeout(() => {
      openCreateModal();
    }, 60);
  }

  // Global triggers
  window.addEventListener('aashray:open-create-request', openCreateModal);
  window.addEventListener('aashray:view-request-details', (e) => {
    if (e.detail && e.detail.id) openDetailsModal(e.detail.id);
  });
}

// AASHRAY Resource Allocation & Delivery Tracking Workbench
// Validates stock limits, prevents over-allocation, and executes inventory decrements.
import { storage } from '../services/storage.js';
import { AllocationEngine } from '../services/allocationEngine.js';

export function renderAllocation(container, navigateTo, params = {}) {
  const requests = storage.getRequests();
  const inventory = storage.getInventory();
  const activeRole = storage.getActiveRole();

  // Find unfulfilled requests
  const openRequests = requests.filter(r => ['Pending', 'Approved', 'In Progress'].includes(r.status));
  
  // Selected request: either from params or first open request
  let selectedReqId = params.requestId || (openRequests.length > 0 ? openRequests[0].id : null);
  let selectedReq = requests.find(r => r.id === selectedReqId) || (openRequests[0] || null);

  // Role perspective banner
  let roleBannerHtml = '';
  if (activeRole === 'public') {
    roleBannerHtml = `
      <div class="role-perspective-banner public">
        <div>🌐 <strong>Citizen Transparency Portal:</strong> You are viewing live operational allocation records. Warehouse transfers and dispatch sign-offs are strictly restricted to authorized State Logistics Coordinators.</div>
        <span class="status-pill status-delivered" style="font-size: 10px;">Public Access</span>
      </div>
    `;
  } else if (activeRole === 'manager') {
    roleBannerHtml = `
      <div class="role-perspective-banner manager">
        <div>🏕️ <strong>Relief Camp Manager Perspective:</strong> Review allocation readiness for camp demands. Formal stock authorization is carried out by Disaster Coordinators.</div>
        <span class="status-pill status-in-progress" style="font-size: 10px;">Camp Manager</span>
      </div>
    `;
  } else if (activeRole === 'delivery') {
    roleBannerHtml = `
      <div class="role-perspective-banner delivery">
        <div>🚚 <strong>Rescue &amp; Delivery Team Perspective:</strong> Active field transport mode. Use the Delivery Pipeline table below to mark shipments in transit and sign off deliveries.</div>
        <span class="status-pill status-pending" style="font-size: 10px;">Field Logistics</span>
      </div>
    `;
  }

  container.innerHTML = `
    ${roleBannerHtml}

    <div class="view-header">
      <div>
        <div class="view-header-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path><path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"></path><circle cx="8" cy="12" r="2"></circle></svg>
          Resource Allocation & Delivery Tracking
        </div>
        <div class="view-header-subtitle">
          Coordinator workbench: validate available camp supplies, prevent stock over-allocation, and track fulfillment dispatch.
        </div>
      </div>
      <div class="view-actions">
        <button id="view-requests-nav-btn" class="btn btn-secondary">
          View All Requests (${requests.length})
        </button>
      </div>
    </div>

    <!-- Allocation Layout Grid -->
    <div class="allocation-grid">
      
      <!-- Left Column: Open Requests Queue -->
      <div class="card-panel" style="margin-bottom: 0;">
        <div class="card-panel-header">
          <div class="card-title">
            <span>Pending & In-Progress Queue</span>
            <span class="badge-tag" style="background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 11px; padding: 2px 7px; border-radius: 4px;">
              ${openRequests.length} unfulfilled
            </span>
          </div>
        </div>

        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
          Select an emergency request to inspect camp inventory and allocate supplies:
        </p>

        <div id="request-queue-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto; padding-right: 4px;">
          <!-- Request cards rendered dynamically -->
        </div>
      </div>

      <!-- Right Column: Live Allocation & Stock Validation Workbench -->
      <div class="card-panel" style="margin-bottom: 0;">
        <div class="card-panel-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            Allocation & Validation Workbench
          </div>
          <span id="workbench-status-badge" class="status-pill status-in-progress">Ready</span>
        </div>

        <div id="workbench-content">
          <!-- Dynamic workbench for selected request -->
        </div>
      </div>

    </div>

    <!-- Delivery Tracking & Status Pipeline Section (Section 4.6) -->
    <div class="card-panel" style="margin-top: 24px;">
      <div class="card-panel-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          Active Delivery Progress Pipeline
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted);">
          Track physical transit and advance deliveries from allocation to on-site camp signoff.
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Camp</th>
              <th>Supply</th>
              <th>Allocated / Required</th>
              <th>Current Pipeline Stage</th>
              <th>Advance Stage</th>
            </tr>
          </thead>
          <tbody id="delivery-pipeline-tbody">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render Left Queue
  function renderRequestQueue() {
    const listContainer = container.querySelector('#request-queue-list');
    if (openRequests.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="padding: 30px;">
          <div class="empty-state-icon">🎉</div>
          <div class="empty-state-title">No Unfulfilled Requests</div>
          <div class="empty-state-desc">All emergency requests are fulfilled or processed.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = openRequests.map(r => {
      const isSelected = selectedReq && selectedReq.id === r.id;
      const allocated = Number(r.allocatedQuantity || 0);
      const total = Number(r.quantity);
      const remaining = Math.max(0, total - allocated);

      // Check stock at camp
      const stockItem = inventory.find(i => 
        (i.campId === r.campId || i.campName.toLowerCase() === r.campName.toLowerCase()) &&
        i.resource.toLowerCase() === r.requiredSupply.toLowerCase()
      );
      const available = stockItem ? Number(stockItem.quantity) : 0;
      const isInsufficient = available < remaining;

      return `
        <div class="req-queue-item" data-id="${r.id}" style="background: ${isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${isSelected ? 'var(--teal-400)' : 'var(--border-subtle)'}; border-left: 4px solid ${r.priority === 'Critical' ? 'var(--rose-500)' : r.priority === 'High' ? 'var(--amber-500)' : 'var(--border-bright)'}; padding: 12px 14px; border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <div>
              <strong style="color: #fff; font-size: 13px;">${r.id}</strong> — <span style="color: var(--teal-400); font-weight: 600;">${r.campName}</span>
            </div>
            <span class="status-pill status-${r.status.toLowerCase().replace(/\s+/g, '-')}">${r.status}</span>
          </div>

          <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px;">
            Need: <strong>${r.quantity} ${r.unit}</strong> of <strong>${r.requiredSupply}</strong>
            ${allocated > 0 ? `<span style="color: var(--emerald-400);"> (Allocated: ${allocated})</span>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <div style="color: ${isInsufficient ? 'var(--rose-400)' : 'var(--emerald-400)'}; font-weight: 600;">
              ${stockItem ? `Stock at Camp: ${available} ${stockItem.unit} ${isInsufficient ? '⚠️ (Shortage)' : '✓'}` : '⚠️ No Camp Stock Registered'}
            </div>
            <span class="priority-pill priority-${r.priority.toLowerCase()}" style="font-size: 9.5px;">${r.priority}</span>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.req-queue-item').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        selectedReq = requests.find(r => r.id === id);
        renderRequestQueue();
        renderWorkbench();
      });
    });
  }

  // Render Right Workbench
  function renderWorkbench() {
    const wb = container.querySelector('#workbench-content');
    if (!selectedReq) {
      wb.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No Request Selected</div>
          <div class="empty-state-desc">Select a request from the left queue to review stock and execute allocation.</div>
        </div>
      `;
      return;
    }

    const currentInventory = storage.getInventory();
    const stockItem = currentInventory.find(i => 
      (i.campId === selectedReq.campId || i.campName.toLowerCase() === selectedReq.campName.toLowerCase()) &&
      i.resource.toLowerCase() === selectedReq.requiredSupply.toLowerCase()
    );

    const availableStock = stockItem ? Number(stockItem.quantity) : 0;
    const totalRequired = Number(selectedReq.quantity);
    const alreadyAllocated = Number(selectedReq.allocatedQuantity || 0);
    const remainingDeficit = Math.max(0, totalRequired - alreadyAllocated);

    // Initial proposed quantity: max available up to remaining deficit
    const initialProposedQty = Math.min(availableStock, remainingDeficit);

    wb.innerHTML = `
      <!-- Request Snapshot Header -->
      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Selected Request</span>
            <div style="font-size: 15px; font-weight: 700; color: #fff;">
              Request #${selectedReq.id} • ${selectedReq.campName}
            </div>
          </div>
          <span class="priority-pill priority-${selectedReq.priority.toLowerCase()}">${selectedReq.priority}</span>
        </div>

        <div style="font-size: 12.5px; color: #cbd5e1;">
          Required: <strong style="color: #fff;">${selectedReq.quantity} ${selectedReq.unit}</strong> of <strong style="color: var(--teal-400);">${selectedReq.requiredSupply}</strong>
        </div>
        ${selectedReq.description ? `
          <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px; font-style: italic;">
            "${selectedReq.description}"
          </div>
        ` : ''}
      </div>

      <!-- Live Stock Comparison Cards -->
      <div class="allocation-card-summary">
        <div class="alloc-stat-row">
          <span class="alloc-stat-label">Total Quantity Demanded</span>
          <span class="alloc-stat-value">${totalRequired} ${selectedReq.unit}</span>
        </div>
        <div class="alloc-stat-row">
          <span class="alloc-stat-label">Already Allocated & Dispatched</span>
          <span class="alloc-stat-value" style="color: ${alreadyAllocated > 0 ? 'var(--emerald-400)' : 'var(--text-muted)'};">${alreadyAllocated} ${selectedReq.unit}</span>
        </div>
        <div class="alloc-stat-row">
          <span class="alloc-stat-label">Current Unfulfilled Deficit</span>
          <span class="alloc-stat-value" style="color: ${remainingDeficit > 0 ? 'var(--amber-400)' : 'var(--emerald-400)'};">${remainingDeficit} ${selectedReq.unit}</span>
        </div>
        <div class="alloc-stat-row" style="background: rgba(255,255,255,0.02); padding: 6px 4px;">
          <span class="alloc-stat-label" style="color: #fff; font-weight: 600;">Current Camp Stock (${selectedReq.campName})</span>
          <span class="alloc-stat-value" style="color: ${availableStock < remainingDeficit ? 'var(--rose-400)' : 'var(--emerald-400)'}; font-size: 14px;">
            ${availableStock} ${stockItem ? stockItem.unit : selectedReq.unit}
          </span>
        </div>
      </div>

      <!-- Real-time Live Validation Callout (PDF Section 4.5 & Insufficient Stock Test) -->
      <div id="live-validation-banner" class="alert-box" style="display: none;"></div>

      <!-- Allocation Form -->
      <form id="allocation-form" novalidate>
        <div class="form-group">
          <label class="form-label required" for="alloc-quantity-input">
            Quantity to Allocate from Camp Stock
          </label>
          <div style="display: flex; gap: 8px;">
            <input type="number" min="1" max="${totalRequired}" id="alloc-quantity-input" class="form-control" value="${initialProposedQty > 0 ? initialProposedQty : remainingDeficit}" style="font-family: var(--font-mono); font-size: 15px; font-weight: 700;" required />
            <button type="button" id="btn-quick-max-stock" class="btn btn-secondary btn-sm" title="Use maximum available stock without over-allocating">
              Max Stock (${availableStock})
            </button>
            <button type="button" id="btn-quick-full-need" class="btn btn-secondary btn-sm" title="Attempt to fulfill entire remaining deficit">
              Full Need (${remainingDeficit})
            </button>
          </div>
          <div class="form-hint">
            The system strictly validates stock and prevents assigning more supplies than currently held in storage.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="alloc-notes-input">Allocation Notes / Dispatch Vehicle</label>
          <input type="text" id="alloc-notes-input" class="form-control" placeholder="e.g. Dispatched via Quick Response Van 3; driver contact +91..." />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button type="submit" id="btn-execute-allocation" class="btn btn-primary" style="padding: 10px 20px; font-size: 13.5px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Confirm & Execute Stock Allocation
          </button>
        </div>
      </form>
    `;

    const qtyInput = wb.querySelector('#alloc-quantity-input');
    const banner = wb.querySelector('#live-validation-banner');
    const submitBtn = wb.querySelector('#btn-execute-allocation');

    // Live validation function
    function validateLive() {
      const val = Number(qtyInput.value);
      const res = AllocationEngine.validate(selectedReq.id, val, selectedReq.campId);

      banner.style.display = 'flex';

      if (!res.valid) {
        banner.className = 'alert-box alert-danger';
        banner.innerHTML = `
          <div style="font-size: 20px;">🚨</div>
          <div>
            <strong>INSUFFICIENT STOCK / INVALID ALLOCATION:</strong><br/>
            ${res.message}
          </div>
        `;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
      } else {
        banner.className = 'alert-box alert-success';
        banner.innerHTML = `
          <div style="font-size: 18px;">✓</div>
          <div>
            <strong>VALID ALLOCATION APPROVED:</strong><br/>
            ${res.message}<br/>
            <span style="font-size: 11px; color: #a7f3d0;">
              Camp available inventory will be deducted from <strong>${availableStock}</strong> to <strong>${res.remainingStockAfter} ${stockItem ? stockItem.unit : ''}</strong>.
            </span>
          </div>
        `;
        if (activeRole === 'public') {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          submitBtn.style.cursor = 'not-allowed';
          submitBtn.title = 'Allocations restricted to authorized State Coordinator credentials';
        } else {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.cursor = 'pointer';
        }
      }
    }

    // Run initial live validation
    validateLive();

    qtyInput.addEventListener('input', validateLive);

    wb.querySelector('#btn-quick-max-stock').addEventListener('click', () => {
      qtyInput.value = availableStock;
      validateLive();
    });

    wb.querySelector('#btn-quick-full-need').addEventListener('click', () => {
      qtyInput.value = remainingDeficit;
      validateLive();
    });

    // Form submission
    wb.querySelector('#allocation-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = Number(qtyInput.value);
      const notes = wb.querySelector('#alloc-notes-input').value.trim();

      try {
        const result = AllocationEngine.execute(selectedReq.id, val, selectedReq.campId, "Disaster Coordinator", notes);
        
        window.dispatchEvent(new CustomEvent('aashray:toast', {
          detail: {
            type: 'success',
            message: `Allocated ${result.allocatedQuantity} ${result.inventoryItem.unit} to Request #${selectedReq.id}. Camp stock updated to ${result.remainingStock}.`
          }
        }));

        // Refresh UI state
        renderAllocation(container, navigateTo, { requestId: selectedReq.id });
      } catch (err) {
        window.dispatchEvent(new CustomEvent('aashray:toast', {
          detail: { type: 'error', message: err.message }
        }));
      }
    });
  }

  // Render Delivery Pipeline
  function renderDeliveryPipeline() {
    const tbody = container.querySelector('#delivery-pipeline-tbody');
    const activeRequests = storage.getRequests().filter(r => ['Approved', 'In Progress', 'Delivered'].includes(r.status));

    if (activeRequests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state" style="padding: 24px;">
              <div class="empty-state-title">No Active Deliveries</div>
              <div class="empty-state-desc">Approve requests or allocate stock to initialize delivery tracking.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = activeRequests.map(r => {
      const allocated = Number(r.allocatedQuantity || 0);
      const total = Number(r.quantity);

      return `
        <tr>
          <td><strong style="color: var(--teal-400);">${r.id}</strong></td>
          <td>${r.campName}</td>
          <td>${r.requiredSupply}</td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 600;">${allocated} / ${total} ${r.unit}</span>
          </td>
          <td>
            <span class="status-pill status-${r.status.toLowerCase().replace(/\s+/g, '-')}">
              <span class="status-dot"></span> ${r.status}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${r.status === 'Approved' ? `
                <button class="btn btn-secondary btn-sm action-advance-status" data-id="${r.id}" data-target="In Progress">
                  Dispatch (In Progress)
                </button>
              ` : ''}
              ${r.status === 'In Progress' ? `
                <button class="btn btn-success btn-sm action-advance-status" data-id="${r.id}" data-target="Delivered">
                  Mark Delivered ✓
                </button>
              ` : ''}
              ${r.status === 'Delivered' ? `
                <span style="font-size: 11px; color: var(--emerald-400); font-weight: 600;">
                  Delivered & Signed Off
                </span>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.action-advance-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const target = e.currentTarget.getAttribute('data-target');
        storage.updateRequestStatus(id, target, "Rescue / Delivery Team", `Advanced delivery pipeline stage to ${target}`);
        window.dispatchEvent(new CustomEvent('aashray:toast', {
          detail: { type: 'success', message: `Request #${id} marked as ${target}.` }
        }));
        renderAllocation(container, navigateTo, { requestId: id });
      });
    });
  }

  renderRequestQueue();
  renderWorkbench();
  renderDeliveryPipeline();

  container.querySelector('#view-requests-nav-btn')?.addEventListener('click', () => navigateTo('requests'));
}
